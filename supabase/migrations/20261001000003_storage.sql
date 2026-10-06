-- ═══════════════════════════════════════════════════════════════════════
-- Storage: a public-read "media" bucket for project and gallery imagery.
-- Only staff may upload, replace or delete files.
-- ═══════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "media: public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

create policy "media: staff upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_staff());

create policy "media: staff update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_staff()) with check (bucket_id = 'media' and public.is_staff());

create policy "media: staff delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_staff());
