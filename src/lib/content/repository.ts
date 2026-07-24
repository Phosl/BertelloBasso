import "server-only";

import {cache} from "react";
import {createClient} from "@supabase/supabase-js";
import {
  defaultProducts,
  defaultSiteCopyByLocale,
} from "./default-content";
import {localizeProduct} from "./localize";
import {mapProductRecord} from "./product-mapper";
import type {Product, SiteCopy} from "./types";
import type {Locale} from "@/lib/i18n/config";
import {isMissingSchemaError} from "@/lib/supabase/errors";

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {auth: {persistSession: false}});
}

const productFields =
  "id, slug, name, eyebrow, description, category, status, formats, featured, published, sort_order, visual, accent";

export const getProducts = cache(async (locale: Locale = "it"): Promise<Product[]> => {
  const client = getPublicClient();
  const defaultPublished = defaultProducts
    .filter((product) => product.published)
    .map((product) => localizeProduct(product, locale));
  if (!client) return defaultPublished;

  const localizedResult = await client
    .from("products")
    .select(
      `${productFields}, translations`,
    )
    .eq("published", true)
    .order("sort_order");
  let data = localizedResult.data as Array<Record<string, unknown>> | null;
  let error = localizedResult.error;

  if (isMissingSchemaError(error)) {
    const legacyResult = await client
      .from("products")
      .select(productFields)
      .eq("published", true)
      .order("sort_order");
    data = legacyResult.data as Array<Record<string, unknown>> | null;
    error = legacyResult.error;
  }

  if (error) {
    console.error({
      scope: "public_content",
      operation: "select",
      resource: "products",
      code: error.code,
    });
    return defaultPublished;
  }

  return (data ?? []).map((row) =>
    localizeProduct(
      mapProductRecord(row),
      locale,
    ),
  );
});

export const getSiteCopy = cache(async (locale: Locale = "it"): Promise<SiteCopy> => {
  const client = getPublicClient();
  const fallback = defaultSiteCopyByLocale[locale];
  if (!client) return fallback;

  if (locale === "en") {
    const {data, error} = await client
      .from("site_settings")
      .select("key, value")
      .in("key", ["site_copy", "site_copy_en"]);

    if (error) {
      console.error({
        scope: "public_content",
        operation: "select",
        resource: "site_settings",
        code: error.code,
      });
      return fallback;
    }

    const settings = new Map(
      (data ?? []).map((row) => [row.key, row.value as Partial<SiteCopy>]),
    );
    const italian = settings.get("site_copy");
    const english = settings.get("site_copy_en");
    return {
      ...fallback,
      ...english,
      contactEmail: italian?.contactEmail ?? fallback.contactEmail,
      contactPhone: italian?.contactPhone ?? fallback.contactPhone,
    };
  }

  const {data, error} = await client
    .from("site_settings")
    .select("value")
    .eq("key", "site_copy")
    .maybeSingle();

  if (error || !data?.value) {
    if (error) {
      console.error({
        scope: "public_content",
        operation: "select",
        resource: "site_settings",
        code: error.code,
      });
    }
    return fallback;
  }

  return {...fallback, ...(data.value as Partial<SiteCopy>)};
});
