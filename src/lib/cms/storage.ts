import type {SupabaseClient} from "@supabase/supabase-js";

export const cmsMediaBucket = "cms-media";
const signedUrlLifetimeSeconds = 24 * 60 * 60;

export async function signCmsMediaPaths(
  client: SupabaseClient,
  paths: string[],
) {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return new Map<string, string>();
  const {data, error} = await client.storage
    .from(cmsMediaBucket)
    .createSignedUrls(unique, signedUrlLifetimeSeconds);
  if (error) throw error;
  return new Map(
    (data ?? [])
      .filter((item) => item.path && item.signedUrl)
      .map((item) => [item.path!, item.signedUrl!]),
  );
}
