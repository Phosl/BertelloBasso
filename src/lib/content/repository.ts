import "server-only";

import {cache} from "react";
import {createClient} from "@supabase/supabase-js";
import {
  defaultProducts,
  defaultSiteCopyByLocale,
} from "./default-content";
import {localizeProduct} from "./localize";
import {mapProductRecord} from "./product-mapper";
import type {Product, ProductMedia, SiteCopy} from "./types";
import type {Locale} from "@/lib/i18n/config";
import {isMissingSchemaError} from "@/lib/supabase/errors";
import {signCmsMediaPaths} from "@/lib/cms/storage";

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {auth: {persistSession: false}});
}

const productFields =
  "id, slug, name, eyebrow, description, category, status, formats, featured, published, sort_order, visual, accent";

async function getProductMedia(
  client: NonNullable<ReturnType<typeof getPublicClient>>,
  productIds: string[],
  locale: Locale,
) {
  if (!productIds.length) return new Map<string, ProductMedia[]>();
  const {data, error} = await client
    .from("product_media_links")
    .select("id, product_id, media_id, role, sort_order, focal_x, focal_y, media_assets(*)")
    .eq("scope", "published")
    .in("product_id", productIds)
    .order("sort_order");
  if (error) {
    if (!isMissingSchemaError(error)) {
      console.error({
        scope: "public_content",
        operation: "select",
        resource: "product_media_links",
        code: error.code,
      });
    }
    return new Map<string, ProductMedia[]>();
  }
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const paths = rows.flatMap((row) => {
    const asset = row.media_assets as Record<string, unknown> | undefined;
    return asset
      ? [String(asset.storage_path ?? ""), String(asset.thumbnail_path ?? "")]
      : [];
  });
  let signed = new Map<string, string>();
  try {
    signed = await signCmsMediaPaths(client, paths);
  } catch (error) {
    console.error({
      scope: "public_content",
      operation: "sign",
      resource: "cms-media",
      code: (error as {code?: string}).code ?? "unknown",
    });
  }

  const result = new Map<string, ProductMedia[]>();
  rows.forEach((row) => {
    const asset = row.media_assets as Record<string, unknown> | undefined;
    if (!asset) return;
    const translations =
      asset.translations && typeof asset.translations === "object"
        ? (asset.translations as {en?: {alt?: string; caption?: string}})
        : {};
    const storagePath = String(asset.storage_path ?? "");
    const thumbnailPath = String(asset.thumbnail_path ?? "");
    const media: ProductMedia = {
      id: String(row.id),
      mediaId: String(row.media_id),
      role: row.role === "primary" ? "primary" : "gallery",
      sortOrder: Number(row.sort_order ?? 0),
      focalX: Number(row.focal_x ?? 0.5),
      focalY: Number(row.focal_y ?? 0.5),
      width: Number(asset.width ?? 1),
      height: Number(asset.height ?? 1),
      altText:
        locale === "en" && translations.en?.alt?.trim()
          ? translations.en.alt
          : String(asset.alt_text ?? ""),
      caption:
        locale === "en" && translations.en?.caption?.trim()
          ? translations.en.caption
          : String(asset.caption ?? ""),
      imageUrl: signed.get(storagePath) ?? "",
      thumbnailUrl: signed.get(thumbnailPath) ?? "",
    };
    const productId = String(row.product_id);
    result.set(productId, [...(result.get(productId) ?? []), media]);
  });
  return result;
}

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

  const products = (data ?? []).map((row) => mapProductRecord(row));
  const media = await getProductMedia(
    client,
    products.map((product) => product.id),
    locale,
  );
  return products.map((product) =>
    localizeProduct(
      {...product, media: media.get(product.id) ?? []},
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
