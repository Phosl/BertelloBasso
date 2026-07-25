"use client";

import type {PostgrestError, SupabaseClient} from "@supabase/supabase-js";
import {getBrowserSupabase} from "@/lib/supabase/browser";
import {gallerySelect, mapGallery, mapGalleryPhoto} from "./mapper";
import {galleryBucket, signGalleryPaths} from "./storage";
import {galleryContentSchema} from "./validation";
import type {
  Gallery,
  GalleryContentInput,
  GalleryPhoto,
  ProcessedGalleryImage,
} from "./types";

function galleryClient(): SupabaseClient {
  const client = getBrowserSupabase();
  if (!client) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  return client;
}

function throwIfError(error: PostgrestError | Error | null) {
  if (error) throw error;
}

async function signRows(
  client: SupabaseClient,
  rows: Array<Record<string, unknown>>,
) {
  const paths = rows.flatMap((row) => {
    const photos = Array.isArray(row.gallery_photos)
      ? (row.gallery_photos as Array<Record<string, unknown>>)
      : [];
    return photos.flatMap((photo) => [
      String(photo.storage_path ?? ""),
      String(photo.thumbnail_path ?? ""),
    ]);
  });
  const signedUrls = await signGalleryPaths(client, paths);
  return rows.map((row) => mapGallery(row, signedUrls));
}

export async function getAdminGalleries(): Promise<Gallery[]> {
  const client = galleryClient();
  const {data, error} = await client
    .from("galleries")
    .select(gallerySelect)
    .order("sort_order")
    .order("sort_order", {referencedTable: "gallery_photos"});
  throwIfError(error);
  return signRows(
    client,
    (data ?? []) as Array<Record<string, unknown>>,
  );
}

export async function getAdminGallery(id: string): Promise<Gallery | null> {
  const client = galleryClient();
  const {data, error} = await client
    .from("galleries")
    .select(gallerySelect)
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  if (!data) return null;
  const [gallery] = await signRows(client, [
    data as unknown as Record<string, unknown>,
  ]);
  return gallery ?? null;
}

export async function createGallery(title: string): Promise<Gallery> {
  const client = galleryClient();
  const {data, error} = await client
    .rpc("create_gallery", {p_title: title.trim()})
    .single();
  throwIfError(error);
  return mapGallery(data as unknown as Record<string, unknown>);
}

export async function updateGalleryContent(
  id: string,
  input: GalleryContentInput,
) {
  const client = galleryClient();
  const values = galleryContentSchema.parse(input);
  const {error} = await client
    .from("galleries")
    .update({
      title: values.title,
      description: values.description,
      translations: values.translations,
      location_name: values.locationName,
      address: values.address,
      latitude: values.latitude,
      longitude: values.longitude,
      google_place_id: values.googlePlaceId,
    })
    .eq("id", id);
  throwIfError(error);
}

export async function publishGallery(id: string, publish: boolean) {
  const client = galleryClient();
  const {error} = await client.rpc("publish_gallery", {
    p_gallery_id: id,
    p_publish: publish,
  });
  throwIfError(error);
}

export async function setGalleryCover(galleryId: string, photoId: string) {
  const client = galleryClient();
  const {error} = await client.rpc("set_gallery_cover", {
    p_gallery_id: galleryId,
    p_photo_id: photoId,
  });
  throwIfError(error);
}

export async function setGalleryArchived(id: string, archived: boolean) {
  const client = galleryClient();
  const {error} = await client
    .from("galleries")
    .update({
      status: archived ? "archived" : "draft",
      published_at: null,
    })
    .eq("id", id);
  throwIfError(error);
}

export async function reorderGalleryPhotos(
  galleryId: string,
  photoIds: string[],
) {
  const client = galleryClient();
  const {error} = await client.rpc("reorder_gallery_photos", {
    p_gallery_id: galleryId,
    p_photo_ids: photoIds,
  });
  throwIfError(error);
}

export async function updateGalleryPhotoText(
  photoId: string,
  input: {
    altText: string;
    caption: string;
    englishAltText: string;
    englishCaption: string;
  },
) {
  const client = galleryClient();
  const {error} = await client
    .from("gallery_photos")
    .update({
      alt_text: input.altText,
      caption: input.caption,
      translations: {
        en: {
          altText: input.englishAltText,
          caption: input.englishCaption,
        },
      },
    })
    .eq("id", photoId);
  throwIfError(error);
}

export async function uploadGalleryPhoto(
  gallery: Gallery,
  processed: ProcessedGalleryImage,
  options?: {sortOrder?: number; setAsCover?: boolean},
): Promise<GalleryPhoto> {
  const client = galleryClient();
  const photoId = crypto.randomUUID();
  const storagePath = `${gallery.id}/${photoId}/display.webp`;
  const thumbnailPath = `${gallery.id}/${photoId}/thumbnail.webp`;
  const uploadedPaths: string[] = [];

  const imageUpload = await client.storage
    .from(galleryBucket)
    .upload(storagePath, processed.image, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: false,
    });
  if (imageUpload.error) throw imageUpload.error;
  uploadedPaths.push(storagePath);

  const thumbnailUpload = await client.storage
    .from(galleryBucket)
    .upload(thumbnailPath, processed.thumbnail, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: false,
    });
  if (thumbnailUpload.error) {
    await client.storage.from(galleryBucket).remove(uploadedPaths);
    throw thumbnailUpload.error;
  }
  uploadedPaths.push(thumbnailPath);

  const fallbackAlt = `${gallery.title}, ${gallery.locationName || "Umbria"}`;
  const {data, error} = await client
    .from("gallery_photos")
    .insert({
      id: photoId,
      gallery_id: gallery.id,
      storage_path: storagePath,
      thumbnail_path: thumbnailPath,
      width: processed.width,
      height: processed.height,
      alt_text: fallbackAlt,
      caption: "",
      translations: {},
      sort_order: options?.sortOrder ?? gallery.photos.length,
    })
    .select("*")
    .single();

  if (error || !data) {
    await client.storage.from(galleryBucket).remove(uploadedPaths);
    throw error ?? new Error("PHOTO_METADATA_NOT_SAVED");
  }

  if (options?.setAsCover) {
    try {
      await setGalleryCover(gallery.id, photoId);
    } catch (coverError) {
      await client.from("gallery_photos").delete().eq("id", photoId);
      await client.storage.from(galleryBucket).remove(uploadedPaths);
      throw coverError;
    }
  }

  const signedUrls = await signGalleryPaths(client, uploadedPaths);
  return mapGalleryPhoto(
    data as unknown as Record<string, unknown>,
    signedUrls,
  );
}

export async function deleteGalleryPhoto(photo: GalleryPhoto) {
  const client = galleryClient();
  const {error} = await client
    .from("gallery_photos")
    .delete()
    .eq("id", photo.id);
  throwIfError(error);

  const {error: storageError} = await client.storage
    .from(galleryBucket)
    .remove([photo.storagePath, photo.thumbnailPath]);
  if (storageError) {
    console.error({
      scope: "admin_galleries",
      operation: "delete",
      resource: "gallery-photos",
      code: storageError.name,
    });
  }
}
