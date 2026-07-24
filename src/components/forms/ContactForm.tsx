"use client";

import {useState} from "react";
import {Check, LoaderCircle, Send} from "lucide-react";
import {z} from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Inserisci il tuo nome."),
  email: z.string().trim().email("Inserisci un indirizzo email valido."),
  subject: z.string().trim().min(2, "Scegli o scrivi un argomento."),
  message: z.string().trim().min(10, "Scrivi almeno 10 caratteri."),
  privacy: z.literal(true, {error: "È necessario accettare l’informativa."}),
});

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = contactSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      privacy: formData.get("privacy") === "on",
    });

    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      setState("error");
      setNotice("Controlla i campi evidenziati.");
      return;
    }

    setErrors({});
    setNotice("");
    setState("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(result.data),
      });
      if (!response.ok) throw new Error("request_failed");
      form.reset();
      setState("success");
      setNotice("Grazie. Il tuo messaggio è stato affidato alla nostra dispensa.");
    } catch {
      setState("error");
      setNotice("Il messaggio non è partito. Riprova oppure scrivici via email.");
    }
  }

  if (state === "success") {
    return (
      <div aria-live="polite" className="form-success" role="status">
        <span><Check aria-hidden="true" size={22} /></span>
        <p className="eyebrow">Messaggio inviato</p>
        <h2>Ci sentiamo presto.</h2>
        <p>{notice}</p>
        <button onClick={() => setState("idle")} type="button">
          Invia un altro messaggio
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          <span>Nome e cognome *</span>
          <input
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            name="name"
            placeholder="Come ti chiami?"
          />
          {errors.name ? <small id="name-error">{errors.name}</small> : null}
        </label>
        <label>
          <span>Email *</span>
          <input
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            inputMode="email"
            name="email"
            placeholder="nome@email.it"
            type="email"
          />
          {errors.email ? <small id="email-error">{errors.email}</small> : null}
        </label>
      </div>
      <label>
        <span>Parliamo di *</span>
        <select
          aria-describedby={errors.subject ? "subject-error" : undefined}
          aria-invalid={Boolean(errors.subject)}
          defaultValue=""
          name="subject"
        >
          <option disabled value="">Scegli un argomento</option>
          <option value="Visita e degustazione">Visita e degustazione</option>
          <option value="Acquisto prodotti">Acquisto prodotti</option>
          <option value="Rivenditori e ristorazione">Rivenditori e ristorazione</option>
          <option value="Altro">Altro</option>
        </select>
        {errors.subject ? (
          <small id="subject-error">{errors.subject}</small>
        ) : null}
      </label>
      <label>
        <span>Messaggio *</span>
        <textarea
          aria-describedby={errors.message ? "message-error" : undefined}
          aria-invalid={Boolean(errors.message)}
          name="message"
          placeholder="Raccontaci come possiamo aiutarti…"
          rows={6}
        />
        {errors.message ? (
          <small id="message-error">{errors.message}</small>
        ) : null}
      </label>
      <label className="checkbox-field">
        <input
          aria-describedby={errors.privacy ? "privacy-error" : undefined}
          aria-invalid={Boolean(errors.privacy)}
          name="privacy"
          type="checkbox"
        />
        <span>
          Acconsento al trattamento dei dati per ricevere risposta alla mia
          richiesta.
        </span>
      </label>
      {errors.privacy ? (
        <small id="privacy-error">{errors.privacy}</small>
      ) : null}
      <div className="form-submit">
        <button disabled={state === "sending"} type="submit">
          {state === "sending" ? (
            <LoaderCircle aria-hidden="true" className="spin" size={18} />
          ) : (
            <Send aria-hidden="true" size={17} />
          )}
          {state === "sending" ? "Invio in corso…" : "Invia il messaggio"}
        </button>
        {notice ? (
          <p aria-live="polite" className="form-notice" role="status">
            {notice}
          </p>
        ) : null}
      </div>
    </form>
  );
}
