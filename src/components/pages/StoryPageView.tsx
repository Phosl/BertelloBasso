import {ArrowDownRight, Sprout, SunMedium, Waves} from "lucide-react";
import {SectionReveal} from "@/components/ui/SectionReveal";
import {getSiteCopy} from "@/lib/content/repository";
import {brand} from "@/lib/brand";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";

const valueIcons = [Sprout, SunMedium, Waves];

export async function StoryPageView({locale}: {locale: Locale}) {
  const copy = await getSiteCopy(locale);
  const messages = getMessages(locale).story;

  return (
    <div className="story-page">
      <header className="story-hero">
        <p className="eyebrow">{messages.kicker}</p>
        <h1 className="i18n-lines">{messages.title}</h1>
        <p>{messages.intro}</p>
        <ArrowDownRight aria-hidden="true" size={36} />
      </header>
      <SectionReveal className="story-manifesto">
        <span className="story-manifesto__number">01</span>
        <div>
          <p className="eyebrow">{brand.name}</p>
          <h2>{copy.storyTitle}</h2>
          <p>{copy.storyBody}</p>
        </div>
      </SectionReveal>
      <section className="story-values">
        {messages.values.map((value, index) => {
          const Icon = valueIcons[index];
          return (
            <SectionReveal key={value.title}>
              <Icon aria-hidden="true" />
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </SectionReveal>
          );
        })}
      </section>
      <section className="story-place">
        <div>
          <p className="eyebrow">{brand.location} · Umbria</p>
          <h2 className="i18n-lines">{messages.placeTitle}</h2>
        </div>
        <p>{messages.placeBody}</p>
      </section>
    </div>
  );
}
