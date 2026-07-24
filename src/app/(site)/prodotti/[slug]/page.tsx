import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ArrowLeft, Mail} from "lucide-react";
import {ProductVisual} from "@/components/products/ProductVisual";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {getProducts} from "@/lib/content/repository";

type PageProps = {
  params: Promise<{slug: string}>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {slug} = await params;
  const product = (await getProducts()).find((item) => item.slug === slug);
  if (!product) return {};
  return {title: product.name, description: product.description};
}

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({slug: product.slug}));
}

export default async function ProductDetailPage({params}: PageProps) {
  const {slug} = await params;
  const product = (await getProducts()).find((item) => item.slug === slug);
  if (!product) notFound();

  return (
    <article className="product-detail">
      <div className="product-detail__visual">
        <TransitionLink className="back-link" href="/prodotti">
          <ArrowLeft aria-hidden="true" size={17} /> Tutti i prodotti
        </TransitionLink>
        <ProductVisual product={product} />
      </div>
      <div className="product-detail__content">
        <div className="product-detail__meta">
          <span>{product.eyebrow}</span>
          <span>
            {product.status === "coming_soon"
              ? "Coming soon"
              : product.status === "seasonal"
                ? "Disponibilità stagionale"
                : "Disponibile"}
          </span>
        </div>
        <h1>{product.name}</h1>
        <p className="product-detail__lead">{product.description}</p>
        <div className="product-detail__formats">
          <p className="eyebrow">Formati</p>
          {product.formats.map((format) => (
            <div key={format.label}>
              <strong>{format.label}</strong>
              <span>
                {format.price
                  ? new Intl.NumberFormat("it-IT", {
                      style: "currency",
                      currency: "EUR",
                    }).format(format.price)
                  : "Prezzo in arrivo"}
              </span>
            </div>
          ))}
        </div>
        {product.status === "coming_soon" ? (
          <div className="coming-note">
            <p className="eyebrow">La prima annata sta arrivando</p>
            <p>
              L’etichetta è pronta, il vino si prende ancora il suo tempo.
              Scrivici per ricevere notizie sull’uscita.
            </p>
          </div>
        ) : null}
        <TransitionLink className="button-link" href="/contatti">
          <Mail aria-hidden="true" size={17} />
          Chiedi disponibilità
        </TransitionLink>
      </div>
    </article>
  );
}
