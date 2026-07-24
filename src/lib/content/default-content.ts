import type {AdminSnapshot, Product, SiteCopy} from "./types";
import {brand} from "@/lib/brand";

export const defaultProducts: Product[] = [
  {
    id: "olio-evo",
    slug: "olio-extra-vergine",
    name: "Olio Extra Vergine",
    eyebrow: "Raccolto di famiglia",
    description:
      "Olio umbro nitido e fragrante, ottenuto dalle olive raccolte nei nostri campi e molite a poche ore dalla raccolta.",
    category: "olio",
    status: "available",
    formats: [
      {label: "100 ml", price: 7},
      {label: "250 ml", price: 13},
      {label: "500 ml", price: 21},
    ],
    featured: true,
    published: true,
    sortOrder: 1,
    visual: "oil",
    accent: "#8d8a3f",
    translations: {
      en: {
        name: "Extra Virgin Olive Oil",
        eyebrow: "Our family harvest",
        description:
          "A bright, fragrant Umbrian olive oil, made from olives picked in our fields and milled within hours of harvesting.",
      },
    },
  },
  {
    id: "mitera-bianco",
    slug: "mitera-grechetto",
    name: "MITERA",
    eyebrow: "Grechetto · Umbria IGT",
    description:
      "Un bianco nato dalle nostre colline: luminoso, materico, con la freschezza quieta del paesaggio intorno a Todi.",
    category: "vino",
    status: "coming_soon",
    formats: [{label: "750 ml"}],
    featured: true,
    published: true,
    sortOrder: 2,
    visual: "white-wine",
    accent: "#b8a56e",
    translations: {
      en: {
        name: "MITERA",
        eyebrow: "Grechetto · Umbria IGT",
        description:
          "A white wine born in our hills: luminous and textured, with the quiet freshness of the landscape around Todi.",
      },
    },
  },
  {
    id: "mitera-rosso",
    slug: "mitera-rosso",
    name: "MITERA rosso",
    eyebrow: "Rosso umbro",
    description:
      "Profondo e gastronomico, custodisce la parte più calda della nostra terra. La prima annata sta riposando.",
    category: "vino",
    status: "coming_soon",
    formats: [{label: "750 ml"}],
    featured: true,
    published: true,
    sortOrder: 3,
    visual: "red-wine",
    accent: "#6f1f2f",
    translations: {
      en: {
        name: "MITERA red",
        eyebrow: "Umbrian red wine",
        description:
          "Deep and made for the table, it holds the warmest side of our land. The first vintage is still resting.",
      },
    },
  },
  {
    id: "gintaglia",
    slug: "gintaglia",
    name: "Gintaglia",
    eyebrow: "Gin agricolo",
    description:
      "Un distillato secco e botanico, attraversato dai profumi spontanei che crescono lungo i nostri campi.",
    category: "distillati",
    status: "available",
    formats: [{label: "500 ml", price: 38}],
    featured: true,
    published: true,
    sortOrder: 4,
    visual: "gin",
    accent: "#405f54",
    translations: {
      en: {
        name: "Gintaglia",
        eyebrow: "Farm gin",
        description:
          "A dry, botanical spirit shaped by the wild aromas that grow along the edges of our fields.",
      },
    },
  },
  {
    id: "salse-piccanti",
    slug: "salse-piccanti",
    name: "Salse piccanti",
    eyebrow: "Peperoncini dell’orto",
    description:
      "Piccole produzioni, intensità diverse e ingredienti riconoscibili. Per accendere senza coprire.",
    category: "dispensa",
    status: "seasonal",
    formats: [{label: "100 g", price: 9}],
    featured: false,
    published: true,
    sortOrder: 5,
    visual: "sauce",
    accent: "#a13a23",
    translations: {
      en: {
        name: "Hot sauces",
        eyebrow: "Chilies from our garden",
        description:
          "Small batches, different levels of heat and recognisable ingredients. Made to brighten a dish, never overpower it.",
      },
    },
  },
  {
    id: "chips-pomodoro",
    slug: "chips-di-pomodoro",
    name: "Chips di pomodoro",
    eyebrow: "Essiccate lentamente",
    description:
      "Pomodoro concentrato, croccante e naturalmente sapido. Un raccolto intero in un morso.",
    category: "dispensa",
    status: "seasonal",
    formats: [{label: "40 g", price: 6}],
    featured: false,
    published: true,
    sortOrder: 6,
    visual: "tomato-chips",
    accent: "#bb4d35",
    translations: {
      en: {
        name: "Tomato chips",
        eyebrow: "Slowly dried",
        description:
          "Concentrated tomato flavour, crisp and naturally savoury. A whole harvest in one bite.",
      },
    },
  },
  {
    id: "chips-semi-polenta",
    slug: "chips-semi-e-polenta",
    name: "Chips semi & polenta",
    eyebrow: "Croccanti da condividere",
    description:
      "Sfoglie sottili di mais e semi, cotte fino a diventare leggere, rustiche e irresistibili.",
    category: "dispensa",
    status: "available",
    formats: [{label: "80 g", price: 7}],
    featured: false,
    published: true,
    sortOrder: 7,
    visual: "polenta-chips",
    accent: "#c29c3e",
    translations: {
      en: {
        name: "Seed & polenta chips",
        eyebrow: "Crisp and made for sharing",
        description:
          "Thin sheets of corn and seeds, baked until light, rustic and irresistible.",
      },
    },
  },
];

export const defaultSiteCopyByLocale: Record<"it" | "en", SiteCopy> = {
  it: {
    heroKicker: `Azienda agricola · ${brand.location}`,
    heroTitle: "Coltiviamo cose buone. Con il tempo che serve.",
    heroBody:
      "Olio, vino e piccole produzioni di dispensa nate sulle colline umbre, tra gesti di famiglia e curiosità contemporanea.",
    storyTitle: "Una casa, due persone, molte stagioni.",
    storyBody:
      `${brand.name} è un progetto agricolo di famiglia a ${brand.location}. Coltiviamo seguendo il ritmo dei campi, trasformiamo in piccole quantità e raccontiamo ogni prodotto con trasparenza, dalla pianta alla tavola.`,
    contactEmail: brand.email,
    contactPhone: "+39 000 000 0000",
  },
  en: {
    heroKicker: `Family farm · ${brand.location}`,
    heroTitle: "We grow good things. Giving them all the time they need.",
    heroBody:
      "Olive oil, wine and small-batch pantry specialties born in the Umbrian hills, shaped by family knowledge and contemporary curiosity.",
    storyTitle: "One home, two people, many seasons.",
    storyBody:
      `${brand.name} is a family farming project in ${brand.location}. We follow the rhythm of the fields, make everything in small batches and share each product transparently, from plant to table.`,
    contactEmail: brand.email,
    contactPhone: "+39 000 000 0000",
  },
};

export const defaultSnapshot: AdminSnapshot = {
  products: defaultProducts,
  siteCopy: defaultSiteCopyByLocale,
  inquiries: [
    {
      id: "inq-01",
      createdAt: "2026-07-23T09:42:00.000Z",
      name: "Giulia B.",
      email: "giulia@example.com",
      subject: "Visita e degustazione",
      message: "Buongiorno, saremo vicino Todi a settembre. È possibile organizzare una visita?",
      status: "new",
    },
    {
      id: "inq-02",
      createdAt: "2026-07-21T14:18:00.000Z",
      name: "Dispensa 21",
      email: "acquisti@example.com",
      subject: "Rivendita Gintaglia",
      message: "Vorremmo ricevere informazioni su minimi d’ordine e disponibilità.",
      status: "read",
    },
  ],
};
