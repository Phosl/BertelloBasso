import {z} from "zod";
import type {Gallery, GalleryContentInput} from "./types";

const optionalCoordinate = z.number().finite().nullable();

export const galleryContentSchema = z.object({
  title: z.string().trim().min(1, "Inserisci il titolo italiano."),
  description: z.string(),
  translations: z.object({
    en: z
      .object({
        title: z.string(),
        description: z.string(),
        locationName: z.string(),
      })
      .optional(),
  }),
  locationName: z.string(),
  address: z.string(),
  latitude: optionalCoordinate.refine(
    (value) => value === null || (value >= -90 && value <= 90),
    "La latitudine non è valida.",
  ),
  longitude: optionalCoordinate.refine(
    (value) => value === null || (value >= -180 && value <= 180),
    "La longitudine non è valida.",
  ),
  googlePlaceId: z.string().nullable(),
}) satisfies z.ZodType<GalleryContentInput>;

export function getPublicationIssues(gallery: Gallery) {
  const issues: string[] = [];
  if (!gallery.title.trim()) issues.push("Inserisci il titolo italiano.");
  if (!gallery.locationName.trim()) issues.push("Inserisci la località.");
  if (gallery.photos.length === 0) issues.push("Aggiungi almeno una foto o un video.");
  if (
    !gallery.coverPhotoId ||
    !gallery.photos.some((photo) => photo.id === gallery.coverPhotoId)
  ) {
    issues.push("Scegli il contenuto di copertina.");
  }
  return issues;
}
