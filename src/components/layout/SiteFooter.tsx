import {ArrowUpRight} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {brand} from "@/lib/brand";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";
import {publicPath} from "@/lib/i18n/routing";
import {cmsPageHref} from "@/lib/cms/routing";
import {localizeText} from "@/lib/cms/localize";
import type {
  CmsPage,
  CmsSiteSettingsContent,
  NavigationEntry,
} from "@/lib/cms/types";

export function SiteFooter({
  locale,
  navigation,
  pages,
  settings,
}: {
  locale: Locale;
  navigation: NavigationEntry[];
  pages: CmsPage[];
  settings: CmsSiteSettingsContent;
}) {
  const copy = getMessages(locale);
  const footerLinks = navigation
    .filter((entry) => entry.showFooter)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((entry) => {
      const page = pages.find((item) => item.id === entry.pageId);
      return page
        ? [{
            href: cmsPageHref(page, locale),
            label: localizeText(entry.label, locale),
          }]
        : [];
    });

  return (
    <footer className="site-footer">
      <div className="site-footer__lead">
        <p className="eyebrow">{localizeText(settings.footerKicker, locale)}</p>
        <h2 className="i18n-lines">{localizeText(settings.footerTitle, locale)}</h2>
        <TransitionLink
          className="text-link"
          href={publicPath(locale, "contact")}
        >
          {copy.footer.visit} <ArrowUpRight aria-hidden="true" size={17} />
        </TransitionLink>
      </div>
      <div className="site-footer__grid">
        <div>
          <strong>{brand.name}</strong>
          <span>{copy.footer.farm}</span>
          <span>
            {brand.location} · {copy.contact.country}
          </span>
        </div>
        <div>
          {footerLinks.map((link) => (
            <TransitionLink href={link.href} key={link.href}>
              {link.label}
            </TransitionLink>
          ))}
        </div>
        <div>
          <a href={`mailto:${settings.email}`}>
            {settings.email}
          </a>
          {settings.instagramUrl ? (
            <a
              href={settings.instagramUrl}
              rel="noreferrer"
              target="_blank"
            >
              Instagram
            </a>
          ) : null}
          <TransitionLink href="/admin">{copy.footer.reserved}</TransitionLink>
        </div>
      </div>
      <div className="site-footer__legal">
        <span>© {new Date().getFullYear()} {brand.name}</span>
        <span>{localizeText(settings.footerSignature, locale)}</span>
      </div>
    </footer>
  );
}
