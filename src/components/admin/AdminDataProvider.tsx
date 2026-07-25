"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {defaultSnapshot} from "@/lib/content/default-content";
import {mapProductRecord} from "@/lib/content/product-mapper";
import type {
  AdminSnapshot,
  Inquiry,
  Product,
  SiteCopy,
} from "@/lib/content/types";
import type {Locale} from "@/lib/i18n/config";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {
  getBrowserSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/browser";

const storageKey = "bertello-basso-admin-demo-v1";

type SaveState = "idle" | "saving" | "saved" | "error";

type AdminDataContextValue = {
  data: AdminSnapshot;
  configured: boolean;
  loading: boolean;
  saveState: SaveState;
  lastSavedAt: Date | null;
  notice: string;
  reportCmsState: (state: SaveState, notice?: string) => void;
  refresh: () => Promise<void>;
  resetDemo: () => void;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<boolean>;
  updateSiteCopy: (locale: Locale, copy: SiteCopy) => Promise<boolean>;
  updateInquiry: (
    id: string,
    status: Inquiry["status"],
  ) => Promise<boolean>;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

function saveLocal(snapshot: AdminSnapshot) {
  window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
}

function toProductRow(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    eyebrow: product.eyebrow,
    description: product.description,
    category: product.category,
    status: product.status,
    formats: product.formats,
    featured: product.featured,
    published: product.published,
    sort_order: product.sortOrder,
    visual: product.visual,
    accent: product.accent,
    translations: product.translations,
    updated_at: new Date().toISOString(),
  };
}

function normalizeLocalSnapshot(value: unknown): AdminSnapshot {
  if (!value || typeof value !== "object") return defaultSnapshot;
  const snapshot = value as {
    products?: Array<Record<string, unknown>>;
    siteCopy?: Record<string, unknown>;
    inquiries?: Inquiry[];
  };
  const products = Array.isArray(snapshot.products)
    ? snapshot.products.map((product) =>
        mapProductRecord(product),
      )
    : defaultSnapshot.products;
  const storedCopy = snapshot.siteCopy ?? {};
  const isLegacyCopy = "heroTitle" in storedCopy;
  const italianCopy = {
    ...defaultSnapshot.siteCopy.it,
    ...(
      isLegacyCopy
        ? (storedCopy as Partial<SiteCopy>)
        : (storedCopy.it as Partial<SiteCopy> | undefined)
    ),
  };

  return {
    products,
    siteCopy: {
      it: italianCopy,
      en: {
        ...defaultSnapshot.siteCopy.en,
        ...(
          isLegacyCopy
            ? {}
            : (storedCopy.en as Partial<SiteCopy> | undefined)
        ),
        contactEmail: italianCopy.contactEmail,
        contactPhone: italianCopy.contactPhone,
      },
    },
    inquiries: Array.isArray(snapshot.inquiries)
      ? snapshot.inquiries
      : defaultSnapshot.inquiries,
  };
}

export function AdminDataProvider({children}: {children: ReactNode}) {
  const configured = isSupabaseConfigured();
  const [data, setData] = useState<AdminSnapshot>(defaultSnapshot);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setNotice("");

    if (!configured) {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) setData(normalizeLocalSnapshot(JSON.parse(stored)));
      } catch {
        setNotice(
          "I dati locali non erano leggibili: è stato caricato il contenuto iniziale.",
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    const client = getBrowserSupabase();
    if (!client) {
      setLoading(false);
      return;
    }

    const [productsResult, settingsResult, inquiriesResult] =
      await Promise.all([
        client.from("products").select("*").order("sort_order"),
        client
          .from("site_settings")
          .select("key, value")
          .in("key", ["site_copy", "site_copy_en"]),
        client
          .from("inquiries")
          .select("id, created_at, name, email, subject, message, status")
          .order("created_at", {ascending: false}),
      ]);

    const firstError =
      productsResult.error ??
      settingsResult.error ??
      inquiriesResult.error;
    if (firstError) {
      setNotice(getAdminErrorMessage(firstError));
      setLoading(false);
      return;
    }

    const siteSettings = new Map(
      (settingsResult.data ?? []).map((row) => [row.key, row.value]),
    );

    setData({
      products: (productsResult.data ?? []).map((row) =>
        mapProductRecord(row as Record<string, unknown>),
      ),
      siteCopy: {
        it: {
          ...defaultSnapshot.siteCopy.it,
          ...(siteSettings.get("site_copy") as Partial<SiteCopy> | undefined),
        },
        en: {
          ...defaultSnapshot.siteCopy.en,
          ...(siteSettings.get("site_copy_en") as Partial<SiteCopy> | undefined),
          contactEmail:
            (
              siteSettings.get("site_copy") as Partial<SiteCopy> | undefined
            )?.contactEmail ?? defaultSnapshot.siteCopy.it.contactEmail,
          contactPhone:
            (
              siteSettings.get("site_copy") as Partial<SiteCopy> | undefined
            )?.contactPhone ?? defaultSnapshot.siteCopy.it.contactPhone,
        },
      },
      inquiries: (inquiriesResult.data ?? []).map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        name: row.name,
        email: row.email,
        subject: row.subject,
        message: row.message,
        status: row.status as Inquiry["status"],
      })),
    });
    setLoading(false);
  }, [configured]);

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, [refresh]);

  const resetDemo = useCallback(() => {
    if (configured) return;
    setData(defaultSnapshot);
    saveLocal(defaultSnapshot);
    setNotice("Dati demo ripristinati.");
  }, [configured]);

  const reportCmsState = useCallback((state: SaveState, message = "") => {
    setSaveState(state);
    setNotice(message);
    if (state === "saved") setLastSavedAt(new Date());
  }, []);

  const updateProduct = useCallback(
    async (id: string, patch: Partial<Product>) => {
      const current = data.products.find((product) => product.id === id);
      if (!current) return false;
      const updated = {...current, ...patch};
      const next = {
        ...data,
        products: data.products.map((product) =>
          product.id === id ? updated : product,
        ),
      };
      setData(next);
      setSaveState("saving");
      setNotice("");

      if (!configured) {
        saveLocal(next);
        await new Promise((resolve) => setTimeout(resolve, 260));
        setSaveState("saved");
        setLastSavedAt(new Date());
        return true;
      }

      const {error} = await getBrowserSupabase()!
        .from("products")
        .update(toProductRow(updated))
        .eq("id", id);
      if (error) {
        setData(data);
        setSaveState("error");
        setNotice(getAdminErrorMessage(error));
        return false;
      }
      setSaveState("saved");
      setLastSavedAt(new Date());
      return true;
    },
    [configured, data],
  );

  const updateSiteCopy = useCallback(
    async (locale: Locale, copy: SiteCopy) => {
      const siteCopy =
        locale === "it"
          ? {
              ...data.siteCopy,
              it: copy,
              en: {
                ...data.siteCopy.en,
                contactEmail: copy.contactEmail,
                contactPhone: copy.contactPhone,
              },
            }
          : {...data.siteCopy, en: copy};
      const next = {
        ...data,
        siteCopy,
      };
      setData(next);
      setSaveState("saving");
      setNotice("");

      if (!configured) {
        saveLocal(next);
        await new Promise((resolve) => setTimeout(resolve, 260));
        setSaveState("saved");
        setLastSavedAt(new Date());
        return true;
      }

      const {error} = await getBrowserSupabase()!
        .from("site_settings")
        .upsert({
          key: locale === "it" ? "site_copy" : "site_copy_en",
          value: copy,
          updated_at: new Date().toISOString(),
        });
      if (error) {
        setData(data);
        setSaveState("error");
        setNotice(getAdminErrorMessage(error));
        return false;
      }
      setSaveState("saved");
      setLastSavedAt(new Date());
      return true;
    },
    [configured, data],
  );

  const updateInquiry = useCallback(
    async (id: string, status: Inquiry["status"]) => {
      const next = {
        ...data,
        inquiries: data.inquiries.map((inquiry) =>
          inquiry.id === id ? {...inquiry, status} : inquiry,
        ),
      };
      setData(next);
      setSaveState("saving");
      setNotice("");

      if (!configured) {
        saveLocal(next);
        setSaveState("saved");
        setLastSavedAt(new Date());
        return true;
      }

      const {error} = await getBrowserSupabase()!
        .from("inquiries")
        .update({status})
        .eq("id", id);
      if (error) {
        setData(data);
        setSaveState("error");
        setNotice(getAdminErrorMessage(error));
        return false;
      }
      setSaveState("saved");
      setLastSavedAt(new Date());
      return true;
    },
    [configured, data],
  );

  const value = useMemo(
    () => ({
      data,
      configured,
      loading,
      saveState,
      lastSavedAt,
      notice,
      reportCmsState,
      refresh,
      resetDemo,
      updateProduct,
      updateSiteCopy,
      updateInquiry,
    }),
    [
      configured,
      data,
      loading,
      lastSavedAt,
      notice,
      reportCmsState,
      refresh,
      resetDemo,
      saveState,
      updateInquiry,
      updateProduct,
      updateSiteCopy,
    ],
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used inside AdminDataProvider");
  }
  return context;
}
