import {z} from "zod";
import {isReservedPageSlug} from "./slug";
import type {
  CmsSiteSettingsContent,
  PageSnapshot,
  ProductDraftContent,
  RichTextDocument,
} from "./types";

const localizedTextSchema = z.object({
  it: z.string(),
  en: z.string().optional(),
});

const richTextMarkSchema = z.object({
  type: z.enum(["bold", "italic", "link"]),
  attrs: z.object({href: z.string().optional()}).optional(),
});

const richTextNodeSchema: z.ZodType<RichTextDocument["content"][number]> =
  z.lazy(() =>
    z.object({
      type: z.enum([
        "doc",
        "paragraph",
        "heading",
        "bulletList",
        "orderedList",
        "listItem",
        "text",
      ]),
      attrs: z.object({level: z.union([z.literal(2), z.literal(3)]).optional()}).optional(),
      marks: z.array(richTextMarkSchema).optional(),
      text: z.string().optional(),
      content: z.array(richTextNodeSchema).optional(),
    }),
  );

const richTextDocumentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(richTextNodeSchema),
});

const sectionBase = {
  id: z.string().min(1),
  hidden: z.boolean(),
};

const seoSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
  socialImageId: z.string().uuid().nullable(),
});

const pageSectionSchema = z.discriminatedUnion("type", [
  z.object({
    ...sectionBase,
    type: z.literal("hero"),
    kicker: localizedTextSchema,
    title: localizedTextSchema,
    body: localizedTextSchema,
    mediaId: z.string().uuid().nullable(),
    watercolor: z.boolean(),
    actionLabel: localizedTextSchema,
    actionHref: z.string(),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("richText"),
    title: localizedTextSchema,
    content: z.object({
      it: richTextDocumentSchema,
      en: richTextDocumentSchema,
    }),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("image"),
    mediaId: z.string().uuid().nullable(),
    caption: localizedTextSchema,
    watercolor: z.boolean(),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("imageText"),
    kicker: localizedTextSchema,
    title: localizedTextSchema,
    body: localizedTextSchema,
    mediaId: z.string().uuid().nullable(),
    imageSide: z.enum(["left", "right"]),
    actionLabel: localizedTextSchema,
    actionHref: z.string(),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("cards"),
    kicker: localizedTextSchema,
    title: localizedTextSchema,
    items: z
      .array(
        z.object({
          id: z.string().min(1),
          title: localizedTextSchema,
          body: localizedTextSchema,
        }),
      )
      .min(2)
      .max(6),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("quote"),
    quote: localizedTextSchema,
    author: localizedTextSchema,
  }),
  z.object({
    ...sectionBase,
    type: z.literal("productGrid"),
    title: localizedTextSchema,
    mode: z.enum(["all", "featured", "selected"]),
    productIds: z.array(z.string()),
    limit: z.number().int().min(1).max(99),
    locked: z.boolean(),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("galleryTeaser"),
    kicker: localizedTextSchema,
    title: localizedTextSchema,
    galleryId: z.string().uuid().nullable(),
    limit: z.number().int().min(1).max(6),
    locked: z.boolean(),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("cta"),
    kicker: localizedTextSchema,
    title: localizedTextSchema,
    body: localizedTextSchema,
    label: localizedTextSchema,
    href: z.string(),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("location"),
    kicker: localizedTextSchema,
    title: localizedTextSchema,
    body: localizedTextSchema,
    address: z.string(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    showMap: z.boolean(),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("contactForm"),
    title: localizedTextSchema,
    locked: z.boolean(),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("galleryIndex"),
    locked: z.boolean(),
  }),
]);

export const pageSnapshotSchema = z.object({
  title: localizedTextSchema,
  seo: seoSchema,
  sections: z.array(pageSectionSchema).min(1).max(30),
}) satisfies z.ZodType<PageSnapshot>;

export const productDraftContentSchema = z.object({
  name: z.string().trim().min(1, "Inserisci il nome italiano."),
  eyebrow: z.string(),
  description: z.string().trim().min(1, "Inserisci la descrizione italiana."),
  translations: z.object({
    en: z
      .object({
        name: z.string(),
        eyebrow: z.string(),
        description: z.string(),
      })
      .optional(),
  }),
  category: z.enum(["olio", "vino", "distillati", "dispensa"]),
  availability: z.enum(["available", "coming_soon", "seasonal"]),
  formats: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Indica il formato."),
        price: z.number().nonnegative().optional(),
      }),
    )
    .min(1, "Aggiungi almeno un formato."),
  featured: z.boolean(),
  visual: z.enum([
    "oil",
    "white-wine",
    "red-wine",
    "gin",
    "sauce",
    "tomato-chips",
    "polenta-chips",
  ]),
  accent: z.string().regex(/^#[0-9a-f]{6}$/i, "Scegli un colore valido."),
  seo: seoSchema,
}) satisfies z.ZodType<ProductDraftContent>;

export const siteSettingsContentSchema = z.object({
  email: z.email(),
  phone: z.string(),
  address: z.string(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  instagramUrl: z.union([z.literal(""), z.url()]),
  footerKicker: localizedTextSchema,
  footerTitle: localizedTextSchema,
  footerSignature: localizedTextSchema,
  defaultSeo: seoSchema,
  navigation: z.array(
    z.object({
      pageId: z.string().uuid(),
      label: localizedTextSchema,
      showHeader: z.boolean(),
      showFooter: z.boolean(),
      sortOrder: z.number().int(),
    }),
  ),
}) satisfies z.ZodType<CmsSiteSettingsContent>;

export function productPublicationIssues(content: ProductDraftContent) {
  const parsed = productDraftContentSchema.safeParse(content);
  return parsed.success
    ? []
    : parsed.error.issues.map((issue) => issue.message);
}

export function pagePublicationIssues(
  slug: string,
  snapshot: PageSnapshot,
  pageKey: string | null,
) {
  const issues: string[] = [];
  const parsed = pageSnapshotSchema.safeParse(snapshot);
  if (!parsed.success) {
    issues.push(...parsed.error.issues.map((issue) => issue.message));
  }
  if (!snapshot.title.it.trim()) issues.push("Inserisci il titolo italiano.");
  if (!slug.trim()) issues.push("Inserisci l’indirizzo della pagina.");
  if (!pageKey && isReservedPageSlug(slug)) {
    issues.push("Questo indirizzo è riservato a una pagina del sito.");
  }
  if (!snapshot.sections.some((section) => !section.hidden)) {
    issues.push("Rendi visibile almeno una sezione.");
  }
  return [...new Set(issues)];
}
