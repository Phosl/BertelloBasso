import {describe, expect, it} from "vitest";
import {localizeGallery} from "./localize";
import type {Gallery} from "./types";
import {getPublicationIssues} from "./validation";

const gallery: Gallery = {
  id: "gallery-1",
  slug: "raccolta",
  title: "La raccolta",
  description: "Testo italiano",
  translations: {
    en: {
      title: "The harvest",
      description: "",
      locationName: "Todi",
    },
  },
  locationName: "San Damiano di Todi",
  address: "",
  latitude: null,
  longitude: null,
  googlePlaceId: null,
  status: "draft",
  coverPhotoId: "photo-1",
  sortOrder: 0,
  publishedAt: null,
  createdAt: "",
  updatedAt: "",
  photos: [
    {
      id: "photo-1",
      galleryId: "gallery-1",
      storagePath: "display.webp",
      thumbnailPath: "thumbnail.webp",
      width: 1600,
      height: 1200,
      altText: "Olive italiane",
      caption: "",
      translations: {},
      sortOrder: 0,
      createdAt: "",
      imageUrl: "signed",
      thumbnailUrl: "signed-thumb",
    },
  ],
  coverPhoto: null,
  photoCount: 1,
};

describe("gallery localisation", () => {
  it("uses English values and falls back field by field to Italian", () => {
    const localized = localizeGallery(gallery, "en");
    expect(localized.title).toBe("The harvest");
    expect(localized.description).toBe("Testo italiano");
    expect(localized.locationName).toBe("Todi");
    expect(localized.photos[0]?.altText).toBe("Olive italiane");
  });
});

describe("gallery publication", () => {
  it("accepts a gallery with title, place, photo and valid cover", () => {
    expect(getPublicationIssues(gallery)).toEqual([]);
  });

  it("reports all missing publication requirements", () => {
    expect(
      getPublicationIssues({
        ...gallery,
        title: "",
        locationName: "",
        coverPhotoId: null,
        photos: [],
      }),
    ).toEqual([
      "Inserisci il titolo italiano.",
      "Inserisci la località.",
      "Aggiungi almeno una fotografia.",
      "Scegli la fotografia di copertina.",
    ]);
  });
});
