import type {MetadataRoute} from "next";
import {brand} from "@/lib/brand";
import {getProducts} from "@/lib/content/repository";
import {publicPath, type PublicRoute} from "@/lib/i18n/routing";

const staticRoutes: PublicRoute[] = ["home", "products", "story", "contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts("it");
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

  return entries;
}
