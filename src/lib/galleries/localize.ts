import type {Locale} from "@/lib/i18n/config";
import type {Gallery, GalleryPhoto} from "./types";

export function localizeGalleryPhoto(
  photo: GalleryPhoto,
  locale: Locale,
): GalleryPhoto {
  if (locale === "it") return photo;
  const translation = photo.translations[locale];
  if (!translation) return photo;
  return {
    ...photo,
    altText: translation.altText.trim() || photo.altText,
    caption: translation.caption.trim() || photo.caption,
  };
}

export function localizeGallery(
  gallery: Gallery,
  locale: Locale,
): Gallery {
  const translation = locale === "it" ? undefined : gallery.translations[locale];
  const photos = gallery.photos.map((photo) =>
    localizeGalleryPhoto(photo, locale),
  );
  return {
    ...gallery,
    title: translation?.title.trim() || gallery.title,
    description: translation?.description.trim() || gallery.description,
    locationName:
      translation?.locationName.trim() || gallery.locationName,
    photos,
    coverPhoto:
      photos.find((photo) => photo.id === gallery.coverPhotoId) ?? null,
  };
}
