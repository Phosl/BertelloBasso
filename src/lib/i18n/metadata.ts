import type {Metadata} from "next";
import type {Locale} from "./config";
import {publicPath, type PublicRoute} from "./routing";

export function localizedMetadata({
  locale,
  route,
  title,
  description,
  productSlug,
}: {
  locale: Locale;
  route: PublicRoute;
  title: string;
  description: string;
  productSlug?: string;
}): Metadata {
  const italian = publicPath("it", route, productSlug);
  const english = publicPath("en", route, productSlug);
  const canonical = locale === "it" ? italian : english;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "it-IT": italian,
        en: english,
        "x-default": italian,
      },
    },
    openGraph: {
      title,
      description,
      locale: locale === "it" ? "it_IT" : "en_GB",
      alternateLocale: locale === "it" ? ["en_GB"] : ["it_IT"],
      url: canonical,
    },
  };
}
