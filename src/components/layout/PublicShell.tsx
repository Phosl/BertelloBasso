import type {ReactNode} from "react";
import type {Locale} from "@/lib/i18n/config";
import {
  getPublishedCmsPages,
  getPublishedCmsSettings,
} from "@/lib/cms/repository";
import {SiteFooter} from "./SiteFooter";
import {SiteHeader} from "./SiteHeader";

export async function PublicShell({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const [pages, settings] = await Promise.all([
    getPublishedCmsPages(),
    getPublishedCmsSettings(),
  ]);
  return (
    <>
      <SiteHeader
        locale={locale}
        navigation={settings.published.navigation}
        pages={pages}
      />
      <main id="main-content">{children}</main>
      <SiteFooter
        locale={locale}
        navigation={settings.published.navigation}
        pages={pages}
        settings={settings.published}
      />
    </>
  );
}
