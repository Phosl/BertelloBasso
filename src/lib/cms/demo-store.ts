"use client";

import {
  createEmptyPage,
  createEmptyProduct,
  defaultCmsPages,
  defaultCmsSiteSettings,
  defaultProductDrafts,
} from "./defaults";
import {createSlug} from "./slug";
import type {
  CmsPage,
  CmsSiteSettings,
  ProductDraft,
} from "./types";

const demoKey = "bertello-basso-complete-cms-demo-v1";

export type CmsDemoSnapshot = {
  products: ProductDraft[];
  pages: CmsPage[];
  settings: CmsSiteSettings;
};

function initialSnapshot(): CmsDemoSnapshot {
  return structuredClone({
    products: defaultProductDrafts,
    pages: defaultCmsPages,
    settings: defaultCmsSiteSettings,
  });
}

export function readCmsDemo(): CmsDemoSnapshot {
  try {
    const stored = window.localStorage.getItem(demoKey);
    return stored
      ? ({...initialSnapshot(), ...JSON.parse(stored)} as CmsDemoSnapshot)
      : initialSnapshot();
  } catch {
    return initialSnapshot();
  }
}

export function writeCmsDemo(snapshot: CmsDemoSnapshot) {
  window.localStorage.setItem(demoKey, JSON.stringify(snapshot));
}

export function mutateCmsDemo(
  mutation: (snapshot: CmsDemoSnapshot) => CmsDemoSnapshot,
) {
  const next = mutation(readCmsDemo());
  writeCmsDemo(next);
  return next;
}

export function createDemoProduct(name: string) {
  const product = createEmptyProduct();
  product.content.name = name;
  product.content.seo.title.it = name;
  product.slug = createSlug(name || "nuovo-prodotto");
  mutateCmsDemo((snapshot) => ({
    ...snapshot,
    products: [...snapshot.products, product],
  }));
  return product;
}

export function createDemoPage(title: string) {
  const page = createEmptyPage(title);
  page.slug = createSlug(title || "nuova-pagina");
  mutateCmsDemo((snapshot) => ({
    ...snapshot,
    pages: [...snapshot.pages, page],
  }));
  return page;
}
