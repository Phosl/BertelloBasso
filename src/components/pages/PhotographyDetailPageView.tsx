import {notFound} from "next/navigation";
import {ArrowLeft} from "lucide-react";
import {GalleryLightbox} from "@/components/galleries/GalleryLightbox";
import {GalleryMap} from "@/components/galleries/GalleryMap";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {getPublishedGallery} from "@/lib/galleries/repository";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";
import {publicPath} from "@/lib/i18n/routing";

export async function PhotographyDetailPageView({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const gallery = await getPublishedGallery(slug, locale);
  if (!gallery) notFound();
  const copy = getMessages(locale).photography;

  return (
    <article className="photography-detail">
      <header className="photography-detail__head">
        <TransitionLink
          className="back-link"
          href={publicPath(locale, "photography")}
        >
          <ArrowLeft aria-hidden="true" size={18} />
          {copy.back}
        </TransitionLink>
        <p className="eyebrow">{gallery.locationName}</p>
        <h1>{gallery.title}</h1>
        {gallery.description ? <p>{gallery.description}</p> : null}
        <div>
          <span>
            {gallery.photoCount} {copy.photoCount}
          </span>
          <span>{gallery.locationName}</span>
        </div>
      </header>
      <GalleryLightbox
        galleryId={gallery.id}
        photos={gallery.photos.filter((photo) => photo.imageUrl)}
        viewerLabel={copy.viewerLabel}
      />
      <GalleryMap
        address={gallery.address}
        latitude={gallery.latitude}
        locale={locale}
        locationName={gallery.locationName}
        longitude={gallery.longitude}
        placeId={gallery.googlePlaceId}
      />
    </article>
  );
}
