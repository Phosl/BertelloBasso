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

Senza variabili ambiente prodotti, contenuti e messaggi del gestionale
funzionano in modalità demo e salvano nel `localStorage` del browser. Il modulo
gallerie resta invece disabilitato: le fotografie richiedono Supabase Storage.

Il sito mantiene l’italiano sugli URL principali e usa percorsi inglesi
indicizzabili (`/en/products`, `/en/photography`, `/en/story`, `/en/contact`).
Il selettore lingua conserva la pagina corrente, comprese schede prodotto e
singole gallerie.

## Collegare Supabase

1. Crea un progetto Supabase.
2. Applica, nell’ordine, i file in `supabase/migrations`. La migrazione
   `202607240002_bilingual_content.sql` aggiunge le traduzioni inglesi e la
   relativa policy pubblica; `202607240003_photography_galleries.sql` aggiunge
   gallerie, fotografie, RPC, policy RLS e il bucket privato
   `gallery-photos`.
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

## Struttura

- `src/lib/content`: contratti, contenuti iniziali e repository pubblico.
- `src/lib/galleries`: contratti, localizzazione, Storage e servizi pubblico/admin.
- `src/lib/i18n`: dizionario UI, routing localizzato e metadata alternati.
- `src/components/admin`: back-office e relativo data provider.
- `src/components/transitions`: transizioni centralizzate con GSAP.
- `src/components/visual`: reveal WebGL a maschera acquerello.
- `supabase/migrations`: schema incrementale, indici e policy RLS.

Nel gestionale, “Contenuti sito” offre le schede Italiano/English; la modifica
prodotto contiene i campi editoriali per entrambe le lingue. Email e telefono
restano condivisi.

Non vengono inserite gallerie o fotografie dimostrative: la sezione mostra lo
stato vuoto finché un amministratore non pubblica la prima galleria reale.
