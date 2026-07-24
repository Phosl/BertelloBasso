import {NextResponse, type NextRequest} from "next/server";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const isEnglish =
    request.nextUrl.pathname === "/en" ||
    request.nextUrl.pathname.startsWith("/en/");
  requestHeaders.set("x-site-locale", isEnglish ? "en" : "it");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
