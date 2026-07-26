"use client";

/* eslint-disable @next/next/no-img-element -- Admin media library uses expiring signed URLs. */

import {useCallback, useEffect, useMemo, useState} from "react";
import {
  Archive,
  Check,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Save,
  Search,
  Upload,
} from "lucide-react";
import {
  getAdminMedia,
  setMediaArchived,
  updateMediaAsset,
  uploadCmsMedia,
} from "@/lib/cms/admin-service";
import type {MediaAsset} from "@/lib/cms/types";
import {processUploadImage, validateImageFile} from "@/lib/media/image-processing";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {useAdminData} from "./AdminDataProvider";

type UploadItem = {
  name: string;
  state: "waiting" | "processing" | "done" | "error";
};

export function MediaManager() {
  const {configured, reportCmsState} = useAdminData();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [notice, setNotice] = useState("");
  const selected = assets.find((asset) => asset.id === selectedId) ?? null;

  const load = useCallback(async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setAssets(await getAdminMedia());
      setNotice("");
    } catch (error) {
      setNotice(getAdminErrorMessage(error as {code?: string; message?: string}));
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return assets.filter(
      (asset) =>
        asset.status === filter &&
        (!value ||
          `${asset.originalName} ${asset.alt.it} ${asset.alt.en ?? ""}`
            .toLowerCase()
            .includes(value)),
    );
  }, [assets, filter, query]);

  async function upload(files: FileList | null) {
    if (!files?.length || !configured) return;
    const queue = Array.from(files).slice(0, 20);
    const invalid = queue.map(validateImageFile).find(Boolean);
    if (invalid) {
      setNotice(invalid);
      return;
    }
    setUploads(queue.map((file) => ({name: file.name, state: "waiting"})));
    reportCmsState("saving");
    let cursor = 0;
    const created: MediaAsset[] = [];
    const workers = Array.from({length: Math.min(2, queue.length)}, async () => {
      while (cursor < queue.length) {
        const index = cursor++;
        const file = queue[index];
        setUploads((items) =>
          items.map((item, itemIndex) =>
            itemIndex === index ? {...item, state: "processing"} : item,
          ),
        );
        try {
          created.push(await uploadCmsMedia(await processUploadImage(file)));
          setUploads((items) =>
            items.map((item, itemIndex) =>
              itemIndex === index ? {...item, state: "done"} : item,
            ),
          );
        } catch {
          setUploads((items) =>
            items.map((item, itemIndex) =>
              itemIndex === index ? {...item, state: "error"} : item,
            ),
          );
        }
      }
    });
    await Promise.all(workers);
    setAssets((current) => [...created, ...current]);
    const failed = queue.length - created.length;
    if (failed) {
      const message = `${failed} file non sono stati caricati. Selezionali di nuovo per riprovare.`;
      setNotice(message);
      reportCmsState("error", message);
    } else {
      reportCmsState("saved");
    }
  }

  async function save(asset: MediaAsset) {
    reportCmsState("saving");
    try {
      await updateMediaAsset(asset);
      setAssets((items) => items.map((item) => (item.id === asset.id ? asset : item)));
      reportCmsState("saved");
    } catch (error) {
      const message = getAdminErrorMessage(error as {code?: string; message?: string});
      setNotice(message);
      reportCmsState("error", message);
    }
  }

  async function toggleArchive(asset: MediaAsset) {
    const archived = asset.status !== "archived";
    if (archived && !window.confirm("Archiviare questa immagine? I contenuti già pubblicati continueranno a mostrarla.")) return;
    reportCmsState("saving");
    try {
      await setMediaArchived(asset.id, archived);
      setAssets((items) =>
        items.map((item) =>
          item.id === asset.id ? {...item, status: archived ? "archived" : "active"} : item,
        ),
      );
      setSelectedId(null);
      reportCmsState("saved");
    } catch (error) {
      reportCmsState("error", getAdminErrorMessage(error as {code?: string; message?: string}));
    }
  }

  return (
    <div className="admin-page media-admin">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Archivio condiviso</p>
          <h1>Immagini</h1>
          <p>Carica una volta e riusa le fotografie in prodotti e pagine.</p>
        </div>
        {configured ? (
          <label className="admin-primary-action">
            <Upload aria-hidden="true" size={20} />
            Carica immagini
            <input accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/*" hidden multiple onChange={(event) => void upload(event.target.files)} type="file" />
          </label>
        ) : null}
      </header>
      {!configured ? (
        <div className="gallery-admin-blocked">
          <ImagePlus aria-hidden="true" size={36} />
          <h2>Collega Supabase per usare la libreria.</h2>
          <p>I file non vengono salvati nella modalità demo locale.</p>
        </div>
      ) : (
        <>
          <div className="cms-admin-filters">
            <button aria-pressed={filter === "active"} onClick={() => setFilter("active")} type="button">Disponibili</button>
            <button aria-pressed={filter === "archived"} onClick={() => setFilter("archived")} type="button">Archiviate</button>
          </div>
          <div className="admin-toolbar">
            <label><Search size={20} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Cerca immagini…" value={query} /></label>
            <span>{visible.length} immagini</span>
          </div>
          {notice ? <div className="gallery-admin-notice">{notice}</div> : null}
          {uploads.length ? (
            <div className="media-upload-progress">
              {uploads.map((item) => (
                <div className={`is-${item.state}`} key={item.name}>
                  {item.state === "processing" ? <LoaderCircle className="spin" size={18} /> : item.state === "done" ? <Check size={18} /> : null}
                  <strong>{item.name}</strong>
                  <span>{item.state === "waiting" ? "In attesa" : item.state === "processing" ? "Elaborazione e caricamento…" : item.state === "done" ? "Completato" : "Errore — riprova"}</span>
                </div>
              ))}
            </div>
          ) : null}
          {loading ? (
            <div className="admin-skeleton admin-skeleton--table" />
          ) : (
            <div className="media-library-grid media-library-grid--page">
              {visible.map((asset) => (
                <button key={asset.id} onClick={() => setSelectedId(asset.id)} type="button">
                  <img alt={asset.alt.it || asset.originalName} height={asset.height} src={asset.thumbnailUrl || asset.imageUrl} width={asset.width} />
                  <span>{asset.alt.it || asset.originalName}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {selected ? (
        <div aria-modal="true" className="cms-modal" role="dialog">
          <div className="cms-modal__panel media-edit-panel">
            <header><div><p className="eyebrow">Dettagli immagine</p><h2>{selected.originalName}</h2></div><button onClick={() => setSelectedId(null)} type="button">Chiudi</button></header>
            <img alt={selected.alt.it || selected.originalName} height={selected.height} src={selected.imageUrl} width={selected.width} />
            <div className="cms-form-grid">
              <label><span>Descrizione accessibile in italiano</span><small className="admin-field-help">Descrivi brevemente ciò che si vede nell’immagine.</small><input value={selected.alt.it} onChange={(event) => setAssets((items) => items.map((item) => item.id === selected.id ? {...item, alt: {...item.alt, it: event.target.value}} : item))} /></label>
              <label><span>Descrizione accessibile in inglese</span><small className="admin-field-help">Se vuota, verrà usata la descrizione italiana.</small><input value={selected.alt.en ?? ""} onChange={(event) => setAssets((items) => items.map((item) => item.id === selected.id ? {...item, alt: {...item.alt, en: event.target.value}} : item))} /></label>
              <label><span>Didascalia italiana</span><textarea rows={3} value={selected.caption.it} onChange={(event) => setAssets((items) => items.map((item) => item.id === selected.id ? {...item, caption: {...item.caption, it: event.target.value}} : item))} /></label>
              <label><span>Didascalia in inglese</span><textarea rows={3} value={selected.caption.en ?? ""} onChange={(event) => setAssets((items) => items.map((item) => item.id === selected.id ? {...item, caption: {...item.caption, en: event.target.value}} : item))} /></label>
            </div>
            <div className="cms-editor__publish-actions">
              <button className="admin-primary-action" onClick={() => void save(selected)} type="button"><Save size={19} /> Salva testi</button>
              <button className="admin-secondary-action" onClick={() => void toggleArchive(selected)} type="button">{selected.status === "archived" ? <RotateCcw size={19} /> : <Archive size={19} />}{selected.status === "archived" ? "Ripristina" : "Archivia"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
