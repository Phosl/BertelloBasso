import type {Metadata} from "next";
import type {Locale} from "./config";
import {publicPath, type PublicRoute} from "./routing";

export function localizedMetadata({
  locale,
  route,
  title,
  description,
  slug,
}: {
  locale: Locale;
  route: PublicRoute;
  title: string;
  description: string;
  slug?: string;
}): Metadata {
  const italian = publicPath("it", route, slug);
  const english = publicPath("en", route, slug);
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
