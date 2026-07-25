# Bertello Basso

Sito pubblico e gestionale per una piccola azienda agricola a San Damiano di
Todi, in Umbria. Il progetto
usa Next.js App Router, TypeScript, GSAP, WebGL e un repository contenuti
sostituibile con Supabase.

## Avvio

Richiede Node.js 22.

```bash
npm install
npm run dev
```

- Sito pubblico italiano: `http://localhost:3000`
- Sito pubblico inglese: `http://localhost:3000/en`
- Fotografie: `http://localhost:3000/fotografie`
- Photography: `http://localhost:3000/en/photography`
- Gestionale: `http://localhost:3000/admin`

Senza variabili ambiente i contenuti pubblici restano disponibili tramite il
fallback statico. Prodotti, pagine e impostazioni del gestionale possono essere
provati in modalità demo e vengono salvati nel `localStorage` del browser;
media e gallerie richiedono invece Supabase Storage.

Il sito mantiene l’italiano sugli URL principali e usa percorsi inglesi
indicizzabili (`/en/products`, `/en/photography`, `/en/story`, `/en/contact`).
Il selettore lingua conserva la pagina corrente, comprese schede prodotto e
singole gallerie.

## Collegare Supabase

1. Crea un progetto Supabase.
2. Applica, nell’ordine, tutti i file in `supabase/migrations`. In particolare:
   - `202607240003_photography_galleries.sql` aggiunge gallerie, fotografie e
     il bucket privato `gallery-photos`;
   - `202607250001_complete_cms.sql` aggiunge CMS, bozze, media, RPC, RLS e il
     bucket privato `cms-media`.
3. Copia `.env.example` in `.env.local` e completa le tre variabili Supabase.
4. Crea un utente in Supabase Auth.
5. Inserisci il profilo amministratore usando l’UUID dell’utente:

```sql
insert into public.profiles (id, full_name, role)
values ('UUID_UTENTE_AUTH', 'Nome amministratore', 'admin');
```

La service role viene usata esclusivamente nella route server del form contatti
e non viene mai inviata al browser.

La chiave facoltativa `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` abilita ricerca Places
nel gestionale e mappa nella pagina pubblica. Senza chiave restano disponibili
inserimento manuale e link “Apri in Google Maps”.

Il gestionale controlla il ruolo `admin` sul server e nuovamente nelle policy
RLS. Una sessione Supabase valida senza quel ruolo viene reindirizzata
all’accesso. Le bozze e i bucket restano privati; il sito pubblico riceve
soltanto contenuti pubblicati e URL firmati a scadenza.

## CMS

Il pannello `/admin` comprende:

- `Prodotti`: CRUD, formati e prezzi opzionali, immagini, bozze, pubblicazione,
  archivio, duplicazione e riordino;
- `Pagine`: pagine di sistema e personalizzate, blocchi visuali IT/EN,
  anteprima privata e pubblicazione;
- `Fotografie`: gallerie, posizione, copertina e ordinamento;
- `Media`: upload e conversione WebP, testi alternativi e archivio;
- `Impostazioni`: contatti, footer, SEO e navigazione.

Le modifiche alle bozze non cambiano il sito online. I contenuti correnti sono
inclusi come fallback e come dati iniziali della migrazione, quindi il rollout
non altera automaticamente testi o prodotti già visibili.

## Struttura

- `src/lib/cms`: contratti, validazione, fallback, repository e servizi CMS.
- `src/lib/content`: compatibilità con prodotti e contenuti pubblici esistenti.
- `src/lib/galleries`: contratti, localizzazione, Storage e servizi pubblico/admin.
- `src/lib/media`: elaborazione immagini condivisa.
- `src/lib/i18n`: dizionario UI, routing localizzato e metadata alternati.
- `src/components/admin`: back-office e relativo data provider.
- `src/components/cms`: renderer condiviso tra sito e anteprima admin.
- `src/components/transitions`: transizioni centralizzate con GSAP.
- `src/components/visual`: reveal WebGL a maschera acquerello.
- `supabase/migrations`: schema incrementale, indici e policy RLS.

Non vengono inserite gallerie o fotografie dimostrative: la sezione mostra lo
stato vuoto finché un amministratore non pubblica la prima galleria reale.
