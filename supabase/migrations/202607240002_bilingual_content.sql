begin;

alter table public.products
  add column translations jsonb not null default '{}'::jsonb;

alter table public.products
  add constraint products_translations_object
  check (jsonb_typeof(translations) = 'object');

update public.products
set translations = jsonb_build_object(
  'en',
  case id
    when 'olio-evo' then jsonb_build_object(
      'name', 'Extra Virgin Olive Oil',
      'eyebrow', 'Our family harvest',
      'description', 'A bright, fragrant Umbrian olive oil, made from olives picked in our fields and milled within hours of harvesting.'
    )
    when 'mitera-bianco' then jsonb_build_object(
      'name', 'MITERA',
      'eyebrow', 'Grechetto · Umbria IGT',
      'description', 'A white wine born in our hills: luminous and textured, with the quiet freshness of the landscape around Todi.'
    )
    when 'mitera-rosso' then jsonb_build_object(
      'name', 'MITERA red',
      'eyebrow', 'Umbrian red wine',
      'description', 'Deep and made for the table, it holds the warmest side of our land. The first vintage is still resting.'
    )
    when 'gintaglia' then jsonb_build_object(
      'name', 'Gintaglia',
      'eyebrow', 'Farm gin',
      'description', 'A dry, botanical spirit shaped by the wild aromas that grow along the edges of our fields.'
    )
    when 'salse-piccanti' then jsonb_build_object(
      'name', 'Hot sauces',
      'eyebrow', 'Chilies from our garden',
      'description', 'Small batches, different levels of heat and recognisable ingredients. Made to brighten a dish, never overpower it.'
    )
    when 'chips-pomodoro' then jsonb_build_object(
      'name', 'Tomato chips',
      'eyebrow', 'Slowly dried',
      'description', 'Concentrated tomato flavour, crisp and naturally savoury. A whole harvest in one bite.'
    )
    when 'chips-semi-polenta' then jsonb_build_object(
      'name', 'Seed & polenta chips',
      'eyebrow', 'Crisp and made for sharing',
      'description', 'Thin sheets of corn and seeds, baked until light, rustic and irresistible.'
    )
    else '{}'::jsonb
  end
)
where id in (
  'olio-evo',
  'mitera-bianco',
  'mitera-rosso',
  'gintaglia',
  'salse-piccanti',
  'chips-pomodoro',
  'chips-semi-polenta'
);

insert into public.site_settings (key, value)
values (
  'site_copy_en',
  jsonb_build_object(
    'heroKicker', 'Family farm · San Damiano di Todi',
    'heroTitle', 'We grow good things. Giving them all the time they need.',
    'heroBody', 'Olive oil, wine and small-batch pantry specialties born in the Umbrian hills, shaped by family knowledge and contemporary curiosity.',
    'storyTitle', 'One home, two people, many seasons.',
    'storyBody', 'Bertello Basso is a family farming project in San Damiano di Todi. We follow the rhythm of the fields, make everything in small batches and share each product transparently, from plant to table.',
    'contactEmail', 'info@bertellobasso.it',
    'contactPhone', '+39 000 000 0000'
  )
)
on conflict (key) do nothing;

drop policy "public reads site copy" on public.site_settings;

create policy "public reads localized site copy"
on public.site_settings for select
to anon, authenticated
using (key in ('site_copy', 'site_copy_en') or public.is_admin());

commit;
