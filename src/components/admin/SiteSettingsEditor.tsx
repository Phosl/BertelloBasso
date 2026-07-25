"use client";

import {useCallback, useEffect, useState} from "react";
import {ArrowDown, ArrowUp, Eye, Save} from "lucide-react";
import {
  getAdminPages,
  getAdminSettings,
  publishAdminSettings,
  saveAdminSettings,
} from "@/lib/cms/admin-service";
import {localizeText} from "@/lib/cms/localize";
import type {
  CmsPage,
  CmsSiteSettings,
  CmsSiteSettingsContent,
  NavigationEntry,
} from "@/lib/cms/types";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {useAdminData} from "./AdminDataProvider";

function ensureNavigation(
  settings: CmsSiteSettings,
  pages: CmsPage[],
): CmsSiteSettings {
  const existing = new Map(
    settings.draft.navigation.map((entry) => [entry.pageId, entry]),
  );
  const navigation = pages
    .filter((page) => page.pageKey !== "home" && page.status !== "archived")
    .map((page, index) => {
      const value = existing.get(page.id);
      return (
        value ?? {
          pageId: page.id,
          label: page.draft.title,
          showHeader: false,
          showFooter: false,
          sortOrder: index + 1,
        }
      );
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return {...settings, draft: {...settings.draft, navigation}};
}

export function SiteSettingsEditor() {
  const {reportCmsState} = useAdminData();
  const [settings, setSettings] = useState<CmsSiteSettings | null>(null);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [language, setLanguage] = useState<"it" | "en">("it");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsResult, pageResult] = await Promise.all([
        getAdminSettings(),
        getAdminPages(),
      ]);
      setPages(pageResult);
      setSettings(ensureNavigation(settingsResult, pageResult));
      setNotice("");
    } catch (error) {
      setNotice(getAdminErrorMessage(error as {code?: string; message?: string}));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  function update(mutator: (content: CmsSiteSettingsContent) => CmsSiteSettingsContent) {
    setSettings((current) =>
      current ? {...current, draft: mutator(current.draft)} : current,
    );
  }

  async function save() {
    if (!settings) return false;
    reportCmsState("saving");
    try {
      await saveAdminSettings(settings.draft);
      reportCmsState("saved");
      return true;
    } catch (error) {
      const message = getAdminErrorMessage(error as {code?: string; message?: string});
      setNotice(message);
      reportCmsState("error", message);
      return false;
    }
  }

  async function publish() {
    if (!settings || !(await save())) return;
    reportCmsState("saving");
    try {
      await publishAdminSettings();
      reportCmsState("saved");
      await load();
    } catch (error) {
      const message = getAdminErrorMessage(error as {code?: string; message?: string});
      setNotice(message);
      reportCmsState("error", message);
    }
  }

  function updateNavigation(
    pageId: string,
    patch: Partial<NavigationEntry>,
  ) {
    update((content) => ({
      ...content,
      navigation: content.navigation.map((entry) =>
        entry.pageId === pageId ? {...entry, ...patch} : entry,
      ),
    }));
  }

  function moveNavigation(index: number, direction: -1 | 1) {
    if (!settings) return;
    const target = index + direction;
    if (target < 0 || target >= settings.draft.navigation.length) return;
    const navigation = [...settings.draft.navigation];
    [navigation[index], navigation[target]] = [navigation[target], navigation[index]];
    update((content) => ({
      ...content,
      navigation: navigation.map((entry, order) => ({...entry, sortOrder: order + 1})),
    }));
  }

  if (loading || !settings) return <div className="admin-skeleton admin-skeleton--form" />;

  const localizedValue = (
    value: {it: string; en?: string},
    next: string,
  ) => (language === "it" ? {...value, it: next} : {...value, en: next});

  return (
    <div className="admin-page cms-editor settings-editor">
      <header className="cms-editor__header">
        <div>
          <p className="eyebrow">Configurazione del sito</p>
          <h1>Impostazioni</h1>
          <p>Contatti, footer, motori di ricerca e ordine del menu.</p>
        </div>
        <div className="cms-editor__publish-actions">
          <button className="admin-secondary-action" onClick={() => void save()} type="button"><Save size={19} /> Salva bozza</button>
          <button className="admin-primary-action" onClick={() => void publish()} type="button"><Eye size={19} /> Pubblica impostazioni</button>
        </div>
      </header>
      {notice ? <div className="gallery-admin-notice">{notice}</div> : null}
      <div className="admin-language-tabs">
        <button aria-pressed={language === "it"} onClick={() => setLanguage("it")} type="button">Italiano</button>
        <button aria-pressed={language === "en"} onClick={() => setLanguage("en")} type="button">English</button>
      </div>

      <div className="settings-editor__grid">
        <section className="cms-editor-section">
          <header><span>1</span><div><h2>Contatti dell’azienda</h2><p>Usati nel footer e nelle pagine.</p></div></header>
          <label><span>Email</span><input type="email" value={settings.draft.email} onChange={(event) => update((content) => ({...content, email: event.target.value}))} /></label>
          <label><span>Telefono</span><input value={settings.draft.phone} onChange={(event) => update((content) => ({...content, phone: event.target.value}))} /></label>
          <label><span>Indirizzo</span><input value={settings.draft.address} onChange={(event) => update((content) => ({...content, address: event.target.value}))} /></label>
          <div className="cms-form-grid">
            <label><span>Latitudine</span><input step="any" type="number" value={settings.draft.latitude ?? ""} onChange={(event) => update((content) => ({...content, latitude: event.target.value ? Number(event.target.value) : null}))} /></label>
            <label><span>Longitudine</span><input step="any" type="number" value={settings.draft.longitude ?? ""} onChange={(event) => update((content) => ({...content, longitude: event.target.value ? Number(event.target.value) : null}))} /></label>
          </div>
          <label><span>Profilo Instagram</span><input placeholder="https://instagram.com/…" value={settings.draft.instagramUrl} onChange={(event) => update((content) => ({...content, instagramUrl: event.target.value}))} /></label>
        </section>

        <section className="cms-editor-section">
          <header><span>2</span><div><h2>Footer</h2><p>Testi in fondo a tutte le pagine.</p></div></header>
          <label><span>Soprattitolo</span><input value={language === "it" ? settings.draft.footerKicker.it : settings.draft.footerKicker.en ?? ""} onChange={(event) => update((content) => ({...content, footerKicker: localizedValue(content.footerKicker, event.target.value)}))} /></label>
          <label><span>Titolo</span><textarea rows={3} value={language === "it" ? settings.draft.footerTitle.it : settings.draft.footerTitle.en ?? ""} onChange={(event) => update((content) => ({...content, footerTitle: localizedValue(content.footerTitle, event.target.value)}))} /></label>
          <label><span>Firma finale</span><input value={language === "it" ? settings.draft.footerSignature.it : settings.draft.footerSignature.en ?? ""} onChange={(event) => update((content) => ({...content, footerSignature: localizedValue(content.footerSignature, event.target.value)}))} /></label>
        </section>

        <section className="cms-editor-section">
          <header><span>3</span><div><h2>SEO predefinito</h2><p>Usato quando una pagina non ha testi specifici.</p></div></header>
          <label><span>Titolo</span><input value={language === "it" ? settings.draft.defaultSeo.title.it : settings.draft.defaultSeo.title.en ?? ""} onChange={(event) => update((content) => ({...content, defaultSeo: {...content.defaultSeo, title: localizedValue(content.defaultSeo.title, event.target.value)}}))} /></label>
          <label><span>Descrizione</span><textarea rows={4} value={language === "it" ? settings.draft.defaultSeo.description.it : settings.draft.defaultSeo.description.en ?? ""} onChange={(event) => update((content) => ({...content, defaultSeo: {...content.defaultSeo, description: localizedValue(content.defaultSeo.description, event.target.value)}}))} /></label>
        </section>
      </div>

      <section className="cms-editor-section settings-navigation">
        <header><span>4</span><div><h2>Menu e footer</h2><p>Scegli dove mostrare ogni pagina e in quale ordine.</p></div></header>
        <div>
          {settings.draft.navigation.map((entry, index) => {
            const page = pages.find((item) => item.id === entry.pageId);
            if (!page) return null;
            return (
              <article key={entry.pageId}>
                <div><strong>{localizeText(page.draft.title, "it")}</strong><small>/{page.slug}</small></div>
                <label><span>Etichetta {language.toUpperCase()}</span><input value={language === "it" ? entry.label.it : entry.label.en ?? ""} onChange={(event) => updateNavigation(entry.pageId, {label: localizedValue(entry.label, event.target.value)})} /></label>
                <label className="admin-check"><input checked={entry.showHeader} onChange={(event) => updateNavigation(entry.pageId, {showHeader: event.target.checked})} type="checkbox" /><span>Mostra nel menu</span></label>
                <label className="admin-check"><input checked={entry.showFooter} onChange={(event) => updateNavigation(entry.pageId, {showFooter: event.target.checked})} type="checkbox" /><span>Mostra nel footer</span></label>
                <div><button disabled={index === 0} onClick={() => moveNavigation(index, -1)} type="button"><ArrowUp size={17} /> Prima</button><button disabled={index === settings.draft.navigation.length - 1} onClick={() => moveNavigation(index, 1)} type="button"><ArrowDown size={17} /> Dopo</button></div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
