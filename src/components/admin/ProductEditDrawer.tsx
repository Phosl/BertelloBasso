"use client";

import {useEffect} from "react";
import {Check, X} from "lucide-react";
import {ProductVisual} from "@/components/products/ProductVisual";
import type {Product} from "@/lib/content/types";

type ProductEditDrawerProps = {
  product: Product;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Product>) => Promise<boolean>;
};

export function ProductEditDrawer({
  product,
  onClose,
  onSave,
}: ProductEditDrawerProps) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [onClose]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const success = await onSave(product.id, {
      name: String(form.get("name")),
      eyebrow: String(form.get("eyebrow")),
      description: String(form.get("description")),
      status: String(form.get("status")) as Product["status"],
      featured: form.get("featured") === "on",
      published: form.get("published") === "on",
      accent: String(form.get("accent")),
    });
    if (success) onClose();
  }

  return (
    <>
      <button
        aria-label="Chiudi pannello di modifica"
        className="drawer-backdrop"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-label={`Modifica ${product.name}`}
        aria-modal="true"
        className="admin-drawer"
        role="dialog"
      >
        <header>
          <div>
            <p className="eyebrow">Modifica prodotto</p>
            <h2>{product.name}</h2>
          </div>
          <button aria-label="Chiudi" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>
        <div className="admin-drawer__preview">
          <ProductVisual compact product={product} />
        </div>
        <form key={product.id} onSubmit={save}>
          <label>
            <span>Nome</span>
            <input defaultValue={product.name} name="name" required />
          </label>
          <label>
            <span>Sottotitolo</span>
            <input defaultValue={product.eyebrow} name="eyebrow" required />
          </label>
          <label>
            <span>Descrizione</span>
            <textarea
              defaultValue={product.description}
              name="description"
              required
              rows={5}
            />
          </label>
          <div className="admin-form-row">
            <label>
              <span>Disponibilità</span>
              <select defaultValue={product.status} name="status">
                <option value="available">Disponibile</option>
                <option value="seasonal">Stagionale</option>
                <option value="coming_soon">Coming soon</option>
              </select>
            </label>
            <label>
              <span>Colore etichetta</span>
              <input
                className="color-input"
                defaultValue={product.accent}
                name="accent"
                type="color"
              />
            </label>
          </div>
          <label className="admin-check">
            <input
              defaultChecked={product.featured}
              name="featured"
              type="checkbox"
            />
            <span>Mostra in homepage</span>
          </label>
          <label className="admin-check">
            <input
              defaultChecked={product.published}
              name="published"
              type="checkbox"
            />
            <span>Pubblicato sul sito</span>
          </label>
          <button className="admin-save" type="submit">
            <Check aria-hidden="true" size={17} />
            Salva modifiche
          </button>
        </form>
      </aside>
    </>
  );
}
