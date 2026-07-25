import "server-only";

import {cache} from "react";
import {createClient} from "@supabase/supabase-js";
import {
  defaultCmsPages,
  defaultCmsSiteSettings,
} from "./defaults";
import {mapCmsSettings, mapMediaAsset} from "./mapper";
import {signCmsMediaPaths} from "./storage";
import type {
  CmsPage,
  CmsSiteSettings,
  MediaAsset,
  PageSnapshot,
} from "./types";
import {isMissingSchemaError} from "@/lib/supabase/errors";

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {persistSession: false, autoRefreshToken: false},
  });
}

function logCmsError(
  operation: string,
  resource: string,
  error: {code?: string} | null,
) {
  console.error({
    scope: "public_cms",
    operation,
    resource,
    code: error?.code ?? "unknown",
  });
}

export const getPublishedCmsPages = cache(async (): Promise<CmsPage[]> => {
  const client = publicClient();
  if (!client) return defaultCmsPages;
  const {data, error} = await client.rpc("cms_get_public_pages");
  if (error) {
    if (!isMissingSchemaError(error)) {
      logCmsError("rpc", "cms_get_public_pages", error);
    }
    return defaultCmsPages;
  }
  return (data ?? []).map((row: Record<string, unknown>) => {
    const content = row.content as PageSnapshot;
    return {
      id: String(row.id),
      pageKey: row.page_key as CmsPage["pageKey"],
      slug: String(row.slug),
      status: "published",
      sortOrder: Number(row.sort_order),
      draft: content,
      published: content,
      publishedAt: row.published_at ? String(row.published_at) : null,
      createdAt: row.published_at ? String(row.published_at) : "",
      updatedAt: row.published_at ? String(row.published_at) : "",
    };
  });
});

export const getPublishedCmsPageByKey = cache(
  async (pageKey: NonNullable<CmsPage["pageKey"]>) => {
    const pages = await getPublishedCmsPages();
    return (
      pages.find((page) => page.pageKey === pageKey) ??
      defaultCmsPages.find((page) => page.pageKey === pageKey) ??
      null
    );
  },
);

export const getPublishedCmsPageBySlug = cache(async (slug: string) => {
  const pages = await getPublishedCmsPages();
  return pages.find((page) => !page.pageKey && page.slug === slug) ?? null;
});

export const getPublishedCmsSettings = cache(
  async (): Promise<CmsSiteSettings> => {
    const client = publicClient();
    if (!client) return defaultCmsSiteSettings;
    const {data, error} = await client.rpc("cms_get_public_site_settings");
    if (error || !data) {
      if (error && !isMissingSchemaError(error)) {
        logCmsError("rpc", "cms_get_public_site_settings", error);
      }
      return defaultCmsSiteSettings;
    }
    return mapCmsSettings({
      draft_content: data,
      published_content: data,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  },
);

export async function getPublishedPageMedia(
  snapshot: PageSnapshot,
): Promise<Map<string, MediaAsset>> {
  const ids = new Set<string>();
  snapshot.sections.forEach((section) => {
    if ("mediaId" in section && section.mediaId) ids.add(section.mediaId);
  });
  if (snapshot.seo.socialImageId) ids.add(snapshot.seo.socialImageId);
  if (!ids.size) return new Map();

  const client = publicClient();
  if (!client) return new Map();
  const {data, error} = await client
    .from("media_assets")
    .select("*")
    .in("id", [...ids]);
  if (error) {
    if (!isMissingSchemaError(error)) {
      logCmsError("select", "media_assets", error);
    }
    return new Map();
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  try {
    const urls = await signCmsMediaPaths(
      client,
      rows.flatMap((row) => [
        String(row.storage_path ?? ""),
        String(row.thumbnail_path ?? ""),
      ]),
    );
    return new Map(
      rows.map((row) => {
        const asset = mapMediaAsset(row, urls);
        return [asset.id, asset];
      }),
    );
  } catch (error) {
    logCmsError("sign", "cms-media", error as {code?: string});
    return new Map();
  }
}
