import {Clock3, Mail, MapPin} from "lucide-react";
import {ContactForm} from "@/components/forms/ContactForm";
import {getSiteCopy} from "@/lib/content/repository";
import {brand} from "@/lib/brand";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";

export async function ContactPageView({locale}: {locale: Locale}) {
  const copy = await getSiteCopy(locale);
  const messages = getMessages(locale).contact;

  return (
    <div className="contact-page">
      <header className="page-intro">
        <div>
          <p className="eyebrow">{messages.kicker}</p>
          <h1 className="i18n-lines">{messages.title}</h1>
        </div>
        <p>{messages.intro}</p>
      </header>
      <div className="contact-layout">
        <aside>
          <div>
            <MapPin aria-hidden="true" size={19} />
            <p className="eyebrow">{messages.where}</p>
            <strong>{brand.location}</strong>
            <span>{messages.country}</span>
            <small>{messages.directions}</small>
          </div>
          <div>
            <Clock3 aria-hidden="true" size={19} />
            <p className="eyebrow">{messages.visits}</p>
            <strong>{messages.appointment}</strong>
            <span>{messages.season}</span>
          </div>
          <div>
            <Mail aria-hidden="true" size={19} />
            <p className="eyebrow">{messages.contacts}</p>
            <a href={`mailto:${copy.contactEmail}`}>{copy.contactEmail}</a>
            <a href={`tel:${copy.contactPhone.replaceAll(" ", "")}`}>
              {copy.contactPhone}
            </a>
          </div>
        </aside>
        <ContactForm locale={locale} />
      </div>
    </div>
  );
}
