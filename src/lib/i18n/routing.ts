import type {Locale} from "./config";

export type PublicRoute = "home" | "products" | "story" | "contact";

export const publicRoutes: Record<Locale, Record<PublicRoute, string>> = {
  it: {
    home: "/",
    products: "/prodotti",
    story: "/storia",
    contact: "/contatti",
  },
  en: {
    home: "/en",
    products: "/en/products",
    story: "/en/story",
    contact: "/en/contact",
  },
};

export function publicPath(
  locale: Locale,
  route: PublicRoute,
  productSlug?: string,
) {
  const base = publicRoutes[locale][route];
  if (route === "products" && productSlug) return `${base}/${productSlug}`;
  return base;
}

export function localeFromPathname(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "it";
}

export function languageSwitchPath(pathname: string, target: Locale) {
  if (target === localeFromPathname(pathname)) return pathname;

  const englishProductPrefix = `${publicRoutes.en.products}/`;
  const italianProductPrefix = `${publicRoutes.it.products}/`;

  if (target === "en") {
    if (pathname.startsWith(italianProductPrefix)) {
      return `${englishProductPrefix}${pathname.slice(italianProductPrefix.length)}`;
    }
    if (pathname === publicRoutes.it.products) return publicRoutes.en.products;
    if (pathname === publicRoutes.it.story) return publicRoutes.en.story;
    if (pathname === publicRoutes.it.contact) return publicRoutes.en.contact;
    return publicRoutes.en.home;
  }

  if (pathname.startsWith(englishProductPrefix)) {
    return `${italianProductPrefix}${pathname.slice(englishProductPrefix.length)}`;
  }
  if (pathname === publicRoutes.en.products) return publicRoutes.it.products;
  if (pathname === publicRoutes.en.story) return publicRoutes.it.story;
  if (pathname === publicRoutes.en.contact) return publicRoutes.it.contact;
  return publicRoutes.it.home;
}
