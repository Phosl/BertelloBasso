import {localized, plainRichText} from "./defaults";
import type {PageSection} from "./types";

export type EditableSectionType = PageSection["type"];

export const sectionTypeLabels: Record<EditableSectionType, string> = {
  hero: "Testata / Hero",
  richText: "Testo formattato",
  image: "Immagine a tutta larghezza",
  imageText: "Testo e immagine",
  cards: "Valori o schede",
  quote: "Citazione",
  productGrid: "Prodotti",
  galleryTeaser: "Anteprima galleria",
  cta: "Invito all’azione",
  location: "Posizione e mappa",
  contactForm: "Modulo contatti",
  galleryIndex: "Indice fotografie",
};

export function createPageSection(type: EditableSectionType): PageSection {
  const base = {id: crypto.randomUUID(), hidden: false};
  switch (type) {
    case "hero":
      return {
        ...base,
        type,
        kicker: localized(),
        title: localized("Nuova testata"),
        body: localized(),
        mediaId: null,
        watercolor: false,
        actionLabel: localized(),
        actionHref: "",
      };
    case "richText":
      return {
        ...base,
        type,
        title: localized("Nuovo testo"),
        content: {
          it: plainRichText("Inizia a scrivere qui."),
          en: plainRichText(""),
        },
      };
    case "image":
      return {
        ...base,
        type,
        mediaId: null,
        caption: localized(),
        watercolor: false,
      };
    case "imageText":
      return {
        ...base,
        type,
        kicker: localized(),
        title: localized("Nuova sezione"),
        body: localized(),
        mediaId: null,
        imageSide: "left",
        actionLabel: localized(),
        actionHref: "",
      };
    case "cards":
      return {
        ...base,
        type,
        kicker: localized(),
        title: localized("Nuove schede"),
        items: [1, 2, 3].map((index) => ({
          id: crypto.randomUUID(),
          title: localized(`Titolo ${index}`),
          body: localized(),
        })),
      };
    case "quote":
      return {
        ...base,
        type,
        quote: localized("Una nuova citazione."),
        author: localized(),
      };
    case "productGrid":
      return {
        ...base,
        type,
        title: localized("I nostri prodotti"),
        mode: "featured",
        productIds: [],
        limit: 4,
        locked: false,
      };
    case "galleryTeaser":
      return {
        ...base,
        type,
        kicker: localized("Fotografie"),
        title: localized("Dalla nostra terra"),
        galleryId: null,
        limit: 3,
        locked: false,
      };
    case "cta":
      return {
        ...base,
        type,
        kicker: localized(),
        title: localized("Parliamone"),
        body: localized(),
        label: localized("Contattaci", "Contact us"),
        href: "/contatti",
      };
    case "location":
      return {
        ...base,
        type,
        kicker: localized("Dove siamo", "Where we are"),
        title: localized("San Damiano di Todi", "San Damiano di Todi"),
        body: localized(),
        address: "San Damiano di Todi",
        latitude: 42.78,
        longitude: 12.41,
        showMap: true,
      };
    case "contactForm":
      return {
        ...base,
        type,
        title: localized("Scrivici", "Write to us"),
        locked: false,
      };
    case "galleryIndex":
      return {...base, type, locked: false};
  }
}
