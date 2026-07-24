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
import type {
  AdminSnapshot,
  Inquiry,
  Product,
  SiteCopy,
} from "@/lib/content/types";
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
  notice: string;
  refresh: () => Promise<void>;
  resetDemo: () => void;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<boolean>;
  updateSiteCopy: (copy: SiteCopy) => Promise<boolean>;
  updateInquiry: (
    id: string,
    status: Inquiry["status"],
  ) => Promise<boolean>;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

function saveLocal(snapshot: AdminSnapshot) {
  window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
}

function mapProductRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    eyebrow: String(row.eyebrow),
    description: String(row.description),
    category: row.category as Product["category"],
    status: row.status as Product["status"],
    formats: row.formats as Product["formats"],
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    sortOrder: Number(row.sort_order),
    visual: row.visual as Product["visual"],
    accent: String(row.accent),
  };
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
    updated_at: new Date().toISOString(),
  };
}

export function AdminDataProvider({children}: {children: ReactNode}) {
  const configured = isSupabaseConfigured();
  const [data, setData] = useState<AdminSnapshot>(defaultSnapshot);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setNotice("");

    if (!configured) {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) setData(JSON.parse(stored) as AdminSnapshot);
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
          .select("value")
          .eq("key", "site_copy")
          .maybeSingle(),
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

    setData({
      products: (productsResult.data ?? []).map((row) =>
        mapProductRow(row as Record<string, unknown>),
      ),
      siteCopy: {
        ...defaultSnapshot.siteCopy,
        ...(settingsResult.data?.value as Partial<SiteCopy> | undefined),
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
      return true;
    },
    [configured, data],
  );

  const updateSiteCopy = useCallback(
    async (copy: SiteCopy) => {
      const next = {...data, siteCopy: copy};
      setData(next);
      setSaveState("saving");
      setNotice("");

      if (!configured) {
        saveLocal(next);
        await new Promise((resolve) => setTimeout(resolve, 260));
        setSaveState("saved");
        return true;
      }

      const {error} = await getBrowserSupabase()!
        .from("site_settings")
        .upsert({
          key: "site_copy",
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
      notice,
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
      notice,
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
