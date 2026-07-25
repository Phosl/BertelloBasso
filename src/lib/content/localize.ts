import type {Locale} from "@/lib/i18n/config";
import type {Product} from "./types";

export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale === "it") return product;

  const translation = product.translations[locale];
  if (!translation) return product;

  return {
    ...product,
    name: translation.name.trim() || product.name,
    eyebrow: translation.eyebrow.trim() || product.eyebrow,
    description: translation.description.trim() || product.description,
    media: product.media?.map((media) => ({
      ...media,
      altText: media.altText || translation.name.trim() || product.name,
    })),
  };
}
