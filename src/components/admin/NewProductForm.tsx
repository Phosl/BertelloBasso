"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowLeft, Plus} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {createProductDraft} from "@/lib/cms/admin-service";
import {getAdminErrorMessage} from "@/lib/supabase/errors";
import {useAdminData} from "./AdminDataProvider";

export function NewProductForm() {
  const router = useRouter();
  const {reportCmsState} = useAdminData();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Inserisci il nome del prodotto.");
      return;
    }
    reportCmsState("saving");
    try {
      const product = await createProductDraft(name);
      reportCmsState("saved");
      router.replace(`/admin/prodotti/${product.id}`);
    } catch (reason) {
      const message = getAdminErrorMessage(
        reason as {code?: string; message?: string},
      );
      setError(message);
      reportCmsState("error", message);
    }
  }

  return (
    <div className="admin-page cms-new-item">
      <TransitionLink className="back-link" href="/admin/prodotti">
        <ArrowLeft aria-hidden="true" size={18} />
        Torna ai prodotti
      </TransitionLink>
      <form onSubmit={submit}>
        <p className="eyebrow">Nuovo prodotto</p>
        <h1>Come si chiama?</h1>
        <p>Il nome serve soltanto per creare la bozza. Potrai modificarlo subito dopo.</p>
        <label>
          <span>Nome del prodotto</span>
          <input
            autoFocus
            onChange={(event) => setName(event.target.value)}
            placeholder="Per esempio: Olio nuovo raccolto"
            value={name}
          />
        </label>
        {error ? <p className="cms-form-error">{error}</p> : null}
        <button className="admin-primary-action" type="submit">
          <Plus aria-hidden="true" size={20} />
          Crea la bozza
        </button>
      </form>
    </div>
  );
}
