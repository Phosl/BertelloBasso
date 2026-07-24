"use client";

import {useState} from "react";
import {Check, ExternalLink} from "lucide-react";
import type {SiteCopy} from "@/lib/content/types";
import {useAdminData} from "./AdminDataProvider";
import type {Locale} from "@/lib/i18n/config";

export function ContentEditor() {
  const {data, loading, updateSiteCopy} = useAdminData();
  const [locale, setLocale] = useState<Locale>("it");

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
      <div aria-label="Lingua contenuti" className="admin-language-tabs">
        <button
          aria-pressed={locale === "it"}
          onClick={() => setLocale("it")}
          type="button"
        >
          Italiano <span>IT</span>
        </button>
        <button
          aria-pressed={locale === "en"}
          onClick={() => setLocale("en")}
          type="button"
        >
          English <span>EN</span>
        </button>
      </div>
      {loading ? (
        <div className="admin-skeleton admin-skeleton--form" />
      ) : (
        <ContentEditorForm
          initialCopy={data.siteCopy[locale]}
          key={`${locale}:${data.siteCopy[locale].heroTitle}:${data.siteCopy.it.contactEmail}`}
          locale={locale}
          onSave={(copy) => updateSiteCopy(locale, copy)}
        />
      )}
    </div>
  );
}

function ContentEditorForm({
  initialCopy,
  locale,
  onSave,
}: {
  initialCopy: SiteCopy;
  locale: Locale;
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
            <p className="eyebrow">Homepage · 01 · {locale.toUpperCase()}</p>
            <h2>{locale === "it" ? "Apertura" : "Opening"}</h2>
          </div>
        </header>
        <label>
          <span>{locale === "it" ? "Sopratitolo" : "Kicker"}</span>
          <input
            onChange={(event) => field("heroKicker", event.target.value)}
            value={copy.heroKicker}
          />
        </label>
        <label>
          <span>{locale === "it" ? "Titolo principale" : "Main title"}</span>
          <textarea
            onChange={(event) => field("heroTitle", event.target.value)}
            rows={3}
            value={copy.heroTitle}
          />
          <small>
            {copy.heroTitle.length} / 90{" "}
            {locale === "it" ? "caratteri consigliati" : "recommended characters"}
          </small>
        </label>
        <label>
          <span>{locale === "it" ? "Testo introduttivo" : "Introduction"}</span>
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
            <p className="eyebrow">Homepage · 02 · {locale.toUpperCase()}</p>
            <h2>{locale === "it" ? "La nostra storia" : "Our story"}</h2>
          </div>
        </header>
        <label>
          <span>{locale === "it" ? "Titolo" : "Title"}</span>
          <input
            onChange={(event) => field("storyTitle", event.target.value)}
            value={copy.storyTitle}
          />
        </label>
        <label>
          <span>{locale === "it" ? "Testo" : "Copy"}</span>
          <textarea
            onChange={(event) => field("storyBody", event.target.value)}
            rows={6}
            value={copy.storyBody}
          />
        </label>
      </section>
      {locale === "it" ? <section className="admin-panel">
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
      </section> : (
        <section className="admin-panel content-editor__shared-note">
          <header>
            <div>
              <p className="eyebrow">Informazioni condivise</p>
              <h2>Contatti pubblici</h2>
            </div>
          </header>
          <p>
            Email e telefono sono condivisi tra italiano e inglese. Modificali
            dalla scheda Italiano.
          </p>
        </section>
      )}
      <div className="content-editor__actions">
        <p>
          {locale === "it"
            ? "Le modifiche verranno applicate ai contenuti italiani."
            : "Le modifiche verranno applicate ai contenuti inglesi."}
        </p>
        <button className="admin-save" type="submit">
          <Check size={17} /> Salva {locale === "it" ? "italiano" : "inglese"}
        </button>
      </div>
    </form>
  );
}
