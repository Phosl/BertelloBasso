"use client";

import {useState} from "react";
import {ArrowLeft, KeyRound, LoaderCircle} from "lucide-react";
import {useRouter} from "next/navigation";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {
  getBrowserSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/browser";

export function AdminLogin() {
  const configured = isSupabaseConfigured();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    const {error: signInError} = await getBrowserSupabase()!.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    setLoading(false);
    if (signInError) {
      setError("Credenziali non valide o utente non autorizzato.");
      return;
    }
    router.replace("/admin");
  }

  return (
    <main className="admin-login">
      <div className="admin-login__art" aria-hidden="true">
        <span>P</span><i /><span>C</span>
        <small>Umbria · Italia</small>
      </div>
      <div className="admin-login__panel">
        <TransitionLink className="back-link" href="/">
          <ArrowLeft size={17} /> Torna al sito
        </TransitionLink>
        <div className="admin-login__form">
          <span className="admin-login__icon"><KeyRound size={21} /></span>
          <p className="eyebrow">Area riservata</p>
          <h1>Bentornati.</h1>
          {configured ? (
            <form onSubmit={submit}>
              <label>
                <span>Email</span>
                <input autoComplete="email" name="email" required type="email" />
              </label>
              <label>
                <span>Password</span>
                <input
                  autoComplete="current-password"
                  name="password"
                  required
                  type="password"
                />
              </label>
              {error ? <p className="login-error">{error}</p> : null}
              <button disabled={loading} type="submit">
                {loading ? <LoaderCircle className="spin" size={18} /> : null}
                {loading ? "Accesso…" : "Accedi"}
              </button>
            </form>
          ) : (
            <div className="demo-login">
              <p>
                Supabase non è ancora configurato. Puoi entrare nella demo
                completa del gestionale: le modifiche restano nel browser.
              </p>
              <button onClick={() => router.replace("/admin")} type="button">
                Entra nella demo
              </button>
            </div>
          )}
        </div>
        <small className="admin-login__help">
          Accesso riservato ai gestori dell’azienda.
        </small>
      </div>
    </main>
  );
}
