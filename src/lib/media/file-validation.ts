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

export function validateImageFile(file: File) {
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
