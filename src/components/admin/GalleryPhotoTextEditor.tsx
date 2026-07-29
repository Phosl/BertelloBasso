"use client";

import {useState} from "react";
import {LoaderCircle, Save} from "lucide-react";
import {updateGalleryPhotoText} from "@/lib/galleries/admin-service";
import type {GalleryPhoto} from "@/lib/galleries/types";
import {getAdminErrorMessage} from "@/lib/supabase/errors";

export function GalleryPhotoTextEditor({
  disabled,
  photo,
}: {
  disabled: boolean;
  photo: GalleryPhoto;
}) {
  const english = photo.translations.en;
  const [altText, setAltText] = useState(photo.altText);
  const [caption, setCaption] = useState(photo.caption);
  const [englishAltText, setEnglishAltText] = useState(
    english?.altText ?? "",
  );
  const [englishCaption, setEnglishCaption] = useState(
    english?.caption ?? "",
  );
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [notice, setNotice] = useState("");

  async function save() {
    setState("saving");
    setNotice("");
    try {
      await updateGalleryPhotoText(photo.id, {
        altText,
        caption,
        englishAltText,
        englishCaption,
      });
      setState("saved");
    } catch (error) {
      setNotice(getAdminErrorMessage(error as Error));
      setState("error");
    }
  }

  return (
    <details className="gallery-photo-text">
      <summary>Didascalia e descrizione accessibile</summary>
      <div>
        <label>
          <span>Descrizione accessibile in italiano</span>
          <small className="admin-field-help">
            Descrivi brevemente ciò che si vede nella foto o nel video.
          </small>
          <input
            disabled={disabled}
            onChange={(event) => setAltText(event.target.value)}
            value={altText}
          />
        </label>
        <label>
          <span>Didascalia italiana</span>
          <textarea
            disabled={disabled}
            onChange={(event) => setCaption(event.target.value)}
            rows={2}
            value={caption}
          />
        </label>
        <label>
          <span>Descrizione accessibile in inglese</span>
          <small className="admin-field-help">
            Se vuota, verrà usata la descrizione italiana.
          </small>
          <input
            disabled={disabled}
            onChange={(event) => setEnglishAltText(event.target.value)}
            value={englishAltText}
          />
        </label>
        <label>
          <span>Didascalia inglese</span>
          <textarea
            disabled={disabled}
            onChange={(event) => setEnglishCaption(event.target.value)}
            rows={2}
            value={englishCaption}
          />
        </label>
        {notice ? <p className="gallery-form-error">{notice}</p> : null}
        <button
          disabled={disabled || state === "saving"}
          onClick={() => void save()}
          type="button"
        >
          {state === "saving" ? (
            <LoaderCircle aria-hidden="true" className="spin" size={20} />
          ) : (
            <Save aria-hidden="true" size={20} />
          )}
          {state === "saving"
            ? "Salvataggio…"
            : state === "saved"
              ? "Didascalia salvata"
              : "Salva didascalia"}
        </button>
      </div>
    </details>
  );
}
