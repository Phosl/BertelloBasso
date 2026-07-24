import {ArrowUpRight} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {brand} from "@/lib/brand";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";
import {publicPath} from "@/lib/i18n/routing";

export function SiteFooter({locale}: {locale: Locale}) {
  const copy = getMessages(locale);

  return (
    <footer className="site-footer">
      <div className="site-footer__lead">
        <p className="eyebrow">{copy.footer.kicker}</p>
        <h2 className="i18n-lines">{copy.footer.title}</h2>
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
          <TransitionLink href={publicPath(locale, "products")}>
            {copy.footer.products}
          </TransitionLink>
          <TransitionLink href={publicPath(locale, "story")}>
            {copy.footer.story}
          </TransitionLink>
          <TransitionLink href={publicPath(locale, "contact")}>
            {copy.footer.contact}
          </TransitionLink>
        </div>
        <div>
          <a href={`mailto:${brand.email}`}>
            {brand.email}
          </a>
          <a href="#" aria-label={copy.footer.instagramLabel}>
            Instagram
          </a>
          <TransitionLink href="/admin">{copy.footer.reserved}</TransitionLink>
        </div>
      </div>
      <div className="site-footer__legal">
        <span>© {new Date().getFullYear()} {brand.name}</span>
        <span>{copy.footer.signature}</span>
      </div>
    </footer>
  );
}
