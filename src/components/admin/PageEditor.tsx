"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {
  archivePage,
  getAdminMedia,
  getAdminPage,
  getAdminProductDrafts,
  publishPage,
  savePage,
  unpublishPage,
} from "@/lib/cms/admin-service";
import {localizeText} from "@/lib/cms/localize";
import {
  createPageSection,
  sectionTypeLabels,
  type EditableSectionType,
} from "@/lib/cms/section-factory";
import type {
  CmsPage,
  MediaAsset,
  PageSection,
  ProductDraft,
} from "@/lib/cms/types";
import {pagePublicationIssues} from "@/lib/cms/validation";
import {getAdminGalleries} from "@/lib/galleries/admin-service";
import type {Gallery} from "@/lib/galleries/types";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {PageSectionEditor} from "./PageSectionEditor";
import {useAdminData} from "./AdminDataProvider";

export function PageEditor({id}: {id: string}) {
  const router = useRouter();
  const {reportCmsState} = useAdminData();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [language, setLanguage] = useState<"it" | "en">("it");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const dirty = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pageResult, mediaResult, productResult, galleryResult] =
        await Promise.all([
          getAdminPage(id),
          getAdminMedia().catch(() => []),
          getAdminProductDrafts().catch(() => []),
          getAdminGalleries().catch(() => []),
        ]);
      setPage(pageResult);
      setMedia(mediaResult);
      setProducts(productResult);
      setGalleries(galleryResult);
      setNotice("");
    } catch (error) {
      setNotice(getAdminErrorMessage(error as {code?: string; message?: string}));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const persist = useCallback(
    async (value: CmsPage, validate = false) => {
      reportCmsState("saving");
      try {
        await savePage(value, {validate});
        dirty.current = false;
        reportCmsState("saved");
        return true;
      } catch (error) {
        const message = getAdminErrorMessage(error as {code?: string; message?: string});
        setNotice(message);
        reportCmsState("error", message);
        return false;
      }
    },
    [reportCmsState],
  );

  useEffect(() => {
    if (!page || !dirty.current) return;
    const timeout = window.setTimeout(() => void persist(page), 1200);
    return () => window.clearTimeout(timeout);
  }, [page, persist]);

  function update(mutator: (current: CmsPage) => CmsPage) {
    dirty.current = true;
    setPage((current) => (current ? mutator(current) : current));
  }

  function updateSection(nextSection: PageSection) {
    update((current) => ({
      ...current,
      draft: {
        ...current.draft,
        sections: current.draft.sections.map((section) =>
          section.id === nextSection.id ? nextSection : section,
        ),
      },
    }));
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (!page || target < 0 || target >= page.draft.sections.length) return;
    update((current) => {
      const sections = [...current.draft.sections];
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return {...current, draft: {...current.draft, sections}};
    });
  }

  function duplicateSection(section: PageSection) {
    const copy = structuredClone(section);
    copy.id = crypto.randomUUID();
    if (copy.type === "cards") {
      copy.items = copy.items.map((item) => ({...item, id: crypto.randomUUID()}));
    }
    update((current) => {
      const index = current.draft.sections.findIndex((item) => item.id === section.id);
      const sections = [...current.draft.sections];
      sections.splice(index + 1, 0, copy);
      return {...current, draft: {...current.draft, sections}};
    });
  }

  function removeSection(section: PageSection) {
    if ("locked" in section && section.locked) return;
    if (!window.confirm(`Eliminare il blocco “${sectionTypeLabels[section.type]}”?`)) return;
    update((current) => ({
      ...current,
      draft: {
        ...current.draft,
        sections: current.draft.sections.filter((item) => item.id !== section.id),
      },
    }));
  }

  async function publish() {
    if (!page) return;
    const issues = pagePublicationIssues(page.slug, page.draft, page.pageKey);
    if (issues.length) {
      setNotice(issues.join(" "));
      return;
    }
    if (!(await persist(page, true))) return;
    reportCmsState("saving");
    try {
      await publishPage(page.id);
      reportCmsState("saved");
      await load();
    } catch (error) {
      const message = getAdminErrorMessage(error as {code?: string; message?: string});
      setNotice(message);
      reportCmsState("error", message);
    }
  }

  async function unpublish() {
    if (!page || page.pageKey) return;
    if (!window.confirm("Togliere questa pagina dal sito? La bozza resterà salvata.")) return;
    reportCmsState("saving");
    try {
      await unpublishPage(page.id);
      reportCmsState("saved");
      await load();
    } catch (error) {
      reportCmsState("error", getAdminErrorMessage(error as {code?: string; message?: string}));
    }
  }

  async function archive() {
    if (!page || page.pageKey) return;
    const archived = page.status !== "archived";
    if (archived && !window.confirm("Archiviare questa pagina? Verrà tolta dal sito e dal menu.")) return;
    reportCmsState("saving");
    try {
      await archivePage(page.id, archived);
      reportCmsState("saved");
      if (archived) router.replace("/admin/pagine");
      else await load();
    } catch (error) {
      reportCmsState("error", getAdminErrorMessage(error as {code?: string; message?: string}));
    }
  }

  if (loading) return <div className="admin-skeleton admin-skeleton--form" />;
  if (!page) {
    return (
      <div className="gallery-admin-empty">
        <h1>Pagina non trovata.</h1>
        <TransitionLink href="/admin/pagine">Torna alle pagine</TransitionLink>
      </div>
    );
  }

  const currentTitle =
    language === "it" ? page.draft.title.it : page.draft.title.en ?? "";

  return (
    <div className="admin-page cms-editor cms-page-editor">
      <header className="cms-editor__header">
        <div>
          <TransitionLink className="back-link" href="/admin/pagine">
            <ArrowLeft aria-hidden="true" size={18} />
            Tutte le pagine
          </TransitionLink>
          <p className="eyebrow">{page.pageKey ? "Pagina di sistema" : "Pagina personalizzata"} · {page.status}</p>
          <h1>{localizeText(page.draft.title, "it")}</h1>
        </div>
        <div className="cms-editor__publish-actions">
          <TransitionLink className="admin-secondary-action" href={`/admin/pagine/${page.id}/anteprima`}>
            <Eye aria-hidden="true" size={19} />
            Anteprima
          </TransitionLink>
          <button className="admin-secondary-action" onClick={() => void persist(page)} type="button">
            <Save aria-hidden="true" size={19} />
            Salva bozza
          </button>
          {page.status === "published" && !page.pageKey ? (
            <button className="admin-secondary-action" onClick={() => void unpublish()} type="button">
              <EyeOff aria-hidden="true" size={19} />
              Togli dal sito
            </button>
          ) : (
            <button className="admin-primary-action" onClick={() => void publish()} type="button">
              <Eye aria-hidden="true" size={19} />
              Pubblica
            </button>
          )}
        </div>
      </header>

      {notice ? <div className="gallery-admin-notice">{notice}</div> : null}

      <div className="admin-language-tabs cms-page-language">
        <button aria-pressed={language === "it"} onClick={() => setLanguage("it")} type="button">Italiano <span>Obbligatorio</span></button>
        <button aria-pressed={language === "en"} onClick={() => setLanguage("en")} type="button">English <span>Fallback italiano</span></button>
      </div>

      <section className="cms-editor-section cms-page-basics">
        <header><span>1</span><div><h2>Pagina e motori di ricerca</h2><p>Titolo, indirizzo e descrizione condivisa.</p></div></header>
        <label>
          <span>Titolo pagina</span>
          <input
            onChange={(event) =>
              update((current) => ({
                ...current,
                draft: {
                  ...current.draft,
                  title:
                    language === "it"
                      ? {...current.draft.title, it: event.target.value}
                      : {...current.draft.title, en: event.target.value},
                },
              }))
            }
            value={currentTitle}
          />
        </label>
        {!page.pageKey ? (
          <label>
            <span>Indirizzo pagina</span>
            <input disabled={Boolean(page.publishedAt)} onChange={(event) => update((current) => ({...current, slug: event.target.value}))} value={page.slug} />
          </label>
        ) : null}
        <label>
          <span>Titolo SEO</span>
          <input
            onChange={(event) =>
              update((current) => ({
                ...current,
                draft: {
                  ...current.draft,
                  seo: {
                    ...current.draft.seo,
                    title:
                      language === "it"
                        ? {...current.draft.seo.title, it: event.target.value}
                        : {...current.draft.seo.title, en: event.target.value},
                  },
                },
              }))
            }
            value={language === "it" ? page.draft.seo.title.it : page.draft.seo.title.en ?? ""}
          />
        </label>
        <label>
          <span>Descrizione SEO</span>
          <textarea
            onChange={(event) =>
              update((current) => ({
                ...current,
                draft: {
                  ...current.draft,
                  seo: {
                    ...current.draft.seo,
                    description:
                      language === "it"
                        ? {...current.draft.seo.description, it: event.target.value}
                        : {...current.draft.seo.description, en: event.target.value},
                  },
                },
              }))
            }
            rows={3}
            value={language === "it" ? page.draft.seo.description.it : page.draft.seo.description.en ?? ""}
          />
        </label>
      </section>

      <section className="cms-block-builder">
        <header>
          <div><p className="eyebrow">2 · Componenti</p><h2>Sezioni della pagina</h2><p>Trascina non è obbligatorio: puoi sempre usare “Sposta prima” e “Sposta dopo”.</p></div>
          <button className="admin-primary-action" onClick={() => setAdding((value) => !value)} type="button"><Plus size={20} /> Aggiungi sezione</button>
        </header>
        {adding ? (
          <div className="cms-section-chooser">
            {(Object.entries(sectionTypeLabels) as Array<[EditableSectionType, string]>).map(([type, label]) => (
              <button
                key={type}
                onClick={() => {
                  update((current) => ({
                    ...current,
                    draft: {...current.draft, sections: [...current.draft.sections, createPageSection(type)]},
                  }));
                  setAdding(false);
                }}
                type="button"
              >
                <Plus aria-hidden="true" size={19} />
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="cms-block-list">
          {page.draft.sections.map((section, index) => (
            <article className={section.hidden ? "is-hidden" : ""} key={section.id}>
              <header>
                <div>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{sectionTypeLabels[section.type]}</h3>
                  {"locked" in section && section.locked ? <small>Obbligatorio</small> : null}
                </div>
                <div>
                  <button disabled={index === 0} onClick={() => moveSection(index, -1)} type="button"><ArrowUp size={17} /> Sposta prima</button>
                  <button disabled={index === page.draft.sections.length - 1} onClick={() => moveSection(index, 1)} type="button"><ArrowDown size={17} /> Sposta dopo</button>
                  <button onClick={() => duplicateSection(section)} type="button"><Copy size={17} /> Duplica</button>
                  <button onClick={() => updateSection({...section, hidden: !section.hidden})} type="button">{section.hidden ? <Eye size={17} /> : <EyeOff size={17} />}{section.hidden ? "Mostra" : "Nascondi"}</button>
                  <button disabled={"locked" in section && section.locked} onClick={() => removeSection(section)} type="button"><Trash2 size={17} /> Elimina</button>
                </div>
              </header>
              <div className="cms-block-list__fields">
                <PageSectionEditor
                  galleries={galleries}
                  language={language}
                  media={media}
                  onChange={updateSection}
                  products={products}
                  section={section}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {!page.pageKey ? (
        <section className="cms-danger-zone">
          <h2>{page.status === "archived" ? "Ripristina pagina" : "Archivia pagina"}</h2>
          <p>L’archivio conserva tutti i componenti e toglie la pagina dal sito.</p>
          <button onClick={() => void archive()} type="button">
            {page.status === "archived" ? <RotateCcw size={19} /> : <Archive size={19} />}
            {page.status === "archived" ? "Ripristina" : "Archivia"}
          </button>
        </section>
      ) : null}
    </div>
  );
}
