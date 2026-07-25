begin;

create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null default '',
  description text not null default '',
  translations jsonb not null default '{}'::jsonb
    check (jsonb_typeof(translations) = 'object'),
  location_name text not null default '',
  address text not null default '',
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  google_place_id text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  cover_photo_id uuid,
  sort_order integer not null default 0 check (sort_order >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  storage_path text not null unique,
  thumbnail_path text not null unique,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  alt_text text not null default '',
  caption text not null default '',
  translations jsonb not null default '{}'::jsonb
    check (jsonb_typeof(translations) = 'object'),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

alter table public.galleries
  add constraint galleries_cover_photo_fk
  foreign key (cover_photo_id)
  references public.gallery_photos(id)
  on delete set null
  deferrable initially immediate;

create index galleries_public_order_idx
  on public.galleries (status, sort_order, published_at desc);

create index gallery_photos_gallery_order_idx
  on public.gallery_photos (gallery_id, sort_order, created_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger galleries_touch_updated_at
before update on public.galleries
for each row execute function public.touch_updated_at();

create or replace function public.gallery_is_publishable(p_gallery_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.galleries as gallery
    where gallery.id = p_gallery_id
      and length(trim(gallery.title)) > 0
      and length(trim(gallery.location_name)) > 0
      and gallery.cover_photo_id is not null
      and exists (
        select 1
        from public.gallery_photos as photo
        where photo.id = gallery.cover_photo_id
          and photo.gallery_id = gallery.id
      )
  );
$$;

revoke all on function public.gallery_is_publishable(uuid) from public;
grant execute on function public.gallery_is_publishable(uuid) to authenticated;

create or replace function public.validate_published_gallery()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published' and not public.gallery_is_publishable(new.id) then
    raise exception 'gallery_not_publishable'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create constraint trigger galleries_require_publishable_content
after insert or update of status, title, location_name, cover_photo_id
on public.galleries
deferrable initially deferred
for each row execute function public.validate_published_gallery();

create or replace function public.protect_published_gallery_photos()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_gallery_id uuid;
begin
  if tg_op = 'DELETE' then
    affected_gallery_id := old.gallery_id;
  else
    affected_gallery_id := new.gallery_id;
  end if;
  if exists (
    select 1
    from public.galleries
    where id = affected_gallery_id
      and status = 'published'
  ) and not public.gallery_is_publishable(affected_gallery_id) then
    raise exception 'published_gallery_requires_valid_cover'
      using errcode = '23514';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create constraint trigger gallery_photos_keep_published_gallery_valid
after delete or update of gallery_id
on public.gallery_photos
deferrable initially deferred
for each row execute function public.protect_published_gallery_photos();

alter table public.galleries enable row level security;
alter table public.gallery_photos enable row level security;

create policy "public reads published galleries"
on public.galleries for select
to anon, authenticated
using (status = 'published' or public.is_admin());

create policy "admins manage galleries"
on public.galleries for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public reads published gallery photos"
on public.gallery_photos for select
to anon, authenticated
using (
  exists (
    select 1
    from public.galleries
    where galleries.id = gallery_photos.gallery_id
      and galleries.status = 'published'
  )
  or public.is_admin()
);

create policy "admins manage gallery photos"
on public.gallery_photos for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.galleries, public.gallery_photos to anon, authenticated;
grant insert, update, delete on public.galleries, public.gallery_photos to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-photos',
  'gallery-photos',
  false,
  26214400,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
);

create policy "public signs published gallery objects"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'gallery-photos'
  and (
    exists (
      select 1
      from public.galleries
      where galleries.id::text = (storage.foldername(name))[1]
        and galleries.status = 'published'
    )
    or public.is_admin()
  )
);

create policy "admins upload gallery objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'gallery-photos'
  and public.is_admin()
  and exists (
    select 1
    from public.galleries
    where galleries.id::text = (storage.foldername(name))[1]
  )
);

create policy "admins update gallery objects"
on storage.objects for update
to authenticated
using (bucket_id = 'gallery-photos' and public.is_admin())
with check (bucket_id = 'gallery-photos' and public.is_admin());

create policy "admins delete gallery objects"
on storage.objects for delete
to authenticated
using (bucket_id = 'gallery-photos' and public.is_admin());

