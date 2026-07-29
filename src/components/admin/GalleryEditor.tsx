"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {
  Archive,
  ArrowLeft,
  Eye,
  Globe2,
  LoaderCircle,
  Save,
  Undo2,
} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {
  getAdminGallery,
  publishGallery,
  setGalleryArchived,
  updateGalleryContent,
} from "@/lib/galleries/admin-service";
import type {
  Gallery,
  GalleryContentInput,
  GalleryTranslation,
} from "@/lib/galleries/types";
import {
  galleryContentSchema,
  getPublicationIssues,
} from "@/lib/galleries/validation";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {isSupabaseConfigured} from "@/lib/supabase/browser";
import type {SelectedGooglePlace} from "./GooglePlacePicker";
import {GalleryDetailsForm} from "./GalleryDetailsForm";
import {GalleryPhotoManager} from "./GalleryPhotoManager";

type SaveState = "idle" | "saving" | "saved" | "error";
type EditorLocale = "it" | "en";

function contentFromGallery(gallery: Gallery): GalleryContentInput {
  return {
    title: gallery.title,
    description: gallery.description,
    translations: {
      en: {
        title: gallery.translations.en?.title ?? "",
        description: gallery.translations.en?.description ?? "",
        locationName: gallery.translations.en?.locationName ?? "",
      },
    },
    locationName: gallery.locationName,
    address: gallery.address,
    latitude: gallery.latitude,
    longitude: gallery.longitude,
    googlePlaceId: gallery.googlePlaceId,
  };
}

