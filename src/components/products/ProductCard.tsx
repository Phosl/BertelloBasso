import {ArrowUpRight} from "lucide-react";
import type {Product} from "@/lib/content/types";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {ProductVisual} from "./ProductVisual";

const statusLabel = {
  available: "Disponibile",
  coming_soon: "Coming soon",
  seasonal: "Stagionale",
} as const;

export function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  return (
    <article className="product-card">
      <div className="product-card__visual">
        <div className="product-card__topline">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className={`status status--${product.status}`}>
            {statusLabel[product.status]}
          </span>
        </div>
        <ProductVisual product={product} />
      </div>
      <div className="product-card__body">
        <p className="eyebrow">{product.eyebrow}</p>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card__foot">
          <span>{product.formats.map((format) => format.label).join(" · ")}</span>
          <TransitionLink
            aria-label={`Scopri ${product.name}`}
            href={`/prodotti/${product.slug}`}
            transitionLabel={product.name}
          >
            <ArrowUpRight aria-hidden="true" size={18} />
          </TransitionLink>
        </div>
      </div>
    </article>
  );
}
