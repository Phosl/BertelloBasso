"use client";

import {useState} from "react";
import {ArrowLeft, LoaderCircle, Plus} from "lucide-react";
import {useRouter} from "next/navigation";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {createGallery} from "@/lib/galleries/admin-service";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {isSupabaseConfigured} from "@/lib/supabase/browser";

export function NewGalleryForm() {
  const configured = isSupabaseConfigured();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !configured) return;
    setCreating(true);
    setNotice("");
    try {
      const gallery = await createGallery(title);
      router.replace(`/admin/gallerie/${gallery.id}`);
    } catch (error) {
      setNotice(getAdminErrorMessage(error as Error));
      setCreating(false);
    }
  }

  return (
    <div className="admin-page gallery-new">
      <TransitionLink className="back-link" href="/admin/gallerie">
        <ArrowLeft aria-hidden="true" size={20} />
        Torna alle gallerie
      </TransitionLink>
      <div className="gallery-new__panel">
        <p className="eyebrow">Nuova galleria</p>
        <h1>Come si chiama?</h1>
        <p>
          Scrivi il titolo in italiano. Potrai aggiungere traduzione, testo,
          luogo e fotografie nella schermata successiva.
        </p>
        <form onSubmit={submit}>
          <label htmlFor="new-gallery-title">Titolo della galleria</label>
          <input
            autoFocus
            disabled={!configured || creating}
            id="new-gallery-title"
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Per esempio: La raccolta delle olive"
            required
            value={title}
          />
          {notice ? <div className="gallery-form-error">{notice}</div> : null}
          <button
            className="admin-primary-action"
            disabled={!title.trim() || !configured || creating}
            type="submit"
          >
            {creating ? (
              <LoaderCircle aria-hidden="true" className="spin" size={23} />
            ) : (
              <Plus aria-hidden="true" size={23} />
            )}
            {creating ? "Creazione…" : "Crea e continua"}
          </button>
        </form>
      </div>
    </div>
  );
}
