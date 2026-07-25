/* eslint-disable @next/next/no-img-element -- CMS hero images use expiring signed URLs. */

import {ArrowDown, ArrowUpRight} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {WatercolorReveal} from "@/components/visual/WatercolorReveal";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";

type HomeHeroProps = {
  actionHref: string;
  actionLabel: string;
  body: string;
  imageAlt: string;
  imageSrc: string;
  kicker: string;
  locale: Locale;
  title: string;
  watercolor: boolean;
};

export function HomeHero({
  actionHref,
  actionLabel,
  body,
  imageAlt,
  imageSrc,
  kicker,
  locale,
  title,
  watercolor,
}: HomeHeroProps) {
  const messages = getMessages(locale);

  return (
    <section aria-labelledby="home-hero-title" className="home-hero">
      <div className="home-hero__media">
        {watercolor ? (
          <WatercolorReveal alt={imageAlt} src={imageSrc} />
        ) : (
          <img
            alt={imageAlt}
            fetchPriority="high"
            loading="eager"
            src={imageSrc}
          />
        )}
      </div>
      <div className="home-hero__copy">
        <p className="eyebrow">{kicker}</p>
        <h1 className="i18n-lines" id="home-hero-title">{title}</h1>
        <div className="home-hero__intro">
          <p>{body}</p>
          {actionLabel && actionHref ? (
            <TransitionLink className="round-link" href={actionHref}>
              <span>{actionLabel}</span>
              <ArrowUpRight aria-hidden="true" size={18} />
            </TransitionLink>
          ) : null}
        </div>
      </div>
      <div aria-hidden="true" className="home-hero__caption">
        <span>San Damiano · Todi</span>
        <span>{messages.home.scroll}</span>
        <ArrowDown size={15} />
      </div>
    </section>
  );
}
