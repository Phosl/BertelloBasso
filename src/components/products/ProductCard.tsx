import {ArrowUpRight} from "lucide-react";
import type {Product} from "@/lib/content/types";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {ProductVisual} from "./ProductVisual";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";
import {publicPath} from "@/lib/i18n/routing";

export function ProductCard({
  product,
  index,
  locale,
}: {
  product: Product;
  index: number;
  locale: Locale;
}) {
  const messages = getMessages(locale);

  return (
    <article className="product-card">
      <div className="product-card__visual">
        <div className="product-card__topline">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className={`status status--${product.status}`}>
            {messages.products.status[product.status]}
          </span>
        </div>
        <ProductVisual locale={locale} product={product} />
      </div>
      <div className="product-card__body">
        <p className="eyebrow">{product.eyebrow}</p>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card__foot">
          <span>{product.formats.map((format) => format.label).join(" · ")}</span>
          <TransitionLink
            aria-label={`${messages.products.discover} ${product.name}`}
            href={publicPath(locale, "products", product.slug)}
            transitionLabel={product.name}
          >
            <ArrowUpRight aria-hidden="true" size={18} />
          </TransitionLink>
        </div>
      </div>
    </article>
  );
}
