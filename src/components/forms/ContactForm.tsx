"use client";

import {useState} from "react";
import {useSearchParams} from "next/navigation";
import {Check, LoaderCircle, Send} from "lucide-react";
import {z} from "zod";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm({locale}: {locale: Locale}) {
  const searchParams = useSearchParams();
  const copy = getMessages(locale).form;
  const requestedProduct = searchParams.get("product")?.trim() ?? "";
  const requestedFormat = searchParams.get("format")?.trim() ?? "";
  const productSubject = requestedProduct
    ? `${copy.productRequest}: ${requestedProduct}${
        requestedFormat ? ` · ${requestedFormat}` : ""
      }`
    : "";
  const contactSchema = z.object({
    name: z.string().trim().min(2, copy.validation.name),
    email: z.string().trim().email(copy.validation.email),
    subject: z.string().trim().min(2, copy.validation.subject),
    message: z.string().trim().min(10, copy.validation.message),
    privacy: z.literal(true, {error: copy.validation.privacy}),
  });
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
      setNotice(copy.invalidNotice);
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
      setNotice(copy.successNotice);
    } catch {
      setState("error");
      setNotice(copy.errorNotice);
    }
  }

  if (state === "success") {
    return (
      <div aria-live="polite" className="form-success" role="status">
        <span><Check aria-hidden="true" size={22} /></span>
        <p className="eyebrow">{copy.successKicker}</p>
        <h2>{copy.successTitle}</h2>
        <p>{notice}</p>
        <button onClick={() => setState("idle")} type="button">
          {copy.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          <span>{copy.name} *</span>
          <input
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            name="name"
            placeholder={copy.namePlaceholder}
          />
          {errors.name ? <small id="name-error">{errors.name}</small> : null}
        </label>
        <label>
          <span>{copy.email} *</span>
          <input
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            inputMode="email"
            name="email"
            placeholder="name@email.com"
            type="email"
          />
          {errors.email ? <small id="email-error">{errors.email}</small> : null}
        </label>
      </div>
      <label>
        <span>{copy.subject} *</span>
        <select
          aria-describedby={errors.subject ? "subject-error" : undefined}
          aria-invalid={Boolean(errors.subject)}
          defaultValue={productSubject}
          name="subject"
        >
          <option disabled value="">{copy.chooseSubject}</option>
          {productSubject ? (
            <option value={productSubject}>{productSubject}</option>
          ) : null}
          {copy.subjects.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        {errors.subject ? (
          <small id="subject-error">{errors.subject}</small>
        ) : null}
      </label>
      <label>
        <span>{copy.message} *</span>
        <textarea
          aria-describedby={errors.message ? "message-error" : undefined}
          aria-invalid={Boolean(errors.message)}
          name="message"
          placeholder={copy.messagePlaceholder}
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
        <span>{copy.privacy}</span>
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
          {state === "sending" ? copy.sending : copy.send}
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
