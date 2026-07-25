import type {Locale} from "@/lib/i18n/config";
import type {
  ProductCategory,
  ProductFormat,
  ProductStatus,
} from "@/lib/content/types";

export type CmsStatus = "draft" | "published" | "archived";

export type LocalizedText = {
  it: string;
  en?: string;
};

export type RichTextMark = {
  type: "bold" | "italic" | "link";
  attrs?: {href?: string};
};

export type RichTextNode = {
  type: "doc" | "paragraph" | "heading" | "bulletList" | "orderedList" | "listItem" | "text";
  attrs?: {level?: 2 | 3};
  marks?: RichTextMark[];
  text?: string;
  content?: RichTextNode[];
};

export type RichTextDocument = {
  type: "doc";
  content: RichTextNode[];
};

export type SeoContent = {
  title: LocalizedText;
  description: LocalizedText;
  socialImageId: string | null;
};

export type PageSectionBase = {
  id: string;
  hidden: boolean;
};

export type HeroSection = PageSectionBase & {
  type: "hero";
  kicker: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  mediaId: string | null;
  watercolor: boolean;
  actionLabel: LocalizedText;
  actionHref: string;
};

export type RichTextSection = PageSectionBase & {
  type: "richText";
  title: LocalizedText;
  content: Record<Locale, RichTextDocument>;
};

export type ImageSection = PageSectionBase & {
  type: "image";
  mediaId: string | null;
  caption: LocalizedText;
  watercolor: boolean;
};

export type ImageTextSection = PageSectionBase & {
  type: "imageText";
  kicker: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  mediaId: string | null;
  imageSide: "left" | "right";
  actionLabel: LocalizedText;
  actionHref: string;
};

export type CardItem = {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
};

export type CardsSection = PageSectionBase & {
  type: "cards";
  kicker: LocalizedText;
  title: LocalizedText;
  items: CardItem[];
};

export type QuoteSection = PageSectionBase & {
  type: "quote";
  quote: LocalizedText;
  author: LocalizedText;
};

export type ProductGridSection = PageSectionBase & {
  type: "productGrid";
  title: LocalizedText;
  mode: "all" | "featured" | "selected";
  productIds: string[];
  limit: number;
  locked: boolean;
};

export type GalleryTeaserSection = PageSectionBase & {
  type: "galleryTeaser";
  kicker: LocalizedText;
  title: LocalizedText;
  galleryId: string | null;
  limit: number;
  locked: boolean;
};

export type CtaSection = PageSectionBase & {
  type: "cta";
  kicker: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  label: LocalizedText;
  href: string;
};

export type LocationSection = PageSectionBase & {
  type: "location";
  kicker: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  address: string;
  latitude: number | null;
  longitude: number | null;
  showMap: boolean;
};

export type ContactFormSection = PageSectionBase & {
  type: "contactForm";
  title: LocalizedText;
  locked: boolean;
};

export type GalleryIndexSection = PageSectionBase & {
  type: "galleryIndex";
  locked: boolean;
};

export type PageSection =
  | HeroSection
  | RichTextSection
  | ImageSection
  | ImageTextSection
  | CardsSection
  | QuoteSection
  | ProductGridSection
  | GalleryTeaserSection
  | CtaSection
  | LocationSection
  | ContactFormSection
  | GalleryIndexSection;

export type PageSnapshot = {
  title: LocalizedText;
  seo: SeoContent;
  sections: PageSection[];
};

export type CmsPage = {
  id: string;
  pageKey: "home" | "products" | "story" | "contact" | "photography" | null;
  slug: string;
  status: CmsStatus;
  sortOrder: number;
  draft: PageSnapshot;
  published: PageSnapshot | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductTranslationDraft = {
  name: string;
  eyebrow: string;
  description: string;
};

export type ProductDraftContent = {
  name: string;
  eyebrow: string;
  description: string;
  translations: {en?: ProductTranslationDraft};
  category: ProductCategory;
  availability: ProductStatus;
  formats: ProductFormat[];
  featured: boolean;
  visual:
    | "oil"
    | "white-wine"
    | "red-wine"
    | "gin"
    | "sauce"
    | "tomato-chips"
    | "polenta-chips";
  accent: string;
  seo: SeoContent;
};

export type ProductDraft = {
  id: string;
  slug: string;
  status: CmsStatus;
  sortOrder: number;
  content: ProductDraftContent;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  media: ProductMedia[];
};

export type MediaAsset = {
  id: string;
  storagePath: string;
  thumbnailPath: string;
  originalName: string;
  mimeType: string;
  width: number;
  height: number;
  bytes: number;
  alt: LocalizedText;
  caption: LocalizedText;
  status: "active" | "archived";
  imageUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductMedia = {
  id: string;
  productId: string;
  mediaId: string;
  scope: "draft" | "published";
  role: "primary" | "gallery";
  sortOrder: number;
  focalX: number;
  focalY: number;
  asset: MediaAsset;
};

export type NavigationEntry = {
  pageId: string;
  label: LocalizedText;
  showHeader: boolean;
  showFooter: boolean;
  sortOrder: number;
};

export type CmsSiteSettingsContent = {
  email: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  instagramUrl: string;
  footerKicker: LocalizedText;
  footerTitle: LocalizedText;
  footerSignature: LocalizedText;
  defaultSeo: SeoContent;
  navigation: NavigationEntry[];
};

export type CmsSiteSettings = {
  draft: CmsSiteSettingsContent;
  published: CmsSiteSettingsContent;
  updatedAt: string;
  publishedAt: string | null;
};

export type ProcessedCmsImage = {
  sourceName: string;
  image: File;
  thumbnail: File;
  width: number;
  height: number;
  sourceBytes: number;
};
