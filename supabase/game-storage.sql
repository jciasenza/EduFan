insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'edufan-game-assets',
  'edufan-game-assets',
  true,
  5242880,
  array['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read EduFan game assets"
  on storage.objects;
create policy "Public can read EduFan game assets"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'edufan-game-assets');
