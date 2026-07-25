import type {Locale} from "./config";

export type PublicRoute =
  | "home"
  | "products"
  | "photography"
  | "story"
  | "contact";

export const publicRoutes: Record<Locale, Record<PublicRoute, string>> = {
  it: {
    home: "/",
    products: "/prodotti",
    photography: "/fotografie",
    story: "/storia",
    contact: "/contatti",
  },
  en: {
    home: "/en",
    products: "/en/products",
    photography: "/en/photography",
    story: "/en/story",
    contact: "/en/contact",
  },
};

export function publicPath(
  locale: Locale,
  route: PublicRoute,
  slug?: string,
) {
  const base = publicRoutes[locale][route];
  if ((route === "products" || route === "photography") && slug) {
    return `${base}/${slug}`;
  }
  return base;
}

export function localeFromPathname(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "it";
}

export function languageSwitchPath(pathname: string, target: Locale) {
  if (target === localeFromPathname(pathname)) return pathname;

  const englishProductPrefix = `${publicRoutes.en.products}/`;
  const italianProductPrefix = `${publicRoutes.it.products}/`;
  const englishPhotographyPrefix = `${publicRoutes.en.photography}/`;
  const italianPhotographyPrefix = `${publicRoutes.it.photography}/`;

  if (target === "en") {
    if (pathname.startsWith(italianProductPrefix)) {
      return `${englishProductPrefix}${pathname.slice(italianProductPrefix.length)}`;
    }
    if (pathname.startsWith(italianPhotographyPrefix)) {
      return `${englishPhotographyPrefix}${pathname.slice(italianPhotographyPrefix.length)}`;
    }
    if (pathname === publicRoutes.it.products) return publicRoutes.en.products;
    if (pathname === publicRoutes.it.photography) {
      return publicRoutes.en.photography;
    }
    if (pathname === publicRoutes.it.story) return publicRoutes.en.story;
    if (pathname === publicRoutes.it.contact) return publicRoutes.en.contact;
    if (pathname.startsWith("/") && pathname.split("/").filter(Boolean).length === 1) {
      return `/en${pathname}`;
    }
    return publicRoutes.en.home;
  }

  if (pathname.startsWith(englishProductPrefix)) {
    return `${italianProductPrefix}${pathname.slice(englishProductPrefix.length)}`;
  }
  if (pathname.startsWith(englishPhotographyPrefix)) {
    return `${italianPhotographyPrefix}${pathname.slice(englishPhotographyPrefix.length)}`;
  }
  if (pathname === publicRoutes.en.products) return publicRoutes.it.products;
  if (pathname === publicRoutes.en.photography) {
    return publicRoutes.it.photography;
  }
  if (pathname === publicRoutes.en.story) return publicRoutes.it.story;
  if (pathname === publicRoutes.en.contact) return publicRoutes.it.contact;
  if (pathname.startsWith("/en/")) {
    return pathname.slice(3) || "/";
  }
  return publicRoutes.it.home;
}
