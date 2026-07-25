import "server-only";

import {getPublishedCmsPageByKey} from "./repository";
import {localizeText} from "./localize";
import type {CmsPage} from "./types";
import type {Locale} from "@/lib/i18n/config";
import {localizedMetadata} from "@/lib/i18n/metadata";

export async function cmsSystemPageMetadata(
  locale: Locale,
  pageKey: NonNullable<CmsPage["pageKey"]>,
) {
  const page = await getPublishedCmsPageByKey(pageKey);
  const content = page?.published ?? page?.draft;
  return localizedMetadata({
    locale,
    route: pageKey,
    title: content ? localizeText(content.seo.title, locale) : "",
    description: content ? localizeText(content.seo.description, locale) : "",
  });
}
