import {ArrowUpRight} from "lucide-react";
import type {SiteCopy} from "@/lib/content/types";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {SectionReveal} from "@/components/ui/SectionReveal";
import {brand} from "@/lib/brand";

export function HomeStory({copy}: {copy: SiteCopy}) {
  return (
    <section className="home-story">
      <SectionReveal className="home-story__grid">
        <div className="home-story__mark" aria-hidden="true">
          <span>B</span>
          <i />
          <span>B</span>
        </div>
        <div>
          <p className="eyebrow">{brand.name} · {brand.location}</p>
          <h2>{copy.storyTitle}</h2>
          <p className="home-story__body">{copy.storyBody}</p>
          <TransitionLink className="text-link" href="/storia">
            La nostra storia <ArrowUpRight aria-hidden="true" size={17} />
          </TransitionLink>
        </div>
      </SectionReveal>
      <div className="values-strip">
        <span>01 · Piccole quantità</span>
        <span>02 · Ingredienti riconoscibili</span>
        <span>03 · Filiera vicina</span>
        <span>04 · Stagioni vere</span>
      </div>
    </section>
  );
}
