import {ArrowUpRight} from "lucide-react";
import type {SiteCopy} from "@/lib/content/types";
import {TransitionLink} from "@/components/transitions/TransitionLink";
import {SectionReveal} from "@/components/ui/SectionReveal";
import {brand} from "@/lib/brand";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";
import {publicPath} from "@/lib/i18n/routing";

export function HomeStory({copy, locale}: {copy: SiteCopy; locale: Locale}) {
  const messages = getMessages(locale);

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
          <TransitionLink
            className="text-link"
            href={publicPath(locale, "story")}
          >
            {messages.home.storyLink}{" "}
            <ArrowUpRight aria-hidden="true" size={17} />
          </TransitionLink>
        </div>
      </SectionReveal>
      <div className="values-strip">
        {messages.home.values.map((value, index) => (
          <span key={value}>
            {String(index + 1).padStart(2, "0")} · {value}
          </span>
        ))}
      </div>
    </section>
  );
}
