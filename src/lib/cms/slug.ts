export const reservedPageSlugs = new Set([
  "admin",
  "api",
  "en",
  "prodotti",
  "products",
  "storia",
  "story",
  "contatti",
  "contact",
  "fotografie",
  "photography",
  "_next",
]);

export function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isReservedPageSlug(slug: string) {
  return reservedPageSlugs.has(slug.toLowerCase());
}
