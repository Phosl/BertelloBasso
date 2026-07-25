"use client";

/* eslint-disable @next/next/no-img-element -- PhotoSwipe needs direct signed full-size URLs and intrinsic dimensions. */

import {useEffect} from "react";
import type {GalleryPhoto} from "@/lib/galleries/types";

export function GalleryLightbox({
  galleryId,
  photos,
  viewerLabel,
}: {
  galleryId: string;
  photos: GalleryPhoto[];
  viewerLabel: string;
}) {
  const elementId = `gallery-grid-${galleryId}`;

  useEffect(() => {
    let active = true;
    let lightbox: import("photoswipe/lightbox").default | null = null;

    void import("photoswipe/lightbox").then(({default: PhotoSwipeLightbox}) => {
      if (!active) return;
      lightbox = new PhotoSwipeLightbox({
        gallery: `#${CSS.escape(elementId)}`,
        children: "a",
        pswpModule: () => import("photoswipe"),
        bgOpacity: 0.94,
        showHideAnimationType: window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches
          ? "none"
          : "zoom",
        wheelToZoom: true,
      });

      lightbox.on("uiRegister", () => {
        lightbox?.pswp?.ui?.registerElement({
          name: "bertello-caption",
          order: 9,
          isButton: false,
          appendTo: "root",
          onInit: (element, pswp) => {
            const updateCaption = () => {
              const current = pswp.currSlide?.data.element;
              element.textContent =
                current?.getAttribute("data-caption") ?? "";
              element.hidden = element.textContent.length === 0;
            };
            pswp.on("change", updateCaption);
            updateCaption();
          },
        });
      });
      lightbox.init();
    });

    return () => {
      active = false;
      lightbox?.destroy();
    };
  }, [elementId]);

  return (
    <div className="photography-grid" id={elementId}>
      {photos.map((photo, index) => (
        <a
          aria-label={`${viewerLabel}: ${photo.altText || index + 1}`}
          className={`photography-grid__item photography-grid__item--${
            (index % 7) + 1
          }`}
          data-caption={photo.caption}
          data-pswp-height={photo.height}
          data-pswp-width={photo.width}
          href={photo.imageUrl}
          key={photo.id}
          target="_blank"
        >
          {photo.thumbnailUrl ? (
            <img
              alt={photo.altText}
              height={photo.height}
              loading={index < 3 ? "eager" : "lazy"}
              src={photo.thumbnailUrl}
              width={photo.width}
            />
          ) : (
            <span className="gallery-image-placeholder" aria-hidden="true" />
          )}
          <span className="photography-grid__number">
            {String(index + 1).padStart(2, "0")}
          </span>
        </a>
      ))}
    </div>
  );
}
