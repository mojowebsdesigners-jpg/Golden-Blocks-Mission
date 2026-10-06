// Applies every migration + seed to an in-process Postgres (PGlite) with
// minimal stubs of Supabase's auth/storage schemas, then exercises the RLS
// policies as anon, a regular user, an editor and an admin.
//   npm run test:sql
import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs'
import path from 'node:path'

const db = new PGlite()
const root = path.resolve(import.meta.dirname, '..')
let failures = 0
const ok = (cond, label) => {
  console.log(`${cond ? '✔' : '✘'} ${label}`)
  if (!cond) failures++
}

await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; create schema storage; create schema extensions;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema public, auth, storage to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated;
`)

const files = fs.readdirSync(path.join(root, 'supabase/migrations')).filter((f) => f.endsWith('.sql')).sort()
for (const f of files) {
  try {
    await db.exec(fs.readFileSync(path.join(root, 'supabase/migrations', f), 'utf8'))
    ok(true, `migration ${f}`)
  } catch (e) {
    ok(false, `migration ${f}: ${e.message}`)
    process.exit(1)
  }
}
// Supabase grants table privileges to anon/authenticated by default; mirror that, then re-apply the revokes.
await db.exec(`
  grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
  grant select, insert, update, delete on all tables in schema storage to anon, authenticated;
  grant usage on all sequences in schema public to anon, authenticated;
`)
await db.exec(fs.readFileSync(path.join(root, 'supabase/migrations/20261001000002_rls.sql'), 'utf8').split('-- Defence in depth')[1].replace(/^[^\n]*\n/, ''))

try {
  await db.exec(fs.readFileSync(path.join(root, 'supabase/seed.sql'), 'utf8'))
  ok(true, 'seed.sql')
} catch (e) {
  ok(false, `seed.sql: ${e.message}`)
}

// Users
const ADMIN = '00000000-0000-0000-0000-00000000000a'
const EDITOR = '00000000-0000-0000-0000-00000000000e'
const USER = '00000000-0000-0000-0000-00000000000u'.replace('u', '1')
await db.exec(`
  insert into auth.users (id, email) values ('${ADMIN}', 'admin@example.org'), ('${EDITOR}', 'editor@example.org'), ('${USER}', 'user@example.org');
  update public.profiles set role = 'admin' where id = '${ADMIN}';
  update public.profiles set role = 'editor' where id = '${EDITOR}';
  insert into public.projects (title, slug, category, published) values ('Hidden draft', 'hidden-draft', 'construction', false);
  insert into public.donations (donor_name, donor_email, amount, payment_method, payment_status) values ('Jane', 'jane@example.org', 1000, 'mpesa', 'completed');
`)
ok((await db.query(`select count(*)::int c from public.profiles`)).rows[0].c === 3, 'profiles auto-created for new auth users')

async function as(role, uid, fn) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false); set role ${role};`)
  try { return await fn() } finally { await db.exec('reset role;') }
}
const count = async (sql) => (await db.query(sql)).rows[0]?.c
const throws = async (sql) => { try { await db.exec(sql); return false } catch { return true } }

// ── anon ──
await as('anon', null, async () => {
  ok((await count(`select count(*)::int c from public.projects`)) === 4, 'anon sees only published projects (4 demo)')
  ok((await count(`select count(*)::int c from public.projects where slug = 'hidden-draft'`)) === 0, 'anon cannot see unpublished draft')
  ok((await count(`select count(*)::int c from public.gallery`)) === 55, 'anon reads published gallery')
  ok(await throws(`select * from public.donations`), 'anon cannot read donations')
  ok(await throws(`insert into public.donations (amount, payment_method) values (1, 'card')`), 'anon cannot insert donations')
  ok(!(await throws(`insert into public.contact_messages (full_name, email, subject, message) values ('Visitor', 'v@example.org', 'Hello there', 'A message of ten+ chars')`)), 'anon can submit a contact message')
  ok(await throws(`select * from public.contact_messages`), 'anon cannot read contact messages')
  ok(!(await throws(`insert into public.partnership_enquiries (contact_person, email, partnership_type, message) values ('Visitor', 'v@example.org', 'volunteer', 'Keen to volunteer on weekends')`)), 'anon can submit a partnership enquiry')
  ok(await throws(`update public.site_settings set value = '{}'`) || (await count(`select count(*)::int c from public.site_settings where value = '{}'::jsonb`)) === 0, 'anon cannot modify settings')
  ok(await throws(`insert into public.projects (title, slug, category) values ('X', 'x', 'construction')`), 'anon cannot create projects')
  ok((await count(`select count(*)::int c from public.site_settings`)) === 1, 'anon can read public site settings')
})
// throttle
await as('anon', null, async () => {
  let blocked = false
  for (let i = 0; i < 6; i++) {
    try { await db.exec(`insert into public.contact_messages (full_name, email, subject, message) values ('Spam', 'spam@example.org', 'Subject', 'Message body here')`) } catch { blocked = true }
  }
  ok(blocked, 'contact form throttles >5 submissions per email per hour')
})

