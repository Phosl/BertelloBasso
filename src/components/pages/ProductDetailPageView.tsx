import {notFound} from "next/navigation";
import {ArrowLeft, Mail} from "lucide-react";
import {ProductVisual} from "@/components/products/ProductVisual";
import {ProductMediaGallery} from "@/components/products/ProductMediaGallery";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {getProducts} from "@/lib/content/repository";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";
import {publicPath} from "@/lib/i18n/routing";

export async function ProductDetailPageView({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const product = (await getProducts(locale)).find(
    (item) => item.slug === slug,
  );
  if (!product) notFound();
  const copy = getMessages(locale).products;
  const visibleMedia =
    product.media?.filter((item) => item.imageUrl || item.thumbnailUrl) ?? [];

  return (
    <article className="product-detail">
      <div className="product-detail__visual">
        <TransitionLink
          className="back-link"
          href={publicPath(locale, "products")}
        >
          <ArrowLeft aria-hidden="true" size={17} /> {copy.allProducts}
        </TransitionLink>
        {visibleMedia.length ? (
          <ProductMediaGallery
            label={copy.viewerLabel}
            media={visibleMedia}
          />
        ) : (
          <ProductVisual locale={locale} product={product} />
        )}
      </div>
      <div className="product-detail__content">
        <div className="product-detail__meta">
          <span>{product.eyebrow}</span>
          <span>{copy.detailStatus[product.status]}</span>
        </div>
        <h1>{product.name}</h1>
        <p className="product-detail__lead">{product.description}</p>
        <div className="product-detail__formats">
          <p className="eyebrow">{copy.formats}</p>
          {product.formats.map((format) => (
            <div key={format.label}>
              <strong>{format.label}</strong>
              <span>
                {format.price !== undefined
                  ? new Intl.NumberFormat(
                      locale === "it" ? "it-IT" : "en-GB",
                      {style: "currency", currency: "EUR"},
                    ).format(format.price)
                  : product.status === "coming_soon"
                    ? copy.priceSoon
                    : copy.priceRequest}
              </span>
            </div>
          ))}
        </div>
        {product.status === "coming_soon" ? (
          <div className="coming-note">
            <p className="eyebrow">{copy.comingKicker}</p>
            <p>{copy.comingBody}</p>
          </div>
        ) : null}
        <TransitionLink
          className="button-link"
          href={`${publicPath(locale, "contact")}?${new URLSearchParams({
            product: product.name,
            productSlug: product.slug,
            format: product.formats[0]?.label ?? "",
          }).toString()}`}
        >
          <Mail aria-hidden="true" size={17} />
          {copy.askAvailability}
        </TransitionLink>
      </div>
    </article>
  );
}
