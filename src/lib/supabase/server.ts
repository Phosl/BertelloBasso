import "server-only";

import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";

export function isServerSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(values) {
        try {
          values.forEach(({name, value, options}) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. The proxy refreshes
          // the session before protected admin routes are rendered.
        }
      },
    },
  });
}

export async function requireAdmin() {
  const client = await getServerSupabase();
  if (!client) return {configured: false as const, user: null};

  const {
    data: {user},
  } = await client.auth.getUser();
  if (!user) return {configured: true as const, user: null};

  const {data: profile} = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    configured: true as const,
    user: profile?.role === "admin" ? user : null,
  };
}
