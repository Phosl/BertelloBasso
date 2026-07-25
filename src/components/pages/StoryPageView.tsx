import {PageRenderer} from "@/components/cms/PageRenderer";
import {getPublishedCmsPageByKey} from "@/lib/cms/repository";
import type {Locale} from "@/lib/i18n/config";

export async function StoryPageView({locale}: {locale: Locale}) {
  const page = await getPublishedCmsPageByKey("story");
  return page ? <PageRenderer locale={locale} page={page} /> : null;
}
