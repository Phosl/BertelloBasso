import type {Metadata} from "next";
import {Clock3, Mail, MapPin} from "lucide-react";
import {ContactForm} from "@/components/forms/ContactForm";
import {getSiteCopy} from "@/lib/content/repository";
import {brand} from "@/lib/brand";

export const metadata: Metadata = {
  title: "Visite e contatti",
  description:
    `Contatta ${brand.name} per prodotti, rivendita e visite a ${brand.location}.`,
};

export default async function ContactPage() {
  const copy = await getSiteCopy();

  return (
    <div className="contact-page">
      <header className="page-intro">
        <div>
          <p className="eyebrow">Visite & contatti</p>
          <h1>Passate<br />a trovarci.</h1>
        </div>
        <p>
          Le visite si fanno su appuntamento, perché qui il lavoro nei campi
          viene prima. Scriveteci e troviamo il momento giusto.
        </p>
      </header>
      <div className="contact-layout">
        <aside>
          <div>
            <MapPin aria-hidden="true" size={19} />
            <p className="eyebrow">Dove siamo</p>
            <strong>{brand.location}</strong>
            <span>Umbria, Italia</span>
            <small>Le indicazioni precise vengono inviate alla conferma.</small>
          </div>
          <div>
            <Clock3 aria-hidden="true" size={19} />
            <p className="eyebrow">Visite</p>
            <strong>Solo su appuntamento</strong>
            <span>Da aprile a ottobre</span>
          </div>
          <div>
            <Mail aria-hidden="true" size={19} />
            <p className="eyebrow">Contatti</p>
            <a href={`mailto:${copy.contactEmail}`}>{copy.contactEmail}</a>
            <a href={`tel:${copy.contactPhone.replaceAll(" ", "")}`}>
              {copy.contactPhone}
            </a>
          </div>
        </aside>
        <ContactForm />
      </div>
    </div>
  );
}
