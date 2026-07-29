begin;

alter table public.gallery_photos
  add column media_type text not null default 'image'
    check (media_type in ('image', 'video')),
  add column source_type text not null default 'standard'
    check (source_type in ('standard', 'dng')),
  add column mime_type text not null default 'image/webp',
  add column source_name text not null default '',
  add column original_path text,
  add column duration_ms integer
    check (duration_ms is null or duration_ms >= 0);

alter table public.gallery_photos
  add constraint gallery_photos_media_shape_check
  check (
    (
      media_type = 'image'
      and duration_ms is null
      and (
        (source_type = 'standard' and original_path is null)
        or
        (source_type = 'dng' and original_path is not null)
      )
    )
    or
    (
      media_type = 'video'
      and source_type = 'standard'
      and original_path is null
    )
  );

create unique index gallery_photos_original_path_idx
  on public.gallery_photos (original_path)
  where original_path is not null;

update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/dng',
    'image/x-adobe-dng',
    'video/mp4',
    'video/x-m4v',
    'video/quicktime',
    'video/webm'
  ]
where id = 'gallery-photos';

commit;
