"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Copy,
  Pencil,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {
  archiveProduct,
  duplicateProduct,
  getAdminProductDrafts,
  reorderProducts,
} from "@/lib/cms/admin-service";
import type {CmsStatus, ProductDraft} from "@/lib/cms/types";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {useAdminData} from "./AdminDataProvider";

const statusLabels: Record<CmsStatus, string> = {
  draft: "Bozza",
  published: "Pubblicato",
  archived: "Archiviato",
};

export function ProductsManager() {
  const {reportCmsState} = useAdminData();
  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CmsStatus | "all">("all");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getAdminProductDrafts());
      setNotice("");
    } catch (error) {
      setNotice(getAdminErrorMessage(error as {code?: string; message?: string}));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (filter !== "all" && product.status !== filter) return false;
      return (
        !query ||
        `${product.content.name} ${product.content.eyebrow} ${product.content.category}`
          .toLowerCase()
          .includes(query)
      );
    });
  }, [filter, products, search]);

  async function move(id: string, direction: -1 | 1) {
    const index = products.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= products.length) return;
    const next = [...products];
    [next[index], next[target]] = [next[target], next[index]];
    setProducts(next);
    reportCmsState("saving");
    try {
      await reorderProducts(next.map((item) => item.id));
      reportCmsState("saved");
    } catch (error) {
      reportCmsState(
        "error",
        getAdminErrorMessage(error as {code?: string; message?: string}),
      );
      await load();
    }
  }

  async function duplicate(id: string) {
    reportCmsState("saving");
    try {
      await duplicateProduct(id);
      reportCmsState("saved");
      await load();
    } catch (error) {
      reportCmsState(
        "error",
        getAdminErrorMessage(error as {code?: string; message?: string}),
      );
    }
  }

  async function toggleArchive(product: ProductDraft) {
    if (
      product.status !== "archived" &&
      !window.confirm(
        `Archiviare “${product.content.name}”? Verrà tolto dal sito ma potrà essere ripristinato.`,
      )
    ) {
      return;
    }
    reportCmsState("saving");
    try {
      await archiveProduct(product.id, product.status !== "archived");
      reportCmsState("saved");
      await load();
    } catch (error) {
      reportCmsState(
        "error",
        getAdminErrorMessage(error as {code?: string; message?: string}),
      );
    }
  }

  return (
    <div className="admin-page cms-admin-list">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h1>Prodotti</h1>
          <p>
            Crea e prepara le modifiche in bozza. Niente cambia sul sito finché
            non premi “Pubblica”.
          </p>
        </div>
        <TransitionLink className="admin-primary-action" href="/admin/prodotti/nuovo">
          <Plus aria-hidden="true" size={20} />
          Crea nuovo prodotto
        </TransitionLink>
      </header>

      <div className="cms-admin-filters" role="group" aria-label="Filtra prodotti">
        {(["all", "published", "draft", "archived"] as const).map((value) => (
          <button
            aria-pressed={filter === value}
            key={value}
            onClick={() => setFilter(value)}
            type="button"
          >
            {value === "all" ? "Tutti" : statusLabels[value]}
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <label>
          <Search aria-hidden="true" size={20} />
          <span className="sr-only">Cerca prodotti</span>
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cerca un prodotto…"
            value={search}
          />
        </label>
        <span>{filtered.length} prodotti</span>
      </div>

      {notice ? <div className="gallery-admin-notice">{notice}</div> : null}
      {loading ? (
        <div className="admin-skeleton admin-skeleton--table" />
      ) : filtered.length ? (
        <div className="cms-admin-cards">
          {filtered.map((product, index) => (
            <article className="cms-admin-card" key={product.id}>
              <span
                className="cms-admin-card__swatch"
                style={{background: product.content.accent}}
              />
              <div className="cms-admin-card__content">
                <div>
                  <span className={`cms-status is-${product.status}`}>
                    {statusLabels[product.status]}
                  </span>
                  <small>{product.content.category}</small>
                </div>
                <h2>{product.content.name || "Prodotto senza nome"}</h2>
                <p>
                  {product.content.formats
                    .map((format) => format.label)
                    .filter(Boolean)
                    .join(" · ") || "Nessun formato completo"}
                </p>
              </div>
              <div className="cms-admin-card__actions">
                <TransitionLink
                  className="admin-primary-action"
                  href={`/admin/prodotti/${product.id}`}
                >
                  <Pencil aria-hidden="true" size={18} />
                  Modifica
                </TransitionLink>
                <button
                  disabled={index === 0}
                  onClick={() => void move(product.id, -1)}
                  type="button"
                >
                  <ArrowUp aria-hidden="true" size={18} />
                  Sposta prima
                </button>
                <button
                  disabled={index === products.length - 1}
                  onClick={() => void move(product.id, 1)}
                  type="button"
                >
                  <ArrowDown aria-hidden="true" size={18} />
                  Sposta dopo
                </button>
                <button onClick={() => void duplicate(product.id)} type="button">
                  <Copy aria-hidden="true" size={18} />
                  Duplica
                </button>
                <button onClick={() => void toggleArchive(product)} type="button">
                  {product.status === "archived" ? (
                    <RotateCcw aria-hidden="true" size={18} />
                  ) : (
                    <Archive aria-hidden="true" size={18} />
                  )}
                  {product.status === "archived" ? "Ripristina" : "Archivia"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="gallery-admin-empty">
          <h2>Nessun prodotto trovato.</h2>
          <p>Prova a cambiare filtro oppure crea un nuovo prodotto.</p>
        </div>
      )}
    </div>
  );
}
