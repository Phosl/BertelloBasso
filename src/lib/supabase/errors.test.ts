import {describe, expect, it} from "vitest";
import {
  getAdminAccessReasonMessage,
  getAdminErrorMessage,
  getAdminLoginErrorMessage,
  isMissingSchemaError,
} from "./errors";

describe("Supabase gallery rollout errors", () => {
  it("recognises a missing table by structured code", () => {
    expect(isMissingSchemaError({code: "PGRST205"})).toBe(true);
  });

  it("gives the administrator a migration action", () => {
    expect(getAdminErrorMessage({code: "42P01"})).toContain(
      "Applica la migrazione",
    );
  });

  it("does not describe insufficient permissions as missing schema", () => {
    expect(isMissingSchemaError({code: "42501"})).toBe(false);
    expect(getAdminErrorMessage({code: "42501"})).toContain("permessi");
  });

  it("distinguishes invalid credentials from a missing admin role", () => {
    expect(
      getAdminLoginErrorMessage({code: "invalid_credentials"}),
    ).toContain("Email o password");
    expect(getAdminAccessReasonMessage("forbidden")).toContain(
      "amministratore",
    );
  });
});
