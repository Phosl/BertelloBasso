"use client";

/* eslint-disable @next/next/no-img-element -- Supabase returns short-lived signed WebP thumbnails that must bypass the persistent Next image cache. */

import {useCallback, useEffect, useState} from "react";
import {ArrowUpRight, Images, MapPin, Plus} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {getAdminGalleries} from "@/lib/galleries/admin-service";
import type {Gallery} from "@/lib/galleries/types";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {isSupabaseConfigured} from "@/lib/supabase/browser";

const statusLabels = {
  draft: "Bozza",
  published: "Online",
  archived: "Archiviata",
} as const;

export function GalleryManager() {
  const configured = isSupabaseConfigured();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(configured);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setNotice("");
    try {
      setGalleries(await getAdminGalleries());
    } catch (error) {
      setNotice(getAdminErrorMessage(error as Error));
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, [refresh]);

  return (
    <div className="admin-page gallery-admin">
      <header className="admin-page__head gallery-admin__head">
        <div>
          <p className="eyebrow">Fotografie</p>
          <h1>Gallerie</h1>
          <p>Crea, ordina e pubblica le storie fotografiche del sito.</p>
        </div>
        {configured ? (
          <TransitionLink
            className="admin-primary-action gallery-admin__create"
            href="/admin/gallerie/nuova"
          >
            <Plus aria-hidden="true" size={24} />
            Crea nuova galleria
          </TransitionLink>
        ) : (
          <span
            aria-disabled="true"
            className="admin-primary-action gallery-admin__create is-disabled"
          >
            <Plus aria-hidden="true" size={24} />
            Crea nuova galleria
          </span>
        )}
      </header>

      {!configured ? (
        <section className="gallery-admin-blocked" role="status">
          <Images aria-hidden="true" size={42} />
          <div>
            <h2>Collega Supabase per caricare fotografie</h2>
            <p>
              Aggiungi le variabili Supabase in <code>.env.local</code>, applica
              la migrazione delle gallerie e poi ricarica questa pagina.
            </p>
          </div>
        </section>
      ) : null}

      {notice ? (
        <div className="gallery-admin-notice" role="alert">
          {notice}
          <button onClick={() => void refresh()} type="button">
            Riprova
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="admin-skeleton admin-skeleton--table" />
      ) : configured && galleries.length === 0 && !notice ? (
        <section className="gallery-admin-empty">
          <Images aria-hidden="true" size={42} />
          <h2>Non ci sono ancora gallerie.</h2>
          <p>Inizia creando la prima storia fotografica.</p>
          <TransitionLink
            className="admin-primary-action"
            href="/admin/gallerie/nuova"
          >
            <Plus aria-hidden="true" size={22} />
            Crea la prima galleria
          </TransitionLink>
        </section>
      ) : null}

      {galleries.length ? (
        <div className="gallery-admin-list">
          {galleries.map((gallery) => (
            <article className="gallery-admin-card" key={gallery.id}>
              <div className="gallery-admin-card__cover">
                {gallery.coverPhoto?.thumbnailUrl ? (
                  <img
                    alt={gallery.coverPhoto.altText}
                    height={gallery.coverPhoto.height}
                    src={gallery.coverPhoto.thumbnailUrl}
                    width={gallery.coverPhoto.width}
                  />
                ) : (
                  <Images aria-hidden="true" size={36} />
                )}
              </div>
              <div className="gallery-admin-card__body">
                <span className={`gallery-status is-${gallery.status}`}>
                  {statusLabels[gallery.status]}
                </span>
                <h2>{gallery.title}</h2>
                <p>
                  <MapPin aria-hidden="true" size={18} />
                  {gallery.locationName || "Località da inserire"}
                </p>
                <strong>
                  {gallery.photoCount}{" "}
                  {gallery.photoCount === 1 ? "fotografia" : "fotografie"}
                </strong>
                <div>
                  <TransitionLink
                    className="gallery-admin-card__edit"
                    href={`/admin/gallerie/${gallery.id}`}
                  >
                    Gestisci galleria
                    <ArrowUpRight aria-hidden="true" size={21} />
                  </TransitionLink>
                  {gallery.status === "published" ? (
                    <a
                      href={`/fotografie/${gallery.slug}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Vedi online
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
