import {brand} from "@/lib/brand";
import {defaultProducts} from "@/lib/content/default-content";
import type {Product} from "@/lib/content/types";
import {messages} from "@/lib/i18n/messages";
import type {
  CmsPage,
  CmsSiteSettings,
  CmsSiteSettingsContent,
  LocalizedText,
  PageSection,
  PageSnapshot,
  ProductDraft,
  ProductDraftContent,
  RichTextDocument,
} from "./types";

export const systemPageIds = {
  home: "00000000-0000-4000-8000-000000000001",
  products: "00000000-0000-4000-8000-000000000002",
  story: "00000000-0000-4000-8000-000000000003",
  contact: "00000000-0000-4000-8000-000000000004",
  photography: "00000000-0000-4000-8000-000000000005",
} as const;

export function localized(it = "", en = ""): LocalizedText {
  return {it, en};
}

export function plainRichText(text: string): RichTextDocument {
  return {
    type: "doc",
    content: text
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((paragraph) => ({
        type: "paragraph" as const,
        content: [{type: "text" as const, text: paragraph}],
      })),
  };
}

function snapshot(
  title: LocalizedText,
  description: LocalizedText,
  sections: PageSection[],
): PageSnapshot {
  return {
    title,
    seo: {title, description, socialImageId: null},
    sections,
  };
}

const homeSnapshot = snapshot(
  localized(brand.name, brand.name),
  localized(
    "Olio, vino e piccole produzioni agricole da San Damiano di Todi.",
    "Olive oil, wine and small-batch farm produce from San Damiano di Todi.",
  ),
  [
    {
      id: "home-hero",
      type: "hero",
      hidden: false,
      kicker: localized(
        `Azienda agricola · ${brand.location}`,
        `Family farm · ${brand.location}`,
      ),
      title: localized(
        "Coltiviamo cose buone. Con il tempo che serve.",
        "We grow good things. Giving them all the time they need.",
      ),
      body: localized(
        "Olio, vino e piccole produzioni di dispensa nate sulle colline umbre, tra gesti di famiglia e curiosità contemporanea.",
        "Olive oil, wine and small-batch pantry specialties born in the Umbrian hills, shaped by family knowledge and contemporary curiosity.",
      ),
      mediaId: null,
      watercolor: true,
      actionLabel: localized(
        messages.it.home.discoverProducts,
        messages.en.home.discoverProducts,
      ),
      actionHref: "/prodotti",
    },
    {
      id: "home-products",
      type: "productGrid",
      hidden: false,
      title: localized(
        messages.it.home.productsTitle,
        messages.en.home.productsTitle,
      ),
      mode: "featured",
      productIds: [],
      limit: 4,
      locked: false,
    },
    {
      id: "home-story",
      type: "imageText",
      hidden: false,
      kicker: localized(
        `${brand.name} · ${brand.location}`,
        `${brand.name} · ${brand.location}`,
      ),
      title: localized(
        "Una casa, due persone, molte stagioni.",
        "One home, two people, many seasons.",
      ),
      body: localized(
        `${brand.name} è un progetto agricolo di famiglia a ${brand.location}. Coltiviamo seguendo il ritmo dei campi, trasformiamo in piccole quantità e raccontiamo ogni prodotto con trasparenza, dalla pianta alla tavola.`,
        `${brand.name} is a family farming project in ${brand.location}. We follow the rhythm of the fields, make everything in small batches and share each product transparently, from plant to table.`,
      ),
      mediaId: null,
      imageSide: "left",
      actionLabel: localized(
        messages.it.home.storyLink,
        messages.en.home.storyLink,
      ),
      actionHref: "/storia",
    },
  ],
);

const productsSnapshot = snapshot(
  localized("Prodotti", "Products"),
  localized(
    messages.it.products.metadataDescription,
    messages.en.products.metadataDescription,
  ),
  [
    {
      id: "products-hero",
      type: "hero",
      hidden: false,
      kicker: localized(
        messages.it.products.kicker,
        messages.en.products.kicker,
      ),
      title: localized(
        messages.it.products.title,
        messages.en.products.title,
      ),
      body: localized(
        messages.it.products.intro,
        messages.en.products.intro,
      ),
      mediaId: null,
      watercolor: false,
      actionLabel: localized(),
      actionHref: "",
    },
    {
      id: "products-catalog",
      type: "productGrid",
      hidden: false,
      title: localized(),
      mode: "all",
      productIds: [],
      limit: 99,
      locked: true,
    },
  ],
);

