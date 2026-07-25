type DatabaseError = {
  code?: string;
  message?: string;
  details?: string | null;
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
    /gallery_not_publishable|published_gallery_requires_valid_cover/.test(
      error?.message ?? "",
    )
  ) {
    return "Prima di pubblicare servono titolo, località, almeno una fotografia e una copertina.";
  }
  return "Non è stato possibile completare l’operazione. Riprova.";
}
