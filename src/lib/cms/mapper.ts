import {
  defaultCmsPages,
  defaultCmsSiteSettings,
  defaultProductDrafts,
} from "./defaults";
import type {
  CmsPage,
  CmsSiteSettings,
  MediaAsset,
  ProductDraft,
  ProductMedia,
} from "./types";

export function mapMediaAsset(
  row: Record<string, unknown>,
  urls = new Map<string, string>(),
): MediaAsset {
  const translations =
    row.translations && typeof row.translations === "object"
      ? (row.translations as {en?: {alt?: string; caption?: string}})
      : {};
  const storagePath = String(row.storage_path ?? "");
  const thumbnailPath = String(row.thumbnail_path ?? "");
  return {
    id: String(row.id),
    storagePath,
    thumbnailPath,
    originalName: String(row.original_name ?? ""),
    mimeType: String(row.mime_type ?? "image/webp"),
    width: Number(row.width ?? 1),
    height: Number(row.height ?? 1),
    bytes: Number(row.bytes ?? 0),
    alt: {
      it: String(row.alt_text ?? ""),
      en: translations.en?.alt ?? "",
    },
    caption: {
      it: String(row.caption ?? ""),
      en: translations.en?.caption ?? "",
    },
    status: row.status === "archived" ? "archived" : "active",
    imageUrl: urls.get(storagePath) ?? "",
    thumbnailUrl: urls.get(thumbnailPath) ?? "",
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function mapProductMedia(
  row: Record<string, unknown>,
  urls: Map<string, string>,
): ProductMedia | null {
  const rawAsset = row.media_assets;
  if (!rawAsset || typeof rawAsset !== "object") return null;
  return {
    id: String(row.id),
    productId: String(row.product_id),
    mediaId: String(row.media_id),
    scope: row.scope === "published" ? "published" : "draft",
    role: row.role === "primary" ? "primary" : "gallery",
    sortOrder: Number(row.sort_order ?? 0),
    focalX: Number(row.focal_x ?? 0.5),
    focalY: Number(row.focal_y ?? 0.5),
    asset: mapMediaAsset(rawAsset as Record<string, unknown>, urls),
  };
}

export function mapProductDraft(
  row: Record<string, unknown>,
  urls = new Map<string, string>(),
): ProductDraft {
  const fallback = defaultProductDrafts.find(
    (item) => item.id === String(row.id),
  );
  const links = Array.isArray(row.product_media_links)
    ? (row.product_media_links as Array<Record<string, unknown>>)
        .map((link) => mapProductMedia(link, urls))
        .filter((item): item is ProductMedia => Boolean(item))
        .filter((item) => item.scope === "draft")
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  return {
    id: String(row.id),
    slug: String(row.slug ?? fallback?.slug ?? ""),
    status:
      row.status === "published" || row.status === "archived"
        ? row.status
        : "draft",
    sortOrder: Number(row.sort_order ?? fallback?.sortOrder ?? 0),
    content:
      row.content && typeof row.content === "object"
        ? (row.content as ProductDraft["content"])
        : fallback?.content ?? defaultProductDrafts[0].content,
    publishedAt: row.published_at ? String(row.published_at) : null,
    createdAt: String(row.created_at ?? fallback?.createdAt ?? ""),
    updatedAt: String(row.updated_at ?? fallback?.updatedAt ?? ""),
    media: links,
  };
}

export function mapCmsPage(row: Record<string, unknown>): CmsPage {
  const fallback = defaultCmsPages.find(
    (page) =>
      page.id === String(row.id) ||
      (row.page_key && page.pageKey === row.page_key),
  );
  return {
    id: String(row.id ?? fallback?.id),
    pageKey:
      row.page_key === "home" ||
      row.page_key === "products" ||
      row.page_key === "story" ||
      row.page_key === "contact" ||
      row.page_key === "photography"
        ? row.page_key
        : null,
    slug: String(row.slug ?? fallback?.slug ?? ""),
    status:
      row.status === "published" || row.status === "archived"
        ? row.status
        : "draft",
    sortOrder: Number(row.sort_order ?? fallback?.sortOrder ?? 0),
    draft:
      row.draft_content && typeof row.draft_content === "object"
        ? (row.draft_content as CmsPage["draft"])
        : fallback?.draft ?? defaultCmsPages[0].draft,
    published:
      row.published_content && typeof row.published_content === "object"
        ? (row.published_content as CmsPage["published"])
        : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    createdAt: String(row.created_at ?? fallback?.createdAt ?? ""),
    updatedAt: String(row.updated_at ?? fallback?.updatedAt ?? ""),
  };
}

export function mapCmsSettings(
  row: Record<string, unknown> | null | undefined,
): CmsSiteSettings {
  if (!row) return defaultCmsSiteSettings;
  return {
    draft:
      row.draft_content && typeof row.draft_content === "object"
        ? (row.draft_content as CmsSiteSettings["draft"])
        : defaultCmsSiteSettings.draft,
    published:
      row.published_content && typeof row.published_content === "object"
        ? (row.published_content as CmsSiteSettings["published"])
        : defaultCmsSiteSettings.published,
    updatedAt: String(row.updated_at ?? defaultCmsSiteSettings.updatedAt),
    publishedAt: row.published_at ? String(row.published_at) : null,
  };
}
