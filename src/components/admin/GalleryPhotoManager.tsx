"use client";

/* eslint-disable @next/next/no-img-element -- Supabase returns short-lived signed WebP thumbnails that must bypass the persistent Next image cache. */

import {useRef, useState} from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  FileImage,
  GripVertical,
  ImagePlus,
  LoaderCircle,
  Play,
  Star,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import {
  deleteGalleryPhoto,
  reorderGalleryPhotos,
  setGalleryCover,
  uploadGalleryPhoto,
} from "@/lib/galleries/admin-service";
import {
  maxGalleryPhotos,
  fileStem,
  isDngFile,
  isGalleryPreviewFile,
  isVideoFile,
  processGalleryMedia,
  validateGalleryFile,
  validateGalleryPreviewFile,
} from "@/lib/galleries/image-processing";
import type {Gallery, GalleryPhoto} from "@/lib/galleries/types";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {GalleryPhotoTextEditor} from "./GalleryPhotoTextEditor";

type UploadState =
  | "waiting"
  | "processing"
  | "uploading"
  | "complete"
  | "error";

type UploadEntry = {
  id: string;
  file: File;
  previewFile?: File;
  state: UploadState;
  error: string;
};

const uploadLabels: Record<UploadState, string> = {
  waiting: "In attesa",
  processing: "Preparazione",
  uploading: "Caricamento",
  complete: "Completata",
  error: "Da riprovare",
};

const progress: Record<UploadState, number> = {
  waiting: 8,
  processing: 38,
  uploading: 76,
  complete: 100,
  error: 100,
};

