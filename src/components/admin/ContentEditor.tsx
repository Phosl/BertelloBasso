"use client";

import {useState} from "react";
import {Check, ExternalLink} from "lucide-react";
import type {SiteCopy} from "@/lib/content/types";
import {useAdminData} from "./AdminDataProvider";

export function ContentEditor() {
  const {data, loading, updateSiteCopy} = useAdminData();

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Sito pubblico</p>
          <h1>Contenuti</h1>
          <p>
            Modifica i testi principali senza intervenire nel codice. I campi
            seguono le sezioni della homepage.
          </p>
        </div>
        <a className="admin-secondary-action" href="/" target="_blank">
          Anteprima <ExternalLink size={16} />
        </a>
      </header>
      {loading ? (
        <div className="admin-skeleton admin-skeleton--form" />
      ) : (
        <ContentEditorForm
          initialCopy={data.siteCopy}
          key={`${data.siteCopy.heroTitle}:${data.siteCopy.contactEmail}`}
          onSave={updateSiteCopy}
        />
      )}
    </div>
  );
}

function ContentEditorForm({
  initialCopy,
  onSave,
}: {
  initialCopy: SiteCopy;
  onSave: (copy: SiteCopy) => Promise<boolean>;
}) {
  const [copy, setCopy] = useState<SiteCopy>(initialCopy);

  function field<Key extends keyof SiteCopy>(key: Key, value: SiteCopy[Key]) {
    setCopy((current) => ({...current, [key]: value}));
  }

  return (
    <form
      className="content-editor"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave(copy);
      }}
    >
      <section className="admin-panel">
        <header>
          <div>
            <p className="eyebrow">Homepage · 01</p>
            <h2>Apertura</h2>
          </div>
        </header>
        <label>
          <span>Sopratitolo</span>
          <input
            onChange={(event) => field("heroKicker", event.target.value)}
            value={copy.heroKicker}
          />
        </label>
        <label>
          <span>Titolo principale</span>
          <textarea
            onChange={(event) => field("heroTitle", event.target.value)}
            rows={3}
            value={copy.heroTitle}
          />
          <small>{copy.heroTitle.length} / 90 caratteri consigliati</small>
        </label>
        <label>
          <span>Testo introduttivo</span>
          <textarea
            onChange={(event) => field("heroBody", event.target.value)}
            rows={4}
            value={copy.heroBody}
          />
        </label>
      </section>
      <section className="admin-panel">
        <header>
          <div>
            <p className="eyebrow">Homepage · 02</p>
            <h2>La nostra storia</h2>
          </div>
        </header>
        <label>
          <span>Titolo</span>
          <input
            onChange={(event) => field("storyTitle", event.target.value)}
            value={copy.storyTitle}
          />
        </label>
        <label>
          <span>Testo</span>
          <textarea
            onChange={(event) => field("storyBody", event.target.value)}
            rows={6}
            value={copy.storyBody}
          />
        </label>
      </section>
      <section className="admin-panel">
        <header>
          <div>
            <p className="eyebrow">Informazioni</p>
            <h2>Contatti pubblici</h2>
          </div>
        </header>
        <label>
          <span>Email</span>
          <input
            onChange={(event) => field("contactEmail", event.target.value)}
            type="email"
            value={copy.contactEmail}
          />
        </label>
        <label>
          <span>Telefono</span>
          <input
            onChange={(event) => field("contactPhone", event.target.value)}
            value={copy.contactPhone}
          />
        </label>
      </section>
      <div className="content-editor__actions">
        <p>Le modifiche verranno applicate ai contenuti condivisi.</p>
        <button className="admin-save" type="submit">
          <Check size={17} /> Salva contenuti
        </button>
      </div>
    </form>
  );
}
