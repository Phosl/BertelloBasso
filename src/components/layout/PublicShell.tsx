import type {ReactNode} from "react";
import type {Locale} from "@/lib/i18n/config";
import {SiteFooter} from "./SiteFooter";
import {SiteHeader} from "./SiteHeader";

export function PublicShell({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main-content">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
