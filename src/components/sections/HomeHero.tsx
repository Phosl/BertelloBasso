import {ArrowDown, ArrowUpRight} from "lucide-react";
import type {SiteCopy} from "@/lib/content/types";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {WatercolorReveal} from "@/components/visual/WatercolorReveal";

export function HomeHero({copy}: {copy: SiteCopy}) {
  return (
    <section className="home-hero">
      <div className="home-hero__copy">
        <p className="eyebrow">{copy.heroKicker}</p>
        <h1>{copy.heroTitle}</h1>
        <div className="home-hero__intro">
          <p>{copy.heroBody}</p>
          <TransitionLink className="round-link" href="/prodotti">
            <span>Scopri i prodotti</span>
            <ArrowUpRight aria-hidden="true" size={18} />
          </TransitionLink>
        </div>
      </div>
      <WatercolorReveal
        alt="Uliveto e casale sulle colline umbre vicino Todi"
        src="/images/umbrian-estate-hero.png"
      />
      <div aria-hidden="true" className="home-hero__caption">
        <span>42.78° N</span>
        <span>Scroll</span>
        <ArrowDown size={15} />
      </div>
    </section>
  );
}
