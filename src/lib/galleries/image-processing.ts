"use client";

import {
  maxSourceBytes,
  processUploadImage,
  validateImageFile,
} from "@/lib/media/image-processing";
import type {ProcessedGalleryImage} from "./types";

export const maxGalleryPhotos = 50;
export {maxSourceBytes};

export function validateGalleryFile(file: File) {
  return validateImageFile(file);
}

export async function processGalleryImage(
  source: File,
): Promise<ProcessedGalleryImage> {
  const processed = await processUploadImage(source);
  return processed;
}
