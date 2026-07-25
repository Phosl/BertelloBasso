"use client";

import {useCallback, useEffect, useState} from "react";
import {Archive, Copy, FilePlus2, Pencil, RotateCcw} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {
  archivePage,
  duplicatePage,
  getAdminPages,
} from "@/lib/cms/admin-service";
import {localizeText} from "@/lib/cms/localize";
import type {CmsPage} from "@/lib/cms/types";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {useAdminData} from "./AdminDataProvider";

const pageKeyLabels: Record<NonNullable<CmsPage["pageKey"]>, string> = {
  home: "Home",
  products: "Prodotti",
  story: "Storia",
  contact: "Contatti",
  photography: "Fotografie",
};

export function PagesManager() {
  const {reportCmsState} = useAdminData();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPages(await getAdminPages());
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

  async function duplicate(id: string) {
    reportCmsState("saving");
    try {
      await duplicatePage(id);
      reportCmsState("saved");
      await load();
    } catch (error) {
      reportCmsState("error", getAdminErrorMessage(error as {code?: string; message?: string}));
    }
  }

  async function toggleArchive(page: CmsPage) {
    if (page.pageKey) return;
    if (page.status !== "archived" && !window.confirm(`Archiviare “${localizeText(page.draft.title, "it")}”?`)) return;
    reportCmsState("saving");
    try {
      await archivePage(page.id, page.status !== "archived");
      reportCmsState("saved");
      await load();
    } catch (error) {
      reportCmsState("error", getAdminErrorMessage(error as {code?: string; message?: string}));
    }
  }

  return (
    <div className="admin-page cms-admin-list">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Contenuti del sito</p>
          <h1>Pagine</h1>
          <p>Modifica le pagine esistenti oppure componine una nuova con blocchi guidati.</p>
        </div>
        <TransitionLink className="admin-primary-action" href="/admin/pagine/nuova">
          <FilePlus2 aria-hidden="true" size={20} />
          Crea nuova pagina
        </TransitionLink>
      </header>
      {notice ? <div className="gallery-admin-notice">{notice}</div> : null}
      {loading ? (
        <div className="admin-skeleton admin-skeleton--table" />
      ) : (
        <div className="cms-admin-cards">
          {pages.map((page) => (
            <article className="cms-admin-card cms-admin-card--page" key={page.id}>
              <div className="cms-admin-card__content">
                <div>
                  <span className={`cms-status is-${page.status}`}>
                    {page.status === "published" ? "Pubblicata" : page.status === "archived" ? "Archiviata" : "Bozza"}
                  </span>
                  <small>{page.pageKey ? `Pagina di sistema · ${pageKeyLabels[page.pageKey]}` : "Pagina personalizzata"}</small>
                </div>
                <h2>{localizeText(page.draft.title, "it")}</h2>
                <p>/{page.slug} · {page.draft.sections.length} sezioni</p>
              </div>
              <div className="cms-admin-card__actions">
                <TransitionLink className="admin-primary-action" href={`/admin/pagine/${page.id}`}>
                  <Pencil aria-hidden="true" size={18} />
                  Modifica
                </TransitionLink>
                <button onClick={() => void duplicate(page.id)} type="button">
                  <Copy aria-hidden="true" size={18} />
                  Duplica
                </button>
                {!page.pageKey ? (
                  <button onClick={() => void toggleArchive(page)} type="button">
                    {page.status === "archived" ? <RotateCcw size={18} /> : <Archive size={18} />}
                    {page.status === "archived" ? "Ripristina" : "Archivia"}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
