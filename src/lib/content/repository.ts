import "server-only";

import {cache} from "react";
import {createClient} from "@supabase/supabase-js";
import {defaultProducts, defaultSiteCopy} from "./default-content";
import type {Product, SiteCopy} from "./types";

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {auth: {persistSession: false}});
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const client = getPublicClient();
  if (!client) return defaultProducts.filter((product) => product.published);

  const {data, error} = await client
    .from("products")
    .select(
      "id, slug, name, eyebrow, description, category, status, formats, featured, published, sort_order, visual, accent",
    )
    .eq("published", true)
    .order("sort_order");

  if (error) {
    console.error({
      scope: "public_content",
      operation: "select",
      resource: "products",
      code: error.code,
    });
    return defaultProducts.filter((product) => product.published);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    eyebrow: row.eyebrow,
    description: row.description,
    category: row.category,
    status: row.status,
    formats: row.formats as Product["formats"],
    featured: row.featured,
    published: row.published,
    sortOrder: row.sort_order,
    visual: row.visual,
    accent: row.accent,
  })) as Product[];
});

export const getSiteCopy = cache(async (): Promise<SiteCopy> => {
  const client = getPublicClient();
  if (!client) return defaultSiteCopy;

  const {data, error} = await client
    .from("site_settings")
    .select("value")
    .eq("key", "site_copy")
    .maybeSingle();

  if (error || !data?.value) {
    if (error) {
      console.error({
        scope: "public_content",
        operation: "select",
        resource: "site_settings",
        code: error.code,
      });
    }
    return defaultSiteCopy;
  }

  return {...defaultSiteCopy, ...(data.value as Partial<SiteCopy>)};
});