export function GalleryPhotoManager({
  gallery,
  onRefresh,
}: {
  gallery: Gallery;
  onRefresh: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dngPreviewInputRef = useRef<HTMLInputElement>(null);
  const previewEntryIdRef = useRef<string | null>(null);
  const [queue, setQueue] = useState<UploadEntry[]>([]);
  const [notice, setNotice] = useState("");
  const [dropActive, setDropActive] = useState(false);
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const disabled = gallery.status !== "draft";

  function updateQueue(id: string, patch: Partial<UploadEntry>) {
    setQueue((current) =>
      current.map((entry) => (entry.id === id ? {...entry, ...patch} : entry)),
    );
  }

  async function uploadEntry(
    entry: UploadEntry,
    sortOrder: number,
    setAsCover: boolean,
  ) {
    try {
      updateQueue(entry.id, {state: "processing", error: ""});
      const processed = await processGalleryMedia(
        entry.file,
        entry.previewFile,
      );
      updateQueue(entry.id, {state: "uploading"});
      const photo = await uploadGalleryPhoto(gallery, processed, {
        sortOrder,
        setAsCover,
      });
      updateQueue(entry.id, {state: "complete"});
      return photo;
    } catch (error) {
      const message =
        error instanceof Error &&
        /Formato|MB|DNG|video|anteprima|browser|dimensioni/i.test(error.message)
          ? error.message
          : getAdminErrorMessage(error as Error);
      updateQueue(entry.id, {state: "error", error: message});
      return null;
    }
  }

  async function addFiles(fileList: FileList | File[]) {
    if (disabled || working) return;
    setNotice("");
    const files = Array.from(fileList);
    const dngFiles = files.filter(isDngFile);
    const previewsUsedByDng = new Set<File>();
    const dngPreviews = new Map<File, File>();

    for (const dng of dngFiles) {
      const preview = files.find(
        (candidate) =>
          candidate !== dng &&
          !previewsUsedByDng.has(candidate) &&
          isGalleryPreviewFile(candidate) &&
          fileStem(candidate) === fileStem(dng),
      );
      if (preview) {
        previewsUsedByDng.add(preview);
        dngPreviews.set(dng, preview);
      }
    }

    const sourceFiles = files.filter((file) => !previewsUsedByDng.has(file));
    const remaining = maxGalleryPhotos - gallery.photos.length;
    if (sourceFiles.length > remaining) {
      setNotice(
        `Puoi aggiungere ancora ${remaining} ${
          remaining === 1 ? "contenuto" : "contenuti"
        }.`,
      );
      return;
    }

    const entries = sourceFiles.map<UploadEntry>((file) => {
      const previewFile = dngPreviews.get(file);
      const validationError =
        validateGalleryFile(file) ||
        (isDngFile(file) && !previewFile
          ? "Per il DNG scegli anche un JPG di anteprima con lo stesso nome."
          : "");
      return {
        id: crypto.randomUUID(),
        file,
        previewFile,
        state: validationError ? "error" : "waiting",
        error: validationError,
      };
    });
    setQueue((current) => [...entries, ...current].slice(0, 50));
    const validEntries = entries.filter((entry) => !entry.error);
    if (!validEntries.length) return;

    setWorking(true);
    let cursor = 0;
    const uploaded: Array<GalleryPhoto | null> = Array(
      validEntries.length,
    ).fill(null);
    const worker = async () => {
      while (cursor < validEntries.length) {
        const index = cursor;
        cursor += 1;
        const photo = await uploadEntry(
          validEntries[index],
          gallery.photos.length + index,
          !gallery.coverPhotoId && index === 0,
        );
        if (photo) uploaded[index] = photo;
      }
    };
    await Promise.all([worker(), worker()]);

    const firstUploaded = uploaded.find(
      (photo): photo is GalleryPhoto => photo !== null,
    );
    if (!gallery.coverPhotoId && firstUploaded) {
      try {
        await setGalleryCover(gallery.id, firstUploaded.id);
      } catch (error) {
        setNotice(getAdminErrorMessage(error as Error));
      }
    }
    await onRefresh();
    setWorking(false);
  }

  async function chooseDngPreview(entry: UploadEntry, preview: File) {
    const previewError = validateGalleryPreviewFile(preview);
    if (previewError) {
      updateQueue(entry.id, {state: "error", error: previewError});
      return;
    }
    const patched = {
      ...entry,
      previewFile: preview,
      state: "waiting" as const,
      error: "",
    };
    updateQueue(entry.id, patched);
    await retry(patched);
  }

  async function retry(entry: UploadEntry) {
    if (working || disabled) return;
    setWorking(true);
    const photo = await uploadEntry(
      entry,
      gallery.photos.length,
      !gallery.coverPhotoId,
    );
    if (photo) await onRefresh();
    setWorking(false);
  }

  async function saveOrder(ids: string[]) {
    if (working || disabled) return;
    setWorking(true);
    setNotice("");
    try {
      await reorderGalleryPhotos(gallery.id, ids);
      await onRefresh();
    } catch (error) {
      setNotice(getAdminErrorMessage(error as Error));
    } finally {
      setWorking(false);
    }
  }

  function movePhoto(photoId: string, direction: -1 | 1) {
    const ids = gallery.photos.map((photo) => photo.id);
    const from = ids.indexOf(photoId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    void saveOrder(ids);
  }

  function dropPhoto(targetId: string) {
    if (!draggedPhotoId || draggedPhotoId === targetId) return;
    const ids = gallery.photos.map((photo) => photo.id);
    const from = ids.indexOf(draggedPhotoId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    setDraggedPhotoId(null);
    void saveOrder(ids);
  }

  async function chooseCover(photoId: string) {
    setWorking(true);
    setNotice("");
    try {
      await setGalleryCover(gallery.id, photoId);
      await onRefresh();
    } catch (error) {
      setNotice(getAdminErrorMessage(error as Error));
    } finally {
      setWorking(false);
    }
  }

  async function removePhoto(photo: GalleryPhoto) {
    if (
      disabled ||
      !window.confirm(
        "Vuoi eliminare questo contenuto? L’operazione non può essere annullata.",
      )
    ) {
      return;
    }
    setWorking(true);
    setNotice("");
    try {
      await deleteGalleryPhoto(photo);
      await onRefresh();
    } catch (error) {
      setNotice(getAdminErrorMessage(error as Error));
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="gallery-editor-section gallery-photo-manager">
      <header>
        <div>
          <span>3</span>
          <div>
            <h2>Foto e video</h2>
            <p>
              Trascina o carica più file insieme. Foto, video e DNG possono
              essere riordinati nello stesso racconto; il primo diventa la
              copertina.
            </p>
          </div>
        </div>
        <strong>{gallery.photos.length} / {maxGalleryPhotos}</strong>
      </header>

      {disabled ? (
        <div className="gallery-editor-warning">
          La galleria è {gallery.status === "published" ? "online" : "archiviata"}.
          Riportala in bozza per modificare foto e video.
        </div>
      ) : null}

      <div
        className={`gallery-dropzone ${dropActive ? "is-active" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setDropActive(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDropActive(false);
          void addFiles(event.dataTransfer.files);
        }}
      >
        <Upload aria-hidden="true" size={38} />
        <h3>Trascina o carica foto e video</h3>
        <p>
          Foto fino a 25 MB · DNG e video fino a 50 MB · per un DNG seleziona
          anche il JPG con lo stesso nome
        </p>
        <button
          disabled={disabled || working || gallery.photos.length >= 50}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <ImagePlus aria-hidden="true" size={23} />
          Scegli foto o video
        </button>
        <input
          accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.dng,.mp4,.m4v,.mov,.webm,image/jpeg,image/png,image/webp,image/heic,image/heif,image/dng,image/x-adobe-dng,video/mp4,video/quicktime,video/webm"
          disabled={disabled}
          hidden
          multiple
          onChange={(event) => {
            if (event.target.files) void addFiles(event.target.files);
            event.target.value = "";
          }}
          ref={inputRef}
          type="file"
        />
        <input
          accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
          hidden
          onChange={(event) => {
            const entryId = previewEntryIdRef.current;
            const preview = event.target.files?.[0];
            const entry = queue.find((item) => item.id === entryId);
            if (entry && preview) void chooseDngPreview(entry, preview);
            event.target.value = "";
          }}
          ref={dngPreviewInputRef}
          type="file"
        />
      </div>

      {queue.length ? (
        <div className="gallery-upload-queue" aria-live="polite">
          <h3>Caricamenti</h3>
          {queue.map((entry) => (
            <div className={`is-${entry.state}`} key={entry.id}>
              <span className="gallery-upload-queue__icon">
                {entry.state === "complete" ? (
                  <Check aria-hidden="true" size={20} />
                ) : entry.state === "error" ? (
                  <span aria-hidden="true">!</span>
                ) : isVideoFile(entry.file) ? (
                  <Video aria-hidden="true" size={20} />
                ) : isDngFile(entry.file) ? (
                  <FileImage aria-hidden="true" size={20} />
                ) : (
                  <LoaderCircle
                    aria-hidden="true"
                    className={entry.state === "waiting" ? "" : "spin"}
                    size={20}
                  />
                )}
              </span>
              <div>
                <strong>{entry.file.name}</strong>
                <span>{entry.error || uploadLabels[entry.state]}</span>
                <i>
                  <span style={{width: `${progress[entry.state]}%`}} />
                </i>
              </div>
              {entry.state === "error" && isDngFile(entry.file) && !entry.previewFile ? (
                <button
                  disabled={working}
                  onClick={() => {
                    previewEntryIdRef.current = entry.id;
                    dngPreviewInputRef.current?.click();
                  }}
                  type="button"
                >
                  Scegli JPG
                </button>
              ) : entry.state === "error" ? (
                <button
                  disabled={working || Boolean(validateGalleryFile(entry.file))}
                  onClick={() => void retry(entry)}
                  type="button"
                >
                  Riprova
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {notice ? <div className="gallery-form-error">{notice}</div> : null}

      {gallery.photos.length ? (
        <div className="gallery-photo-list">
          {gallery.photos.map((photo, index) => (
            <article
              className={`gallery-photo-card ${
                photo.id === gallery.coverPhotoId ? "is-cover" : ""
              }`}
              draggable={!disabled && !working}
              key={photo.id}
              onDragOver={(event) => event.preventDefault()}
              onDragStart={() => setDraggedPhotoId(photo.id)}
              onDrop={() => dropPhoto(photo.id)}
            >
              <div className="gallery-photo-card__image">
                <img
                  alt={photo.altText}
                  height={photo.height}
                  src={photo.thumbnailUrl}
                  width={photo.width}
                />
                {photo.mediaType === "video" ? (
                  <span
                    aria-label="Video"
                    className="gallery-photo-card__play"
                  >
                    <Play aria-hidden="true" fill="currentColor" size={24} />
                  </span>
                ) : null}
                <strong className="gallery-photo-card__format">
                  {photo.mediaType === "video"
                    ? "Video"
                    : photo.sourceType === "dng"
                      ? "DNG"
                      : "Foto"}
                </strong>
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="gallery-photo-card__content">
                <div className="gallery-photo-card__top">
                  <span>
                    <GripVertical aria-hidden="true" size={22} />
                    Trascina per riordinare
                  </span>
                  {photo.id === gallery.coverPhotoId ? (
                    <strong>
                      <Star aria-hidden="true" size={18} />
                      Copertina
                    </strong>
                  ) : (
                    <button
                      disabled={disabled || working}
                      onClick={() => void chooseCover(photo.id)}
                      type="button"
                    >
                      <Star aria-hidden="true" size={18} />
                      Usa come copertina
                    </button>
                  )}
                </div>
                <div className="gallery-photo-card__actions">
                  <button
                    disabled={disabled || working || index === 0}
                    onClick={() => movePhoto(photo.id, -1)}
                    type="button"
                  >
                    <ArrowUp aria-hidden="true" size={19} />
                    Sposta prima
                  </button>
                  <button
                    disabled={
                      disabled || working || index === gallery.photos.length - 1
                    }
                    onClick={() => movePhoto(photo.id, 1)}
                    type="button"
                  >
                    <ArrowDown aria-hidden="true" size={19} />
                    Sposta dopo
                  </button>
                  <button
                    className="is-danger"
                    disabled={disabled || working}
                    onClick={() => void removePhoto(photo)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={19} />
                      Elimina contenuto
                  </button>
                </div>
                <GalleryPhotoTextEditor disabled={disabled} photo={photo} />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
