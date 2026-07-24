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
- Gestionale: `http://localhost:3000/admin`

Senza variabili ambiente il gestionale funziona in modalità demo e salva nel
`localStorage` del browser.

Il sito mantiene l’italiano sugli URL principali e usa percorsi inglesi
indicizzabili (`/en/products`, `/en/story`, `/en/contact`). Il selettore lingua
conserva la pagina corrente, comprese le schede prodotto.

## Collegare Supabase

1. Crea un progetto Supabase.
2. Applica, nell’ordine, i file in `supabase/migrations`. La migrazione
   `202607240002_bilingual_content.sql` aggiunge le traduzioni inglesi e la
   relativa policy pubblica.
3. Copia `.env.example` in `.env.local` e completa le tre variabili.
4. Crea un utente in Supabase Auth.
5. Inserisci il profilo amministratore usando l’UUID dell’utente:

```sql
insert into public.profiles (id, full_name, role)
values ('UUID_UTENTE_AUTH', 'Nome amministratore', 'admin');
```

La service role viene usata esclusivamente nella route server del form contatti
e non viene mai inviata al browser.

## Struttura

- `src/lib/content`: contratti, contenuti iniziali e repository pubblico.
- `src/lib/i18n`: dizionario UI, routing localizzato e metadata alternati.
- `src/components/admin`: back-office e relativo data provider.
- `src/components/transitions`: transizioni centralizzate con GSAP.
- `src/components/visual`: reveal WebGL a maschera acquerello.
- `supabase/migrations`: schema incrementale, indici e policy RLS.

Nel gestionale, “Contenuti sito” offre le schede Italiano/English; la modifica
prodotto contiene i campi editoriali per entrambe le lingue. Email e telefono
restano condivisi.

Le fotografie generate sono materiale prototipale e andranno sostituite con gli
scatti reali dell’azienda prima della pubblicazione definitiva.
