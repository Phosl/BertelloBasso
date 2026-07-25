import type {Locale} from "@/lib/i18n/config";

export type ProductCategory = "olio" | "vino" | "distillati" | "dispensa";
export type ProductStatus = "available" | "coming_soon" | "seasonal";

export type ProductFormat = {
  label: string;
  price?: number;
};

export type ProductTranslation = {
  name: string;
  eyebrow: string;
  description: string;
};

export type ProductMedia = {
  id: string;
  mediaId: string;
  role: "primary" | "gallery";
  sortOrder: number;
  focalX: number;
  focalY: number;
  width: number;
  height: number;
  altText: string;
  caption: string;
  imageUrl: string;
  thumbnailUrl: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  category: ProductCategory;
  status: ProductStatus;
  formats: ProductFormat[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
  visual: "oil" | "white-wine" | "red-wine" | "gin" | "sauce" | "tomato-chips" | "polenta-chips";
  accent: string;
  translations: Partial<Record<Exclude<Locale, "it">, ProductTranslation>>;
  media?: ProductMedia[];
};

export type SiteCopy = {
  heroKicker: string;
  heroTitle: string;
  heroBody: string;
  storyTitle: string;
  storyBody: string;
  contactEmail: string;
  contactPhone: string;
};

export type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
};

export type AdminSnapshot = {
  products: Product[];
  siteCopy: Record<Locale, SiteCopy>;
  inquiries: Inquiry[];
};
