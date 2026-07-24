"use client";

import {useCallback, useMemo, useState} from "react";
import {ChevronRight, Eye, EyeOff, Pencil, Search} from "lucide-react";
import {useAdminData} from "./AdminDataProvider";
import {ProductEditDrawer} from "./ProductEditDrawer";

const statusLabels = {
  available: "Disponibile",
  coming_soon: "Coming soon",
  seasonal: "Stagionale",
};

export function ProductsManager() {
  const {data, loading, updateProduct} = useAdminData();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.products.find((item) => item.id === selectedId) ?? null;

  const products = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data.products;
    return data.products.filter((product) =>
      `${product.name} ${product.eyebrow} ${product.category}`
        .toLowerCase()
        .includes(query),
    );
  }, [data.products, search]);

  const closeDrawer = useCallback(() => setSelectedId(null), []);

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h1>Prodotti</h1>
          <p>
            Gestisci testi, disponibilità e visibilità. Le etichette visuali si
            aggiornano con il nome.
          </p>
        </div>
      </header>
      <div className="admin-toolbar">
        <label>
          <Search aria-hidden="true" size={17} />
          <span className="sr-only">Cerca prodotti</span>
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cerca prodotto…"
            value={search}
          />
        </label>
        <span>{products.length} elementi</span>
      </div>
      {loading ? (
        <div className="admin-skeleton admin-skeleton--table" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Prodotto</th>
                <th>Categoria</th>
                <th>Disponibilità</th>
                <th>Visibilità</th>
                <th><span className="sr-only">Azioni</span></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <span
                      className="table-swatch"
                      style={{background: product.accent}}
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <small>{product.formats.map((item) => item.label).join(" · ")}</small>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <span className={`admin-status is-${product.status}`}>
                      {statusLabels[product.status]}
                    </span>
                  </td>
                  <td>
                    <button
                      aria-label={`${product.published ? "Nascondi" : "Pubblica"} ${product.name}`}
                      className="visibility-toggle"
                      onClick={() =>
                        void updateProduct(product.id, {
                          published: !product.published,
                        })
                      }
                      type="button"
                    >
                      {product.published ? (
                        <Eye aria-hidden="true" size={16} />
                      ) : (
                        <EyeOff aria-hidden="true" size={16} />
                      )}
                      {product.published ? "Online" : "Bozza"}
                    </button>
                  </td>
                  <td>
                    <button
                      aria-label={`Modifica ${product.name}`}
                      className="table-action"
                      onClick={() => setSelectedId(product.id)}
                      type="button"
                    >
                      <Pencil aria-hidden="true" size={16} />
                      <ChevronRight aria-hidden="true" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected ? (
        <ProductEditDrawer
          onClose={closeDrawer}
          onSave={updateProduct}
          product={selected}
        />
      ) : null}
    </div>
  );
}
