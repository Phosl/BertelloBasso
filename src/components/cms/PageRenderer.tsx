/* eslint-disable @next/next/no-img-element -- CMS images are private assets exposed with expiring signed URLs. */

import {ArrowUpRight, Images, Quote} from "lucide-react";
import {ContactForm} from "@/components/forms/ContactForm";
import {GalleryMap} from "@/components/galleries/GalleryMap";
import {ProductCard} from "@/components/products/ProductCard";
import {SectionReveal} from "@/components/ui/SectionReveal";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {WatercolorReveal} from "@/components/visual/WatercolorReveal";
import {
  getPublishedCmsSettings,
  getPublishedPageMedia,
} from "@/lib/cms/repository";
import {localizeRichText, localizeText, visibleSections} from "@/lib/cms/localize";
import type {CmsPage, MediaAsset, PageSnapshot} from "@/lib/cms/types";
import {getProducts} from "@/lib/content/repository";
import {getPublishedGalleries} from "@/lib/galleries/repository";
import type {Gallery} from "@/lib/galleries/types";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";
import {publicPath} from "@/lib/i18n/routing";
import {RichTextRenderer} from "./RichTextRenderer";

function localizedHref(href: string, locale: Locale) {
  if (locale === "it") return href;
  const routeMap: Record<string, string> = {
    "/": "/en",
    "/prodotti": "/en/products",
    "/fotografie": "/en/photography",
    "/storia": "/en/story",
    "/contatti": "/en/contact",
  };
  return routeMap[href] ?? (href.startsWith("/") ? `/en${href}` : href);
}

function CmsImage({
  asset,
  alt,
  watercolor,
}: {
  asset: MediaAsset | undefined;
  alt: string;
  watercolor: boolean;
}) {
  if (!asset?.imageUrl) return null;
  if (watercolor) {
    return <WatercolorReveal alt={alt || asset.alt.it} src={asset.imageUrl} />;
  }
  return (
    <img
      alt={alt || asset.alt.it}
      height={asset.height}
      loading="lazy"
      src={asset.imageUrl}
      width={asset.width}
    />
  );
}

function GalleryCards({
  galleries,
  locale,
}: {
  galleries: Gallery[];
  locale: Locale;
}) {
  const copy = getMessages(locale).photography;
  if (!galleries.length) {
    return (
      <div className="gallery-empty">
        <Images aria-hidden="true" size={36} />
        <h2>{copy.emptyTitle}</h2>
        <p>{copy.emptyBody}</p>
      </div>
    );
  }
  return (
    <div className="gallery-list">
      {galleries.map((gallery, index) => (
        <SectionReveal key={gallery.id}>
          <TransitionLink
            className="gallery-card"
            href={publicPath(locale, "photography", gallery.slug)}
            transitionLabel={gallery.title}
          >
            <div className="gallery-card__image">
              {gallery.coverPhoto?.thumbnailUrl ? (
                <img
                  alt={gallery.coverPhoto.altText}
                  height={gallery.coverPhoto.height}
                  loading={index < 2 ? "eager" : "lazy"}
                  src={gallery.coverPhoto.thumbnailUrl}
                  width={gallery.coverPhoto.width}
                />
              ) : (
                <span className="gallery-image-placeholder" />
              )}
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="gallery-card__body">
              <div>
                <p className="eyebrow">{gallery.locationName}</p>
                <h2>{gallery.title}</h2>
              </div>
              <div className="gallery-card__meta">
                <span>{gallery.photoCount} {copy.photoCount}</span>
                <span>{copy.discover}<ArrowUpRight aria-hidden="true" size={18} /></span>
              </div>
            </div>
          </TransitionLink>
        </SectionReveal>
      ))}
    </div>
  );
}

