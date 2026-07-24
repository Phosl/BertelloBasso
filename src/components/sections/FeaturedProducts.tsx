import type {Product} from "@/lib/content/types";
import {ProductCard} from "@/components/products/ProductCard";
import {SectionReveal} from "@/components/ui/SectionReveal";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";

export function FeaturedProducts({
  products,
  locale,
}: {
  products: Product[];
  locale: Locale;
}) {
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const messages = getMessages(locale);

  return (
    <section className="featured-products">
      <SectionReveal className="section-heading">
        <div>
          <p className="eyebrow">{messages.home.productsKicker}</p>
          <h2 className="i18n-lines">{messages.home.productsTitle}</h2>
        </div>
        <p>
          {messages.home.productsBody}
        </p>
      </SectionReveal>
      <div className="product-grid">
        {featured.map((product, index) => (
          <SectionReveal key={product.id}>
            <ProductCard index={index} locale={locale} product={product} />
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
