"use client";

import {useState} from "react";
import {Archive, ArrowLeft, CheckCheck, Mail, Reply} from "lucide-react";
import type {Inquiry} from "@/lib/content/types";
import {useAdminData} from "./AdminDataProvider";

export function Inbox() {
  const {data, loading, updateInquiry} = useAdminData();
  const [selectedId, setSelectedId] = useState<string | null>(
    data.inquiries[0]?.id ?? null,
  );
  const selected =
    data.inquiries.find((inquiry) => inquiry.id === selectedId) ?? null;

  async function select(inquiry: Inquiry) {
    setSelectedId(inquiry.id);
    if (inquiry.status === "new") {
      await updateInquiry(inquiry.id, "read");
    }
  }

  return (
    <div className="admin-page admin-page--inbox">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Contatti</p>
          <h1>Messaggi</h1>
          <p>Richieste arrivate dal modulo pubblico del sito.</p>
        </div>
      </header>
      {loading ? (
        <div className="admin-skeleton admin-skeleton--table" />
      ) : data.inquiries.length === 0 ? (
        <div className="inbox-empty">
          <Mail aria-hidden="true" size={25} />
          <h2>Nessun messaggio.</h2>
          <p>Le nuove richieste appariranno qui.</p>
        </div>
      ) : (
        <div className={`inbox ${selected ? "has-selection" : ""}`}>
          <div className="inbox-list">
            {data.inquiries.map((inquiry) => (
              <button
                className={`${inquiry.status === "new" ? "is-new" : ""} ${
                  inquiry.id === selectedId ? "is-active" : ""
                }`}
                key={inquiry.id}
                onClick={() => void select(inquiry)}
                type="button"
              >
                <span className="inbox-list__dot" />
                <div>
                  <strong>{inquiry.name}</strong>
                  <span>{inquiry.subject}</span>
                  <p>{inquiry.message}</p>
                </div>
                <time dateTime={inquiry.createdAt}>
                  {new Intl.DateTimeFormat("it-IT", {
                    day: "2-digit",
                    month: "short",
                  }).format(new Date(inquiry.createdAt))}
                </time>
              </button>
            ))}
          </div>
          {selected ? (
            <article className="message-detail">
              <button
                className="message-detail__back"
                onClick={() => setSelectedId(null)}
                type="button"
              >
                <ArrowLeft size={17} /> Messaggi
              </button>
              <header>
                <p className="eyebrow">
                  {new Intl.DateTimeFormat("it-IT", {
                    dateStyle: "long",
                    timeStyle: "short",
                  }).format(new Date(selected.createdAt))}
                </p>
                <h2>{selected.subject}</h2>
                <div>
                  <span>Da</span>
                  <strong>{selected.name}</strong>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                </div>
              </header>
              <p className="message-detail__body">{selected.message}</p>
              <footer>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}>
                  <Reply size={16} /> Rispondi
                </a>
                <button
                  onClick={() =>
                    void updateInquiry(selected.id, "read")
                  }
                  type="button"
                >
                  <CheckCheck size={16} /> Segna letto
                </button>
                <button
                  onClick={() =>
                    void updateInquiry(selected.id, "archived")
                  }
                  type="button"
                >
                  <Archive size={16} /> Archivia
                </button>
              </footer>
            </article>
          ) : null}
        </div>
      )}
    </div>
  );
}
