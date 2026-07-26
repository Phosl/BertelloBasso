"use client";

import {useState} from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
} from "lucide-react";
import {useRouter} from "next/navigation";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {
  getBrowserSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/browser";
import {
  getAdminAccessReasonMessage,
  getAdminErrorMessage,
  getAdminLoginErrorMessage,
} from "@/lib/supabase/errors";

export function AdminLogin({reason}: {reason?: string}) {
  const configured = isSupabaseConfigured();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(() =>
    getAdminAccessReasonMessage(reason),
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    const client = getBrowserSupabase();
    if (!client) {
      setLoading(false);
      setError("Il servizio di accesso non è configurato.");
      return;
    }

    const {data, error: signInError} = await client.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    if (signInError) {
      setLoading(false);
      setError(getAdminLoginErrorMessage(signInError));
      return;
    }

    const {data: profile, error: profileError} = await client
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      await client.auth.signOut();
      setLoading(false);
      setError(getAdminErrorMessage(profileError));
      return;
    }
    if (profile?.role !== "admin") {
      await client.auth.signOut();
      setLoading(false);
      setError(getAdminAccessReasonMessage("forbidden"));
      return;
    }

    window.location.assign("/admin");
  }

  return (
    <main className="admin-login">
      <div className="admin-login__art" aria-hidden="true">
        <span>B</span><i /><span>B</span>
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
                <input
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                  name="email"
                  required
                  spellCheck={false}
                  type="email"
                />
              </label>
              <label>
                <span>Password</span>
                <span className="login-password-field">
                  <input
                    autoComplete="current-password"
                    disabled={loading}
                    name="password"
                    required
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    aria-label={
                      showPassword ? "Nascondi password" : "Mostra password"
                    }
                    className="login-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    {showPassword ? "Nascondi" : "Mostra"}
                  </button>
                </span>
              </label>
              {error ? (
                <p aria-live="assertive" className="login-error" role="alert">
                  {error}
                </p>
              ) : null}
              <button disabled={loading} type="submit">
                {loading ? <LoaderCircle className="spin" size={18} /> : null}
                {loading ? "Accesso…" : "Accedi"}
              </button>
            </form>
          ) : (
            <div className="demo-login">
              <p>
                Il collegamento al sito non è ancora configurato. Puoi entrare
                nella demo completa del gestionale: le modifiche restano in
                questo browser.
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
