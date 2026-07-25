/* eslint-disable @next/next/no-img-element -- Product media use expiring signed Supabase URLs. */

import type {Product} from "@/lib/content/types";
import {brand} from "@/lib/brand";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";

export function ProductVisual({
  product,
  compact = false,
  locale = "it",
}: {
  product: Product;
  compact?: boolean;
  locale?: Locale;
}) {
  const messages = getMessages(locale);
  const isBottle = ["oil", "white-wine", "red-wine", "gin"].includes(
    product.visual,
  );
  const isBag = ["tomato-chips", "polenta-chips"].includes(product.visual);
  const primaryMedia =
    product.media?.find((item) => item.role === "primary") ?? product.media?.[0];

  if (primaryMedia?.thumbnailUrl || primaryMedia?.imageUrl) {
    return (
      <div
        className={`product-visual product-visual--photo ${
          compact ? "is-compact" : ""
        }`}
      >
        <img
          alt={primaryMedia.altText || product.name}
          height={primaryMedia.height}
          loading={compact ? "lazy" : "eager"}
          src={primaryMedia.thumbnailUrl || primaryMedia.imageUrl}
          style={{
            objectPosition: `${primaryMedia.focalX * 100}% ${
              primaryMedia.focalY * 100
            }%`,
          }}
          width={primaryMedia.width}
        />
      </div>
    );
  }

  return (
    <div
      aria-label={`${messages.products.packageLabel} ${product.name}`}
      className={`product-visual product-visual--${product.visual} ${
        compact ? "is-compact" : ""
      }`}
      role="img"
      style={{"--product-accent": product.accent} as React.CSSProperties}
    >
      {isBottle ? (
        <div className="product-bottle">
          <span className="product-bottle__cap" />
          <span className="product-bottle__neck" />
          <span className="product-bottle__body">
            <span className="product-label">
              <small>{brand.name}</small>
              <strong>{product.name}</strong>
              <i>{product.eyebrow}</i>
              <em>{messages.products.visual.country}</em>
            </span>
          </span>
        </div>
      ) : null}
      {product.visual === "sauce" ? (
        <div className="product-jar">
          <span className="product-jar__lid" />
          <span className="product-jar__glass">
            <span className="product-label">
              <small>{brand.name}</small>
              <strong>{messages.products.visual.sauceTitle}</strong>
              <i>{messages.products.visual.sauceSubtitle}</i>
            </span>
          </span>
        </div>
      ) : null}
      {isBag ? (
        <div className="product-bag">
          <span className="product-bag__seam" />
          <span className="product-label">
            <small>{brand.name}</small>
            <strong>
              {product.visual === "tomato-chips"
                ? messages.products.visual.tomato
                : messages.products.visual.seedsPolenta}
            </strong>
            <i>{messages.products.visual.chips}</i>
          </span>
        </div>
      ) : null}
      <span aria-hidden="true" className="product-visual__shadow" />
    </div>
  );
}
