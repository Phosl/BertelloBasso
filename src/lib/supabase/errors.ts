type DatabaseError = {
  code?: string;
  message?: string;
  details?: string | null;
  status?: number;
};

const missingSchemaCodes = new Set([
  "42P01",
  "42703",
  "42883",
  "PGRST200",
  "PGRST202",
  "PGRST204",
  "PGRST205",
]);

export function isMissingSchemaError(
  error: DatabaseError | null | undefined,
) {
  if (!error) return false;
  if (error.code && missingSchemaCodes.has(error.code)) return true;
  const message = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return /schema cache|does not exist|could not find (the )?(table|function|column)/.test(
    message,
  );
}

export function getAdminErrorMessage(
  error: DatabaseError | null | undefined,
) {
  if (error?.message === "SUPABASE_NOT_CONFIGURED") {
    return "Collega Supabase nelle variabili ambiente per usare le gallerie fotografiche.";
  }
  if (isMissingSchemaError(error)) {
    return "La funzione richiede lo schema Supabase aggiornato. Applica la migrazione prevista e ricarica la pagina.";
  }
  if (/bucket.*not found/i.test(error?.message ?? "")) {
    return "L’archivio fotografie non è ancora disponibile. Applica la migrazione Supabase delle gallerie e ricarica la pagina.";
  }
  if (error?.code === "42501") {
    return "Non hai i permessi necessari per questa operazione. Verifica il ruolo amministratore.";
  }
  if (
    error?.code === "23514" ||
    /gallery_not_publishable|published_gallery_requires_valid_cover|cms_product_not_publishable|cms_page_not_publishable|cms_locked_section_missing/.test(
      error?.message ?? "",
    )
  ) {
    if (/cms_product/.test(error?.message ?? "")) {
      return "Prima di pubblicare completa nome, descrizione e almeno un formato.";
    }
    if (/cms_page|cms_locked/.test(error?.message ?? "")) {
      return "Prima di pubblicare completa il titolo e lascia visibile almeno una sezione obbligatoria.";
    }
    return "Prima di pubblicare servono titolo, località, almeno una foto o un video e una copertina.";
  }
  if (error?.message === "PRODUCT_MEDIA_LIMIT") {
    return "Puoi collegare al massimo 12 fotografie a un prodotto.";
  }
  return "Non è stato possibile completare l’operazione. Riprova.";
}

export function getAdminLoginErrorMessage(
  error: DatabaseError | null | undefined,
) {
  const code = error?.code?.toLowerCase();
  const message = error?.message?.toLowerCase() ?? "";

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials")
  ) {
    return "Email o password non corretti. Controlla i dati e riprova.";
  }
  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "L’indirizzo email non è ancora confermato. Apri il messaggio ricevuto da Supabase e conferma l’account.";
  }
  if (
    error?.status === 429 ||
    code === "over_request_rate_limit" ||
    message.includes("too many requests")
  ) {
    return "Sono stati fatti troppi tentativi. Attendi qualche minuto e riprova.";
  }
  if (
    message.includes("failed to fetch") ||
    message.includes("network")
  ) {
    return "Connessione non disponibile. Controlla internet e riprova.";
  }
  return "Non è stato possibile accedere. Riprova tra poco.";
}

export function getAdminAccessReasonMessage(reason?: string) {
  if (reason === "forbidden") {
    return "L’account è valido, ma non è abilitato come amministratore.";
  }
  if (reason === "profile-error") {
    return "Non è stato possibile verificare il profilo amministratore. Riprova tra poco.";
  }
  if (reason === "signed-out") {
    return "La sessione è scaduta. Accedi di nuovo.";
  }
  return "";
}
