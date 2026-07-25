"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {ProductVisual} from "@/components/products/ProductVisual";
import {
  archiveProduct,
  getAdminProductDraft,
  linkProductMedia,
  publishProduct,
  saveProductDraft,
  unpublishProduct,
  updateProductMediaFocalPoint,
} from "@/lib/cms/admin-service";
import type {MediaAsset, ProductDraft} from "@/lib/cms/types";
import type {Product} from "@/lib/content/types";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {productPublicationIssues} from "@/lib/cms/validation";
import {MediaPicker} from "./MediaPicker";
import {useAdminData} from "./AdminDataProvider";

const visualOptions: Product["visual"][] = [
  "oil",
  "white-wine",
  "red-wine",
  "gin",
  "sauce",
  "tomato-chips",
  "polenta-chips",
];

export function ProductEditor({id}: {id: string}) {
  const router = useRouter();
  const {reportCmsState} = useAdminData();
  const [product, setProduct] = useState<ProductDraft | null>(null);
  const [language, setLanguage] = useState<"it" | "en">("it");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const dirty = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProduct(await getAdminProductDraft(id));
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
    async (value: ProductDraft, validate = false) => {
      reportCmsState("saving");
      try {
        await saveProductDraft(value, {validate});
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
    if (!product || !dirty.current) return;
    const timeout = window.setTimeout(() => void persist(product), 1200);
    return () => window.clearTimeout(timeout);
  }, [persist, product]);

  function update(mutator: (current: ProductDraft) => ProductDraft) {
    dirty.current = true;
    setProduct((current) => (current ? mutator(current) : current));
  }

  const preview = useMemo<Product | null>(() => {
    if (!product) return null;
    return {
      id: product.id,
      slug: product.slug,
      name: product.content.name || "Nuovo prodotto",
      eyebrow: product.content.eyebrow,
      description: product.content.description,
      category: product.content.category,
      status: product.content.availability,
      formats: product.content.formats,
      featured: product.content.featured,
      published: product.status === "published",
      sortOrder: product.sortOrder,
      visual: product.content.visual,
      accent: product.content.accent,
      translations: product.content.translations,
      media: product.media.map((item) => ({
        id: item.id,
        mediaId: item.mediaId,
        role: item.role,
        sortOrder: item.sortOrder,
        focalX: item.focalX,
        focalY: item.focalY,
        width: item.asset.width,
        height: item.asset.height,
        altText: item.asset.alt.it,
        caption: item.asset.caption.it,
        imageUrl: item.asset.imageUrl,
        thumbnailUrl: item.asset.thumbnailUrl,
      })),
    };
  }, [product]);

  async function changeMedia(assets: MediaAsset[]) {
    if (!product) return;
    reportCmsState("saving");
    try {
      await linkProductMedia(product.id, assets);
      setProduct({
        ...product,
        media: assets.map((asset, index) => ({
          id: product.media.find((item) => item.mediaId === asset.id)?.id ?? crypto.randomUUID(),
          productId: product.id,
          mediaId: asset.id,
          scope: "draft",
          role: index === 0 ? "primary" : "gallery",
          sortOrder: index,
          focalX: 0.5,
          focalY: 0.5,
          asset,
        })),
      });
      reportCmsState("saved");
    } catch (error) {
      const message = getAdminErrorMessage(error as {code?: string; message?: string});
      setNotice(message);
      reportCmsState("error", message);
    }
  }

  async function changeFocalPoint(
    mediaId: string,
    focalX: number,
    focalY: number,
  ) {
    if (!product) return;
    setProduct({
      ...product,
      media: product.media.map((item) =>
        item.mediaId === mediaId ? {...item, focalX, focalY} : item,
      ),
    });
    reportCmsState("saving");
    try {
      await updateProductMediaFocalPoint(product.id, mediaId, focalX, focalY);
      reportCmsState("saved");
    } catch (error) {
      reportCmsState(
        "error",
        getAdminErrorMessage(error as {code?: string; message?: string}),
      );
    }
  }

  async function publish() {
    if (!product) return;
    const issues = productPublicationIssues(product.content);
    if (issues.length) {
      setNotice(issues.join(" "));
      return;
    }
    if (!(await persist(product, true))) return;
    reportCmsState("saving");
    try {
      await publishProduct(product.id);
      reportCmsState("saved");
      await load();
    } catch (error) {
      const message = getAdminErrorMessage(error as {code?: string; message?: string});
      setNotice(message);
      reportCmsState("error", message);
    }
  }

  async function unpublish() {
    if (!product || !window.confirm("Togliere questo prodotto dal sito? La bozza resterà salvata.")) return;
    reportCmsState("saving");
    try {
      await unpublishProduct(product.id);
      reportCmsState("saved");
      await load();
    } catch (error) {
      reportCmsState("error", getAdminErrorMessage(error as {code?: string; message?: string}));
    }
  }

  async function archive() {
    if (!product) return;
    if (product.status !== "archived" && !window.confirm("Archiviare questo prodotto? Verrà tolto dal sito.")) return;
    reportCmsState("saving");
    try {
      await archiveProduct(product.id, product.status !== "archived");
      reportCmsState("saved");
      if (product.status === "archived") await load();
      else router.replace("/admin/prodotti");
    } catch (error) {
      reportCmsState("error", getAdminErrorMessage(error as {code?: string; message?: string}));
    }
  }

  if (loading) return <div className="admin-skeleton admin-skeleton--form" />;
  if (!product || !preview) {
    return (
      <div className="gallery-admin-empty">
        <h1>Prodotto non trovato.</h1>
        <TransitionLink href="/admin/prodotti">Torna ai prodotti</TransitionLink>
      </div>
    );
  }

  const translation = product.content.translations.en ?? {
    name: "",
    eyebrow: "",
    description: "",
  };

  return (
    <div className="admin-page cms-editor">
      <header className="cms-editor__header">
        <div>
          <TransitionLink className="back-link" href="/admin/prodotti">
            <ArrowLeft aria-hidden="true" size={18} />
            Tutti i prodotti
          </TransitionLink>
          <p className="eyebrow">Prodotto · {product.status}</p>
          <h1>{product.content.name || "Nuovo prodotto"}</h1>
        </div>
        <div className="cms-editor__publish-actions">
          <button className="admin-secondary-action" onClick={() => void persist(product)} type="button">
            <Save aria-hidden="true" size={19} />
            Salva bozza
          </button>
          {product.status === "published" ? (
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

      <div className="cms-editor__layout">
        <form className="cms-editor__form" onSubmit={(event) => event.preventDefault()}>
          <section className="cms-editor-section">
            <header>
              <span>1</span>
              <div><h2>Nome e descrizione</h2><p>Italiano obbligatorio, inglese facoltativo.</p></div>
            </header>
            <div className="admin-language-tabs">
              <button aria-pressed={language === "it"} onClick={() => setLanguage("it")} type="button">Italiano <span>Obbligatorio</span></button>
              <button aria-pressed={language === "en"} onClick={() => setLanguage("en")} type="button">English <span>Facoltativo</span></button>
            </div>
            {language === "it" ? (
              <>
                <label><span>Nome prodotto</span><input value={product.content.name} onChange={(event) => update((item) => ({...item, content: {...item.content, name: event.target.value}}))} /></label>
                <label><span>Soprattitolo</span><input value={product.content.eyebrow} onChange={(event) => update((item) => ({...item, content: {...item.content, eyebrow: event.target.value}}))} /></label>
                <label><span>Descrizione</span><textarea rows={5} value={product.content.description} onChange={(event) => update((item) => ({...item, content: {...item.content, description: event.target.value}}))} /></label>
              </>
            ) : (
              <>
                <label><span>Product name</span><input value={translation.name} onChange={(event) => update((item) => ({...item, content: {...item.content, translations: {en: {...translation, name: event.target.value}}}}))} /></label>
                <label><span>Eyebrow</span><input value={translation.eyebrow} onChange={(event) => update((item) => ({...item, content: {...item.content, translations: {en: {...translation, eyebrow: event.target.value}}}}))} /></label>
                <label><span>Description</span><textarea rows={5} value={translation.description} onChange={(event) => update((item) => ({...item, content: {...item.content, translations: {en: {...translation, description: event.target.value}}}}))} /></label>
              </>
            )}
          </section>

          <section className="cms-editor-section">
            <header><span>2</span><div><h2>Vendita e disponibilità</h2><p>Formati e prezzi mostrati sul sito.</p></div></header>
            <div className="cms-form-grid">
              <label><span>Categoria</span><select value={product.content.category} onChange={(event) => update((item) => ({...item, content: {...item.content, category: event.target.value as ProductDraft["content"]["category"]}}))}><option value="olio">Olio</option><option value="vino">Vino</option><option value="distillati">Distillati</option><option value="dispensa">Dispensa</option></select></label>
              <label><span>Disponibilità</span><select value={product.content.availability} onChange={(event) => update((item) => ({...item, content: {...item.content, availability: event.target.value as ProductDraft["content"]["availability"]}}))}><option value="available">Disponibile</option><option value="coming_soon">Coming soon</option><option value="seasonal">Stagionale</option></select></label>
            </div>
            <label className="admin-check"><input checked={product.content.featured} onChange={(event) => update((item) => ({...item, content: {...item.content, featured: event.target.checked}}))} type="checkbox" /><span>Mostra tra i prodotti in evidenza</span></label>
            <div className="cms-format-list">
              {product.content.formats.map((format, index) => (
                <div key={`${index}-${format.label}`}>
                  <label><span>Formato</span><input placeholder="500 ml" value={format.label} onChange={(event) => update((item) => ({...item, content: {...item.content, formats: item.content.formats.map((value, valueIndex) => valueIndex === index ? {...value, label: event.target.value} : value)}}))} /></label>
                  <label><span>Prezzo €</span><input inputMode="decimal" min="0" placeholder="Su richiesta" step="0.01" type="number" value={format.price ?? ""} onChange={(event) => update((item) => ({...item, content: {...item.content, formats: item.content.formats.map((value, valueIndex) => valueIndex === index ? {...value, price: event.target.value === "" ? undefined : Number(event.target.value)} : value)}}))} /></label>
                  <button aria-label={`Elimina formato ${index + 1}`} disabled={product.content.formats.length === 1} onClick={() => update((item) => ({...item, content: {...item.content, formats: item.content.formats.filter((_, valueIndex) => valueIndex !== index)}}))} type="button"><Trash2 aria-hidden="true" size={18} /> Elimina</button>
                </div>
              ))}
              <button onClick={() => update((item) => ({...item, content: {...item.content, formats: [...item.content.formats, {label: "", price: undefined}]}}))} type="button"><Plus aria-hidden="true" size={18} /> Aggiungi formato</button>
            </div>
          </section>

          <section className="cms-editor-section">
            <header><span>3</span><div><h2>Fotografie</h2><p>La prima immagine è la copertina. Massimo 12.</p></div></header>
            <MediaPicker
              label="Scegli o carica fotografie"
              max={12}
              onChange={changeMedia}
              selected={product.media.map((item) => item.asset)}
            />
            {product.media.length > 0 ? (
              <div className="cms-media-order">
                {product.media.map((item, index) => (
                  <div key={item.id}>
                    <strong>{index === 0 ? "Copertina" : item.asset.originalName}</strong>
                    <label>
                      <span>Punto focale orizzontale</span>
                      <input
                        max="1"
                        min="0"
                        onChange={(event) =>
                          void changeFocalPoint(
                            item.mediaId,
                            Number(event.target.value),
                            item.focalY,
                          )
                        }
                        step="0.05"
                        type="range"
                        value={item.focalX}
                      />
                    </label>
                    <label>
                      <span>Punto focale verticale</span>
                      <input
                        max="1"
                        min="0"
                        onChange={(event) =>
                          void changeFocalPoint(
                            item.mediaId,
                            item.focalX,
                            Number(event.target.value),
                          )
                        }
                        step="0.05"
                        type="range"
                        value={item.focalY}
                      />
                    </label>
                    <button disabled={index === 0} onClick={() => { const assets = product.media.map((entry) => entry.asset); [assets[index - 1], assets[index]] = [assets[index], assets[index - 1]]; void changeMedia(assets); }} type="button"><ArrowUp size={17} /> Sposta prima</button>
                    <button disabled={index === product.media.length - 1} onClick={() => { const assets = product.media.map((entry) => entry.asset); [assets[index], assets[index + 1]] = [assets[index + 1], assets[index]]; void changeMedia(assets); }} type="button"><ArrowDown size={17} /> Sposta dopo</button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="cms-editor-section">
            <header><span>4</span><div><h2>Aspetto di riserva</h2><p>Usato se non è stata caricata una fotografia.</p></div></header>
            <div className="cms-form-grid">
              <label><span>Illustrazione</span><select value={product.content.visual} onChange={(event) => update((item) => ({...item, content: {...item.content, visual: event.target.value as Product["visual"]}}))}>{visualOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
              <label><span>Colore</span><input type="color" value={product.content.accent} onChange={(event) => update((item) => ({...item, content: {...item.content, accent: event.target.value}}))} /></label>
            </div>
          </section>

          <section className="cms-editor-section">
            <header><span>5</span><div><h2>Indirizzo e SEO</h2><p>Lo slug non cambia dopo la prima pubblicazione.</p></div></header>
            <label><span>Indirizzo pagina</span><input disabled={Boolean(product.publishedAt)} value={product.slug} onChange={(event) => update((item) => ({...item, slug: event.target.value}))} /></label>
            <label><span>Titolo SEO italiano</span><input value={product.content.seo.title.it} onChange={(event) => update((item) => ({...item, content: {...item.content, seo: {...item.content.seo, title: {...item.content.seo.title, it: event.target.value}}}}))} /></label>
            <label><span>Descrizione SEO italiana</span><textarea rows={3} value={product.content.seo.description.it} onChange={(event) => update((item) => ({...item, content: {...item.content, seo: {...item.content.seo, description: {...item.content.seo.description, it: event.target.value}}}}))} /></label>
          </section>

          <section className="cms-danger-zone">
            <h2>{product.status === "archived" ? "Ripristina prodotto" : "Archivia prodotto"}</h2>
            <p>L’archivio conserva testi e fotografie e rimuove il prodotto dal sito.</p>
            <button onClick={() => void archive()} type="button">
              {product.status === "archived" ? <RotateCcw size={19} /> : <Archive size={19} />}
              {product.status === "archived" ? "Ripristina" : "Archivia"}
            </button>
          </section>
        </form>

        <aside className="cms-editor__preview">
          <p className="eyebrow">Anteprima prodotto</p>
          <ProductVisual compact product={preview} />
          <h2>{preview.name}</h2>
          <p>{preview.description}</p>
        </aside>
      </div>
    </div>
  );
}
