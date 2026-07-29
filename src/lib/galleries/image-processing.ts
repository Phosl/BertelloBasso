"use client";

import {
  maxSourceBytes,
  validateImageFile,
} from "../media/file-validation";
import type {ProcessedGalleryMedia} from "./types";

export const maxGalleryPhotos = 50;
export const maxGalleryVideoBytes = 45 * 1024 * 1024;
export const maxGalleryVideoDurationSeconds = 60;
export {maxSourceBytes};

const videoExtensions = new Set(["mp4"]);
const videoMimeTypes = new Set(["video/mp4"]);

function extension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

export function isVideoFile(file: File) {
  return videoExtensions.has(extension(file)) || videoMimeTypes.has(file.type);
}

export function validateGalleryFile(file: File) {
  if (isVideoFile(file)) {
    if (file.size > maxGalleryVideoBytes) {
      return "Il video supera 45 MB. Comprimilo seguendo la guida qui sotto.";
    }
    return "";
  }
  if (file.type.startsWith("video/")) {
    return "Questo video non è in formato MP4. Segui la guida qui sotto per convertirlo.";
  }
  return validateImageFile(file).replace(
    "Usa JPG, PNG, WebP o HEIC.",
    "Usa JPG, PNG, WebP, HEIC oppure un video MP4.",
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
    if (durationSeconds > maxGalleryVideoDurationSeconds) {
      throw new Error(
        "Il video dura più di 1 minuto. Accorcialo seguendo la guida qui sotto.",
      );
    }
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
): Promise<ProcessedGalleryMedia> {
  const validationError = validateGalleryFile(source);
  if (validationError) throw new Error(validationError);

  if (isVideoFile(source)) {
    const poster = await createVideoPoster(source);
    return {
      sourceName: source.name,
      media: new File([source], source.name, {
        type: "video/mp4",
        lastModified: source.lastModified,
      }),
      thumbnail: poster.thumbnail,
      mediaType: "video",
      mimeType: "video/mp4",
      width: poster.width,
      height: poster.height,
      durationMs: poster.durationMs,
    };
  }

  const {processUploadImage} = await import("../media/image-processing");
  const processed = await processUploadImage(source);
  return {
    sourceName: processed.sourceName,
    media: processed.image,
    thumbnail: processed.thumbnail,
    mediaType: "image",
    mimeType: "image/webp",
    width: processed.width,
    height: processed.height,
    durationMs: null,
  };
}
