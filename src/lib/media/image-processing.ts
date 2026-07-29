"use client";

import imageCompression from "browser-image-compression";
import heic2any from "heic2any";
import {validateImageFile} from "./file-validation";

export {maxSourceBytes, validateImageFile} from "./file-validation";

export type ProcessedUploadImage = {
  sourceName: string;
  image: File;
  thumbnail: File;
  width: number;
  height: number;
  sourceBytes: number;
};

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

export async function processUploadImage(
  source: File,
): Promise<ProcessedUploadImage> {
  const validationError = validateImageFile(source);
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
    sourceBytes: source.size,
  };
}
