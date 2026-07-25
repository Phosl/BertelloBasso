begin;

create table public.product_drafts (
  id text primary key,
  slug text not null unique,
  content jsonb not null default '{}'::jsonb
    check (jsonb_typeof(content) = 'object'),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  page_key text unique
    check (
      page_key is null or
      page_key in ('home', 'products', 'story', 'contact', 'photography')
    ),
  slug text not null unique,
  draft_content jsonb not null default '{}'::jsonb
    check (jsonb_typeof(draft_content) = 'object'),
  published_content jsonb
    check (
      published_content is null or
      jsonb_typeof(published_content) = 'object'
    ),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cms_site_settings (
  id boolean primary key default true check (id),
  draft_content jsonb not null default '{}'::jsonb
    check (jsonb_typeof(draft_content) = 'object'),
  published_content jsonb not null default '{}'::jsonb
    check (jsonb_typeof(published_content) = 'object'),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  thumbnail_path text not null unique,
  original_name text not null,
  mime_type text not null default 'image/webp',
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  bytes bigint not null default 0 check (bytes >= 0),
  alt_text text not null default '',
  caption text not null default '',
  translations jsonb not null default '{}'::jsonb
    check (jsonb_typeof(translations) = 'object'),
  status text not null default 'active'
    check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_media_links (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.product_drafts(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  scope text not null default 'draft'
    check (scope in ('draft', 'published')),
  role text not null default 'gallery'
    check (role in ('primary', 'gallery')),
  sort_order integer not null default 0,
  focal_x numeric(5,4) not null default 0.5
    check (focal_x between 0 and 1),
  focal_y numeric(5,4) not null default 0.5
    check (focal_y between 0 and 1),
  created_at timestamptz not null default now(),
  unique (product_id, media_id, scope)
);

create unique index product_media_one_primary_idx
  on public.product_media_links (product_id, scope)
  where role = 'primary';

create table public.page_media_links (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  section_id text not null,
  scope text not null default 'draft'
    check (scope in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (page_id, media_id, section_id, scope)
);

create index product_drafts_status_order_idx
  on public.product_drafts (status, sort_order);

create index cms_pages_status_order_idx
  on public.cms_pages (status, sort_order);

create index product_media_product_scope_idx
  on public.product_media_links (product_id, scope, sort_order);

create index page_media_page_scope_idx
  on public.page_media_links (page_id, scope, sort_order);

create index media_assets_status_created_idx
  on public.media_assets (status, created_at desc);

create or replace function public.cms_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger product_drafts_touch_updated_at
before update on public.product_drafts
for each row execute function public.cms_touch_updated_at();

create trigger cms_pages_touch_updated_at
before update on public.cms_pages
for each row execute function public.cms_touch_updated_at();

create trigger cms_site_settings_touch_updated_at
before update on public.cms_site_settings
for each row execute function public.cms_touch_updated_at();

create trigger media_assets_touch_updated_at
before update on public.media_assets
for each row execute function public.cms_touch_updated_at();

insert into public.product_drafts
  (id, slug, content, status, sort_order, published_at, created_at, updated_at)
select
  products.id,
  products.slug,
  jsonb_build_object(
    'name', products.name,
    'eyebrow', products.eyebrow,
    'description', products.description,
    'translations', products.translations,
    'category', products.category,
    'availability', products.status,
    'formats', products.formats,
    'featured', products.featured,
    'visual', products.visual,
    'accent', products.accent,
    'seo', jsonb_build_object(
      'title', jsonb_build_object(
        'it', products.name,
        'en', coalesce(products.translations #>> '{en,name}', products.name)
      ),
      'description', jsonb_build_object(
        'it', products.description,
        'en', coalesce(
          products.translations #>> '{en,description}',
          products.description
        )
      ),
      'socialImageId', null
    )
  ),
  case when products.published then 'published' else 'draft' end,
  products.sort_order,
  case when products.published then products.updated_at else null end,
  products.created_at,
  products.updated_at
from public.products;

with page_seed(id, page_key, slug, sort_order, content) as (
  values
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'home',
    'home',
    0,
    $json$
    {
      "title":{"it":"Bertello Basso","en":"Bertello Basso"},
      "seo":{
        "title":{"it":"Bertello Basso","en":"Bertello Basso"},
        "description":{
          "it":"Olio, vino e piccole produzioni agricole da San Damiano di Todi.",
          "en":"Olive oil, wine and small-batch farm produce from San Damiano di Todi."
        },
        "socialImageId":null
      },
      "sections":[
        {
          "id":"home-hero","type":"hero","hidden":false,
          "kicker":{"it":"Azienda agricola · San Damiano di Todi","en":"Family farm · San Damiano di Todi"},
          "title":{"it":"Coltiviamo cose buone. Con il tempo che serve.","en":"We grow good things. Giving them all the time they need."},
          "body":{"it":"Olio, vino e piccole produzioni di dispensa nate sulle colline umbre, tra gesti di famiglia e curiosità contemporanea.","en":"Olive oil, wine and small-batch pantry specialties born in the Umbrian hills, shaped by family knowledge and contemporary curiosity."},
          "mediaId":null,"watercolor":true,
          "actionLabel":{"it":"Scopri i prodotti","en":"Discover our products"},
          "actionHref":"/prodotti"
        },
        {
          "id":"home-products","type":"productGrid","hidden":false,
          "title":{"it":"Prodotti che sanno\nda dove vengono.","en":"Products that know\nwhere they come from."},
          "mode":"featured","productIds":[],"limit":4,"locked":false
        },
        {
          "id":"home-story","type":"imageText","hidden":false,
          "kicker":{"it":"Bertello Basso · San Damiano di Todi","en":"Bertello Basso · San Damiano di Todi"},
          "title":{"it":"Una casa, due persone, molte stagioni.","en":"One home, two people, many seasons."},
          "body":{"it":"Bertello Basso è un progetto agricolo di famiglia a San Damiano di Todi. Coltiviamo seguendo il ritmo dei campi, trasformiamo in piccole quantità e raccontiamo ogni prodotto con trasparenza, dalla pianta alla tavola.","en":"Bertello Basso is a family farming project in San Damiano di Todi. We follow the rhythm of the fields, make everything in small batches and share each product transparently, from plant to table."},
          "mediaId":null,"imageSide":"left",
          "actionLabel":{"it":"La nostra storia","en":"Our story"},
          "actionHref":"/storia"
        }
      ]
    }
    $json$::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000002'::uuid,
    'products',
    'prodotti',
    1,
    $json$
    {
      "title":{"it":"Prodotti","en":"Products"},
      "seo":{
        "title":{"it":"Prodotti","en":"Products"},
        "description":{"it":"Olio, vini MITERA, Gintaglia e piccole produzioni della dispensa.","en":"Olive oil, MITERA wines, Gintaglia and small-batch pantry specialties."},
        "socialImageId":null
      },
      "sections":[
        {
          "id":"products-hero","type":"hero","hidden":false,
          "kicker":{"it":"La nostra dispensa","en":"From our pantry"},
          "title":{"it":"Dalla terra\nalla tavola.","en":"From the land\nto the table."},
          "body":{"it":"Lavoriamo in piccole serie e seguiamo la disponibilità reale dei raccolti. Alcune cose tornano ogni anno, altre arrivano quando sono pronte.","en":"We work in small batches, following the real availability of each harvest. Some things return every year; others arrive only when they are ready."},
          "mediaId":null,"watercolor":false,
          "actionLabel":{"it":"","en":""},"actionHref":""
        },
        {
          "id":"products-catalog","type":"productGrid","hidden":false,
          "title":{"it":"","en":""},"mode":"all","productIds":[],"limit":99,"locked":true
        }
      ]
    }
    $json$::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000003'::uuid,
    'story',
    'storia',
    3,
    $json$
    {
      "title":{"it":"La nostra storia","en":"Our story"},
      "seo":{
        "title":{"it":"La nostra storia","en":"Our story"},
        "description":{"it":"Una piccola azienda agricola di famiglia sulle colline umbre vicino Todi.","en":"A small family farm in the Umbrian hills near Todi."},
        "socialImageId":null
      },
      "sections":[
        {
          "id":"story-hero","type":"hero","hidden":false,
          "kicker":{"it":"La nostra storia","en":"Our story"},
          "title":{"it":"Non siamo nati\nper fare tutto.","en":"We were not made\nto do everything."},
          "body":{"it":"Siamo nati per fare poche cose, seguirle da vicino e riconoscere ogni stagione dentro quello che produciamo.","en":"We are here to make a few things, follow them closely and recognise each season in everything we produce."},
          "mediaId":null,"watercolor":false,
          "actionLabel":{"it":"","en":""},"actionHref":""
        },
        {
          "id":"story-manifesto","type":"richText","hidden":false,
          "title":{"it":"Una casa, due persone, molte stagioni.","en":"One home, two people, many seasons."},
          "content":{
            "it":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Bertello Basso è un progetto agricolo di famiglia a San Damiano di Todi. Coltiviamo seguendo il ritmo dei campi, trasformiamo in piccole quantità e raccontiamo ogni prodotto con trasparenza, dalla pianta alla tavola."}]}]},
            "en":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Bertello Basso is a family farming project in San Damiano di Todi. We follow the rhythm of the fields, make everything in small batches and share each product transparently, from plant to table."}]}]}
          }
        },
        {
          "id":"story-values","type":"cards","hidden":false,
          "kicker":{"it":"I nostri valori","en":"Our values"},
          "title":{"it":"","en":""},
          "items":[
            {"id":"story-value-1","title":{"it":"La terra detta la quantità.","en":"The land decides the quantity."},"body":{"it":"Non forziamo la continuità: comunichiamo esauriti, attese e nuove annate con sincerità.","en":"We do not force continuity: we talk honestly about sold-out batches, waiting times and new vintages."}},
            {"id":"story-value-2","title":{"it":"Il tempo è un ingrediente.","en":"Time is an ingredient."},"body":{"it":"Dalla maturazione all’essiccazione, ogni passaggio ha il proprio ritmo e non ammette scorciatoie.","en":"From ripening to drying, every stage has its own pace and allows no shortcuts."}},
            {"id":"story-value-3","title":{"it":"Curiosi, senza rumore.","en":"Curious, without the noise."},"body":{"it":"Accanto all’olio nascono vini, distillati e ricette di dispensa: esperimenti con radici chiare.","en":"Alongside our olive oil come wines, spirits and pantry recipes: experiments with clear roots."}}
          ]
        },
        {
          "id":"story-place","type":"location","hidden":false,
          "kicker":{"it":"San Damiano di Todi · Umbria","en":"San Damiano di Todi · Umbria"},
          "title":{"it":"Nel centro d’Italia,\nun po’ fuori strada.","en":"In the heart of Italy,\na little off the road."},
          "body":{"it":"Colline, argilla, sole e notti fresche. Il paesaggio non è uno sfondo: entra nei profumi dell’olio, nel carattere del vino e nella scelta di restare piccoli.","en":"Hills, clay, sunshine and cool nights. The landscape is not a backdrop: it finds its way into the scent of the oil, the character of the wine and our choice to stay small."},
          "address":"San Damiano di Todi","latitude":42.78,"longitude":12.41,"showMap":false
        }
      ]
    }
    $json$::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000004'::uuid,
    'contact',
    'contatti',
    4,
    $json$
    {
      "title":{"it":"Visite e contatti","en":"Visits and contact"},
      "seo":{
        "title":{"it":"Visite e contatti","en":"Visits and contact"},
        "description":{"it":"Contatta Bertello Basso per prodotti, rivendita e visite a San Damiano di Todi.","en":"Contact Bertello Basso about products, retail and visits in San Damiano di Todi."},
        "socialImageId":null
      },
      "sections":[
        {
          "id":"contact-hero","type":"hero","hidden":false,
          "kicker":{"it":"Visite & contatti","en":"Visits & contact"},
          "title":{"it":"Passate\na trovarci.","en":"Come\nand see us."},
          "body":{"it":"Le visite si fanno su appuntamento, perché qui il lavoro nei campi viene prima. Scriveteci e troviamo il momento giusto.","en":"Visits are by appointment, because work in the fields comes first here. Write to us and we will find the right time."},
          "mediaId":null,"watercolor":false,
          "actionLabel":{"it":"","en":""},"actionHref":""
        },
        {
          "id":"contact-location","type":"location","hidden":false,
          "kicker":{"it":"Dove siamo","en":"Where we are"},
          "title":{"it":"San Damiano di Todi","en":"San Damiano di Todi"},
          "body":{"it":"Umbria, Italia. Le indicazioni precise vengono inviate alla conferma.","en":"Umbria, Italy. Detailed directions are sent with your confirmation."},
          "address":"San Damiano di Todi","latitude":42.78,"longitude":12.41,"showMap":true
        },
        {
          "id":"contact-form","type":"contactForm","hidden":false,
          "title":{"it":"Scrivici","en":"Write to us"},"locked":true
        }
      ]
    }
    $json$::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000005'::uuid,
    'photography',
    'fotografie',
    2,
    $json$
    {
      "title":{"it":"Fotografie","en":"Photography"},
      "seo":{
        "title":{"it":"Fotografie","en":"Photography"},
        "description":{"it":"Storie fotografiche dai campi, dalle stagioni e dalla vita di Bertello Basso a San Damiano di Todi.","en":"Photographic stories from the fields, seasons and daily life at Bertello Basso in San Damiano di Todi."},
        "socialImageId":null
      },
      "sections":[
        {
          "id":"photography-hero","type":"hero","hidden":false,
          "kicker":{"it":"Diario fotografico","en":"Photographic journal"},
          "title":{"it":"La terra,\ncome la vediamo.","en":"The land,\nas we see it."},
          "body":{"it":"Raccolti, persone, giornate di lavoro e piccoli dettagli. Un archivio vivo della nostra casa in Umbria.","en":"Harvests, people, working days and small details. A living archive of our home in Umbria."},
          "mediaId":null,"watercolor":false,
          "actionLabel":{"it":"","en":""},"actionHref":""
        },
        {"id":"photography-index","type":"galleryIndex","hidden":false,"locked":true}
      ]
    }
    $json$::jsonb
  )
)
insert into public.cms_pages
  (id, page_key, slug, draft_content, published_content, status, sort_order, published_at)
select id, page_key, slug, content, content, 'published', sort_order, now()
from page_seed;

insert into public.cms_site_settings
  (id, draft_content, published_content, published_at)
values (
  true,
  $json$
  {
    "email":"info@bertellobasso.it",
    "phone":"+39 000 000 0000",
    "address":"San Damiano di Todi",
    "latitude":42.78,
    "longitude":12.41,
    "instagramUrl":"",
    "footerKicker":{"it":"Venite a trovarci","en":"Come and see us"},
    "footerTitle":{"it":"Una strada bianca,\npoco fuori Todi.","en":"A country road,\njust outside Todi."},
    "footerSignature":{"it":"Fatto lentamente in Umbria","en":"Made slowly in Umbria"},
    "defaultSeo":{
      "title":{"it":"Bertello Basso · Azienda agricola a San Damiano di Todi","en":"Bertello Basso · Family farm in San Damiano di Todi"},
      "description":{"it":"Olio, vino e piccole produzioni agricole da San Damiano di Todi, nel cuore dell’Umbria.","en":"Olive oil, wine and small-batch farm produce from San Damiano di Todi, in the heart of Umbria."},
      "socialImageId":null
    },
    "navigation":[
      {"pageId":"00000000-0000-4000-8000-000000000002","label":{"it":"Prodotti","en":"Products"},"showHeader":true,"showFooter":true,"sortOrder":1},
      {"pageId":"00000000-0000-4000-8000-000000000005","label":{"it":"Fotografie","en":"Photography"},"showHeader":true,"showFooter":true,"sortOrder":2},
      {"pageId":"00000000-0000-4000-8000-000000000003","label":{"it":"La nostra storia","en":"Our story"},"showHeader":true,"showFooter":true,"sortOrder":3},
      {"pageId":"00000000-0000-4000-8000-000000000004","label":{"it":"Visite & contatti","en":"Visits & contact"},"showHeader":true,"showFooter":true,"sortOrder":4}
    ]
  }
  $json$::jsonb,
  $json$
  {
    "email":"info@bertellobasso.it",
    "phone":"+39 000 000 0000",
    "address":"San Damiano di Todi",
    "latitude":42.78,
    "longitude":12.41,
    "instagramUrl":"",
    "footerKicker":{"it":"Venite a trovarci","en":"Come and see us"},
    "footerTitle":{"it":"Una strada bianca,\npoco fuori Todi.","en":"A country road,\njust outside Todi."},
    "footerSignature":{"it":"Fatto lentamente in Umbria","en":"Made slowly in Umbria"},
    "defaultSeo":{
      "title":{"it":"Bertello Basso · Azienda agricola a San Damiano di Todi","en":"Bertello Basso · Family farm in San Damiano di Todi"},
      "description":{"it":"Olio, vino e piccole produzioni agricole da San Damiano di Todi, nel cuore dell’Umbria.","en":"Olive oil, wine and small-batch farm produce from San Damiano di Todi, in the heart of Umbria."},
      "socialImageId":null
    },
    "navigation":[
      {"pageId":"00000000-0000-4000-8000-000000000002","label":{"it":"Prodotti","en":"Products"},"showHeader":true,"showFooter":true,"sortOrder":1},
      {"pageId":"00000000-0000-4000-8000-000000000005","label":{"it":"Fotografie","en":"Photography"},"showHeader":true,"showFooter":true,"sortOrder":2},
      {"pageId":"00000000-0000-4000-8000-000000000003","label":{"it":"La nostra storia","en":"Our story"},"showHeader":true,"showFooter":true,"sortOrder":3},
      {"pageId":"00000000-0000-4000-8000-000000000004","label":{"it":"Visite & contatti","en":"Visits & contact"},"showHeader":true,"showFooter":true,"sortOrder":4}
    ]
  }
  $json$::jsonb,
  now()
);

create or replace function public.cms_slugify(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(
    both '-' from
    regexp_replace(
      lower(
        translate(
          coalesce(value, ''),
          'àáâäãåèéêëìíîïòóôöõùúûüýÿñç',
          'aaaaaaeeeeiiiiooooouuuuyync'
        )
      ),
      '[^a-z0-9]+',
      '-',
      'g'
    )
  );
$$;

create or replace function public.cms_unique_product_slug(
  value text,
  excluded_id text default null
)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  base_slug text := coalesce(nullif(public.cms_slugify(value), ''), 'prodotto');
  candidate text := base_slug;
  suffix integer := 2;
begin
  while exists (
    select 1
    from public.product_drafts
    where slug = candidate
      and (excluded_id is null or id <> excluded_id)
  ) loop
    candidate := base_slug || '-' || suffix;
    suffix := suffix + 1;
  end loop;
  return candidate;
end;
$$;

create or replace function public.cms_unique_page_slug(
  value text,
  excluded_id uuid default null
)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  base_slug text := coalesce(nullif(public.cms_slugify(value), ''), 'pagina');
  candidate text := base_slug;
  suffix integer := 2;
  reserved text[] := array[
    'admin', 'api', 'en', 'prodotti', 'products', 'storia', 'story',
    'contatti', 'contact', 'fotografie', 'photography', '_next'
  ];
begin
  while candidate = any(reserved) or exists (
    select 1
    from public.cms_pages
    where slug = candidate
      and (excluded_id is null or id <> excluded_id)
  ) loop
    candidate := base_slug || '-' || suffix;
    suffix := suffix + 1;
  end loop;
  return candidate;
end;
$$;

create or replace function public.cms_create_product(p_name text)
returns public.product_drafts
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.product_drafts;
  product_id text := gen_random_uuid()::text;
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;

  insert into public.product_drafts (id, slug, content, sort_order)
  values (
    product_id,
    public.cms_unique_product_slug(coalesce(nullif(trim(p_name), ''), 'Nuovo prodotto')),
    jsonb_build_object(
      'name', trim(coalesce(p_name, '')),
      'eyebrow', '',
      'description', '',
      'translations', '{}'::jsonb,
      'category', 'dispensa',
      'availability', 'available',
      'formats', '[{"label":""}]'::jsonb,
      'featured', false,
      'visual', 'oil',
      'accent', '#8d8a3f',
      'seo', jsonb_build_object(
        'title', jsonb_build_object('it', trim(coalesce(p_name, '')), 'en', ''),
        'description', jsonb_build_object('it', '', 'en', ''),
        'socialImageId', null
      )
    ),
    coalesce((select max(sort_order) + 1 from public.product_drafts), 0)
  )
  returning * into result;

  return result;
end;
$$;

create or replace function public.cms_duplicate_product(p_product_id text)
returns public.product_drafts
language plpgsql
security definer
set search_path = ''
as $$
declare
  source public.product_drafts;
  result public.product_drafts;
  new_id text := gen_random_uuid()::text;
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  select * into source from public.product_drafts where id = p_product_id;
  if source.id is null then
    raise exception 'cms_product_not_found' using errcode = 'P0002';
  end if;

  insert into public.product_drafts
    (id, slug, content, status, sort_order)
  values (
    new_id,
    public.cms_unique_product_slug((source.content->>'name') || ' copia'),
    jsonb_set(source.content, '{name}', to_jsonb((source.content->>'name') || ' copia')),
    'draft',
    coalesce((select max(sort_order) + 1 from public.product_drafts), 0)
  )
  returning * into result;

  insert into public.product_media_links
    (product_id, media_id, scope, role, sort_order, focal_x, focal_y)
  select
    new_id, media_id, 'draft', role, sort_order, focal_x, focal_y
  from public.product_media_links
  where product_id = p_product_id and scope = 'draft';

  return result;
end;
$$;

create or replace function public.cms_publish_product(p_product_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  draft public.product_drafts;
  values_json jsonb;
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  select * into draft from public.product_drafts where id = p_product_id;
  if draft.id is null then
    raise exception 'cms_product_not_found' using errcode = 'P0002';
  end if;
  values_json := draft.content;

  if trim(coalesce(values_json->>'name', '')) = ''
    or trim(coalesce(values_json->>'description', '')) = ''
    or jsonb_typeof(values_json->'formats') <> 'array'
    or jsonb_array_length(values_json->'formats') = 0
  then
    raise exception 'cms_product_not_publishable' using errcode = '23514';
  end if;

  insert into public.products
    (
      id, slug, name, eyebrow, description, category, status, formats,
      featured, published, sort_order, visual, accent, translations, updated_at
    )
  values
    (
      draft.id,
      draft.slug,
      values_json->>'name',
      coalesce(values_json->>'eyebrow', ''),
      values_json->>'description',
      values_json->>'category',
      values_json->>'availability',
      values_json->'formats',
      coalesce((values_json->>'featured')::boolean, false),
      true,
      draft.sort_order,
      values_json->>'visual',
      values_json->>'accent',
      coalesce(values_json->'translations', '{}'::jsonb),
      now()
    )
  on conflict (id) do update set
    slug = excluded.slug,
    name = excluded.name,
    eyebrow = excluded.eyebrow,
    description = excluded.description,
    category = excluded.category,
    status = excluded.status,
    formats = excluded.formats,
    featured = excluded.featured,
    published = true,
    sort_order = excluded.sort_order,
    visual = excluded.visual,
    accent = excluded.accent,
    translations = excluded.translations,
    updated_at = now();

  delete from public.product_media_links
  where product_id = p_product_id and scope = 'published';

  insert into public.product_media_links
    (product_id, media_id, scope, role, sort_order, focal_x, focal_y)
  select product_id, media_id, 'published', role, sort_order, focal_x, focal_y
  from public.product_media_links
  where product_id = p_product_id and scope = 'draft';

  update public.product_drafts
  set status = 'published', published_at = now()
  where id = p_product_id;
end;
$$;

create or replace function public.cms_unpublish_product(p_product_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  update public.products set published = false, updated_at = now()
  where id = p_product_id;
  update public.product_drafts
  set status = 'draft', published_at = null
  where id = p_product_id and status <> 'archived';
end;
$$;

create or replace function public.cms_archive_product(
  p_product_id text,
  p_archived boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  if p_archived then
    update public.products set published = false, updated_at = now()
    where id = p_product_id;
    update public.product_drafts
    set status = 'archived', published_at = null
    where id = p_product_id;
  else
    update public.product_drafts
    set status = 'draft'
    where id = p_product_id;
  end if;
end;
$$;

create or replace function public.cms_reorder_products(p_product_ids text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  product_id text;
  position integer := 0;
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  foreach product_id in array p_product_ids loop
    update public.product_drafts
    set sort_order = position
    where id = product_id;
    update public.products
    set sort_order = position, updated_at = now()
    where id = product_id and published = true;
    position := position + 1;
  end loop;
end;
$$;

create or replace function public.cms_create_page(p_title text)
returns public.cms_pages
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.cms_pages;
  page_id uuid := gen_random_uuid();
  title_value text := coalesce(nullif(trim(p_title), ''), 'Nuova pagina');
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  insert into public.cms_pages
    (id, slug, draft_content, status, sort_order)
  values (
    page_id,
    public.cms_unique_page_slug(title_value),
    jsonb_build_object(
      'title', jsonb_build_object('it', title_value, 'en', ''),
      'seo', jsonb_build_object(
        'title', jsonb_build_object('it', title_value, 'en', ''),
        'description', jsonb_build_object('it', '', 'en', ''),
        'socialImageId', null
      ),
      'sections', jsonb_build_array(
        jsonb_build_object(
          'id', gen_random_uuid()::text,
          'type', 'hero',
          'hidden', false,
          'kicker', jsonb_build_object('it', '', 'en', ''),
          'title', jsonb_build_object('it', title_value, 'en', ''),
          'body', jsonb_build_object('it', '', 'en', ''),
          'mediaId', null,
          'watercolor', false,
          'actionLabel', jsonb_build_object('it', '', 'en', ''),
          'actionHref', ''
        )
      )
    ),
    'draft',
    coalesce((select max(sort_order) + 1 from public.cms_pages), 0)
  )
  returning * into result;
  return result;
end;
$$;

create or replace function public.cms_duplicate_page(p_page_id uuid)
returns public.cms_pages
language plpgsql
security definer
set search_path = ''
as $$
declare
  source public.cms_pages;
  result public.cms_pages;
  title_value text;
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  select * into source from public.cms_pages where id = p_page_id;
  if source.id is null then
    raise exception 'cms_page_not_found' using errcode = 'P0002';
  end if;
  title_value := coalesce(source.draft_content #>> '{title,it}', 'Pagina') || ' copia';

  insert into public.cms_pages
    (slug, draft_content, status, sort_order)
  values (
    public.cms_unique_page_slug(title_value),
    jsonb_set(
      source.draft_content,
      '{title,it}',
      to_jsonb(title_value)
    ),
    'draft',
    coalesce((select max(sort_order) + 1 from public.cms_pages), 0)
  )
  returning * into result;
  return result;
end;
$$;

create or replace function public.cms_publish_page(p_page_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  page public.cms_pages;
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  select * into page from public.cms_pages where id = p_page_id;
  if page.id is null then
    raise exception 'cms_page_not_found' using errcode = 'P0002';
  end if;

  if trim(coalesce(page.draft_content #>> '{title,it}', '')) = ''
    or jsonb_typeof(page.draft_content->'sections') <> 'array'
    or not jsonb_path_exists(
      page.draft_content,
      '$.sections[*] ? (@.hidden == false)'
    )
  then
    raise exception 'cms_page_not_publishable' using errcode = '23514';
  end if;

  if page.page_key = 'products' and not jsonb_path_exists(
    page.draft_content,
    '$.sections[*] ? (@.type == "productGrid" && @.locked == true)'
  ) then
    raise exception 'cms_locked_section_missing' using errcode = '23514';
  end if;
  if page.page_key = 'photography' and not jsonb_path_exists(
    page.draft_content,
    '$.sections[*] ? (@.type == "galleryIndex" && @.locked == true)'
  ) then
    raise exception 'cms_locked_section_missing' using errcode = '23514';
  end if;
  if page.page_key = 'contact' and not jsonb_path_exists(
    page.draft_content,
    '$.sections[*] ? (@.type == "contactForm" && @.locked == true)'
  ) then
    raise exception 'cms_locked_section_missing' using errcode = '23514';
  end if;

  update public.cms_pages
  set
    published_content = draft_content,
    status = 'published',
    published_at = now()
  where id = p_page_id;

  delete from public.page_media_links
  where page_id = p_page_id and scope = 'published';

  insert into public.page_media_links
    (page_id, media_id, section_id, scope, sort_order)
  select page_id, media_id, section_id, 'published', sort_order
  from public.page_media_links
  where page_id = p_page_id and scope = 'draft';
end;
$$;

create or replace function public.cms_unpublish_page(p_page_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  system_key text;
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  select page_key into system_key from public.cms_pages where id = p_page_id;
  if system_key is not null then
    raise exception 'cms_system_page_cannot_be_unpublished' using errcode = '23514';
  end if;
  update public.cms_pages
  set status = 'draft', published_at = null
  where id = p_page_id;
end;
$$;

create or replace function public.cms_archive_page(
  p_page_id uuid,
  p_archived boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  system_key text;
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  select page_key into system_key from public.cms_pages where id = p_page_id;
  if system_key is not null then
    raise exception 'cms_system_page_cannot_be_archived' using errcode = '23514';
  end if;
  update public.cms_pages
  set
    status = case when p_archived then 'archived' else 'draft' end,
    published_at = case when p_archived then null else published_at end
  where id = p_page_id;
end;
$$;

create or replace function public.cms_publish_site_settings()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;
  update public.cms_site_settings
  set published_content = draft_content, published_at = now()
  where id = true;
end;
$$;

create or replace function public.cms_get_public_pages()
returns table (
  id uuid,
  page_key text,
  slug text,
  content jsonb,
  sort_order integer,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    pages.id,
    pages.page_key,
    pages.slug,
    pages.published_content,
    pages.sort_order,
    pages.published_at
  from public.cms_pages pages
  where pages.status = 'published'
    and pages.published_content is not null
  order by pages.sort_order;
$$;

create or replace function public.cms_get_public_site_settings()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select published_content
  from public.cms_site_settings
  where id = true;
$$;

create or replace function public.cms_media_is_public(p_storage_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.media_assets assets
    where
      (assets.storage_path = p_storage_path or assets.thumbnail_path = p_storage_path)
      and (
        exists (
          select 1
          from public.product_media_links links
          join public.products products on products.id = links.product_id
          where links.media_id = assets.id
            and links.scope = 'published'
            and products.published = true
        )
        or exists (
          select 1
          from public.page_media_links links
          join public.cms_pages pages on pages.id = links.page_id
          where links.media_id = assets.id
            and links.scope = 'published'
            and pages.status = 'published'
        )
      )
  );
$$;

revoke all on function public.cms_create_product(text) from public;
revoke all on function public.cms_duplicate_product(text) from public;
revoke all on function public.cms_publish_product(text) from public;
revoke all on function public.cms_unpublish_product(text) from public;
revoke all on function public.cms_archive_product(text, boolean) from public;
revoke all on function public.cms_reorder_products(text[]) from public;
revoke all on function public.cms_create_page(text) from public;
revoke all on function public.cms_duplicate_page(uuid) from public;
revoke all on function public.cms_publish_page(uuid) from public;
revoke all on function public.cms_unpublish_page(uuid) from public;
revoke all on function public.cms_archive_page(uuid, boolean) from public;
revoke all on function public.cms_publish_site_settings() from public;

grant execute on function public.cms_create_product(text) to authenticated;
grant execute on function public.cms_duplicate_product(text) to authenticated;
grant execute on function public.cms_publish_product(text) to authenticated;
grant execute on function public.cms_unpublish_product(text) to authenticated;
grant execute on function public.cms_archive_product(text, boolean) to authenticated;
grant execute on function public.cms_reorder_products(text[]) to authenticated;
grant execute on function public.cms_create_page(text) to authenticated;
grant execute on function public.cms_duplicate_page(uuid) to authenticated;
grant execute on function public.cms_publish_page(uuid) to authenticated;
grant execute on function public.cms_unpublish_page(uuid) to authenticated;
grant execute on function public.cms_archive_page(uuid, boolean) to authenticated;
grant execute on function public.cms_publish_site_settings() to authenticated;

revoke all on function public.cms_get_public_pages() from public;
revoke all on function public.cms_get_public_site_settings() from public;
revoke all on function public.cms_media_is_public(text) from public;
grant execute on function public.cms_get_public_pages() to anon, authenticated;
grant execute on function public.cms_get_public_site_settings() to anon, authenticated;
grant execute on function public.cms_media_is_public(text) to anon, authenticated;

alter table public.product_drafts enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_site_settings enable row level security;
alter table public.media_assets enable row level security;
alter table public.product_media_links enable row level security;
alter table public.page_media_links enable row level security;

create policy "admins manage product drafts"
on public.product_drafts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage cms pages"
on public.cms_pages for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage cms settings"
on public.cms_site_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage media assets"
on public.media_assets for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public reads published media metadata"
on public.media_assets for select
to anon, authenticated
using (public.cms_media_is_public(storage_path));

create policy "admins manage product media links"
on public.product_media_links for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public reads published product media links"
on public.product_media_links for select
to anon, authenticated
using (
  scope = 'published'
  and exists (
    select 1 from public.products
    where products.id = product_media_links.product_id
      and products.published = true
  )
);

create policy "admins manage page media links"
on public.page_media_links for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public reads published page media links"
on public.page_media_links for select
to anon, authenticated
using (
  scope = 'published'
  and exists (
    select 1 from public.cms_pages
    where cms_pages.id = page_media_links.page_id
      and cms_pages.status = 'published'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  false,
  10485760,
  array['image/webp']
);

create policy "admins upload cms media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'cms-media'
  and public.is_admin()
);

create policy "admins update cms media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'cms-media'
  and public.is_admin()
)
with check (
  bucket_id = 'cms-media'
  and public.is_admin()
);

create policy "admins delete cms media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'cms-media'
  and public.is_admin()
);

create policy "published cms media is readable"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'cms-media'
  and public.cms_media_is_public(name)
);

create policy "admins read cms media"
on storage.objects for select
to authenticated
using (
  bucket_id = 'cms-media'
  and public.is_admin()
);

commit;
