"use client";

import imageCompression from "browser-image-compression";
import heic2any from "heic2any";
import type {ProcessedGalleryImage} from "./types";

export const maxGalleryPhotos = 50;
export const maxSourceBytes = 25 * 1024 * 1024;

const acceptedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function extension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function isHeic(file: File) {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    extension(file) === "heic" ||
    extension(file) === "heif"
  );
}

export function validateGalleryFile(file: File) {
  const knownExtension = ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(
    extension(file),
  );
  if ((!file.type || !acceptedTypes.has(file.type)) && !knownExtension) {
    return "Formato non supportato. Usa JPG, PNG, WebP o HEIC.";
  }
  if (file.size > maxSourceBytes) {
    return "Il file supera 25 MB.";
  }
  return "";
}

async function convertHeic(file: File) {
  if (!isHeic(file)) return file;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.95,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}

async function imageDimensions(file: File) {
  const bitmap = await createImageBitmap(file);
  const dimensions = {width: bitmap.width, height: bitmap.height};
  bitmap.close();
  return dimensions;
}

export async function processGalleryImage(
  source: File,
): Promise<ProcessedGalleryImage> {
  const validationError = validateGalleryFile(source);
  if (validationError) throw new Error(validationError);

  const compatible = await convertHeic(source);
  const image = await imageCompression(compatible, {
    maxWidthOrHeight: 3200,
    maxSizeMB: 5,
    initialQuality: 0.9,
    fileType: "image/webp",
    useWebWorker: true,
    preserveExif: false,
  });
  const thumbnail = await imageCompression(compatible, {
    maxWidthOrHeight: 900,
    maxSizeMB: 0.7,
    initialQuality: 0.8,
    fileType: "image/webp",
    useWebWorker: true,
    preserveExif: false,
  });
  const {width, height} = await imageDimensions(image);

  return {
    sourceName: source.name,
    image: new File([image], "display.webp", {type: "image/webp"}),
    thumbnail: new File([thumbnail], "thumbnail.webp", {
      type: "image/webp",
    }),
    width,
    height,
  };
}
