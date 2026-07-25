"use client";

/* eslint-disable @next/next/no-img-element -- Admin previews use expiring signed URLs. */

import {useCallback, useEffect, useMemo, useState} from "react";
import {Check, ImagePlus, LoaderCircle, Search, Upload, X} from "lucide-react";
import {
  getAdminMedia,
  uploadCmsMedia,
} from "@/lib/cms/admin-service";
import type {MediaAsset} from "@/lib/cms/types";
import {
  processUploadImage,
  validateImageFile,
} from "@/lib/media/image-processing";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {useAdminData} from "./AdminDataProvider";

export function MediaPicker({
  selected,
  onChange,
  max = 1,
  label = "Scegli immagini",
}: {
  selected: MediaAsset[];
  onChange: (assets: MediaAsset[]) => void | Promise<void>;
  max?: number;
  label?: string;
}) {
  const {configured, reportCmsState} = useAdminData();
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    try {
      setAssets((await getAdminMedia()).filter((asset) => asset.status === "active"));
      setNotice("");
    } catch (error) {
      setNotice(getAdminErrorMessage(error as {code?: string; message?: string}));
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    if (open) queueMicrotask(() => void load());
  }, [load, open]);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value
      ? assets.filter((asset) =>
          `${asset.originalName} ${asset.alt.it} ${asset.alt.en ?? ""}`
            .toLowerCase()
            .includes(value),
        )
      : assets;
  }, [assets, query]);

  async function toggle(asset: MediaAsset) {
    const exists = selected.some((item) => item.id === asset.id);
    let next = exists
      ? selected.filter((item) => item.id !== asset.id)
      : [...selected, asset];
    if (max === 1 && !exists) next = [asset];
    if (next.length > max) {
      setNotice(`Puoi scegliere al massimo ${max} immagini.`);
      return;
    }
    await onChange(next);
    if (max === 1 && !exists) setOpen(false);
  }

  async function upload(files: FileList | null) {
    if (!files?.length || !configured) return;
    const queue = Array.from(files).slice(0, 20);
    const validation = queue.map(validateImageFile).find(Boolean);
    if (validation) {
      setNotice(validation);
      return;
    }
    setUploading(true);
    reportCmsState("saving");
    const uploaded: MediaAsset[] = [];
    const failures: string[] = [];
    let cursor = 0;
    const workers = Array.from({length: Math.min(2, queue.length)}, async () => {
      while (cursor < queue.length) {
        const file = queue[cursor++];
        try {
          const processed = await processUploadImage(file);
          uploaded.push(await uploadCmsMedia(processed));
        } catch {
          failures.push(file.name);
        }
      }
    });
    await Promise.all(workers);
    setAssets((current) => [...uploaded, ...current]);
    setUploading(false);
    if (uploaded.length) {
      const room = Math.max(0, max - selected.length);
      await onChange([...selected, ...uploaded.slice(0, room)]);
      reportCmsState("saved");
    }
    if (failures.length) {
      const message = `Non sono state caricate: ${failures.join(", ")}. Riprova.`;
      setNotice(message);
      reportCmsState("error", message);
    }
  }

  return (
    <div className="media-picker">
      <button className="admin-secondary-action" onClick={() => setOpen(true)} type="button">
        <ImagePlus aria-hidden="true" size={20} />
        {label}
      </button>
      {selected.length ? (
        <div className="media-picker__selected">
          {selected.map((asset, index) => (
            <div key={asset.id}>
              <img
                alt={asset.alt.it || asset.originalName}
                height={asset.height}
                src={asset.thumbnailUrl || asset.imageUrl}
                width={asset.width}
              />
              <span>{index === 0 ? "Copertina" : `Foto ${index + 1}`}</span>
              <button
                aria-label={`Rimuovi ${asset.originalName}`}
                onClick={() => void onChange(selected.filter((item) => item.id !== asset.id))}
                type="button"
              >
                <X aria-hidden="true" size={16} />
                Rimuovi
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {open ? (
        <div aria-modal="true" className="cms-modal" role="dialog">
          <div className="cms-modal__panel">
            <header>
              <div>
                <p className="eyebrow">Libreria immagini</p>
                <h2>Scegli o carica</h2>
              </div>
              <button onClick={() => setOpen(false)} type="button">
                <X aria-hidden="true" size={20} />
                Chiudi
              </button>
            </header>
            {!configured ? (
              <div className="gallery-admin-blocked">
                <h3>Collega Supabase per caricare immagini.</h3>
                <p>I testi della demo funzionano, ma i file non possono restare nel browser.</p>
              </div>
            ) : (
              <>
                <div className="media-picker__toolbar">
                  <label>
                    <Search aria-hidden="true" size={19} />
                    <input
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Cerca immagini…"
                      value={query}
                    />
                  </label>
                  <label className="admin-primary-action">
                    {uploading ? (
                      <LoaderCircle className="spin" size={20} />
                    ) : (
                      <Upload aria-hidden="true" size={20} />
                    )}
                    {uploading ? "Caricamento…" : "Carica immagini"}
                    <input
                      accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/*"
                      disabled={uploading}
                      hidden
                      multiple={max > 1}
                      onChange={(event) => void upload(event.target.files)}
                      type="file"
                    />
                  </label>
                </div>
                {notice ? <div className="gallery-admin-notice">{notice}</div> : null}
                {loading ? (
                  <div className="admin-skeleton admin-skeleton--table" />
                ) : (
                  <div className="media-library-grid">
                    {visible.map((asset) => {
                      const active = selected.some((item) => item.id === asset.id);
                      return (
                        <button
                          aria-pressed={active}
                          key={asset.id}
                          onClick={() => void toggle(asset)}
                          type="button"
                        >
                          <img
                            alt={asset.alt.it || asset.originalName}
                            height={asset.height}
                            src={asset.thumbnailUrl || asset.imageUrl}
                            width={asset.width}
                          />
                          <span>{asset.alt.it || asset.originalName}</span>
                          {active ? <Check aria-hidden="true" size={22} /> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
