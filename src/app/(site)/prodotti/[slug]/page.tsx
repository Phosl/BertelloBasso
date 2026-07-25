import type {Metadata} from "next";
import {ProductDetailPageView} from "@/components/pages/ProductDetailPageView";
import {getProducts} from "@/lib/content/repository";
import {localizedMetadata} from "@/lib/i18n/metadata";

type PageProps = {
  params: Promise<{slug: string}>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {slug} = await params;
  const product = (await getProducts("it")).find((item) => item.slug === slug);
  if (!product) return {};
  return localizedMetadata({
    locale: "it",
    route: "products",
    slug: product.slug,
    title: product.name,
    description: product.description,
  });
}

export async function generateStaticParams() {
  return (await getProducts("it")).map((product) => ({slug: product.slug}));
}

export default async function ProductDetailPage({params}: PageProps) {
  const {slug} = await params;
  return <ProductDetailPageView locale="it" slug={slug} />;
}
