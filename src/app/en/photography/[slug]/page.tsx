import type {Metadata} from "next";
import {PhotographyDetailPageView} from "@/components/pages/PhotographyDetailPageView";
import {photographyDetailMetadata} from "@/lib/galleries/metadata";

type PageProps = {params: Promise<{slug: string}>};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {slug} = await params;
  return photographyDetailMetadata(slug, "en");
}

export default async function EnglishPhotographyDetailPage({
  params,
}: PageProps) {
  const {slug} = await params;
  return <PhotographyDetailPageView locale="en" slug={slug} />;
}
