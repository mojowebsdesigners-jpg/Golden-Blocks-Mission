-- ═══════════════════════════════════════════════════════════════════════
-- Row Level Security
--   • Visitors (anon) read only published public content.
--   • Visitors may submit enquiries but never read them back.
--   • Donations are invisible to visitors; they are written only by server
--     functions using the service-role key (which bypasses RLS).
--   • Staff (admin/editor) manage content; admins manage donations,
--     settings and roles.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.profiles              enable row level security;
alter table public.projects              enable row level security;
alter table public.project_images        enable row level security;
alter table public.project_updates       enable row level security;
alter table public.gallery               enable row level security;
alter table public.donations             enable row level security;
alter table public.contact_messages      enable row level security;
alter table public.partnership_enquiries enable row level security;
alter table public.site_settings         enable row level security;

-- ── profiles ───────────────────────────────────────────────────────────
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles: update own or admin" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- ── projects ───────────────────────────────────────────────────────────
create policy "projects: public read published" on public.projects
  for select to anon, authenticated using (published or public.is_staff());
create policy "projects: staff insert" on public.projects for insert to authenticated with check (public.is_staff());
create policy "projects: staff update" on public.projects for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "projects: staff delete" on public.projects for delete to authenticated using (public.is_staff());

-- ── project_images ─────────────────────────────────────────────────────
create policy "project_images: public read for published projects" on public.project_images
  for select to anon, authenticated
  using (public.is_staff() or exists (select 1 from public.projects p where p.id = project_id and p.published));
create policy "project_images: staff insert" on public.project_images for insert to authenticated with check (public.is_staff());
create policy "project_images: staff update" on public.project_images for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "project_images: staff delete" on public.project_images for delete to authenticated using (public.is_staff());

-- ── project_updates ────────────────────────────────────────────────────
create policy "project_updates: public read published" on public.project_updates
  for select to anon, authenticated
  using (public.is_staff() or (published and exists (select 1 from public.projects p where p.id = project_id and p.published)));
create policy "project_updates: staff insert" on public.project_updates for insert to authenticated with check (public.is_staff());
create policy "project_updates: staff update" on public.project_updates for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "project_updates: staff delete" on public.project_updates for delete to authenticated using (public.is_staff());

-- ── gallery ────────────────────────────────────────────────────────────
create policy "gallery: public read published" on public.gallery
  for select to anon, authenticated using (published or public.is_staff());
create policy "gallery: staff insert" on public.gallery for insert to authenticated with check (public.is_staff());
create policy "gallery: staff update" on public.gallery for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "gallery: staff delete" on public.gallery for delete to authenticated using (public.is_staff());

-- ── donations ──────────────────────────────────────────────────────────
-- No anon policies at all. No delete policy: financial records are kept.
create policy "donations: admin read" on public.donations for select to authenticated using (public.is_admin());
create policy "donations: admin update" on public.donations for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── contact_messages ───────────────────────────────────────────────────
create policy "contact_messages: anyone can submit" on public.contact_messages
  for insert to anon, authenticated with check (status = 'new');
create policy "contact_messages: staff read" on public.contact_messages for select to authenticated using (public.is_staff());
create policy "contact_messages: staff update" on public.contact_messages for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "contact_messages: admin delete" on public.contact_messages for delete to authenticated using (public.is_admin());

-- ── partnership_enquiries ──────────────────────────────────────────────
create policy "partnership_enquiries: anyone can submit" on public.partnership_enquiries
  for insert to anon, authenticated with check (status = 'new');
create policy "partnership_enquiries: staff read" on public.partnership_enquiries for select to authenticated using (public.is_staff());
create policy "partnership_enquiries: staff update" on public.partnership_enquiries for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "partnership_enquiries: admin delete" on public.partnership_enquiries for delete to authenticated using (public.is_admin());

-- ── site_settings ──────────────────────────────────────────────────────
create policy "site_settings: public read" on public.site_settings for select to anon, authenticated using (true);
create policy "site_settings: admin insert" on public.site_settings for insert to authenticated with check (public.is_admin());
create policy "site_settings: admin update" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Defence in depth: visitors never need these privileges.
revoke all on public.donations from anon;
revoke update, delete on public.contact_messages, public.partnership_enquiries from anon;
revoke select on public.contact_messages, public.partnership_enquiries from anon;
