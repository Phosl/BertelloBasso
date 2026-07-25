import {describe, expect, it} from "vitest";
import {localizeText, visibleSections} from "./localize";
import {createSlug, isReservedPageSlug} from "./slug";
import {
  pagePublicationIssues,
  productPublicationIssues,
} from "./validation";
import type {
  PageSnapshot,
  ProductDraftContent,
} from "./types";

const product: ProductDraftContent = {
  name: "Olio",
  eyebrow: "Raccolto",
  description: "Olio umbro.",
  translations: {},
  category: "olio",
  availability: "available",
  formats: [{label: "500 ml", price: 20}],
  featured: true,
  visual: "oil",
  accent: "#8d8a3f",
  seo: {
    title: {it: "Olio", en: ""},
    description: {it: "Olio umbro.", en: ""},
    socialImageId: null,
  },
};

const page: PageSnapshot = {
  title: {it: "Visite", en: ""},
  seo: {
    title: {it: "Visite", en: ""},
    description: {it: "Visite in azienda.", en: ""},
    socialImageId: null,
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      hidden: false,
      kicker: {it: "", en: ""},
      title: {it: "Visite", en: ""},
      body: {it: "Benvenuti.", en: ""},
      mediaId: null,
      watercolor: false,
      actionLabel: {it: "", en: ""},
      actionHref: "",
    },
    {
      id: "cta",
      type: "cta",
      hidden: false,
      kicker: {it: "", en: ""},
      title: {it: "Scrivici", en: ""},
      body: {it: "", en: ""},
      label: {it: "Contatti", en: ""},
      href: "/contatti",
    },
  ],
};

describe("CMS localization and slugs", () => {
  it("uses English when present and falls back to Italian", () => {
    expect(localizeText({it: "Terra", en: "Land"}, "en")).toBe("Land");
    expect(localizeText({it: "Terra", en: ""}, "en")).toBe("Terra");
  });

  it("creates stable slugs and recognizes reserved routes", () => {
    expect(createSlug("  Olio Èvo 2026! ")).toBe("olio-evo-2026");
    expect(isReservedPageSlug("prodotti")).toBe(true);
    expect(isReservedPageSlug("visite-in-frantoio")).toBe(false);
  });
});

describe("CMS publication rules", () => {
  it("accepts a complete product and rejects incomplete formats", () => {
    expect(productPublicationIssues(product)).toEqual([]);
    expect(
      productPublicationIssues({...product, formats: [{label: ""}]}),
    ).toContain("Indica il formato.");
  });

  it("requires a visible section and protects reserved custom slugs", () => {
    const hidden = {
      ...page,
      sections: page.sections.map((section) => ({...section, hidden: true})),
    };
    expect(pagePublicationIssues("pagina", hidden, null)).toContain(
      "Rendi visibile almeno una sezione.",
    );
    expect(pagePublicationIssues("prodotti", page, null)).toContain(
      "Questo indirizzo è riservato a una pagina del sito.",
    );
  });

  it("filters hidden sections without changing their order", () => {
    expect(
      visibleSections({
        ...page,
        sections: page.sections.map((section, index) => ({
          ...section,
          hidden: index === 0,
        })),
      }).map((section) => section.id),
    ).toEqual(["cta"]);
  });
});
