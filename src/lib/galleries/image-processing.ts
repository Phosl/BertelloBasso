"use client";

import {
  maxSourceBytes,
  processUploadImage,
  validateImageFile,
} from "@/lib/media/image-processing";
import type {
  GalleryMediaType,
  ProcessedGalleryMedia,
} from "./types";

export const maxGalleryPhotos = 50;
export const maxGalleryMediaBytes = 50 * 1024 * 1024;
export {maxSourceBytes};

const videoExtensions = new Set(["mp4", "m4v", "mov", "webm"]);
const videoMimeTypes = new Set([
  "video/mp4",
  "video/x-m4v",
  "video/quicktime",
  "video/webm",
]);
const dngMimeTypes = new Set([
  "image/dng",
  "image/x-adobe-dng",
  "image/x-adobe-dng-image",
]);

function extension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

export function fileStem(file: File) {
  return file.name.replace(/\.[^.]+$/, "").trim().toLocaleLowerCase();
}

export function isDngFile(file: File) {
  return extension(file) === "dng" || dngMimeTypes.has(file.type);
}

export function isVideoFile(file: File) {
  return videoExtensions.has(extension(file)) || videoMimeTypes.has(file.type);
}

export function isGalleryPreviewFile(file: File) {
  return !isDngFile(file) && !isVideoFile(file) && !validateImageFile(file);
}

export function validateGalleryPreviewFile(file: File) {
  if (isDngFile(file) || isVideoFile(file)) {
    return "L’anteprima deve essere un file JPG, PNG, WebP o HEIC.";
  }
  return validateImageFile(file);
}

export function galleryFileMediaType(file: File): GalleryMediaType {
  return isVideoFile(file) ? "video" : "image";
}

function normalizedVideoMimeType(file: File) {
  if (file.type === "video/webm" || extension(file) === "webm") {
    return "video/webm";
  }
  if (file.type === "video/quicktime" || extension(file) === "mov") {
    return "video/quicktime";
  }
  return "video/mp4";
}

export function validateGalleryFile(file: File) {
  if (isDngFile(file)) {
    if (file.size > maxGalleryMediaBytes) {
      return "Il file DNG supera 50 MB.";
    }
    return "";
  }
  if (isVideoFile(file)) {
    if (file.size > maxGalleryMediaBytes) {
      return "Il video supera 50 MB.";
    }
    return "";
  }
  return validateImageFile(file).replace(
    "Usa JPG, PNG, WebP o HEIC.",
    "Usa JPG, PNG, WebP, HEIC, DNG, MP4, MOV o WebM.",
  );
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Non è stato possibile creare l’anteprima."));
      },
      "image/webp",
      0.84,
    );
  });
}

function waitForVideoEvent(
  video: HTMLVideoElement,
  eventName: "loadeddata" | "seeked",
) {
  return new Promise<void>((resolve, reject) => {
    const onSuccess = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(
        new Error(
          "Il video non può essere letto. Prova a esportarlo in MP4 H.264.",
        ),
      );
    };
    const cleanup = () => {
      video.removeEventListener(eventName, onSuccess);
      video.removeEventListener("error", onError);
    };
    video.addEventListener(eventName, onSuccess, {once: true});
    video.addEventListener("error", onError, {once: true});
  });
}

async function createVideoPoster(source: File) {
  const sourceUrl = URL.createObjectURL(source);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = sourceUrl;

  try {
    const loaded = waitForVideoEvent(video, "loadeddata");
    video.load();
    await loaded;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      throw new Error(
        "Il video non contiene dimensioni valide. Prova a esportarlo in MP4.",
      );
    }

    const durationSeconds = Number.isFinite(video.duration)
      ? video.duration
      : 0;
    if (durationSeconds > 0.25) {
      const seeked = waitForVideoEvent(video, "seeked");
      video.currentTime = Math.min(1, durationSeconds * 0.1);
      await seeked;
    }

    const maximumSide = 1200;
    const scale = Math.min(1, maximumSide / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Il browser non può creare l’anteprima del video.");
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const poster = await canvasBlob(canvas);

    return {
      width,
      height,
      durationMs: durationSeconds > 0 ? Math.round(durationSeconds * 1000) : null,
      thumbnail: new File([poster], "poster.webp", {type: "image/webp"}),
    };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(sourceUrl);
  }
}

export async function processGalleryMedia(
  source: File,
  preview?: File,
): Promise<ProcessedGalleryMedia> {
  const validationError = validateGalleryFile(source);
  if (validationError) throw new Error(validationError);

  if (isVideoFile(source)) {
    const poster = await createVideoPoster(source);
    const mimeType = normalizedVideoMimeType(source);
    return {
      sourceName: source.name,
      media: new File([source], source.name, {
        type: mimeType,
        lastModified: source.lastModified,
      }),
      thumbnail: poster.thumbnail,
      original: null,
      mediaType: "video",
      sourceType: "standard",
      mimeType,
      width: poster.width,
      height: poster.height,
      durationMs: poster.durationMs,
    };
  }

  if (isDngFile(source)) {
    if (!preview) {
      throw new Error(
        "Per il DNG scegli anche un JPG di anteprima con lo stesso nome.",
      );
    }
    const previewError = validateImageFile(preview);
    if (previewError) throw new Error(`Anteprima DNG: ${previewError}`);
    const processed = await processUploadImage(preview);
    return {
      sourceName: source.name,
      media: processed.image,
      thumbnail: processed.thumbnail,
      original: new File([source], source.name, {
        type: "image/x-adobe-dng",
        lastModified: source.lastModified,
      }),
      mediaType: "image",
      sourceType: "dng",
      mimeType: "image/webp",
      width: processed.width,
      height: processed.height,
      durationMs: null,
    };
  }

  const processed = await processUploadImage(source);
  return {
    sourceName: processed.sourceName,
    media: processed.image,
    thumbnail: processed.thumbnail,
    original: null,
    mediaType: "image",
    sourceType: "standard",
    mimeType: "image/webp",
    width: processed.width,
    height: processed.height,
    durationMs: null,
  };
}
