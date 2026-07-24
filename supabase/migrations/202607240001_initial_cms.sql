begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('editor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  eyebrow text not null default '',
  description text not null default '',
  category text not null check (category in ('olio', 'vino', 'distillati', 'dispensa')),
  status text not null check (status in ('available', 'coming_soon', 'seasonal')),
  formats jsonb not null default '[]'::jsonb check (jsonb_typeof(formats) = 'array'),
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  visual text not null check (
    visual in ('oil', 'white-wine', 'red-wine', 'gin', 'sauce', 'tomato-chips', 'polenta-chips')
  ),
  accent text not null default '#8d8a3f',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create index products_public_order_idx
  on public.products (published, sort_order);

create index inquiries_status_created_idx
  on public.inquiries (status, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.inquiries enable row level security;

create policy "profiles read own"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "admins manage profiles"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public reads published products"
on public.products for select
to anon, authenticated
using (published = true or public.is_admin());

create policy "admins manage products"
on public.products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public reads site copy"
on public.site_settings for select
to anon, authenticated
using (key = 'site_copy' or public.is_admin());

create policy "admins manage site settings"
on public.site_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins read inquiries"
on public.inquiries for select
to authenticated
using (public.is_admin());

create policy "admins update inquiries"
on public.inquiries for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.products
  (id, slug, name, eyebrow, description, category, status, formats, featured, published, sort_order, visual, accent)
values
  (
    'olio-evo',
    'olio-extra-vergine',
    'Olio Extra Vergine',
    'Raccolto di famiglia',
    'Olio umbro nitido e fragrante, ottenuto dalle olive raccolte nei nostri campi e molite a poche ore dalla raccolta.',
    'olio',
    'available',
    '[{"label":"100 ml","price":7},{"label":"250 ml","price":13},{"label":"500 ml","price":21}]'::jsonb,
    true,
    true,
    1,
    'oil',
    '#8d8a3f'
  ),
  (
    'mitera-bianco',
    'mitera-grechetto',
    'MITERA',
    'Grechetto · Umbria IGT',
    'Un bianco nato dalle nostre colline: luminoso, materico, con la freschezza quieta del paesaggio intorno a Todi.',
    'vino',
    'coming_soon',
    '[{"label":"750 ml"}]'::jsonb,
    true,
    true,
    2,
    'white-wine',
    '#b8a56e'
  ),
  (
    'mitera-rosso',
    'mitera-rosso',
    'MITERA rosso',
    'Rosso umbro',
    'Profondo e gastronomico, custodisce la parte più calda della nostra terra. La prima annata sta riposando.',
    'vino',
    'coming_soon',
    '[{"label":"750 ml"}]'::jsonb,
    true,
    true,
    3,
    'red-wine',
    '#6f1f2f'
  ),
  (
    'gintaglia',
    'gintaglia',
    'Gintaglia',
    'Gin agricolo',
    'Un distillato secco e botanico, attraversato dai profumi spontanei che crescono lungo i nostri campi.',
    'distillati',
    'available',
    '[{"label":"500 ml","price":38}]'::jsonb,
    true,
    true,
    4,
    'gin',
    '#405f54'
  ),
  (
    'salse-piccanti',
    'salse-piccanti',
    'Salse piccanti',
    'Peperoncini dell’orto',
    'Piccole produzioni, intensità diverse e ingredienti riconoscibili. Per accendere senza coprire.',
    'dispensa',
    'seasonal',
    '[{"label":"100 g","price":9}]'::jsonb,
    false,
    true,
    5,
    'sauce',
    '#a13a23'
  ),
  (
    'chips-pomodoro',
    'chips-di-pomodoro',
    'Chips di pomodoro',
    'Essiccate lentamente',
    'Pomodoro concentrato, croccante e naturalmente sapido. Un raccolto intero in un morso.',
    'dispensa',
    'seasonal',
    '[{"label":"40 g","price":6}]'::jsonb,
    false,
    true,
    6,
    'tomato-chips',
    '#bb4d35'
  ),
  (
    'chips-semi-polenta',
    'chips-semi-e-polenta',
    'Chips semi & polenta',
    'Croccanti da condividere',
    'Sfoglie sottili di mais e semi, cotte fino a diventare leggere, rustiche e irresistibili.',
    'dispensa',
    'available',
    '[{"label":"80 g","price":7}]'::jsonb,
    false,
    true,
    7,
    'polenta-chips',
    '#c29c3e'
  );

insert into public.site_settings (key, value)
values (
  'site_copy',
  jsonb_build_object(
    'heroKicker', 'Azienda agricola · Todi, Umbria',
    'heroTitle', 'Coltiviamo cose buone. Con il tempo che serve.',
    'heroBody', 'Olio, vino e piccole produzioni di dispensa nate sulle colline umbre, tra gesti di famiglia e curiosità contemporanea.',
    'storyTitle', 'Una casa, due persone, molte stagioni.',
    'storyBody', 'Pian della Carlotta è un progetto agricolo di famiglia. Coltiviamo seguendo il ritmo dei campi, trasformiamo in piccole quantità e raccontiamo ogni prodotto con trasparenza, dalla pianta alla tavola.',
    'contactEmail', 'ciao@piandellacarlotta.it',
    'contactPhone', '+39 000 000 0000'
  )
);

commit;
