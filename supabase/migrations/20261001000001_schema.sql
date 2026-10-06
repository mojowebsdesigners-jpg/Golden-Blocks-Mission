-- ═══════════════════════════════════════════════════════════════════════
-- Golden Blocks Mission — core schema
-- ═══════════════════════════════════════════════════════════════════════

-- gen_random_uuid() is built into PostgreSQL 13+, no extension required.

-- ── Enumerations ───────────────────────────────────────────────────────
create type public.user_role as enum ('admin', 'editor', 'user');
create type public.project_category as enum ('construction', 'renovation', 'community');
create type public.project_status as enum ('planned', 'ongoing', 'completed');
create type public.enquiry_status as enum ('new', 'in_progress', 'resolved', 'archived');
create type public.donation_status as enum ('pending', 'completed', 'failed', 'cancelled', 'pledged');
create type public.payment_method as enum ('mpesa', 'card', 'bank_transfer');
create type public.donation_frequency as enum ('one_time', 'monthly');
create type public.gallery_category as enum ('architecture', 'interiors', 'construction', 'renovation', 'details', 'community', 'outreach', 'volunteers');

-- ── Helpers ────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ── Profiles (1:1 with auth.users) ─────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text check (char_length(full_name) <= 120),
  email       text,
  role        public.user_role not null default 'user',
  created_at  timestamptz not null default now()
);

-- Role helpers. SECURITY DEFINER so policies can consult profiles without recursion.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'));
$$;

-- Create a profile for every new auth user (default role: user).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', null))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users may edit their own name, but only admins may change roles.
-- SECURITY INVOKER on purpose: current_user must be the caller's role
-- (authenticated / service_role / postgres), not the function owner.
create or replace function public.guard_profile_role()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() and current_user not in ('postgres', 'service_role', 'supabase_admin') then
    raise exception 'Only administrators can change roles';
  end if;
  return new;
end $$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ── Projects ───────────────────────────────────────────────────────────
create table public.projects (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 2 and 160),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  summary          text check (char_length(summary) <= 400),
  description      text not null default '',
  category         public.project_category not null,
  location         text check (char_length(location) <= 160),
  status           public.project_status not null default 'planned',
  cover_image      text,
  objectives       text[] not null default '{}',
  start_date       date,
  completion_date  date,
  featured         boolean not null default false,
  published        boolean not null default false,
  is_demo          boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint projects_dates_ok check (completion_date is null or start_date is null or completion_date >= start_date)
);
create index projects_published_idx on public.projects (published, featured, created_at desc);
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

create table public.project_images (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects (id) on delete cascade,
  image_url      text not null,
  caption        text check (char_length(caption) <= 300),
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);
create index project_images_project_idx on public.project_images (project_id, display_order);

create table public.project_updates (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  title       text not null check (char_length(title) between 2 and 200),
  content     text not null,
  images      text[] not null default '{}',
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index project_updates_project_idx on public.project_updates (project_id, created_at desc);

-- ── Gallery ────────────────────────────────────────────────────────────
create table public.gallery (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(title) between 1 and 200),
  description     text check (char_length(description) <= 1000),
  image_url       text not null,
  thumb_url       text,
  category        public.gallery_category not null,
  width           integer,
  height          integer,
  credit_author   text,
  credit_license  text,
  credit_source   text,
  featured        boolean not null default false,
  published       boolean not null default true,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);
create index gallery_published_idx on public.gallery (published, display_order);

-- ── Donations (written ONLY by server functions using the service role) ─
create table public.donations (
  id                   uuid primary key default gen_random_uuid(),
  donor_name           text check (char_length(donor_name) <= 120),
  donor_email          text check (char_length(donor_email) <= 160),
  donor_phone          text check (char_length(donor_phone) <= 24),
  anonymous            boolean not null default false,
  amount               numeric(14, 2) not null check (amount > 0),
  currency             text not null default 'KES' check (currency in ('KES', 'USD')),
  frequency            public.donation_frequency not null default 'one_time',
  designation          text not null default 'general',
  project_id           uuid references public.projects (id) on delete set null,
  payment_method       public.payment_method not null,
  payment_reference    text unique,             -- our reference (e.g. GBM-XXXX), shown to the donor
  provider_reference   text,                    -- M-Pesa receipt / Paystack transaction id
  checkout_request_id  text unique,             -- Daraja STK CheckoutRequestID
  merchant_request_id  text,
  payment_status       public.donation_status not null default 'pending',
  status_token         uuid not null default gen_random_uuid(),  -- lets a donor poll only their own status
  message              text check (char_length(message) <= 1000),
  provider_payload     jsonb,
  verified_at          timestamptz,
  confirmation_sent_at timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index donations_status_idx on public.donations (payment_status, created_at desc);
create trigger donations_updated_at before update on public.donations for each row execute function public.set_updated_at();

-- ── Enquiries ──────────────────────────────────────────────────────────
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (char_length(full_name) between 2 and 120),
  email       text not null check (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone       text check (char_length(phone) <= 24),
  subject     text not null check (char_length(subject) between 3 and 160),
  message     text not null check (char_length(message) between 10 and 4000),
  status      public.enquiry_status not null default 'new',
  created_at  timestamptz not null default now()
);
create index contact_messages_status_idx on public.contact_messages (status, created_at desc);

create table public.partnership_enquiries (
  id                 uuid primary key default gen_random_uuid(),
  organisation_name  text check (char_length(organisation_name) <= 160),
  contact_person     text not null check (char_length(contact_person) between 2 and 120),
  email              text not null check (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone              text check (char_length(phone) <= 24),
  partnership_type   text not null check (char_length(partnership_type) <= 60),
  message            text not null check (char_length(message) between 10 and 4000),
  status             public.enquiry_status not null default 'new',
  created_at         timestamptz not null default now()
);
create index partnership_enquiries_status_idx on public.partnership_enquiries (status, created_at desc);

-- Basic abuse protection for public forms: max 5 submissions per email per hour.
create or replace function public.throttle_enquiries()
returns trigger language plpgsql security definer set search_path = public as $$
declare recent integer;
begin
  execute format('select count(*) from public.%I where email = $1 and created_at > now() - interval ''1 hour''', tg_table_name)
    into recent using new.email;
  if recent >= 5 then
    raise exception 'Too many submissions. Please try again later.' using errcode = 'P0001';
  end if;
  new.status := 'new';
  return new;
end $$;

create trigger contact_messages_throttle before insert on public.contact_messages for each row execute function public.throttle_enquiries();
create trigger partnership_enquiries_throttle before insert on public.partnership_enquiries for each row execute function public.throttle_enquiries();

-- ── Site settings (editable organisation details; no secrets here) ─────
create table public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
