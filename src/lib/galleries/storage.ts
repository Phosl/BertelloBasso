import type {SupabaseClient} from "@supabase/supabase-js";

export const galleryBucket = "gallery-photos";
const signedUrlLifetimeSeconds = 24 * 60 * 60;
const signedUrlBatchSize = 100;

export async function signGalleryPaths(
  client: SupabaseClient,
  paths: string[],
) {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  const urlMap = new Map<string, string>();

  for (let offset = 0; offset < uniquePaths.length; offset += signedUrlBatchSize) {
    const batch = uniquePaths.slice(offset, offset + signedUrlBatchSize);
    const {data, error} = await client.storage
      .from(galleryBucket)
      .createSignedUrls(batch, signedUrlLifetimeSeconds);
    if (error) throw error;
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) urlMap.set(item.path, item.signedUrl);
    }
  }

  return urlMap;
}
