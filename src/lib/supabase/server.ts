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
  if (!client) {
    return {
      configured: false as const,
      reason: "unconfigured" as const,
      user: null,
    };
  }

  const {
    data: {user},
    error: userError,
  } = await client.auth.getUser();
  if (!user) {
    const sessionMissing =
      userError?.name === "AuthSessionMissingError" ||
      /auth session missing/i.test(userError?.message ?? "");
    if (userError && !sessionMissing && userError.status !== 401) {
      console.error(JSON.stringify({
        scope: "admin_auth",
        operation: "get_user",
        resource: "auth",
        code: userError.code ?? String(userError.status),
      }));
    }
    return {
      configured: true as const,
      reason: "signed-out" as const,
      user: null,
    };
  }

  const {data: profile, error: profileError} = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(JSON.stringify({
      scope: "admin_auth",
      operation: "read_role",
      resource: "profiles",
      code: profileError.code,
    }));
    return {
      configured: true as const,
      reason: "profile-error" as const,
      user: null,
    };
  }

  if (profile?.role !== "admin") {
    return {
      configured: true as const,
      reason: "forbidden" as const,
      user: null,
    };
  }

  return {
    configured: true as const,
    reason: "authorized" as const,
    user,
  };
}
