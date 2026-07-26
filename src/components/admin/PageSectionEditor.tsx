"use client";

import {Plus, Trash2} from "lucide-react";
import type {Gallery} from "@/lib/galleries/types";
import type {
  LocalizedText,
  MediaAsset,
  PageSection,
  ProductDraft,
} from "@/lib/cms/types";
import {MediaPicker} from "./MediaPicker";
import {RichTextEditor} from "./RichTextEditor";

type TextField =
  | "kicker"
  | "title"
  | "body"
  | "caption"
  | "actionLabel"
  | "quote"
  | "author"
  | "label";

function hasLocalizedField(
  section: PageSection,
  field: TextField,
): section is PageSection & Record<TextField, LocalizedText> {
  return field in section;
}

export function PageSectionEditor({
  section,
  language,
  media,
  products,
  galleries,
  onChange,
}: {
  section: PageSection;
  language: "it" | "en";
  media: MediaAsset[];
  products: ProductDraft[];
  galleries: Gallery[];
  onChange: (section: PageSection) => void;
}) {
  function localizedField(
    field: TextField,
    label: string,
    multiline = false,
  ) {
    if (!hasLocalizedField(section, field)) return null;
    const value = section[field];
    const current = language === "it" ? value.it : value.en ?? "";
    const update = (next: string) =>
      onChange({
        ...section,
        [field]:
          language === "it"
            ? {...value, it: next}
            : {...value, en: next},
      } as PageSection);
    return (
      <label>
        <span>{label}</span>
        {multiline ? (
          <textarea
            onChange={(event) => update(event.target.value)}
            rows={4}
            value={current}
          />
        ) : (
          <input
            onChange={(event) => update(event.target.value)}
            value={current}
          />
        )}
      </label>
    );
  }

  function mediaField(mediaId: string | null, label: string) {
    const selected = mediaId
      ? media.filter((asset) => asset.id === mediaId)
      : [];
    return (
      <MediaPicker
        label={label}
        max={1}
        onChange={(assets) =>
          onChange({...section, mediaId: assets[0]?.id ?? null} as PageSection)
        }
        selected={selected}
      />
    );
  }

  if (section.type === "hero") {
    return (
      <>
        {localizedField("kicker", "Soprattitolo")}
        {localizedField("title", "Titolo")}
        {localizedField("body", "Testo", true)}
        {localizedField("actionLabel", "Testo del pulsante")}
        <label>
          <span>Collegamento del pulsante</span>
          <input
            onChange={(event) =>
              onChange({...section, actionHref: event.target.value})
            }
            placeholder="/contatti oppure https://…"
            value={section.actionHref}
          />
        </label>
        {mediaField(section.mediaId, "Scegli immagine della testata")}
        <label className="admin-check">
          <input
            checked={section.watercolor}
            onChange={(event) =>
              onChange({...section, watercolor: event.target.checked})
            }
            type="checkbox"
          />
          <span>Usa il reveal ad acquerello</span>
        </label>
      </>
    );
  }

  if (section.type === "richText") {
    return (
      <>
        {localizedField("title", "Titolo")}
        <label>
          <span>Testo formattato</span>
          <RichTextEditor
            onChange={(document) =>
              onChange({
                ...section,
                content: {...section.content, [language]: document},
              })
            }
            value={section.content[language]}
          />
        </label>
      </>
    );
  }

  if (section.type === "image") {
    return (
      <>
        {mediaField(section.mediaId, "Scegli immagine")}
        {localizedField("caption", "Didascalia")}
        <label className="admin-check">
          <input
            checked={section.watercolor}
            onChange={(event) =>
              onChange({...section, watercolor: event.target.checked})
            }
            type="checkbox"
          />
          <span>Usa il reveal ad acquerello</span>
        </label>
      </>
    );
  }

  if (section.type === "imageText") {
    return (
      <>
        {localizedField("kicker", "Soprattitolo")}
        {localizedField("title", "Titolo")}
        {localizedField("body", "Testo", true)}
        {localizedField("actionLabel", "Testo del collegamento")}
        <label>
          <span>Indirizzo del collegamento</span>
          <input
            onChange={(event) =>
              onChange({...section, actionHref: event.target.value})
            }
            value={section.actionHref}
          />
        </label>
        {mediaField(section.mediaId, "Scegli immagine")}
        <label>
          <span>Posizione immagine</span>
          <select
            onChange={(event) =>
              onChange({
                ...section,
                imageSide: event.target.value as "left" | "right",
              })
            }
            value={section.imageSide}
          >
            <option value="left">A sinistra</option>
            <option value="right">A destra</option>
          </select>
        </label>
      </>
    );
  }

  if (section.type === "cards") {
    return (
      <>
        {localizedField("kicker", "Soprattitolo")}
        {localizedField("title", "Titolo")}
        <div className="cms-repeater">
          {section.items.map((item, index) => (
            <fieldset key={item.id}>
              <legend>Scheda {index + 1}</legend>
              <label>
                <span>Titolo</span>
                <input
                  onChange={(event) =>
                    onChange({
                      ...section,
                      items: section.items.map((value) =>
                        value.id === item.id
                          ? {
                              ...value,
                              title:
                                language === "it"
                                  ? {...value.title, it: event.target.value}
                                  : {...value.title, en: event.target.value},
                            }
                          : value,
                      ),
                    })
                  }
                  value={language === "it" ? item.title.it : item.title.en ?? ""}
                />
              </label>
              <label>
                <span>Testo</span>
                <textarea
                  onChange={(event) =>
                    onChange({
                      ...section,
                      items: section.items.map((value) =>
                        value.id === item.id
                          ? {
                              ...value,
                              body:
                                language === "it"
                                  ? {...value.body, it: event.target.value}
                                  : {...value.body, en: event.target.value},
                            }
                          : value,
                      ),
                    })
                  }
                  rows={3}
                  value={language === "it" ? item.body.it : item.body.en ?? ""}
                />
              </label>
              <button
                disabled={section.items.length <= 2}
                onClick={() =>
                  onChange({
                    ...section,
                    items: section.items.filter((value) => value.id !== item.id),
                  })
                }
                type="button"
              >
                <Trash2 aria-hidden="true" size={17} />
                Elimina scheda
              </button>
            </fieldset>
          ))}
          <button
            disabled={section.items.length >= 6}
            onClick={() =>
              onChange({
                ...section,
                items: [
                  ...section.items,
                  {
                    id: crypto.randomUUID(),
                    title: {it: "Nuova scheda", en: ""},
                    body: {it: "", en: ""},
                  },
                ],
              })
            }
            type="button"
          >
            <Plus aria-hidden="true" size={18} />
            Aggiungi scheda
          </button>
        </div>
      </>
    );
  }

  if (section.type === "quote") {
    return (
      <>
        {localizedField("quote", "Citazione", true)}
        {localizedField("author", "Autore")}
      </>
    );
  }

  if (section.type === "productGrid") {
    return (
      <>
        {localizedField("title", "Titolo")}
        <div className="cms-form-grid">
          <label>
            <span>Quali prodotti</span>
            <select
              onChange={(event) =>
                onChange({
                  ...section,
                  mode: event.target.value as typeof section.mode,
                })
              }
              value={section.mode}
            >
              <option value="featured">In evidenza</option>
              <option value="all">Tutti</option>
              <option value="selected">Scelti manualmente</option>
            </select>
          </label>
          <label>
            <span>Numero massimo</span>
            <input
              max="99"
              min="1"
              onChange={(event) =>
                onChange({...section, limit: Number(event.target.value)})
              }
              type="number"
              value={section.limit}
            />
          </label>
        </div>
        {section.mode === "selected" ? (
          <fieldset className="cms-choice-grid">
            <legend>Scegli prodotti</legend>
            {products.map((product) => (
              <label className="admin-check" key={product.id}>
                <input
                  checked={section.productIds.includes(product.id)}
                  onChange={(event) =>
                    onChange({
                      ...section,
                      productIds: event.target.checked
                        ? [...section.productIds, product.id]
                        : section.productIds.filter((id) => id !== product.id),
                    })
                  }
                  type="checkbox"
                />
                <span>{product.content.name}</span>
              </label>
            ))}
          </fieldset>
        ) : null}
      </>
    );
  }

  if (section.type === "galleryTeaser") {
    return (
      <>
        {localizedField("kicker", "Soprattitolo")}
        {localizedField("title", "Titolo")}
        <label>
          <span>Galleria specifica</span>
          <select
            onChange={(event) =>
              onChange({...section, galleryId: event.target.value || null})
            }
            value={section.galleryId ?? ""}
          >
            <option value="">Le più recenti</option>
            {galleries.map((gallery) => (
              <option key={gallery.id} value={gallery.id}>
                {gallery.title}
              </option>
            ))}
          </select>
        </label>
      </>
    );
  }

  if (section.type === "cta") {
    return (
      <>
        {localizedField("kicker", "Soprattitolo")}
        {localizedField("title", "Titolo")}
        {localizedField("body", "Testo", true)}
        {localizedField("label", "Testo del pulsante")}
        <label>
          <span>Collegamento</span>
          <input
            onChange={(event) => onChange({...section, href: event.target.value})}
            value={section.href}
          />
        </label>
      </>
    );
  }

  if (section.type === "location") {
    return (
      <>
        {localizedField("kicker", "Soprattitolo")}
        {localizedField("title", "Titolo")}
        {localizedField("body", "Testo", true)}
        <label>
          <span>Indirizzo</span>
          <input
            onChange={(event) =>
              onChange({...section, address: event.target.value})
            }
            value={section.address}
          />
        </label>
        <div className="cms-form-grid">
          <label>
            <span>Latitudine</span>
            <input
              onChange={(event) =>
                onChange({
                  ...section,
                  latitude: event.target.value ? Number(event.target.value) : null,
                })
              }
              step="any"
              type="number"
              value={section.latitude ?? ""}
            />
          </label>
          <label>
            <span>Longitudine</span>
            <input
              onChange={(event) =>
                onChange({
                  ...section,
                  longitude: event.target.value ? Number(event.target.value) : null,
                })
              }
              step="any"
              type="number"
              value={section.longitude ?? ""}
            />
          </label>
        </div>
        <p className="admin-field-help">
          Le coordinate servono per posizionare con precisione la mappa. Puoi
          lasciarle vuote e aggiungerle in seguito.
        </p>
        <label className="admin-check">
          <input
            checked={section.showMap}
            onChange={(event) =>
              onChange({...section, showMap: event.target.checked})
            }
            type="checkbox"
          />
          <span>Mostra la mappa quando disponibile</span>
        </label>
      </>
    );
  }

  if (section.type === "contactForm") {
    return localizedField("title", "Titolo sopra il modulo");
  }

  return (
    <p className="cms-help-text">
      Questo blocco mostra automaticamente tutte le gallerie pubblicate.
    </p>
  );
}
