import {ArrowDown, ArrowUpRight} from "lucide-react";
import type {SiteCopy} from "@/lib/content/types";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {WatercolorReveal} from "@/components/visual/WatercolorReveal";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";
import {publicPath} from "@/lib/i18n/routing";

export function HomeHero({copy, locale}: {copy: SiteCopy; locale: Locale}) {
  const messages = getMessages(locale);

  return (
    <section className="home-hero">
      <div className="home-hero__copy">
        <p className="eyebrow">{copy.heroKicker}</p>
        <h1>{copy.heroTitle}</h1>
        <div className="home-hero__intro">
          <p>{copy.heroBody}</p>
          <TransitionLink
            className="round-link"
            href={publicPath(locale, "products")}
          >
            <span>{messages.home.discoverProducts}</span>
            <ArrowUpRight aria-hidden="true" size={18} />
          </TransitionLink>
        </div>
      </div>
      <WatercolorReveal
        alt={messages.home.imageAlt}
        src="/images/umbrian-estate-hero.png"
      />
      <div aria-hidden="true" className="home-hero__caption">
        <span>42.78° N</span>
        <span>{messages.home.scroll}</span>
        <ArrowDown size={15} />
      </div>
    </section>
  );
}
