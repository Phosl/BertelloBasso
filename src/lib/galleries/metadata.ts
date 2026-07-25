import "server-only";

import type {Metadata} from "next";
import type {Locale} from "@/lib/i18n/config";
import {localizedMetadata} from "@/lib/i18n/metadata";
import {getPublishedGallery} from "./repository";

export async function photographyDetailMetadata(
  slug: string,
  locale: Locale,
): Promise<Metadata> {
  const gallery = await getPublishedGallery(slug, locale);
  if (!gallery) return {};
  const metadata = localizedMetadata({
    locale,
    route: "photography",
    slug,
    title: gallery.title,
    description: gallery.description || gallery.locationName,
  });
  if (gallery.coverPhoto?.imageUrl) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [{url: gallery.coverPhoto.imageUrl}],
    };
  }
  return metadata;
}
