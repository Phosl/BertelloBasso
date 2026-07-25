import "server-only";

import {cache} from "react";
import {createClient} from "@supabase/supabase-js";
import type {Locale} from "@/lib/i18n/config";
import {isMissingSchemaError} from "@/lib/supabase/errors";
import {localizeGallery} from "./localize";
import {gallerySelect, mapGallery} from "./mapper";
import {signGalleryPaths} from "./storage";
import type {Gallery} from "./types";

function getPublicGalleryClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {persistSession: false, autoRefreshToken: false},
  });
}

function logGalleryError(
  operation: string,
  resource: string,
  error: {code?: string} | null,
) {
  console.error({
    scope: "public_galleries",
    operation,
    resource,
    code: error?.code ?? "unknown",
  });
}

async function queryPublishedRows(slug?: string) {
  const client = getPublicGalleryClient();
  if (!client) return [];

  let query = client
    .from("galleries")
    .select(gallerySelect)
    .eq("status", "published")
    .order("sort_order")
    .order("sort_order", {
      referencedTable: "gallery_photos",
    });
  if (slug) query = query.eq("slug", slug);

  const {data, error} = await query;
  if (error) {
    logGalleryError("select", "galleries", error);
    return [];
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const paths = rows.flatMap((row) => {
    const photos = Array.isArray(row.gallery_photos)
      ? (row.gallery_photos as Array<Record<string, unknown>>)
      : [];
    return photos.flatMap((photo) => [
      String(photo.storage_path ?? ""),
      String(photo.thumbnail_path ?? ""),
    ]);
  });

  try {
    const signedUrls = await signGalleryPaths(client, paths);
    return rows.map((row) => mapGallery(row, signedUrls));
  } catch (error) {
    const storageError = error as {code?: string};
    logGalleryError("sign", "gallery-photos", storageError);
    return rows.map((row) => mapGallery(row));
  }
}

export const getPublishedGalleries = cache(
  async (locale: Locale): Promise<Gallery[]> => {
    const galleries = await queryPublishedRows();
    return galleries.map((gallery) => localizeGallery(gallery, locale));
  },
);

export const getPublishedGallery = cache(
  async (slug: string, locale: Locale): Promise<Gallery | null> => {
    const [gallery] = await queryPublishedRows(slug);
    return gallery ? localizeGallery(gallery, locale) : null;
  },
);

export async function gallerySchemaIsAvailable() {
  const client = getPublicGalleryClient();
  if (!client) return false;
  const {error} = await client.from("galleries").select("id").limit(1);
  return !isMissingSchemaError(error);
}
