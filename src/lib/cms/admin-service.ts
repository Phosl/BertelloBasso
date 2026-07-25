"use client";

import type {PostgrestError, SupabaseClient} from "@supabase/supabase-js";
import {getBrowserSupabase} from "@/lib/supabase/browser";
import type {ProcessedUploadImage} from "@/lib/media/image-processing";
import {
  createDemoPage,
  createDemoProduct,
  mutateCmsDemo,
  readCmsDemo,
} from "./demo-store";
import {mapCmsPage, mapCmsSettings, mapMediaAsset, mapProductDraft} from "./mapper";
import {createSlug} from "./slug";
import {cmsMediaBucket, signCmsMediaPaths} from "./storage";
import type {
  CmsPage,
  CmsSiteSettingsContent,
  MediaAsset,
  PageSnapshot,
  ProductDraft,
} from "./types";
import {
  pageSnapshotSchema,
  productDraftContentSchema,
  siteSettingsContentSchema,
} from "./validation";

function clientOrNull() {
  return getBrowserSupabase();
}

function throwIfError(error: PostgrestError | Error | null) {
  if (error) throw error;
}

async function productRowsWithSignedMedia(
  client: SupabaseClient,
  rows: Array<Record<string, unknown>>,
) {
  const paths = rows.flatMap((row) => {
    const links = Array.isArray(row.product_media_links)
      ? (row.product_media_links as Array<Record<string, unknown>>)
      : [];
    return links.flatMap((link) => {
      const asset = link.media_assets as Record<string, unknown> | undefined;
      return asset
        ? [
            String(asset.storage_path ?? ""),
            String(asset.thumbnail_path ?? ""),
          ]
        : [];
    });
  });
  const urls = await signCmsMediaPaths(client, paths);
  return rows.map((row) => mapProductDraft(row, urls));
}

const productDraftSelect =
  "*, product_media_links(*, media_assets(*))";

export async function getAdminProductDrafts(): Promise<ProductDraft[]> {
  const client = clientOrNull();
  if (!client) return readCmsDemo().products;
  const {data, error} = await client
    .from("product_drafts")
    .select(productDraftSelect)
    .order("sort_order")
    .order("sort_order", {referencedTable: "product_media_links"});
  throwIfError(error);
  return productRowsWithSignedMedia(
    client,
    (data ?? []) as Array<Record<string, unknown>>,
  );
}

export async function getAdminProductDraft(id: string) {
  const client = clientOrNull();
  if (!client) return readCmsDemo().products.find((item) => item.id === id) ?? null;
  const {data, error} = await client
    .from("product_drafts")
    .select(productDraftSelect)
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  if (!data) return null;
  const [product] = await productRowsWithSignedMedia(client, [
    data as Record<string, unknown>,
  ]);
  return product ?? null;
}

export async function createProductDraft(name: string) {
  const client = clientOrNull();
  if (!client) return createDemoProduct(name);
  const {data, error} = await client
    .rpc("cms_create_product", {p_name: name})
    .single();
  throwIfError(error);
  return mapProductDraft(data as unknown as Record<string, unknown>);
}

export async function saveProductDraft(
  product: ProductDraft,
  options: {validate?: boolean} = {},
) {
  const content = options.validate
    ? productDraftContentSchema.parse(product.content)
    : product.content;
  const slug = createSlug(product.slug || content.name || "prodotto");
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      products: snapshot.products.map((item) =>
        item.id === product.id
          ? {...product, slug, content, updatedAt: new Date().toISOString()}
          : item,
      ),
    }));
    return;
  }
  const {error} = await client
    .from("product_drafts")
    .update({
      slug,
      content,
      sort_order: product.sortOrder,
    })
    .eq("id", product.id);
  throwIfError(error);
}