export async function PageRenderer({
  locale,
  page,
  snapshot,
  preview = false,
}: {
  locale: Locale;
  page: CmsPage;
  snapshot?: PageSnapshot;
  preview?: boolean;
}) {
  const content = snapshot ?? page.published ?? page.draft;
  const sections = visibleSections(content);
  const needsProducts = sections.some((section) => section.type === "productGrid");
  const needsGalleries = sections.some(
    (section) =>
      section.type === "galleryIndex" || section.type === "galleryTeaser",
  );
  const [products, galleries, media, settings] = await Promise.all([
    needsProducts ? getProducts(locale) : Promise.resolve([]),
    needsGalleries ? getPublishedGalleries(locale) : Promise.resolve([]),
    preview ? Promise.resolve(new Map<string, MediaAsset>()) : getPublishedPageMedia(content),
    getPublishedCmsSettings(),
  ]);

  return (
    <div className={`cms-page cms-page--${page.pageKey ?? "custom"}`}>
      {preview ? (
        <div className="cms-preview-banner">Anteprima della bozza — non pubblicata</div>
      ) : null}
      {sections.map((section) => {
        if (section.type === "hero") {
          const heroAsset = section.mediaId ? media.get(section.mediaId) : undefined;
          const fallbackHero =
            page.pageKey === "home" && !heroAsset
              ? "/images/umbrian-estate-hero.png"
              : "";
          return (
            <section className="cms-hero" key={section.id}>
              <div className="cms-hero__copy">
                <p className="eyebrow">{localizeText(section.kicker, locale)}</p>
                <h1 className="i18n-lines">{localizeText(section.title, locale)}</h1>
                <p>{localizeText(section.body, locale)}</p>
                {localizeText(section.actionLabel, locale) && section.actionHref ? (
                  <TransitionLink
                    className="text-link"
                    href={localizedHref(section.actionHref, locale)}
                  >
                    {localizeText(section.actionLabel, locale)}
                    <ArrowUpRight aria-hidden="true" size={17} />
                  </TransitionLink>
                ) : null}
              </div>
              {heroAsset ? (
                <CmsImage
                  alt={localizeText(heroAsset.alt, locale)}
                  asset={heroAsset}
                  watercolor={section.watercolor}
                />
              ) : fallbackHero ? (
                <WatercolorReveal
                  alt={getMessages(locale).home.imageAlt}
                  src={fallbackHero}
                />
              ) : null}
            </section>
          );
        }

        if (section.type === "richText") {
          return (
            <SectionReveal className="cms-section cms-section--rich" key={section.id}>
              {localizeText(section.title, locale) ? (
                <h2>{localizeText(section.title, locale)}</h2>
              ) : null}
              <RichTextRenderer
                content={localizeRichText(section.content, locale).content}
              />
            </SectionReveal>
          );
        }

        if (section.type === "image") {
          const asset = section.mediaId ? media.get(section.mediaId) : undefined;
          return (
            <SectionReveal className="cms-section cms-section--image" key={section.id}>
              <CmsImage
                alt={asset ? localizeText(asset.alt, locale) : ""}
                asset={asset}
                watercolor={section.watercolor}
              />
              {localizeText(section.caption, locale) ? (
                <p>{localizeText(section.caption, locale)}</p>
              ) : null}
            </SectionReveal>
          );
        }

        if (section.type === "imageText") {
          const asset = section.mediaId ? media.get(section.mediaId) : undefined;
          return (
            <SectionReveal
              className={`cms-section cms-section--split is-${section.imageSide}`}
              key={section.id}
            >
              <div className="cms-section__media">
                {asset ? (
                  <CmsImage
                    alt={localizeText(asset.alt, locale)}
                    asset={asset}
                    watercolor={false}
                  />
                ) : (
                  <span className="cms-brand-mark" aria-hidden="true">B<i />B</span>
                )}
              </div>
              <div>
                <p className="eyebrow">{localizeText(section.kicker, locale)}</p>
                <h2>{localizeText(section.title, locale)}</h2>
                <p>{localizeText(section.body, locale)}</p>
                {localizeText(section.actionLabel, locale) && section.actionHref ? (
                  <TransitionLink
                    className="text-link"
                    href={localizedHref(section.actionHref, locale)}
                  >
                    {localizeText(section.actionLabel, locale)}
                    <ArrowUpRight aria-hidden="true" size={17} />
                  </TransitionLink>
                ) : null}
              </div>
            </SectionReveal>
          );
        }

        if (section.type === "cards") {
          return (
            <section className="cms-section cms-section--cards" key={section.id}>
              <header>
                <p className="eyebrow">{localizeText(section.kicker, locale)}</p>
                {localizeText(section.title, locale) ? (
                  <h2>{localizeText(section.title, locale)}</h2>
                ) : null}
              </header>
              <div>
                {section.items.map((item, index) => (
                  <SectionReveal key={item.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{localizeText(item.title, locale)}</h3>
                    <p>{localizeText(item.body, locale)}</p>
                  </SectionReveal>
                ))}
              </div>
            </section>
          );
        }

        if (section.type === "quote") {
          return (
            <SectionReveal className="cms-section cms-section--quote" key={section.id}>
              <Quote aria-hidden="true" />
              <blockquote>{localizeText(section.quote, locale)}</blockquote>
              <cite>{localizeText(section.author, locale)}</cite>
            </SectionReveal>
          );
        }

        if (section.type === "productGrid") {
          const selected = products
            .filter((product) => {
              if (section.mode === "featured") return product.featured;
              if (section.mode === "selected") return section.productIds.includes(product.id);
              return true;
            })
            .slice(0, section.limit);
          return (
            <section className="cms-section cms-section--products" key={section.id}>
              {localizeText(section.title, locale) ? (
                <header>
                  <p className="eyebrow">{getMessages(locale).home.productsKicker}</p>
                  <h2 className="i18n-lines">{localizeText(section.title, locale)}</h2>
                </header>
              ) : null}
              <div className="product-grid product-grid--catalog">
                {selected.map((product, index) => (
                  <SectionReveal key={product.id}>
                    <ProductCard index={index} locale={locale} product={product} />
                  </SectionReveal>
                ))}
              </div>
            </section>
          );
        }

        if (section.type === "galleryIndex") {
          return (
            <section className="cms-section cms-section--galleries" key={section.id}>
              <GalleryCards galleries={galleries} locale={locale} />
            </section>
          );
        }

        if (section.type === "galleryTeaser") {
          const selected = section.galleryId
            ? galleries.filter((gallery) => gallery.id === section.galleryId)
            : galleries.slice(0, section.limit);
          return (
            <section className="cms-section cms-section--galleries" key={section.id}>
              <header>
                <p className="eyebrow">{localizeText(section.kicker, locale)}</p>
                <h2>{localizeText(section.title, locale)}</h2>
              </header>
              <GalleryCards galleries={selected} locale={locale} />
            </section>
          );
        }

        if (section.type === "cta") {
          return (
            <SectionReveal className="cms-section cms-section--cta" key={section.id}>
              <p className="eyebrow">{localizeText(section.kicker, locale)}</p>
              <h2>{localizeText(section.title, locale)}</h2>
              <p>{localizeText(section.body, locale)}</p>
              <TransitionLink
                className="button-link"
                href={localizedHref(section.href, locale)}
              >
                {localizeText(section.label, locale)}
                <ArrowUpRight aria-hidden="true" size={17} />
              </TransitionLink>
            </SectionReveal>
          );
        }

        if (section.type === "location") {
          return (
            <div className="cms-section cms-section--location" key={section.id}>
              <div className="cms-location-intro">
                <p className="eyebrow">{localizeText(section.kicker, locale)}</p>
                <h2>{localizeText(section.title, locale)}</h2>
                <p>{localizeText(section.body, locale)}</p>
                {page.pageKey === "contact" ? (
                  <div className="cms-location-contacts">
                    <a href={`mailto:${settings.published.email}`}>
                      {settings.published.email}
                    </a>
                    {settings.published.phone ? (
                      <a href={`tel:${settings.published.phone.replaceAll(" ", "")}`}>
                        {settings.published.phone}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {section.showMap ? (
                <GalleryMap
                  address={section.address}
                  latitude={section.latitude}
                  locale={locale}
                  locationName={localizeText(section.title, locale)}
                  longitude={section.longitude}
                  placeId={null}
                />
              ) : null}
            </div>
          );
        }

        if (section.type === "contactForm") {
          return (
            <section className="cms-section cms-section--contact" key={section.id}>
              <h2>{localizeText(section.title, locale)}</h2>
              <ContactForm locale={locale} />
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