create or replace function public.gallery_slugify(p_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(
    both '-' from regexp_replace(
      translate(
        lower(coalesce(p_value, '')),
        'àáâäãåèéêëìíîïòóôöõùúûüýÿñç',
        'aaaaaaeeeeiiiiooooouuuuyync'
      ),
      '[^a-z0-9]+',
      '-',
      'g'
    )
  );
$$;

create or replace function public.create_gallery(p_title text)
returns public.galleries
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix integer := 1;
  created_gallery public.galleries;
begin
  if not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if length(trim(coalesce(p_title, ''))) = 0 then
    raise exception 'title_required' using errcode = '23514';
  end if;

  base_slug := public.gallery_slugify(p_title);
  if base_slug = '' then
    base_slug := 'galleria';
  end if;
  candidate_slug := base_slug;

  loop
    begin
      insert into public.galleries (slug, title, sort_order)
      values (
        candidate_slug,
        trim(p_title),
        coalesce((select max(sort_order) + 1 from public.galleries), 0)
      )
      returning * into created_gallery;
      return created_gallery;
    exception
      when unique_violation then
        suffix := suffix + 1;
        candidate_slug := base_slug || '-' || suffix::text;
    end;
  end loop;
end;
$$;

create or replace function public.set_gallery_cover(
  p_gallery_id uuid,
  p_photo_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.gallery_photos
    where id = p_photo_id
      and gallery_id = p_gallery_id
  ) then
    raise exception 'photo_not_in_gallery' using errcode = '23514';
  end if;

  update public.galleries
  set cover_photo_id = p_photo_id
  where id = p_gallery_id;
end;
$$;

create or replace function public.publish_gallery(
  p_gallery_id uuid,
  p_publish boolean
)
returns public.galleries
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_gallery public.galleries;
begin
  if not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if p_publish and not public.gallery_is_publishable(p_gallery_id) then
    raise exception 'gallery_not_publishable' using errcode = '23514';
  end if;

  update public.galleries
  set
    status = case when p_publish then 'published' else 'draft' end,
    published_at = case
      when p_publish then coalesce(published_at, now())
      else null
    end
  where id = p_gallery_id
  returning * into updated_gallery;

  if updated_gallery.id is null then
    raise exception 'gallery_not_found' using errcode = 'P0002';
  end if;

  return updated_gallery;
end;
$$;

create or replace function public.reorder_gallery_photos(
  p_gallery_id uuid,
  p_photo_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if coalesce(array_length(p_photo_ids, 1), 0) <> (
    select count(*)::integer
    from public.gallery_photos
    where gallery_id = p_gallery_id
      and id = any(p_photo_ids)
  ) or coalesce(array_length(p_photo_ids, 1), 0) <> (
    select count(*)::integer
    from public.gallery_photos
    where gallery_id = p_gallery_id
  ) then
    raise exception 'invalid_photo_order' using errcode = '23514';
  end if;

  update public.gallery_photos as photo
  set sort_order = ordered.ordinality - 1
  from unnest(p_photo_ids) with ordinality as ordered(id, ordinality)
  where photo.id = ordered.id
    and photo.gallery_id = p_gallery_id;
end;
$$;

create or replace function public.reorder_galleries(p_gallery_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if coalesce(array_length(p_gallery_ids, 1), 0) <> (
    select count(*)::integer
    from public.galleries
    where status <> 'archived'
      and id = any(p_gallery_ids)
  ) then
    raise exception 'invalid_gallery_order' using errcode = '23514';
  end if;

  update public.galleries as gallery
  set sort_order = ordered.ordinality - 1
  from unnest(p_gallery_ids) with ordinality as ordered(id, ordinality)
  where gallery.id = ordered.id
    and gallery.status <> 'archived';
end;
$$;

revoke all on function public.gallery_slugify(text) from public;
revoke all on function public.create_gallery(text) from public;
revoke all on function public.set_gallery_cover(uuid, uuid) from public;
revoke all on function public.publish_gallery(uuid, boolean) from public;
revoke all on function public.reorder_gallery_photos(uuid, uuid[]) from public;
revoke all on function public.reorder_galleries(uuid[]) from public;

grant execute on function public.create_gallery(text) to authenticated;
grant execute on function public.set_gallery_cover(uuid, uuid) to authenticated;
grant execute on function public.publish_gallery(uuid, boolean) to authenticated;
grant execute on function public.reorder_gallery_photos(uuid, uuid[]) to authenticated;
grant execute on function public.reorder_galleries(uuid[]) to authenticated;

commit;
