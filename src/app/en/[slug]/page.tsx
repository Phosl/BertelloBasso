import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {PageRenderer} from "@/components/cms/PageRenderer";
import {getPublishedCmsPageBySlug} from "@/lib/cms/repository";
import {localizeText} from "@/lib/cms/localize";

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>;
}): Promise<Metadata> {
  const {slug} = await params;
  const page = await getPublishedCmsPageBySlug(slug);
  if (!page?.published) return {};
  return {
    title: localizeText(page.published.seo.title, "en"),
    description: localizeText(page.published.seo.description, "en"),
    alternates: {
      canonical: `/en/${slug}`,
      languages: {"it-IT": `/${slug}`, en: `/en/${slug}`},
    },
  };
}

export default async function EnglishCustomPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  const page = await getPublishedCmsPageBySlug(slug);
  if (!page) notFound();
  return <PageRenderer locale="en" page={page} />;
}
