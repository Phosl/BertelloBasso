"use client";

import {ArrowUpRight, Boxes, Eye, Mail, Sparkles} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {useAdminData} from "./AdminDataProvider";

export function AdminDashboard() {
  const {data, loading} = useAdminData();
  const visibleProducts = data.products.filter((product) => product.published);
  const comingSoon = data.products.filter(
    (product) => product.status === "coming_soon",
  );
  const newMessages = data.inquiries.filter(
    (inquiry) => inquiry.status === "new",
  );

  if (loading) {
    return <div className="admin-skeleton admin-skeleton--dashboard" />;
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Panoramica</p>
          <h1>Buongiorno.</h1>
          <p>
            Qui trovi lo stato del sito e le cose che richiedono attenzione.
          </p>
        </div>
        <a className="admin-primary-action" href="/" target="_blank">
          <Eye aria-hidden="true" size={17} />
          Vedi sito
        </a>
      </header>
      <section className="admin-stats" aria-label="Riepilogo">
        <article>
          <span><Boxes size={19} /></span>
          <strong>{visibleProducts.length}</strong>
          <p>Prodotti pubblicati</p>
          <small>{data.products.length - visibleProducts.length} in bozza</small>
        </article>
        <article>
          <span><Sparkles size={19} /></span>
          <strong>{comingSoon.length}</strong>
          <p>Prodotti in arrivo</p>
          <small>MITERA è in evidenza</small>
        </article>
        <article>
          <span><Mail size={19} /></span>
          <strong>{newMessages.length}</strong>
          <p>Nuovi messaggi</p>
          <small>{data.inquiries.length} messaggi totali</small>
        </article>
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <header>
            <div>
              <p className="eyebrow">Prodotti</p>
              <h2>Stato catalogo</h2>
            </div>
            <TransitionLink href="/admin/prodotti">
              Gestisci <ArrowUpRight size={16} />
            </TransitionLink>
          </header>
          <div className="dashboard-product-list">
            {data.products.slice(0, 5).map((product) => (
              <div key={product.id}>
                <span
                  className="dashboard-product-list__swatch"
                  style={{background: product.accent}}
                />
                <strong>{product.name}</strong>
                <small>
                  {product.published ? "Online" : "Bozza"} ·{" "}
                  {product.status === "coming_soon"
                    ? "In arrivo"
                    : product.status === "seasonal"
                      ? "Stagionale"
                      : "Disponibile"}
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <header>
            <div>
              <p className="eyebrow">Posta in arrivo</p>
              <h2>Ultimi messaggi</h2>
            </div>
            <TransitionLink href="/admin/messaggi">
              Apri <ArrowUpRight size={16} />
            </TransitionLink>
          </header>
          <div className="dashboard-message-list">
            {data.inquiries.map((inquiry) => (
              <div key={inquiry.id}>
                <span className={inquiry.status === "new" ? "is-new" : ""} />
                <div>
                  <strong>{inquiry.subject}</strong>
                  <small>{inquiry.name} · {inquiry.email}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
