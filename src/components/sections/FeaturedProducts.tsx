import type {Product} from "@/lib/content/types";
import {ProductCard} from "@/components/products/ProductCard";
import {SectionReveal} from "@/components/ui/SectionReveal";

export function FeaturedProducts({products}: {products: Product[]}) {
  const featured = products.filter((product) => product.featured).slice(0, 4);

  return (
    <section className="featured-products">
      <SectionReveal className="section-heading">
        <div>
          <p className="eyebrow">Dai nostri campi</p>
          <h2>Prodotti che sanno<br />da dove vengono.</h2>
        </div>
        <p>
          Coltiviamo e trasformiamo in piccole quantità. Ogni raccolto cambia,
          la cura resta la stessa.
        </p>
      </SectionReveal>
      <div className="product-grid">
        {featured.map((product, index) => (
          <SectionReveal key={product.id}>
            <ProductCard index={index} product={product} />
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
