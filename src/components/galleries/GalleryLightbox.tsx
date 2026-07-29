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

      lightbox.on("contentLoad", (event) => {
        const {content} = event;
        if (content.type !== "video") return;
        event.preventDefault();

        const container = document.createElement("div");
        container.className = "pswp__video-container";
        const video = document.createElement("video");
        video.controls = true;
        video.playsInline = true;
        video.preload = event.isLazy ? "none" : "metadata";
        video.poster = String(content.data.msrc ?? "");
        const mediaUrl = String(content.data.src ?? "");
        const mimeType = String(content.data.element?.dataset.videoType ?? "");
        const source = document.createElement("source");
        source.src = mediaUrl;
        if (mimeType) source.type = mimeType;
        video.append(source);
        video.setAttribute(
          "aria-label",
          String(content.data.alt || viewerLabel),
        );

        const fallback = document.createElement("a");
        fallback.href = mediaUrl;
        fallback.target = "_blank";
        fallback.rel = "noreferrer";
        fallback.textContent = "Apri o scarica il video";

        container.append(video, fallback);
        content.element = container;
      });

      lightbox.on("contentDeactivate", ({content}) => {
        content.element?.querySelector("video")?.pause();
      });

      lightbox.on("contentDestroy", ({content}) => {
        const video = content.element?.querySelector("video");
        if (!video) return;
        video.pause();
        video.replaceChildren();
        video.load();
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
        lightbox?.pswp?.ui?.registerElement({
          name: "bertello-dng-download",
          className: "pswp__button--bertello-dng",
          order: 8,
          isButton: false,
          tagName: "a",
          html: "DNG ↓",
          ariaLabel: "Scarica il file DNG originale",
          appendTo: "bar",
          onInit: (element, pswp) => {
            const link = element as HTMLAnchorElement;
            const updateDownload = () => {
              const current = pswp.currSlide?.data.element;
              const originalUrl =
                current?.getAttribute("data-original-url") ?? "";
              link.hidden = !originalUrl;
              link.href = originalUrl || "#";
              link.download =
                current?.getAttribute("data-source-name") || "fotografia.dng";
              link.target = "_blank";
              link.rel = "noreferrer";
            };
            pswp.on("change", updateDownload);
            updateDownload();
          },
        });
      });
      lightbox.init();
    });

    return () => {
      active = false;
      lightbox?.destroy();
    };
  }, [elementId, viewerLabel]);

  return (
    <div className="photography-grid" id={elementId}>
      {photos.map((photo, index) => (
        <a
          aria-label={`${viewerLabel}: ${photo.altText || index + 1}`}
          className={`photography-grid__item photography-grid__item--${
            (index % 7) + 1
          }`}
          data-caption={photo.caption}
          data-media-type={photo.mediaType}
          data-original-url={photo.originalUrl || undefined}
          data-pswp-height={photo.height}
          data-pswp-type={
            photo.mediaType === "video" ? "video" : undefined
          }
          data-pswp-width={photo.width}
          data-source-name={photo.sourceName || undefined}
          data-video-type={
            photo.mediaType === "video" ? photo.mimeType : undefined
          }
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
          {photo.mediaType === "video" ? (
            <span className="photography-grid__play" aria-hidden="true">
              <span />
            </span>
          ) : null}
          <span className="photography-grid__format">
            {photo.mediaType === "video"
              ? "Video"
              : photo.sourceType === "dng"
                ? "DNG"
                : ""}
          </span>
          <span className="photography-grid__number">
            {String(index + 1).padStart(2, "0")}
          </span>
        </a>
      ))}
    </div>
  );
}
