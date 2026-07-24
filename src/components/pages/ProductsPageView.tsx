import {ProductCard} from "@/components/products/ProductCard";
import {SectionReveal} from "@/components/ui/SectionReveal";
import {getProducts} from "@/lib/content/repository";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";

export async function ProductsPageView({locale}: {locale: Locale}) {
  const products = await getProducts(locale);
  const copy = getMessages(locale).products;

  return (
    <div className="page-shell products-page">
      <header className="page-intro">
        <div>
          <p className="eyebrow">
            {copy.kicker} · {products.length} {copy.count}
          </p>
          <h1 className="i18n-lines">{copy.title}</h1>
        </div>
        <p>{copy.intro}</p>
      </header>
      <div className="product-grid product-grid--catalog">
        {products.map((product, index) => (
          <SectionReveal key={product.id}>
            <ProductCard index={index} locale={locale} product={product} />
          </SectionReveal>
        ))}
      </div>
    </div>
  );
}