const storySnapshot = snapshot(
  localized(
    messages.it.story.metadataTitle,
    messages.en.story.metadataTitle,
  ),
  localized(
    messages.it.story.metadataDescription,
    messages.en.story.metadataDescription,
  ),
  [
    {
      id: "story-hero",
      type: "hero",
      hidden: false,
      kicker: localized(messages.it.story.kicker, messages.en.story.kicker),
      title: localized(messages.it.story.title, messages.en.story.title),
      body: localized(messages.it.story.intro, messages.en.story.intro),
      mediaId: null,
      watercolor: false,
      actionLabel: localized(),
      actionHref: "",
    },
    {
      id: "story-manifesto",
      type: "richText",
      hidden: false,
      title: localized(
        "Una casa, due persone, molte stagioni.",
        "One home, two people, many seasons.",
      ),
      content: {
        it: plainRichText(
          `${brand.name} è un progetto agricolo di famiglia a ${brand.location}. Coltiviamo seguendo il ritmo dei campi, trasformiamo in piccole quantità e raccontiamo ogni prodotto con trasparenza, dalla pianta alla tavola.`,
        ),
        en: plainRichText(
          `${brand.name} is a family farming project in ${brand.location}. We follow the rhythm of the fields, make everything in small batches and share each product transparently, from plant to table.`,
        ),
      },
    },
    {
      id: "story-values",
      type: "cards",
      hidden: false,
      kicker: localized("I nostri valori", "Our values"),
      title: localized(),
      items: messages.it.story.values.map((value, index) => ({
        id: `story-value-${index + 1}`,
        title: localized(value.title, messages.en.story.values[index].title),
        body: localized(value.body, messages.en.story.values[index].body),
      })),
    },
    {
      id: "story-place",
      type: "location",
      hidden: false,
      kicker: localized(
        `${brand.location} · Umbria`,
        `${brand.location} · Umbria`,
      ),
      title: localized(
        messages.it.story.placeTitle,
        messages.en.story.placeTitle,
      ),
      body: localized(
        messages.it.story.placeBody,
        messages.en.story.placeBody,
      ),
      address: brand.location,
      latitude: 42.78,
      longitude: 12.41,
      showMap: false,
    },
  ],
);

const contactSnapshot = snapshot(
  localized(
    messages.it.contact.metadataTitle,
    messages.en.contact.metadataTitle,
  ),
  localized(
    messages.it.contact.metadataDescription,
    messages.en.contact.metadataDescription,
  ),
  [
    {
      id: "contact-hero",
      type: "hero",
      hidden: false,
      kicker: localized(
        messages.it.contact.kicker,
        messages.en.contact.kicker,
      ),
      title: localized(messages.it.contact.title, messages.en.contact.title),
      body: localized(messages.it.contact.intro, messages.en.contact.intro),
      mediaId: null,
      watercolor: false,
      actionLabel: localized(),
      actionHref: "",
    },
    {
      id: "contact-location",
      type: "location",
      hidden: false,
      kicker: localized(
        messages.it.contact.where,
        messages.en.contact.where,
      ),
      title: localized(brand.location, brand.location),
      body: localized(
        `${messages.it.contact.country}. ${messages.it.contact.directions}`,
        `${messages.en.contact.country}. ${messages.en.contact.directions}`,
      ),
      address: brand.location,
      latitude: 42.78,
      longitude: 12.41,
      showMap: true,
    },
    {
      id: "contact-form",
      type: "contactForm",
      hidden: false,
      title: localized("Scrivici", "Write to us"),
      locked: true,
    },
  ],
);

const photographySnapshot = snapshot(
  localized(
    messages.it.photography.metadataTitle,
    messages.en.photography.metadataTitle,
  ),
  localized(
    messages.it.photography.metadataDescription,
    messages.en.photography.metadataDescription,
  ),
  [
    {
      id: "photography-hero",
      type: "hero",
      hidden: false,
      kicker: localized(
        messages.it.photography.kicker,
        messages.en.photography.kicker,
      ),
      title: localized(
        messages.it.photography.title,
        messages.en.photography.title,
      ),
      body: localized(
        messages.it.photography.intro,
        messages.en.photography.intro,
      ),
      mediaId: null,
      watercolor: false,
      actionLabel: localized(),
      actionHref: "",
    },
    {
      id: "photography-index",
      type: "galleryIndex",
      hidden: false,
      locked: true,
    },
  ],
);

const now = "2026-07-24T00:00:00.000Z";

