import type {Locale} from "@/lib/i18n/config";

export type GalleryStatus = "draft" | "published" | "archived";
export type GalleryMediaType = "image" | "video";
export type GallerySourceType = "standard" | "dng";

export type GalleryTranslation = {
  title: string;
  description: string;
  locationName: string;
};

export type GalleryPhotoTranslation = {
  altText: string;
  caption: string;
};

export type GalleryPhoto = {
  id: string;
  galleryId: string;
  storagePath: string;
  thumbnailPath: string;
  originalPath: string | null;
  mediaType: GalleryMediaType;
  sourceType: GallerySourceType;
  mimeType: string;
  sourceName: string;
  durationMs: number | null;
  width: number;
  height: number;
  altText: string;
  caption: string;
  translations: Partial<Record<Locale, GalleryPhotoTranslation>>;
  sortOrder: number;
  createdAt: string;
  imageUrl: string;
  thumbnailUrl: string;
  originalUrl: string;
};

export type Gallery = {
  id: string;
  slug: string;
  title: string;
  description: string;
  translations: Partial<Record<Locale, GalleryTranslation>>;
  locationName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  status: GalleryStatus;
  coverPhotoId: string | null;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  photos: GalleryPhoto[];
  coverPhoto: GalleryPhoto | null;
  photoCount: number;
};

export type GalleryContentInput = {
  title: string;
  description: string;
  translations: Partial<Record<Locale, GalleryTranslation>>;
  locationName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
};

export type ProcessedGalleryMedia = {
  sourceName: string;
  media: File;
  thumbnail: File;
  original: File | null;
  mediaType: GalleryMediaType;
  sourceType: GallerySourceType;
  mimeType: string;
  width: number;
  height: number;
  durationMs: number | null;
};
