"use client";

import type {
  GalleryContentInput,
  GalleryTranslation,
} from "@/lib/galleries/types";
import {
  GooglePlacePicker,
  type SelectedGooglePlace,
} from "./GooglePlacePicker";

type EditorLocale = "it" | "en";

export function GalleryDetailsForm({
  content,
  locale,
  onChange,
  onChangeEnglish,
  onLocaleChange,
  onPlaceSelect,
}: {
  content: GalleryContentInput;
  locale: EditorLocale;
  onChange: (patch: Partial<GalleryContentInput>) => void;
  onChangeEnglish: (patch: Partial<GalleryTranslation>) => void;
  onLocaleChange: (locale: EditorLocale) => void;
  onPlaceSelect: (place: SelectedGooglePlace) => void;
}) {
  const english = content.translations.en ?? {
    title: "",
    description: "",
    locationName: "",
  };

  return (
    <>
      <section className="gallery-editor-section">
        <header>
          <div>
            <span>1</span>
            <div>
              <h2>Titolo e racconto</h2>
              <p>Prima l’italiano; l’inglese può restare vuoto.</p>
            </div>
          </div>
        </header>
        <div className="gallery-editor-tabs" aria-label="Lingua del contenuto">
          <button
            aria-pressed={locale === "it"}
            onClick={() => onLocaleChange("it")}
            type="button"
          >
            <strong>Italiano</strong>
            <span>Obbligatorio</span>
          </button>
          <button
            aria-pressed={locale === "en"}
            onClick={() => onLocaleChange("en")}
            type="button"
          >
            <strong>Inglese</strong>
            <span>Facoltativo</span>
          </button>
        </div>
        {locale === "it" ? (
          <div className="gallery-editor-fields">
            <label>
              <span>Titolo italiano</span>
              <input
                maxLength={120}
                onChange={(event) => onChange({title: event.target.value})}
                required
                value={content.title}
              />
            </label>
            <label>
              <span>Testo italiano</span>
              <textarea
                onChange={(event) =>
                  onChange({description: event.target.value})
                }
                placeholder="Racconta il momento, la stagione o il lavoro mostrato nelle fotografie."
                rows={6}
                value={content.description}
              />
            </label>
          </div>
        ) : (
          <div className="gallery-editor-fields">
            <label>
              <span>Titolo in inglese</span>
              <input
                maxLength={120}
                onChange={(event) =>
                  onChangeEnglish({title: event.target.value})
                }
                placeholder={content.title}
                value={english.title}
              />
            </label>
            <label>
              <span>Testo in inglese</span>
              <textarea
                onChange={(event) =>
                  onChangeEnglish({description: event.target.value})
                }
                placeholder="Se vuoto, il sito mostrerà il testo italiano."
                rows={6}
                value={english.description}
              />
            </label>
          </div>
        )}
      </section>

      <section className="gallery-editor-section">
        <header>
          <div>
            <span>2</span>
            <div>
              <h2>Posizione geografica</h2>
              <p>
                La località è obbligatoria; indirizzo e coordinate sono utili
                per la mappa.
              </p>
            </div>
          </div>
        </header>
        <GooglePlacePicker onSelect={onPlaceSelect} />
        <div className="gallery-editor-fields gallery-editor-fields--location">
          <label>
            <span>Località italiana</span>
            <input
              onChange={(event) =>
                onChange({locationName: event.target.value})
              }
              placeholder="San Damiano di Todi"
              required
              value={content.locationName}
            />
          </label>
          <label>
            <span>Località in inglese</span>
            <input
              onChange={(event) =>
                onChangeEnglish({locationName: event.target.value})
              }
              placeholder={content.locationName}
              value={english.locationName}
            />
          </label>
          <label className="is-wide">
            <span>Indirizzo</span>
            <input
              onChange={(event) => onChange({address: event.target.value})}
              placeholder="Indirizzo o frazione"
              value={content.address}
            />
          </label>
          <label>
            <span>Latitudine</span>
            <input
              onChange={(event) =>
                onChange({
                  latitude:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                })
              }
              placeholder="42.78"
              step="any"
              type="number"
              value={content.latitude ?? ""}
            />
          </label>
          <label>
            <span>Longitudine</span>
            <input
              onChange={(event) =>
                onChange({
                  longitude:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                })
              }
              placeholder="12.41"
              step="any"
              type="number"
              value={content.longitude ?? ""}
            />
          </label>
        </div>
        <p className="admin-field-help">
          Le coordinate servono soltanto per posizionare con precisione la
          mappa. Puoi lasciarle vuote e aggiungerle in seguito.
        </p>
      </section>
    </>
  );
}