// ── regular user ──
await as('authenticated', USER, async () => {
  ok(await throws(`select * from public.donations`) || (await count(`select count(*)::int c from public.donations`)) === 0, 'regular user cannot read donations')
  ok(await throws(`update public.profiles set role = 'admin' where id = '${USER}'`), 'regular user cannot self-promote to admin')
  ok((await count(`select count(*)::int c from public.profiles`)) === 1, 'regular user sees only own profile')
  ok((await count(`select count(*)::int c from public.contact_messages`)) === 0, 'regular user cannot read enquiries')
})

// ── editor ──
await as('authenticated', EDITOR, async () => {
  ok((await count(`select count(*)::int c from public.projects where slug = 'hidden-draft'`)) === 1, 'editor sees drafts')
  ok(!(await throws(`insert into public.projects (title, slug, category) values ('Editor project', 'editor-project', 'renovation')`)), 'editor can create projects')
  ok((await count(`select count(*)::int c from public.contact_messages`)) >= 1, 'editor can read enquiries')
  ok((await count(`select count(*)::int c from public.donations`)) === 0, 'editor cannot read donations')
  const stats = (await db.query(`select public.admin_dashboard_stats() s`)).rows[0].s
  ok(stats && stats.donations === null, 'editor stats omit donation figures')
})

// ── admin ──
await as('authenticated', ADMIN, async () => {
  ok((await count(`select count(*)::int c from public.donations`)) === 1, 'admin reads donations')
  ok(!(await throws(`update public.donations set payment_status = 'completed'`)), 'admin can update donation status')
  ok(await throws(`delete from public.donations`) || (await count(`select count(*)::int c from public.donations`)) === 1, 'donation records cannot be deleted')
  ok(!(await throws(`update public.site_settings set value = value || '{"email":"hello@example.org"}' where key = 'organisation'`)), 'admin updates settings')
  const stats = (await db.query(`select public.admin_dashboard_stats() s`)).rows[0].s
  ok(stats.donations.totals.KES == 1000, 'admin stats include real donation totals')
  ok(!(await throws(`select public.admin_set_role('user@example.org', 'editor')`)), 'admin can assign roles')
})
await as('anon', null, async () => {
  ok(await throws(`select public.admin_dashboard_stats()`), 'anon cannot call admin stats')
})

// ── Podcast, FAQs, sponsorship ──
await as('authenticated', EDITOR, async () => {
  ok(!(await throws(`insert into public.podcast_episodes (title, media_url, published) values ('Draft episode', 'https://youtu.be/abcdefghijk', false)`)), 'editor can add a podcast episode')
  ok(!(await throws(`insert into public.podcast_episodes (title, media_url, published) values ('Live episode', 'https://open.spotify.com/episode/abc123', true)`)), 'editor can publish a podcast episode')
  ok(await throws(`insert into public.podcast_episodes (title, media_url) values ('Bad link', 'http://insecure.example/ep.mp3')`), 'podcast links must be https')
  ok(!(await throws(`insert into public.sponsorship_programs (title, published) values ('Draft programme', false)`)), 'editor can add a sponsorship programme')
  ok(!(await throws(`update public.faqs set answer = answer || ' (edited)' where display_order = 1`)), 'editor can edit FAQs')
})
await as('anon', null, async () => {
  ok((await count(`select count(*)::int c from public.faqs`)) === 12, 'anon reads the 12 seeded FAQs')
  ok((await count(`select count(*)::int c from public.podcast_episodes`)) === 1, 'anon sees only published podcast episodes')
  ok((await count(`select count(*)::int c from public.sponsorship_programs`)) === 0, 'anon cannot see draft sponsorship programmes')
  ok(await throws(`insert into public.faqs (question, answer) values ('Spam question?', 'spam')`), 'anon cannot add FAQs')
  ok(await throws(`delete from public.podcast_episodes`) || (await count(`select count(*)::int c from public.podcast_episodes`)) === 1, 'anon cannot delete podcast episodes')
  ok(await throws(`update public.sponsorship_programs set published = true`) || (await count(`select count(*)::int c from public.sponsorship_programs`)) === 0, 'anon cannot publish sponsorship programmes')
})
// USER was promoted to editor above, so use a fresh account with the default 'user' role.
const VISITOR = '00000000-0000-0000-0000-000000000002'
await db.exec(`reset role; insert into auth.users (id, email) values ('${VISITOR}', 'visitor@example.org');`)
await as('authenticated', VISITOR, async () => {
  ok(await throws(`insert into public.podcast_episodes (title, media_url) values ('User episode', 'https://youtu.be/abcdefghijk')`), 'regular user cannot add podcast episodes')
  ok((await count(`select count(*)::int c from public.sponsorship_programs`)) === 0, 'regular user cannot see draft programmes')
})

console.log(failures ? `\n${failures} check(s) failed` : '\nAll database checks passed')
process.exit(failures ? 1 : 0)
