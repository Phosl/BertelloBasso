import type {CmsPage} from "./types";
import type {Locale} from "@/lib/i18n/config";
import {publicPath} from "@/lib/i18n/routing";

export function cmsPageHref(page: CmsPage, locale: Locale) {
  if (page.pageKey) return publicPath(locale, page.pageKey);
  return locale === "en" ? `/en/${page.slug}` : `/${page.slug}`;
}
