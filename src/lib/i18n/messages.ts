import type {Locale} from "./config";

export const messages = {
  it: {
    languageName: "Italiano",
    languageShort: "IT",
    otherLanguageName: "English",
    otherLanguageShort: "EN",
    skipToContent: "Vai al contenuto",
    navigation: {
      mainLabel: "Navigazione principale",
      mobileLabel: "Navigazione mobile",
      dialogLabel: "Menu di navigazione",
      openMenu: "Apri il menu",
      closeMenu: "Chiudi il menu",
      products: "Prodotti",
      photography: "Fotografie",
      story: "La nostra storia",
      contact: "Visite & contatti",
      reserved: "Area riservata",
      switchLanguage: "View the site in English",
    },
    home: {
      discoverProducts: "Scopri i prodotti",
      imageAlt: "Uliveto e casale sulle colline umbre vicino Todi",
      scroll: "Scorri",
      productsKicker: "Dai nostri campi",
      productsTitle: "Prodotti che sanno\nda dove vengono.",
      productsBody:
        "Coltiviamo e trasformiamo in piccole quantità. Ogni raccolto cambia, la cura resta la stessa.",
      storyLink: "La nostra storia",
      values: [
        "Piccole quantità",
        "Ingredienti riconoscibili",
        "Filiera vicina",
        "Stagioni vere",
      ],
    },
    products: {
      metadataTitle: "Prodotti",
      metadataDescription:
        "Olio, vini MITERA, Gintaglia e piccole produzioni della dispensa.",
      kicker: "La nostra dispensa",
      count: "prodotti",
      title: "Dalla terra\nalla tavola.",
      intro:
        "Lavoriamo in piccole serie e seguiamo la disponibilità reale dei raccolti. Alcune cose tornano ogni anno, altre arrivano quando sono pronte.",
      discover: "Scopri",
      allProducts: "Tutti i prodotti",
      formats: "Formati",
      priceSoon: "Prezzo in arrivo",
      askAvailability: "Chiedi disponibilità",
      status: {
        available: "Disponibile",
        coming_soon: "Coming soon",
        seasonal: "Stagionale",
      },
      detailStatus: {
        available: "Disponibile",
        coming_soon: "Coming soon",
        seasonal: "Disponibilità stagionale",
      },
      comingKicker: "La prima annata sta arrivando",
      comingBody:
        "L’etichetta è pronta, il vino si prende ancora il suo tempo. Scrivici per ricevere notizie sull’uscita.",
      packageLabel: "Confezione illustrata di",
      visual: {
        sauceTitle: "Salse",
        sauceSubtitle: "piccanti",
        tomato: "Pomodoro",
        seedsPolenta: "Semi & polenta",
        chips: "chips croccanti",
        country: "Umbria · Italia",
      },
    },
    photography: {
      metadataTitle: "Fotografie",
      metadataDescription:
        "Storie fotografiche dai campi, dalle stagioni e dalla vita di Bertello Basso a San Damiano di Todi.",
      kicker: "Diario fotografico",
      count: "gallerie",
      title: "La terra,\ncome la vediamo.",
      intro:
        "Raccolti, persone, giornate di lavoro e piccoli dettagli. Un archivio vivo della nostra casa in Umbria.",
      discover: "Apri la galleria",
      photoCount: "fotografie",
      back: "Tutte le fotografie",
      location: "Dove",
      openMaps: "Apri in Google Maps",
      emptyTitle: "La prima galleria sta arrivando.",
      emptyBody:
        "Stiamo scegliendo le fotografie. Torna presto per vedere la vita nei campi.",
      viewerLabel: "Apri la fotografia a schermo intero",
      mapUnavailable: "La mappa non è disponibile.",
    },
    story: {
      metadataTitle: "La nostra storia",
      metadataDescription:
        "Una piccola azienda agricola di famiglia sulle colline umbre vicino Todi.",
      kicker: "La nostra storia",
      title: "Non siamo nati\nper fare tutto.",
      intro:
        "Siamo nati per fare poche cose, seguirle da vicino e riconoscere ogni stagione dentro quello che produciamo.",
      values: [
        {
          title: "La terra detta la quantità.",
          body: "Non forziamo la continuità: comunichiamo esauriti, attese e nuove annate con sincerità.",
        },
        {
          title: "Il tempo è un ingrediente.",
          body: "Dalla maturazione all’essiccazione, ogni passaggio ha il proprio ritmo e non ammette scorciatoie.",
        },
        {
          title: "Curiosi, senza rumore.",
          body: "Accanto all’olio nascono vini, distillati e ricette di dispensa: esperimenti con radici chiare.",
        },
      ],
      placeTitle: "Nel centro d’Italia,\nun po’ fuori strada.",
      placeBody:
        "Colline, argilla, sole e notti fresche. Il paesaggio non è uno sfondo: entra nei profumi dell’olio, nel carattere del vino e nella scelta di restare piccoli.",
    },
    contact: {
      metadataTitle: "Visite e contatti",
      metadataDescription:
        "Contatta Bertello Basso per prodotti, rivendita e visite a San Damiano di Todi.",
      kicker: "Visite & contatti",
      title: "Passate\na trovarci.",
      intro:
        "Le visite si fanno su appuntamento, perché qui il lavoro nei campi viene prima. Scriveteci e troviamo il momento giusto.",
      where: "Dove siamo",
      country: "Umbria, Italia",
      directions: "Le indicazioni precise vengono inviate alla conferma.",
      visits: "Visite",
      appointment: "Solo su appuntamento",
      season: "Da aprile a ottobre",
      contacts: "Contatti",
    },
    form: {
      name: "Nome e cognome",
      namePlaceholder: "Come ti chiami?",
      email: "Email",
      subject: "Parliamo di",
      chooseSubject: "Scegli un argomento",
      subjects: [
        "Visita e degustazione",
        "Acquisto prodotti",
        "Rivenditori e ristorazione",
        "Altro",
      ],
      message: "Messaggio",
      messagePlaceholder: "Raccontaci come possiamo aiutarti…",
      privacy:
        "Acconsento al trattamento dei dati per ricevere risposta alla mia richiesta.",
      sending: "Invio in corso…",
      send: "Invia il messaggio",
      invalidNotice: "Controlla i campi evidenziati.",
      errorNotice:
        "Il messaggio non è partito. Riprova oppure scrivici via email.",
      successKicker: "Messaggio inviato",
      successTitle: "Ci sentiamo presto.",
      successNotice:
        "Grazie. Il tuo messaggio è stato affidato alla nostra dispensa.",
      sendAnother: "Invia un altro messaggio",
      validation: {
        name: "Inserisci il tuo nome.",
        email: "Inserisci un indirizzo email valido.",
        subject: "Scegli o scrivi un argomento.",
        message: "Scrivi almeno 10 caratteri.",
        privacy: "È necessario accettare l’informativa.",
      },
    },
    footer: {
      kicker: "Venite a trovarci",
      title: "Una strada bianca,\npoco fuori Todi.",
      visit: "Organizza una visita",
      farm: "Azienda agricola di famiglia",
      products: "Prodotti",
      photography: "Fotografie",
      story: "La nostra storia",
      contact: "Contatti",
      reserved: "Area riservata",
      instagramLabel: "Instagram, profilo da collegare",
      signature: "Fatto lentamente in Umbria",
    },
  },
  en: {
    languageName: "English",
    languageShort: "EN",
    otherLanguageName: "Italiano",
    otherLanguageShort: "IT",
    skipToContent: "Skip to content",
    navigation: {
      mainLabel: "Main navigation",
      mobileLabel: "Mobile navigation",
      dialogLabel: "Navigation menu",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      products: "Products",
      photography: "Photography",
      story: "Our story",
      contact: "Visits & contact",
      reserved: "Private area",
      switchLanguage: "Visualizza il sito in italiano",
    },
    home: {
      discoverProducts: "Discover our products",
      imageAlt: "Olive grove and farmhouse in the Umbrian hills near Todi",
      scroll: "Scroll",
      productsKicker: "From our fields",
      productsTitle: "Products that know\nwhere they come from.",
      productsBody:
        "We grow and make everything in small batches. Every harvest is different; the care we give it never changes.",
      storyLink: "Our story",
      values: [
        "Small batches",
        "Recognisable ingredients",
        "A short supply chain",
        "True seasons",
      ],
    },
    products: {
      metadataTitle: "Products",
      metadataDescription:
        "Olive oil, MITERA wines, Gintaglia and small-batch pantry specialties.",
      kicker: "From our pantry",
      count: "products",
      title: "From the land\nto the table.",
      intro:
        "We work in small batches, following the real availability of each harvest. Some things return every year; others arrive only when they are ready.",
      discover: "Discover",
      allProducts: "All products",
      formats: "Sizes",
      priceSoon: "Price coming soon",
      askAvailability: "Ask about availability",
      status: {
        available: "Available",
        coming_soon: "Coming soon",
        seasonal: "Seasonal",
      },
      detailStatus: {
        available: "Available",
        coming_soon: "Coming soon",
        seasonal: "Seasonal availability",
      },
      comingKicker: "The first vintage is on its way",
      comingBody:
        "The label is ready, while the wine is still taking its time. Write to us for news about its release.",
      packageLabel: "Illustrated packaging for",
      visual: {
        sauceTitle: "Hot",
        sauceSubtitle: "sauces",
        tomato: "Tomato",
        seedsPolenta: "Seeds & polenta",
        chips: "crisp chips",
        country: "Umbria · Italy",
      },
    },
    photography: {
      metadataTitle: "Photography",
      metadataDescription:
        "Photographic stories from the fields, seasons and daily life at Bertello Basso in San Damiano di Todi.",
      kicker: "Photographic journal",
      count: "galleries",
      title: "The land,\nas we see it.",
      intro:
        "Harvests, people, working days and small details. A living archive of our home in Umbria.",
      discover: "Open gallery",
      photoCount: "photographs",
      back: "All photography",
      location: "Where",
      openMaps: "Open in Google Maps",
      emptyTitle: "Our first gallery is coming.",
      emptyBody:
        "We are selecting the photographs. Come back soon to see life in the fields.",
      viewerLabel: "Open photograph full screen",
      mapUnavailable: "The map is unavailable.",
    },
    story: {
      metadataTitle: "Our story",
      metadataDescription:
        "A small family farm in the Umbrian hills near Todi.",
      kicker: "Our story",
      title: "We were not made\nto do everything.",
      intro:
        "We are here to make a few things, follow them closely and recognise each season in everything we produce.",
      values: [
        {
          title: "The land decides the quantity.",
          body: "We do not force continuity: we talk honestly about sold-out batches, waiting times and new vintages.",
        },
        {
          title: "Time is an ingredient.",
          body: "From ripening to drying, every stage has its own pace and allows no shortcuts.",
        },
        {
          title: "Curious, without the noise.",
          body: "Alongside our olive oil come wines, spirits and pantry recipes: experiments with clear roots.",
        },
      ],
      placeTitle: "In the heart of Italy,\na little off the road.",
      placeBody:
        "Hills, clay, sunshine and cool nights. The landscape is not a backdrop: it finds its way into the scent of the oil, the character of the wine and our choice to stay small.",
    },
    contact: {
      metadataTitle: "Visits and contact",
      metadataDescription:
        "Contact Bertello Basso about products, retail and visits in San Damiano di Todi.",
      kicker: "Visits & contact",
      title: "Come\nand see us.",
      intro:
        "Visits are by appointment, because work in the fields comes first here. Write to us and we will find the right time.",
      where: "Where we are",
      country: "Umbria, Italy",
      directions: "Detailed directions are sent with your confirmation.",
      visits: "Visits",
      appointment: "By appointment only",
      season: "April to October",
      contacts: "Contact",
    },
    form: {
      name: "Full name",
      namePlaceholder: "What is your name?",
      email: "Email",
      subject: "What can we help with?",
      chooseSubject: "Choose a subject",
      subjects: [
        "Visit and tasting",
        "Buying products",
        "Retail and hospitality",
        "Other",
      ],
      message: "Message",
      messagePlaceholder: "Tell us how we can help…",
      privacy:
        "I consent to the processing of my data so that I can receive a reply.",
      sending: "Sending…",
      send: "Send message",
      invalidNotice: "Check the highlighted fields.",
      errorNotice:
        "Your message could not be sent. Try again or contact us by email.",
      successKicker: "Message sent",
      successTitle: "We will be in touch soon.",
      successNotice: "Thank you. Your message has reached our pantry.",
      sendAnother: "Send another message",
      validation: {
        name: "Enter your name.",
        email: "Enter a valid email address.",
        subject: "Choose or enter a subject.",
        message: "Write at least 10 characters.",
        privacy: "You need to accept the privacy notice.",
      },
    },
    footer: {
      kicker: "Come and see us",
      title: "A country road,\njust outside Todi.",
      visit: "Plan a visit",
      farm: "A family farm",
      products: "Products",
      photography: "Photography",
      story: "Our story",
      contact: "Contact",
      reserved: "Private area",
      instagramLabel: "Instagram, profile to be linked",
      signature: "Made slowly in Umbria",
    },
  },
} as const satisfies Record<Locale, object>;

export function getMessages(locale: Locale) {
  return messages[locale];
}
