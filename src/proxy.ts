import {createServerClient} from "@supabase/ssr";
import {NextResponse, type NextRequest} from "next/server";

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const isEnglish =
    request.nextUrl.pathname === "/en" ||
    request.nextUrl.pathname.startsWith("/en/");
  requestHeaders.set("x-site-locale", isEnglish ? "en" : "it");
  requestHeaders.set("x-admin-path", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (
    !url ||
    !key ||
    !request.nextUrl.pathname.startsWith("/admin")
  ) {
    return response;
  }

  const client = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(values) {
        values.forEach(({name, value}) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {headers: requestHeaders},
        });
        values.forEach(({name, value, options}) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
  await client.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