function systemPage(
  pageKey: keyof typeof systemPageIds,
  slug: string,
  sortOrder: number,
  pageSnapshot: PageSnapshot,
): CmsPage {
  return {
    id: systemPageIds[pageKey],
    pageKey,
    slug,
    status: "published",
    sortOrder,
    draft: pageSnapshot,
    published: pageSnapshot,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

export const defaultCmsPages: CmsPage[] = [
  systemPage("home", "home", 0, homeSnapshot),
  systemPage("products", "prodotti", 1, productsSnapshot),
  systemPage("photography", "fotografie", 2, photographySnapshot),
  systemPage("story", "storia", 3, storySnapshot),
  systemPage("contact", "contatti", 4, contactSnapshot),
];

export const defaultSiteSettingsContent: CmsSiteSettingsContent = {
  email: brand.email,
  phone: "+39 000 000 0000",
  address: brand.location,
  latitude: 42.78,
  longitude: 12.41,
  instagramUrl: "",
  footerKicker: localized(
    messages.it.footer.kicker,
    messages.en.footer.kicker,
  ),
  footerTitle: localized(
    messages.it.footer.title,
    messages.en.footer.title,
  ),
  footerSignature: localized(
    messages.it.footer.signature,
    messages.en.footer.signature,
  ),
  defaultSeo: {
    title: localized(
      `${brand.name} · Azienda agricola a ${brand.location}`,
      `${brand.name} · Family farm in ${brand.location}`,
    ),
    description: localized(
      "Olio, vino e piccole produzioni agricole da San Damiano di Todi, nel cuore dell’Umbria.",
      "Olive oil, wine and small-batch farm produce from San Damiano di Todi, in the heart of Umbria.",
    ),
    socialImageId: null,
  },
  navigation: [
    {
      pageId: systemPageIds.products,
      label: localized(
        messages.it.navigation.products,
        messages.en.navigation.products,
      ),
      showHeader: true,
      showFooter: true,
      sortOrder: 1,
    },
    {
      pageId: systemPageIds.photography,
      label: localized(
        messages.it.navigation.photography,
        messages.en.navigation.photography,
      ),
      showHeader: true,
      showFooter: true,
      sortOrder: 2,
    },
    {
      pageId: systemPageIds.story,
      label: localized(
        messages.it.navigation.story,
        messages.en.navigation.story,
      ),
      showHeader: true,
      showFooter: true,
      sortOrder: 3,
    },
    {
      pageId: systemPageIds.contact,
      label: localized(
        messages.it.navigation.contact,
        messages.en.navigation.contact,
      ),
      showHeader: true,
      showFooter: true,
      sortOrder: 4,
    },
  ],
};

export const defaultCmsSiteSettings: CmsSiteSettings = {
  draft: defaultSiteSettingsContent,
  published: defaultSiteSettingsContent,
  updatedAt: now,
  publishedAt: now,
};

function productContent(product: Product): ProductDraftContent {
  return {
    name: product.name,
    eyebrow: product.eyebrow,
    description: product.description,
    translations: {
      en: product.translations.en
        ? {
            name: product.translations.en.name,
            eyebrow: product.translations.en.eyebrow,
            description: product.translations.en.description,
          }
        : undefined,
    },
    category: product.category,
    availability: product.status,
    formats: product.formats,
    featured: product.featured,
    visual: product.visual,
    accent: product.accent,
    seo: {
      title: localized(
        product.name,
        product.translations.en?.name ?? product.name,
      ),
      description: localized(
        product.description,
        product.translations.en?.description ?? product.description,
      ),
      socialImageId: null,
    },
  };
}

export const defaultProductDrafts: ProductDraft[] = defaultProducts.map(
  (product) => ({
    id: product.id,
    slug: product.slug,
    status: product.published ? "published" : "draft",
    sortOrder: product.sortOrder,
    content: productContent(product),
    publishedAt: product.published ? now : null,
    createdAt: now,
    updatedAt: now,
    media: [],
  }),
);

export function createEmptyPage(title = "Nuova pagina"): CmsPage {
  const createdAt = new Date().toISOString();
  const content = snapshot(
    localized(title),
    localized(),
    [
      {
        id: crypto.randomUUID(),
        type: "hero",
        hidden: false,
        kicker: localized(),
        title: localized(title),
        body: localized(),
        mediaId: null,
        watercolor: false,
        actionLabel: localized(),
        actionHref: "",
      },
    ],
  );
  return {
    id: crypto.randomUUID(),
    pageKey: null,
    slug: "",
    status: "draft",
    sortOrder: 100,
    draft: content,
    published: null,
    publishedAt: null,
    createdAt,
    updatedAt: createdAt,
  };
}

export function createEmptyProduct(): ProductDraft {
  const createdAt = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    slug: "",
    status: "draft",
    sortOrder: 100,
    publishedAt: null,
    createdAt,
    updatedAt: createdAt,
    media: [],
    content: {
      name: "",
      eyebrow: "",
      description: "",
      translations: {},
      category: "dispensa",
      availability: "available",
      formats: [{label: "", price: undefined}],
      featured: false,
      visual: "oil",
      accent: "#8d8a3f",
      seo: {
        title: localized(),
        description: localized(),
        socialImageId: null,
      },
    },
  };
}