export async function duplicateProduct(id: string) {
  const client = clientOrNull();
  if (!client) {
    const source = readCmsDemo().products.find((item) => item.id === id);
    if (!source) throw new Error("PRODUCT_NOT_FOUND");
    const copy = structuredClone(source);
    copy.id = crypto.randomUUID();
    copy.slug = createSlug(`${source.slug}-copia`);
    copy.content.name = `${source.content.name} copia`;
    copy.status = "draft";
    copy.publishedAt = null;
    copy.media = [];
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      products: [...snapshot.products, copy],
    }));
    return copy;
  }
  const {data, error} = await client
    .rpc("cms_duplicate_product", {p_product_id: id})
    .single();
  throwIfError(error);
  return mapProductDraft(data as unknown as Record<string, unknown>);
}

async function productAction(
  rpc: string,
  values: Record<string, unknown>,
) {
  const client = clientOrNull();
  if (!client) return;
  const {error} = await client.rpc(rpc, values);
  throwIfError(error);
}

export async function publishProduct(id: string) {
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      products: snapshot.products.map((item) =>
        item.id === id
          ? {...item, status: "published", publishedAt: new Date().toISOString()}
          : item,
      ),
    }));
    return;
  }
  await productAction("cms_publish_product", {p_product_id: id});
}

export async function unpublishProduct(id: string) {
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      products: snapshot.products.map((item) =>
        item.id === id ? {...item, status: "draft", publishedAt: null} : item,
      ),
    }));
    return;
  }
  await productAction("cms_unpublish_product", {p_product_id: id});
}

export async function archiveProduct(id: string, archived: boolean) {
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      products: snapshot.products.map((item) =>
        item.id === id
          ? {
              ...item,
              status: archived ? "archived" : "draft",
              publishedAt: null,
            }
          : item,
      ),
    }));
    return;
  }
  await productAction("cms_archive_product", {
    p_product_id: id,
    p_archived: archived,
  });
}

export async function reorderProducts(ids: string[]) {
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      products: ids
        .map((id, index) => {
          const product = snapshot.products.find((item) => item.id === id);
          return product ? {...product, sortOrder: index} : null;
        })
        .filter((item): item is ProductDraft => Boolean(item)),
    }));
    return;
  }
  await productAction("cms_reorder_products", {p_product_ids: ids});
}

export async function getAdminPages(): Promise<CmsPage[]> {
  const client = clientOrNull();
  if (!client) return readCmsDemo().pages;
  const {data, error} = await client
    .from("cms_pages")
    .select("*")
    .order("sort_order");
  throwIfError(error);
  return (data ?? []).map((row) =>
    mapCmsPage(row as unknown as Record<string, unknown>),
  );
}

export async function getAdminPage(id: string) {
  const client = clientOrNull();
  if (!client) return readCmsDemo().pages.find((page) => page.id === id) ?? null;
  const {data, error} = await client
    .from("cms_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data ? mapCmsPage(data as Record<string, unknown>) : null;
}

export async function createPage(title: string) {
  const client = clientOrNull();
  if (!client) return createDemoPage(title);
  const {data, error} = await client
    .rpc("cms_create_page", {p_title: title})
    .single();
  throwIfError(error);
  return mapCmsPage(data as unknown as Record<string, unknown>);
}

function pageMediaReferences(snapshot: PageSnapshot) {
  const links: Array<{mediaId: string; sectionId: string; sortOrder: number}> = [];
  snapshot.sections.forEach((section, index) => {
    if ("mediaId" in section && section.mediaId) {
      links.push({
        mediaId: section.mediaId,
        sectionId: section.id,
        sortOrder: index,
      });
    }
  });
  if (snapshot.seo.socialImageId) {
    links.push({
      mediaId: snapshot.seo.socialImageId,
      sectionId: "seo",
      sortOrder: -1,
    });
  }
  return links;
}

export async function savePage(page: CmsPage, options: {validate?: boolean} = {}) {
  const draft = options.validate
    ? pageSnapshotSchema.parse(page.draft)
    : page.draft;
  const slug = page.pageKey ? page.slug : createSlug(page.slug || draft.title.it);
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      pages: snapshot.pages.map((item) =>
        item.id === page.id
          ? {...page, slug, draft, updatedAt: new Date().toISOString()}
          : item,
      ),
    }));
    return;
  }
  const {error} = await client
    .from("cms_pages")
    .update({
      slug,
      draft_content: draft,
      sort_order: page.sortOrder,
    })
    .eq("id", page.id);
  throwIfError(error);

  const deleteResult = await client
    .from("page_media_links")
    .delete()
    .eq("page_id", page.id)
    .eq("scope", "draft");
  throwIfError(deleteResult.error);
  const links = pageMediaReferences(draft);
  if (links.length) {
    const {error: linkError} = await client.from("page_media_links").insert(
      links.map((link) => ({
        page_id: page.id,
        media_id: link.mediaId,
        section_id: link.sectionId,
        scope: "draft",
        sort_order: link.sortOrder,
      })),
    );
    throwIfError(linkError);
  }
}

