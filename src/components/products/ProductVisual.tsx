import type {Product} from "@/lib/content/types";

export function ProductVisual({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const isBottle = ["oil", "white-wine", "red-wine", "gin"].includes(
    product.visual,
  );
  const isBag = ["tomato-chips", "polenta-chips"].includes(product.visual);

  return (
    <div
      aria-label={`Confezione illustrata di ${product.name}`}
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
              <small>Pian della Carlotta</small>
              <strong>{product.name}</strong>
              <i>{product.eyebrow}</i>
              <em>Umbria · Italia</em>
            </span>
          </span>
        </div>
      ) : null}
      {product.visual === "sauce" ? (
        <div className="product-jar">
          <span className="product-jar__lid" />
          <span className="product-jar__glass">
            <span className="product-label">
              <small>Pian della Carlotta</small>
              <strong>Salse</strong>
              <i>piccanti</i>
            </span>
          </span>
        </div>
      ) : null}
      {isBag ? (
        <div className="product-bag">
          <span className="product-bag__seam" />
          <span className="product-label">
            <small>Pian della Carlotta</small>
            <strong>
              {product.visual === "tomato-chips" ? "Pomodoro" : "Semi & polenta"}
            </strong>
            <i>chips croccanti</i>
          </span>
        </div>
      ) : null}
      <span aria-hidden="true" className="product-visual__shadow" />
    </div>
  );
}
