import type {Metadata} from "next";
import {ArrowDownRight, Sprout, SunMedium, Waves} from "lucide-react";
import {SectionReveal} from "@/components/ui/SectionReveal";
import {getSiteCopy} from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "La nostra storia",
  description:
    "Una piccola azienda agricola di famiglia sulle colline umbre vicino Todi.",
};

export default async function StoryPage() {
  const copy = await getSiteCopy();

  return (
    <div className="story-page">
      <header className="story-hero">
        <p className="eyebrow">La nostra storia</p>
        <h1>Non siamo nati<br />per fare tutto.</h1>
        <p>
          Siamo nati per fare poche cose, seguirle da vicino e riconoscere ogni
          stagione dentro quello che produciamo.
        </p>
        <ArrowDownRight aria-hidden="true" size={36} />
      </header>
      <SectionReveal className="story-manifesto">
        <span className="story-manifesto__number">01</span>
        <div>
          <p className="eyebrow">Pian della Carlotta</p>
          <h2>{copy.storyTitle}</h2>
          <p>{copy.storyBody}</p>
        </div>
      </SectionReveal>
      <section className="story-values">
        <SectionReveal>
          <Sprout aria-hidden="true" />
          <span>01</span>
          <h3>La terra detta la quantità.</h3>
          <p>
            Non forziamo la continuità: comunichiamo esauriti, attese e nuove
            annate con sincerità.
          </p>
        </SectionReveal>
        <SectionReveal>
          <SunMedium aria-hidden="true" />
          <span>02</span>
          <h3>Il tempo è un ingrediente.</h3>
          <p>
            Dalla maturazione all’essiccazione, ogni passaggio ha il proprio
            ritmo e non ammette scorciatoie.
          </p>
        </SectionReveal>
        <SectionReveal>
          <Waves aria-hidden="true" />
          <span>03</span>
          <h3>Curiosi, senza rumore.</h3>
          <p>
            Accanto all’olio nascono vini, distillati e ricette di dispensa:
            esperimenti con radici chiare.
          </p>
        </SectionReveal>
      </section>
      <section className="story-place">
        <div>
          <p className="eyebrow">Todi · Umbria</p>
          <h2>Nel centro d’Italia,<br />un po’ fuori strada.</h2>
        </div>
        <p>
          Colline, argilla, sole e notti fresche. Il paesaggio non è uno sfondo:
          entra nei profumi dell’olio, nel carattere del vino e nella scelta di
          restare piccoli.
        </p>
      </section>
    </div>
  );
}