export async function duplicatePage(id: string) {
  const client = clientOrNull();
  if (!client) {
    const source = readCmsDemo().pages.find((page) => page.id === id);
    if (!source) throw new Error("PAGE_NOT_FOUND");
    const copy = structuredClone(source);
    copy.id = crypto.randomUUID();
    copy.pageKey = null;
    copy.slug = createSlug(`${source.slug}-copia`);
    copy.draft.title.it = `${copy.draft.title.it} copia`;
    copy.status = "draft";
    copy.published = null;
    copy.publishedAt = null;
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      pages: [...snapshot.pages, copy],
    }));
    return copy;
  }
  const {data, error} = await client
    .rpc("cms_duplicate_page", {p_page_id: id})
    .single();
  throwIfError(error);
  return mapCmsPage(data as unknown as Record<string, unknown>);
}

export async function publishPage(id: string) {
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      pages: snapshot.pages.map((page) =>
        page.id === id
          ? {
              ...page,
              status: "published",
              published: structuredClone(page.draft),
              publishedAt: new Date().toISOString(),
            }
          : page,
      ),
    }));
    return;
  }
  const {error} = await client.rpc("cms_publish_page", {p_page_id: id});
  throwIfError(error);
}

export async function unpublishPage(id: string) {
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      pages: snapshot.pages.map((page) =>
        page.id === id ? {...page, status: "draft", publishedAt: null} : page,
      ),
    }));
    return;
  }
  const {error} = await client.rpc("cms_unpublish_page", {p_page_id: id});
  throwIfError(error);
}

export async function archivePage(id: string, archived: boolean) {
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      pages: snapshot.pages.map((page) =>
        page.id === id
          ? {...page, status: archived ? "archived" : "draft", publishedAt: null}
          : page,
      ),
    }));
    return;
  }
  const {error} = await client.rpc("cms_archive_page", {
    p_page_id: id,
    p_archived: archived,
  });
  throwIfError(error);
}

export async function getAdminSettings() {
  const client = clientOrNull();
  if (!client) return readCmsDemo().settings;
  const {data, error} = await client
    .from("cms_site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  throwIfError(error);
  return mapCmsSettings(data as Record<string, unknown> | null);
}

export async function saveAdminSettings(content: CmsSiteSettingsContent) {
  const draft = siteSettingsContentSchema.parse(content);
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      settings: {
        ...snapshot.settings,
        draft,
        updatedAt: new Date().toISOString(),
      },
    }));
    return;
  }
  const {error} = await client
    .from("cms_site_settings")
    .update({draft_content: draft})
    .eq("id", true);
  throwIfError(error);
}

export async function publishAdminSettings() {
  const client = clientOrNull();
  if (!client) {
    mutateCmsDemo((snapshot) => ({
      ...snapshot,
      settings: {
        ...snapshot.settings,
        published: structuredClone(snapshot.settings.draft),
        publishedAt: new Date().toISOString(),
      },
    }));
    return;
  }
  const {error} = await client.rpc("cms_publish_site_settings");
  throwIfError(error);
}

export async function getAdminMedia(): Promise<MediaAsset[]> {
  const client = clientOrNull();
  if (!client) return [];
  const {data, error} = await client
    .from("media_assets")
    .select("*")
    .order("created_at", {ascending: false});
  throwIfError(error);
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const urls = await signCmsMediaPaths(
    client,
    rows.flatMap((row) => [
      String(row.storage_path ?? ""),
      String(row.thumbnail_path ?? ""),
    ]),
  );
  return rows.map((row) => mapMediaAsset(row, urls));
}

