# Pian della Carlotta

Sito pubblico e gestionale per una piccola azienda agricola umbra. Il progetto
usa Next.js App Router, TypeScript, GSAP, WebGL e un repository contenuti
sostituibile con Supabase.

## Avvio

```bash
npm install
npm run dev
```

- Sito pubblico: `http://localhost:3000`
- Gestionale: `http://localhost:3000/admin`

Senza variabili ambiente il gestionale funziona in modalità demo e salva nel
`localStorage` del browser.

## Collegare Supabase

1. Crea un progetto Supabase.
2. Applica, nell’ordine, i file in `supabase/migrations`.
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
- `src/components/admin`: back-office e relativo data provider.
- `src/components/transitions`: transizioni centralizzate con GSAP.
- `src/components/visual`: reveal WebGL a maschera acquerello.
- `supabase/migrations`: schema incrementale, indici e policy RLS.

Le fotografie generate sono materiale prototipale e andranno sostituite con gli
scatti reali dell’azienda prima della pubblicazione definitiva.