function formatSavedTime(date: Date | null) {
  if (!date) return "Non ci sono modifiche da salvare.";
  return `Salvato alle ${new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
}

export function GalleryEditor({galleryId}: {galleryId: string}) {
  const configured = isSupabaseConfigured();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [content, setContent] = useState<GalleryContentInput | null>(null);
  const [locale, setLocale] = useState<EditorLocale>("it");
  const [loading, setLoading] = useState(configured);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [notice, setNotice] = useState("");

  const refreshGallery = useCallback(
    async (replaceContent = false) => {
      if (!configured) return;
      const fresh = await getAdminGallery(galleryId);
      setGallery(fresh);
      if (fresh && (replaceContent || !content)) {
        setContent(contentFromGallery(fresh));
      }
    },
    [configured, content, galleryId],
  );

  useEffect(() => {
    if (!configured) return;
    let active = true;
    void getAdminGallery(galleryId)
      .then((fresh) => {
        if (!active) return;
        setGallery(fresh);
        setContent(fresh ? contentFromGallery(fresh) : null);
      })
      .catch((error) => {
        if (active) setNotice(getAdminErrorMessage(error as Error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [configured, galleryId]);

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  function changeContent(patch: Partial<GalleryContentInput>) {
    setContent((current) => (current ? {...current, ...patch} : current));
    setDirty(true);
    setSaveState("idle");
  }

  function changeEnglish(patch: Partial<GalleryTranslation>) {
    if (!content) return;
    const current = content.translations.en ?? {
      title: "",
      description: "",
      locationName: "",
    };
    changeContent({
      translations: {en: {...current, ...patch}},
    });
  }

  const choosePlace = useCallback((place: SelectedGooglePlace) => {
    setContent((current) => (current ? {...current, ...place} : current));
    setDirty(true);
    setSaveState("idle");
  }, []);

  async function save(showNotice = true) {
    if (!gallery || !content) return false;
    const parsed = galleryContentSchema.safeParse(content);
    if (!parsed.success) {
      setNotice(parsed.error.issues[0]?.message ?? "Controlla i campi.");
      setSaveState("error");
      return false;
    }
    setSaveState("saving");
    setNotice("");
    try {
      await updateGalleryContent(gallery.id, parsed.data);
      setGallery((current) =>
        current ? {...current, ...parsed.data} : current,
      );
      setDirty(false);
      setSaveState("saved");
      setSavedAt(new Date());
      if (showNotice) setNotice("Modifiche salvate correttamente.");
      return true;
    } catch (error) {
      setNotice(getAdminErrorMessage(error as Error));
      setSaveState("error");
      return false;
    }
  }

  const candidateGallery = useMemo(
    () => (gallery && content ? {...gallery, ...content} : gallery),
    [content, gallery],
  );
  const publicationIssues = candidateGallery
    ? getPublicationIssues(candidateGallery)
    : [];

  async function changePublication(publish: boolean) {
    if (!gallery || !content) return;
    if (publish && publicationIssues.length) {
      setNotice(publicationIssues.join(" "));
      return;
    }
    if (
      !publish &&
      !window.confirm(
        "Vuoi rimettere questa galleria in bozza? Non sarà più visibile sul sito.",
      )
    ) {
      return;
    }
    const saved = await save(false);
    if (!saved) return;
    setSaveState("saving");
    try {
      await publishGallery(gallery.id, publish);
      await refreshGallery();
      setSaveState("saved");
      setSavedAt(new Date());
      setNotice(
        publish
          ? "Galleria pubblicata: ora è visibile sul sito."
          : "Galleria riportata in bozza.",
      );
    } catch (error) {
      setNotice(getAdminErrorMessage(error as Error));
      setSaveState("error");
    }
  }

  async function changeArchive(archived: boolean) {
    if (!gallery) return;
    if (
      archived &&
      !window.confirm(
        "Vuoi archiviare questa galleria? Foto e video resteranno conservati.",
      )
    ) {
      return;
    }
    setSaveState("saving");
    setNotice("");
    try {
      await setGalleryArchived(gallery.id, archived);
      await refreshGallery();
      setSaveState("saved");
      setSavedAt(new Date());
      setNotice(archived ? "Galleria archiviata." : "Galleria ripristinata.");
    } catch (error) {
      setNotice(getAdminErrorMessage(error as Error));
      setSaveState("error");
    }
  }

  if (!configured) {
    return (
      <div className="admin-page gallery-editor-unavailable">
        <h1>Collega Supabase</h1>
        <p>
          Foto e video richiedono un archivio online. Configura Supabase e
          applica la migrazione prima di continuare.
        </p>
        <TransitionLink className="admin-primary-action" href="/admin/gallerie">
          Torna alle gallerie
        </TransitionLink>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-skeleton admin-skeleton--form" />;
  }

  if (!gallery || !content) {
    return (
      <div className="admin-page gallery-editor-unavailable">
        <h1>Galleria non trovata</h1>
        <p>{notice || "La galleria potrebbe essere stata archiviata o rimossa."}</p>
        <TransitionLink className="admin-primary-action" href="/admin/gallerie">
          Torna alle gallerie
        </TransitionLink>
      </div>
    );
  }

  return (
    <div className="admin-page gallery-editor">
      <header className="gallery-editor__head">
        <div>
          <TransitionLink className="back-link" href="/admin/gallerie">
            <ArrowLeft aria-hidden="true" size={20} />
            Tutte le gallerie
          </TransitionLink>
          <span className={`gallery-status is-${gallery.status}`}>
            {gallery.status === "published"
              ? "Online"
              : gallery.status === "archived"
                ? "Archiviata"
                : "Bozza"}
          </span>
          <h1>{content.title}</h1>
          <p className="gallery-editor__slug">/fotografie/{gallery.slug}</p>
        </div>
        {gallery.status === "published" ? (
          <a
            className="admin-secondary-action"
            href={`/fotografie/${gallery.slug}`}
            rel="noreferrer"
            target="_blank"
          >
            <Eye aria-hidden="true" size={21} />
            Vedi online
          </a>
        ) : null}
      </header>

      {notice ? (
        <div
          className={`gallery-editor-notice ${
            saveState === "error" ? "is-error" : ""
          }`}
          role={saveState === "error" ? "alert" : "status"}
        >
          {notice}
        </div>
      ) : null}

      <GalleryDetailsForm
        content={content}
        locale={locale}
        onChange={changeContent}
        onChangeEnglish={changeEnglish}
        onLocaleChange={setLocale}
        onPlaceSelect={choosePlace}
      />

      <GalleryPhotoManager
        gallery={gallery}
        onRefresh={() => refreshGallery()}
      />

      <section className="gallery-editor-section gallery-publish-panel">
        <header>
          <div>
            <span>4</span>
            <div>
              <h2>Pubblicazione</h2>
              <p>Controlla che tutto sia pronto prima di renderla visibile.</p>
            </div>
          </div>
          <Globe2 aria-hidden="true" size={32} />
        </header>
        {publicationIssues.length ? (
          <ul>
            {publicationIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        ) : (
          <p className="gallery-publish-ready">La galleria è pronta.</p>
        )}
        {gallery.status === "draft" ? (
          <div className="gallery-publish-panel__actions">
            <button
              className="gallery-publish-button"
              disabled={publicationIssues.length > 0 || saveState === "saving"}
              onClick={() => void changePublication(true)}
              type="button"
            >
              <Globe2 aria-hidden="true" size={24} />
              Pubblica sul sito
            </button>
            <button
              disabled={saveState === "saving"}
              onClick={() => void changeArchive(true)}
              type="button"
            >
              <Archive aria-hidden="true" size={21} />
              Archivia galleria
            </button>
          </div>
        ) : gallery.status === "published" ? (
          <button
            className="gallery-unpublish-button"
            disabled={saveState === "saving"}
            onClick={() => void changePublication(false)}
            type="button"
          >
            <Undo2 aria-hidden="true" size={21} />
            Rimetti in bozza
          </button>
        ) : (
          <button
            className="gallery-unpublish-button"
            disabled={saveState === "saving"}
            onClick={() => void changeArchive(false)}
            type="button"
          >
            <Undo2 aria-hidden="true" size={21} />
            Ripristina come bozza
          </button>
        )}
      </section>

      <div className="gallery-editor-actions">
        <div>
          <strong>
            {dirty ? "Ci sono modifiche da salvare." : formatSavedTime(savedAt)}
          </strong>
          <span>
            {gallery.status === "published"
              ? "La galleria è visibile sul sito."
              : "La galleria non è visibile al pubblico."}
          </span>
        </div>
        <button
          disabled={!dirty || saveState === "saving"}
          onClick={() => void save()}
          type="button"
        >
          {saveState === "saving" ? (
            <LoaderCircle aria-hidden="true" className="spin" size={23} />
          ) : (
            <Save aria-hidden="true" size={23} />
          )}
          {saveState === "saving" ? "Salvataggio…" : "Salva modifiche"}
        </button>
      </div>
    </div>
  );
}
