"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowLeft, FilePlus2} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {createPage} from "@/lib/cms/admin-service";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {useAdminData} from "./AdminDataProvider";

export function NewPageForm() {
  const router = useRouter();
  const {reportCmsState} = useAdminData();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Inserisci il titolo della pagina.");
      return;
    }
    reportCmsState("saving");
    try {
      const page = await createPage(title);
      reportCmsState("saved");
      router.replace(`/admin/pagine/${page.id}`);
    } catch (reason) {
      const message = getAdminErrorMessage(reason as {code?: string; message?: string});
      setError(message);
      reportCmsState("error", message);
    }
  }

  return (
    <div className="admin-page cms-new-item">
      <TransitionLink className="back-link" href="/admin/pagine">
        <ArrowLeft aria-hidden="true" size={18} />
        Torna alle pagine
      </TransitionLink>
      <form onSubmit={submit}>
        <p className="eyebrow">Nuova pagina</p>
        <h1>Come si chiama?</h1>
        <p>Creeremo una bozza con una testata iniziale. Potrai poi aggiungere tutti i blocchi utili.</p>
        <label>
          <span>Titolo della pagina</span>
          <input autoFocus onChange={(event) => setTitle(event.target.value)} placeholder="Per esempio: Visite in frantoio" value={title} />
        </label>
        {error ? <p className="cms-form-error">{error}</p> : null}
        <button className="admin-primary-action" type="submit">
          <FilePlus2 aria-hidden="true" size={20} />
          Crea la bozza
        </button>
      </form>
    </div>
  );
}
