import type {Metadata} from "next";
import {ProductCard} from "@/components/products/ProductCard";
import {SectionReveal} from "@/components/ui/SectionReveal";
import {getProducts} from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Prodotti",
  description:
    "Olio, vini MITERA, Gintaglia e piccole produzioni della dispensa.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="page-shell products-page">
      <header className="page-intro">
        <div>
          <p className="eyebrow">La nostra dispensa · {products.length} prodotti</p>
          <h1>Dalla terra<br />alla tavola.</h1>
        </div>
        <p>
          Lavoriamo in piccole serie e seguiamo la disponibilità reale dei
          raccolti. Alcune cose tornano ogni anno, altre arrivano quando sono
          pronte.
        </p>
      </header>
      <div className="product-grid product-grid--catalog">
        {products.map((product, index) => (
          <SectionReveal key={product.id}>
            <ProductCard index={index} product={product} />
          </SectionReveal>
        ))}
      </div>
    </div>
  );
}
