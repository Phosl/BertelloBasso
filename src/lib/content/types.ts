export type ProductCategory = "olio" | "vino" | "distillati" | "dispensa";
export type ProductStatus = "available" | "coming_soon" | "seasonal";

export type ProductFormat = {
  label: string;
  price?: number;
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
  siteCopy: SiteCopy;
  inquiries: Inquiry[];
};
