-- ═══════════════════════════════════════════════════════════════════════
-- Podcast episodes, FAQs and sponsorship programmes — all edited from /admin.
-- Same model as projects/gallery: the public reads published rows only;
-- staff (editor/admin) create, edit and delete.
-- ═══════════════════════════════════════════════════════════════════════

-- ── Podcast ────────────────────────────────────────────────────────────
-- Episodes are hosted elsewhere (YouTube, Spotify, SoundCloud, Apple Podcasts,
-- or a direct .mp3 link); the site embeds or links to `media_url`.
create table public.podcast_episodes (
  id                uuid primary key default gen_random_uuid(),
  title             text not null check (char_length(title) between 2 and 200),
  description       text check (char_length(description) <= 4000),
  media_url         text not null check (media_url ~ '^https://'),
  cover_image       text,
  episode_number    integer check (episode_number is null or episode_number > 0),
  duration_minutes  integer check (duration_minutes is null or duration_minutes between 1 and 1000),
  published_on      date,
  published         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index podcast_episodes_published_idx on public.podcast_episodes (published, published_on desc nulls last, created_at desc);
create trigger podcast_episodes_updated_at before update on public.podcast_episodes for each row execute function public.set_updated_at();

-- ── FAQs ───────────────────────────────────────────────────────────────
create table public.faqs (
  id             uuid primary key default gen_random_uuid(),
  question       text not null check (char_length(question) between 5 and 300),
  answer         text not null check (char_length(answer) between 2 and 4000),
  category       text not null default 'General' check (char_length(category) between 2 and 60),
  display_order  integer not null default 0,
  published      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index faqs_published_idx on public.faqs (published, category, display_order);
create trigger faqs_updated_at before update on public.faqs for each row execute function public.set_updated_at();

-- ── Sponsorship programmes ─────────────────────────────────────────────
create table public.sponsorship_programs (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(title) between 2 and 160),
  summary        text check (char_length(summary) <= 400),
  description    text not null default '',
  amount_label   text check (char_length(amount_label) <= 80),   -- free text, e.g. "KES 2,000 / month"
  cover_image    text,
  display_order  integer not null default 0,
  published      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index sponsorship_programs_published_idx on public.sponsorship_programs (published, display_order);
create trigger sponsorship_programs_updated_at before update on public.sponsorship_programs for each row execute function public.set_updated_at();

-- ── Row level security ─────────────────────────────────────────────────
alter table public.podcast_episodes     enable row level security;
alter table public.faqs                 enable row level security;
alter table public.sponsorship_programs enable row level security;

create policy "podcast_episodes: public read published" on public.podcast_episodes
  for select to anon, authenticated using (published or public.is_staff());
create policy "podcast_episodes: staff insert" on public.podcast_episodes for insert to authenticated with check (public.is_staff());
create policy "podcast_episodes: staff update" on public.podcast_episodes for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "podcast_episodes: staff delete" on public.podcast_episodes for delete to authenticated using (public.is_staff());

create policy "faqs: public read published" on public.faqs
  for select to anon, authenticated using (published or public.is_staff());
create policy "faqs: staff insert" on public.faqs for insert to authenticated with check (public.is_staff());
create policy "faqs: staff update" on public.faqs for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "faqs: staff delete" on public.faqs for delete to authenticated using (public.is_staff());

create policy "sponsorship_programs: public read published" on public.sponsorship_programs
  for select to anon, authenticated using (published or public.is_staff());
create policy "sponsorship_programs: staff insert" on public.sponsorship_programs for insert to authenticated with check (public.is_staff());
create policy "sponsorship_programs: staff update" on public.sponsorship_programs for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "sponsorship_programs: staff delete" on public.sponsorship_programs for delete to authenticated using (public.is_staff());

-- Visitors only ever read these tables.
revoke insert, update, delete on public.podcast_episodes, public.faqs, public.sponsorship_programs from anon;
