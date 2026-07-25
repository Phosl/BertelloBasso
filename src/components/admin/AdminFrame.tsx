"use client";

import {type ReactNode, useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {
  Boxes,
  ExternalLink,
  FileText,
  Gauge,
  Images,
  LogOut,
  Mail,
  Menu,
  RotateCcw,
  X,
} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {getBrowserSupabase} from "@/lib/supabase/browser";
import {useAdminData} from "./AdminDataProvider";
import {brand} from "@/lib/brand";

const adminLinks = [
  {href: "/admin", label: "Panoramica", icon: Gauge},
  {href: "/admin/prodotti", label: "Prodotti", icon: Boxes},
  {href: "/admin/gallerie", label: "Gallerie", icon: Images},
  {href: "/admin/contenuti", label: "Contenuti sito", icon: FileText},
  {href: "/admin/messaggi", label: "Messaggi", icon: Mail},
];

export function AdminFrame({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const router = useRouter();
  const {configured, notice, resetDemo, saveState} = useAdminData();
  const isLogin = pathname === "/admin/accesso";
  const [checking, setChecking] = useState(configured && !isLogin);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!configured || isLogin) {
      return;
    }
    const client = getBrowserSupabase();
    void client?.auth.getSession().then(async ({data}) => {
      if (!data.session) {
        router.replace("/admin/accesso");
        return;
      }
      const {data: profile, error} = await client
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .maybeSingle();
      if (error || profile?.role !== "admin") {
        await client.auth.signOut();
        router.replace("/admin/accesso");
        return;
      }
      setChecking(false);
    });
  }, [configured, isLogin, router]);

  if (isLogin) return children;

  if (checking) {
    return (
      <div className="admin-loading">
        <span />
        <p>Verifica accesso…</p>
      </div>
    );
  }

  async function signOut() {
    await getBrowserSupabase()?.auth.signOut();
    router.replace("/admin/accesso");
  }

  return (
    <div className="admin-app">
      <aside className={menuOpen ? "is-open" : ""}>
        <div className="admin-brand">
          <span className="admin-brand__mark">{brand.mark}</span>
          <div>
            <strong>{brand.name}</strong>
            <small>Amministrazione</small>
          </div>
          <button
            aria-label="Chiudi navigazione"
            className="admin-sidebar-close"
            onClick={() => setMenuOpen(false)}
            type="button"
          >
            <X size={19} />
          </button>
        </div>
        <nav aria-label="Navigazione amministrazione">
          {adminLinks.map(({href, icon: Icon, label}) => {
            const active =
              href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <TransitionLink
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : ""}
                href={href}
                key={href}
                onClick={() => setMenuOpen(false)}
              >
                <Icon aria-hidden="true" size={18} />
                {label}
              </TransitionLink>
            );
          })}
        </nav>
        <div className="admin-sidebar__foot">
          <a href="/" target="_blank">
            <ExternalLink aria-hidden="true" size={17} />
            Apri il sito
          </a>
          {configured ? (
            <button onClick={signOut} type="button">
              <LogOut aria-hidden="true" size={17} />
              Esci
            </button>
          ) : (
            <button onClick={resetDemo} type="button">
              <RotateCcw aria-hidden="true" size={17} />
              Ripristina demo
            </button>
          )}
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            aria-expanded={menuOpen}
            aria-label="Apri navigazione"
            className="admin-menu-toggle"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            <Menu size={20} />
          </button>
          <div>
            <span
              className={`mode-dot ${
                configured ? "is-connected" : "is-demo"
              }`}
            />
            {configured ? "Supabase connesso" : "Modalità demo locale"}
          </div>
          <span className={`save-indicator is-${saveState}`}>
            {saveState === "saving"
              ? "Salvataggio…"
              : saveState === "saved"
                ? "Salvato"
                : saveState === "error"
                  ? "Errore"
                  : ""}
          </span>
        </header>
        {!configured ? (
          <div className="admin-mode-banner">
            <div>
              <strong>Stai lavorando in locale.</strong>
              <span>
                Le modifiche restano in questo browser. Collega Supabase per
                pubblicarle sul sito.
              </span>
            </div>
            <code>.env.local</code>
          </div>
        ) : null}
        {notice ? (
          <div aria-live="polite" className="admin-notice" role="status">
            {notice}
          </div>
        ) : null}
        <main>{children}</main>
      </div>
      {menuOpen ? (
        <button
          aria-label="Chiudi navigazione"
          className="admin-backdrop"
          onClick={() => setMenuOpen(false)}
          type="button"
        />
      ) : null}
    </div>
  );
}
