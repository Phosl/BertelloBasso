import {describe, expect, it} from "vitest";
import {localizeGallery} from "./localize";
import {mapGalleryPhoto} from "./mapper";
import {
  maxGalleryVideoBytes,
  validateGalleryFile,
} from "./image-processing";
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
      originalPath: null,
      mediaType: "image",
      sourceType: "standard",
      mimeType: "image/webp",
      sourceName: "olive.jpg",
      durationMs: null,
      width: 1600,
      height: 1200,
      altText: "Olive italiane",
      caption: "",
      translations: {},
      sortOrder: 0,
      createdAt: "",
      imageUrl: "signed",
      thumbnailUrl: "signed-thumb",
      originalUrl: "",
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
      "Aggiungi almeno una foto o un video.",
      "Scegli il contenuto di copertina.",
    ]);
  });
});

describe("gallery media compatibility", () => {
  it("maps an existing photo row with safe media defaults", () => {
    const photo = mapGalleryPhoto({
      id: "legacy-photo",
      gallery_id: "gallery-1",
      storage_path: "display.webp",
      thumbnail_path: "thumbnail.webp",
      width: 1200,
      height: 800,
    });

    expect(photo.mediaType).toBe("image");
    expect(photo.sourceType).toBe("standard");
    expect(photo.mimeType).toBe("image/webp");
    expect(photo.originalPath).toBeNull();
    expect(photo.durationMs).toBeNull();
  });

  it("maps a DNG original and its signed download URL", () => {
    const photo = mapGalleryPhoto(
      {
        id: "dng-photo",
        gallery_id: "gallery-1",
        storage_path: "display.webp",
        thumbnail_path: "thumbnail.webp",
        original_path: "original.dng",
        media_type: "image",
        source_type: "dng",
        mime_type: "image/webp",
        width: 1200,
        height: 800,
      },
      new Map([["original.dng", "signed-dng"]]),
    );

    expect(photo.sourceType).toBe("dng");
    expect(photo.originalUrl).toBe("signed-dng");
  });
});

describe("gallery video validation", () => {
  function file(name: string, type: string, size: number) {
    return {name, type, size} as File;
  }

  it("accepts a web-ready MP4 within the limit", () => {
    expect(
      validateGalleryFile(file("raccolta.mp4", "video/mp4", 8_000_000)),
    ).toBe("");
  });

  it("explains how to fix a MOV video", () => {
    expect(
      validateGalleryFile(file("raccolta.mov", "video/quicktime", 8_000_000)),
    ).toContain("non è in formato MP4");
  });

  it("rejects videos over the safe upload limit", () => {
    expect(
      validateGalleryFile(
        file("raccolta.mp4", "video/mp4", maxGalleryVideoBytes + 1),
      ),
    ).toContain("supera 45 MB");
  });
});
