import type {
  Gallery,
  GalleryPhoto,
  GalleryPhotoTranslation,
  GalleryStatus,
  GalleryTranslation,
} from "./types";
import type {Locale} from "@/lib/i18n/config";

type Row = Record<string, unknown>;
type UrlMap = ReadonlyMap<string, string>;

function translations<T>(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Partial<Record<Locale, T>>;
  }
  return value as Partial<Record<Locale, T>>;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function nullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function mapGalleryPhoto(
  row: Row,
  signedUrls: UrlMap = new Map(),
): GalleryPhoto {
  const storagePath = stringValue(row.storage_path);
  const thumbnailPath = stringValue(row.thumbnail_path);
  return {
    id: stringValue(row.id),
    galleryId: stringValue(row.gallery_id),
    storagePath,
    thumbnailPath,
    width: Number(row.width) || 1,
    height: Number(row.height) || 1,
    altText: stringValue(row.alt_text),
    caption: stringValue(row.caption),
    translations: translations<GalleryPhotoTranslation>(row.translations),
    sortOrder: Number(row.sort_order) || 0,
    createdAt: stringValue(row.created_at),
    imageUrl: signedUrls.get(storagePath) ?? "",
    thumbnailUrl: signedUrls.get(thumbnailPath) ?? "",
  };
}

export function mapGallery(
  row: Row,
  signedUrls: UrlMap = new Map(),
): Gallery {
  const nestedPhotos = Array.isArray(row.gallery_photos)
    ? (row.gallery_photos as Row[])
    : [];
  const photos = nestedPhotos
    .map((photo) => mapGalleryPhoto(photo, signedUrls))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const coverPhotoId = nullableString(row.cover_photo_id);
  return {
    id: stringValue(row.id),
    slug: stringValue(row.slug),
    title: stringValue(row.title),
    description: stringValue(row.description),
    translations: translations<GalleryTranslation>(row.translations),
    locationName: stringValue(row.location_name),
    address: stringValue(row.address),
    latitude: nullableNumber(row.latitude),
    longitude: nullableNumber(row.longitude),
    googlePlaceId: nullableString(row.google_place_id),
    status: (stringValue(row.status) || "draft") as GalleryStatus,
    coverPhotoId,
    sortOrder: Number(row.sort_order) || 0,
    publishedAt: nullableString(row.published_at),
    createdAt: stringValue(row.created_at),
    updatedAt: stringValue(row.updated_at),
    photos,
    coverPhoto: photos.find((photo) => photo.id === coverPhotoId) ?? null,
    photoCount: photos.length,
  };
}

export const gallerySelect = `
  id,
  slug,
  title,
  description,
  translations,
  location_name,
  address,
  latitude,
  longitude,
  google_place_id,
  status,
  cover_photo_id,
  sort_order,
  published_at,
  created_at,
  updated_at,
  gallery_photos!gallery_photos_gallery_id_fkey (
    id,
    gallery_id,
    storage_path,
    thumbnail_path,
    width,
    height,
    alt_text,
    caption,
    translations,
    sort_order,
    created_at
  )
`;
