"use client";

/* eslint-disable @next/next/no-img-element -- Signed Supabase URLs expire and PhotoSwipe requires intrinsic dimensions. */

import {useEffect} from "react";
import type {ProductMedia} from "@/lib/content/types";

export function ProductMediaGallery({
  media,
  label,
}: {
  media: ProductMedia[];
  label: string;
}) {
  const galleryId = `product-gallery-${media[0]?.id ?? "empty"}`;

  useEffect(() => {
    if (!media.length) return;
    let active = true;
    let lightbox: import("photoswipe/lightbox").default | null = null;
    void import("photoswipe/lightbox").then(({default: PhotoSwipeLightbox}) => {
      if (!active) return;
      lightbox = new PhotoSwipeLightbox({
        gallery: `#${CSS.escape(galleryId)}`,
        children: "a",
        pswpModule: () => import("photoswipe"),
        bgOpacity: 0.94,
        wheelToZoom: true,
        showHideAnimationType: window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches
          ? "none"
          : "zoom",
      });
      lightbox.init();
    });
    return () => {
      active = false;
      lightbox?.destroy();
    };
  }, [galleryId, media.length]);

  return (
    <div className="product-media-gallery" id={galleryId}>
      {media.map((item, index) => (
        <a
          aria-label={`${label}: ${item.altText || index + 1}`}
          className={index === 0 ? "is-primary" : ""}
          data-pswp-height={item.height}
          data-pswp-width={item.width}
          href={item.imageUrl}
          key={item.id}
          target="_blank"
        >
          <img
            alt={item.altText}
            height={item.height}
            loading={index === 0 ? "eager" : "lazy"}
            src={item.thumbnailUrl || item.imageUrl}
            style={{
              objectPosition: `${item.focalX * 100}% ${item.focalY * 100}%`,
            }}
            width={item.width}
          />
        </a>
      ))}
    </div>
  );
}