export async function uploadCmsMedia(
  processed: ProcessedUploadImage,
): Promise<MediaAsset> {
  const client = clientOrNull();
  if (!client) throw new Error("SUPABASE_NOT_CONFIGURED");
  const assetId = crypto.randomUUID();
  const storagePath = `${assetId}/display.webp`;
  const thumbnailPath = `${assetId}/thumbnail.webp`;
  const uploaded: string[] = [];

  const mainResult = await client.storage
    .from(cmsMediaBucket)
    .upload(storagePath, processed.image, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
  if (mainResult.error) throw mainResult.error;
  uploaded.push(storagePath);

  const thumbResult = await client.storage
    .from(cmsMediaBucket)
    .upload(thumbnailPath, processed.thumbnail, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
  if (thumbResult.error) {
    await client.storage.from(cmsMediaBucket).remove(uploaded);
    throw thumbResult.error;
  }
  uploaded.push(thumbnailPath);

  const {data, error} = await client
    .from("media_assets")
    .insert({
      id: assetId,
      storage_path: storagePath,
      thumbnail_path: thumbnailPath,
      original_name: processed.sourceName,
      mime_type: "image/webp",
      width: processed.width,
      height: processed.height,
      bytes: processed.sourceBytes,
      alt_text: "",
      caption: "",
      translations: {},
    })
    .select("*")
    .single();
  if (error || !data) {
    await client.storage.from(cmsMediaBucket).remove(uploaded);
    throw error ?? new Error("MEDIA_METADATA_NOT_SAVED");
  }
  const urls = await signCmsMediaPaths(client, uploaded);
  return mapMediaAsset(data as Record<string, unknown>, urls);
}

export async function updateMediaAsset(asset: MediaAsset) {
  const client = clientOrNull();
  if (!client) throw new Error("SUPABASE_NOT_CONFIGURED");
  const {error} = await client
    .from("media_assets")
    .update({
      alt_text: asset.alt.it,
      caption: asset.caption.it,
      translations: {
        en: {alt: asset.alt.en ?? "", caption: asset.caption.en ?? ""},
      },
      status: asset.status,
    })
    .eq("id", asset.id);
  throwIfError(error);
}

export async function setMediaArchived(id: string, archived: boolean) {
  const client = clientOrNull();
  if (!client) throw new Error("SUPABASE_NOT_CONFIGURED");
  const {error} = await client
    .from("media_assets")
    .update({status: archived ? "archived" : "active"})
    .eq("id", id);
  throwIfError(error);
}

export async function linkProductMedia(
  productId: string,
  assets: MediaAsset[],
) {
  const client = clientOrNull();
  if (!client) return;
  if (assets.length > 12) throw new Error("PRODUCT_MEDIA_LIMIT");

  const current = await client
    .from("product_media_links")
    .select("media_id, role, focal_x, focal_y")
    .eq("product_id", productId)
    .eq("scope", "draft");
  throwIfError(current.error);
  const currentById = new Map(
    (current.data ?? []).map((row) => [row.media_id, row]),
  );
  const deletion = await client
    .from("product_media_links")
    .delete()
    .eq("product_id", productId)
    .eq("scope", "draft");
  throwIfError(deletion.error);
  if (!assets.length) return;

  const {error} = await client.from("product_media_links").insert(
    assets.map((asset, index) => {
      const prior = currentById.get(asset.id);
      return {
        product_id: productId,
        media_id: asset.id,
        scope: "draft",
        role: index === 0 ? "primary" : "gallery",
        sort_order: index,
        focal_x: prior?.focal_x ?? 0.5,
        focal_y: prior?.focal_y ?? 0.5,
      };
    }),
  );
  throwIfError(error);
}

export async function updateProductMediaFocalPoint(
  productId: string,
  mediaId: string,
  focalX: number,
  focalY: number,
) {
  const client = clientOrNull();
  if (!client) return;
  const {error} = await client
    .from("product_media_links")
    .update({focal_x: focalX, focal_y: focalY})
    .eq("product_id", productId)
    .eq("media_id", mediaId)
    .eq("scope", "draft");
  throwIfError(error);
}
