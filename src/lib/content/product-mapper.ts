import {defaultProducts} from "./default-content";
import type {Product} from "./types";

export function mapProductRecord(row: Record<string, unknown>): Product {
  const fallback = defaultProducts.find(
    (product) => product.id === String(row.id),
  );
  const translations =
    row.translations && typeof row.translations === "object"
      ? (row.translations as Product["translations"])
      : {};

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    eyebrow: String(row.eyebrow),
    description: String(row.description),
    category: row.category as Product["category"],
    status: row.status as Product["status"],
    formats: row.formats as Product["formats"],
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    sortOrder: Number(row.sort_order ?? row.sortOrder),
    visual: row.visual as Product["visual"],
    accent: String(row.accent),
    translations: {
      ...fallback?.translations,
      ...translations,
    },
  };
}
