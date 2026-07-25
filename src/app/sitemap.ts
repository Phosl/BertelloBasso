import type {MetadataRoute} from "next";
import {brand} from "@/lib/brand";
import {getProducts} from "@/lib/content/repository";
import {getPublishedGalleries} from "@/lib/galleries/repository";
import {getPublishedCmsPages} from "@/lib/cms/repository";
import {publicPath, type PublicRoute} from "@/lib/i18n/routing";

const staticRoutes: PublicRoute[] = [
  "home",
  "products",
  "photography",
  "story",
  "contact",
];

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, galleries, pages] = await Promise.all([
    getProducts("it"),
    getPublishedGalleries("it"),
    getPublishedCmsPages(),
  ]);
  const updatedAt = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    const italianPath = publicPath("it", route);
    const englishPath = publicPath("en", route);
    const alternates = {
      languages: {
        "it-IT": `${brand.productionUrl}${italianPath}`,
        en: `${brand.productionUrl}${englishPath}`,
      },
    };
    entries.push(
      {
        url: `${brand.productionUrl}${italianPath}`,
        lastModified: updatedAt,
        changeFrequency: route === "home" ? "weekly" : "monthly",
        priority: route === "home" ? 1 : 0.8,
        alternates,
      },
      {
        url: `${brand.productionUrl}${englishPath}`,
        lastModified: updatedAt,
        changeFrequency: route === "home" ? "weekly" : "monthly",
        priority: route === "home" ? 0.9 : 0.7,
        alternates,
      },
    );
  }

  for (const product of products) {
    const italianPath = publicPath("it", "products", product.slug);
    const englishPath = publicPath("en", "products", product.slug);
    const alternates = {
      languages: {
        "it-IT": `${brand.productionUrl}${italianPath}`,
        en: `${brand.productionUrl}${englishPath}`,
      },
    };
    entries.push(
      {
        url: `${brand.productionUrl}${italianPath}`,
        lastModified: updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates,
      },
      {
        url: `${brand.productionUrl}${englishPath}`,
        lastModified: updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates,
      },
    );
  }

  for (const gallery of galleries) {
    const italianPath = publicPath("it", "photography", gallery.slug);
    const englishPath = publicPath("en", "photography", gallery.slug);
    const alternates = {
      languages: {
        "it-IT": `${brand.productionUrl}${italianPath}`,
        en: `${brand.productionUrl}${englishPath}`,
      },
    };
    entries.push(
      {
        url: `${brand.productionUrl}${italianPath}`,
        lastModified: gallery.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates,
      },
      {
        url: `${brand.productionUrl}${englishPath}`,
        lastModified: gallery.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates,
      },
    );
  }

  for (const page of pages.filter((item) => !item.pageKey)) {
    const italianPath = `/${page.slug}`;
    const englishPath = `/en/${page.slug}`;
    const alternates = {
      languages: {
        "it-IT": `${brand.productionUrl}${italianPath}`,
        en: `${brand.productionUrl}${englishPath}`,
      },
    };
    entries.push(
      {
        url: `${brand.productionUrl}${italianPath}`,
        lastModified: page.publishedAt ?? updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates,
      },
      {
        url: `${brand.productionUrl}${englishPath}`,
        lastModified: page.publishedAt ?? updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
        alternates,
      },
    );
  }

  return entries;
}
