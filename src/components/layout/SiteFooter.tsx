import {ArrowUpRight} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__lead">
        <p className="eyebrow">Venite a trovarci</p>
        <h2>Una strada bianca,<br />poco fuori Todi.</h2>
        <TransitionLink className="text-link" href="/contatti">
          Organizza una visita <ArrowUpRight aria-hidden="true" size={17} />
        </TransitionLink>
      </div>
      <div className="site-footer__grid">
        <div>
          <strong>Pian della Carlotta</strong>
          <span>Azienda agricola di famiglia</span>
          <span>Umbria, Italia</span>
        </div>
        <div>
          <TransitionLink href="/prodotti">Prodotti</TransitionLink>
          <TransitionLink href="/storia">La nostra storia</TransitionLink>
          <TransitionLink href="/contatti">Contatti</TransitionLink>
        </div>
        <div>
          <a href="mailto:ciao@piandellacarlotta.it">
            ciao@piandellacarlotta.it
          </a>
          <a href="#" aria-label="Instagram, profilo da collegare">
            Instagram
          </a>
          <TransitionLink href="/admin">Area riservata</TransitionLink>
        </div>
      </div>
      <div className="site-footer__legal">
        <span>© {new Date().getFullYear()} Pian della Carlotta</span>
        <span>Made slowly in Umbria</span>
      </div>
    </footer>
  );
}
