/* eslint-disable @next/next/no-img-element -- Supabase thumbnails are pre-compressed WebP assets with expiring signed URLs. */

import {ArrowUpRight, Images} from "lucide-react";
import {SectionReveal} from "@/components/ui/SectionReveal";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {getPublishedGalleries} from "@/lib/galleries/repository";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";
import {publicPath} from "@/lib/i18n/routing";

export async function PhotographyPageView({locale}: {locale: Locale}) {
  const galleries = await getPublishedGalleries(locale);
  const copy = getMessages(locale).photography;

  return (
    <div className="page-shell photography-page">
      <header className="page-intro">
        <div>
          <p className="eyebrow">
            {copy.kicker} · {galleries.length} {copy.count}
          </p>
          <h1 className="i18n-lines">{copy.title}</h1>
        </div>
        <p>{copy.intro}</p>
      </header>
      {galleries.length ? (
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
                    <span>
                      {gallery.photoCount} {copy.photoCount}
                    </span>
                    <span>
                      {copy.discover}
                      <ArrowUpRight aria-hidden="true" size={18} />
                    </span>
                  </div>
                </div>
              </TransitionLink>
            </SectionReveal>
          ))}
        </div>
      ) : (
        <div className="gallery-empty">
          <Images aria-hidden="true" size={36} />
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyBody}</p>
        </div>
      )}
    </div>
  );
}
