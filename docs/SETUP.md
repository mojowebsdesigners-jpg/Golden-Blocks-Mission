# Setup guide

This guide connects the website to Supabase, M-Pesa, Paystack and email. Every variable is listed in [`.env.example`](../.env.example).

> **Security rule:** only variables that start with `VITE_` reach the browser, and they must be public. Never put the Supabase service-role key, Daraja secrets or the Paystack secret key in a `VITE_` variable.

---

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com) (region: closest to Kenya, e.g. EU Central or South Africa where offered).
2. Apply the database migrations, using either method:
   - **CLI** (recommended):
     ```bash
     npx supabase login
     npx supabase link --project-ref YOUR-PROJECT-REF
     npx supabase db push           # applies supabase/migrations/*
     psql "$DATABASE_URL" -f supabase/seed.sql   # or paste seed.sql into the SQL editor
     ```
   - **Dashboard**: open the SQL editor and run each file in `supabase/migrations/` in filename order, then run `supabase/seed.sql`.
3. Go to **Project Settings → API** and copy:
   - `Project URL` into `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - `anon public` key into `VITE_SUPABASE_ANON_KEY`
   - `service_role` key into `SUPABASE_SERVICE_ROLE_KEY` (server only)
4. Go to **Authentication → URL Configuration**:
   - Set **Site URL** to your domain.
   - Add `https://YOUR-DOMAIN/admin` (and `http://localhost:5173/admin`) to the redirect URLs. Password-reset links need these.
5. Recommended: under **Authentication → Providers → Email**, disable public sign-ups. Staff accounts are then created only by invitation.

### What the database enforces

| Table | Visitors (anon) | Editors | Admins |
|---|---|---|---|
| projects, project_images, project_updates, gallery | read **published** rows only | full management | full management |
| contact_messages, partnership_enquiries | **submit only**, can never read | read and update status | plus delete |
| donations | **no access** | no access | read and update (cannot delete) |
| site_settings | read | none | read and update |
| profiles | none | own profile | all profiles and roles |

- Donations are written only by the server functions using the service role.
- Public forms are throttled to 5 submissions per email address per hour.
- Run `npm run test:sql` to verify all of this locally.

## 2. The first administrator

1. In Supabase go to **Authentication → Users → Add user → Create new user** and enter an email and password. Tick "Auto confirm".
2. In the SQL editor, run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.org';
   ```
3. Sign in at `/admin`. Further staff can then be invited the same way and given roles under **Admin → Team**.

## 3. M-Pesa (Daraja STK Push)

1. Create an app at [developer.safaricom.co.ke](https://developer.safaricom.co.ke) with the **M-Pesa Express** product.
2. Sandbox values for testing:

   | Variable | Value |
   |---|---|
   | `MPESA_ENV` | `sandbox` |
   | `MPESA_SHORTCODE` | `174379` |
   | `MPESA_PASSKEY` | the sandbox passkey shown on the Daraja simulator |
   | `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | from your app |

3. Set `MPESA_CALLBACK_SECRET` to a long random value (`openssl rand -hex 32`). Daraja callbacks are unsigned, so the site protects them in three ways:
   - It requires this secret in the callback URL.
   - It re-confirms each result with Daraja's STK Query API before recording a donation as completed.
   - It checks that the amount paid matches.
4. Daraja must be able to reach your callback over public HTTPS. For local testing, expose the dev server (e.g. `ngrok http 5173`) and set `MPESA_CALLBACK_BASE_URL` to the tunnel URL.
5. **Going live:** apply for M-Pesa Express on your own Paybill or Till ("Go Live" on the Daraja portal). Then:
   - Set `MPESA_ENV=production`.
   - Use your real shortcode, passkey and production app keys.
   - For a Till (Buy Goods), set `MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline`, put the store number in `MPESA_SHORTCODE` and the till in `MPESA_TILL_NUMBER`.

If the callback is ever missed, `/api/donations/status` reconciles pending payments with Daraja automatically while the donor's page is open.

## 4. Paystack (cards, one-time and monthly)

1. Create a Paystack account for the organisation (Paystack supports Kenyan businesses and settles in KES; USD requires enabling it on your account).
2. Copy the secret key from **Settings → API Keys & Webhooks** into `PAYSTACK_SECRET_KEY`. Use `sk_test_…` while testing.
3. Set the **webhook URL** to `https://YOUR-DOMAIN/api/donations/paystack/webhook`. Webhooks are verified with HMAC-SHA512. They also record monthly renewals as new verified donations.
4. Monthly gifts create (or reuse) a monthly Paystack plan for that amount. Donors can cancel through the link in Paystack's emails, or by contacting you.

The thank-you page never trusts the redirect alone. It calls `/api/donations/paystack/verify`, which checks the transaction with Paystack's API, including amount and currency, before showing a confirmation.

## 5. Bank transfer

- Donors choosing bank transfer get a unique reference, and a **pledge** is recorded.
- Enter your bank details under **Admin → Settings**.
- When the funds arrive, open **Admin → Donations** and click **Mark received**. Only then does the pledge count as a verified donation.

## 6. Confirmation emails (optional)

1. Create a [Resend](https://resend.com) account and verify your sending domain.
2. Set `RESEND_API_KEY` and `EMAIL_FROM`.

Donors are emailed once, only after their payment is verified. Without these keys, everything works except the email.

## 7. Check the integrations

Sign in to `/admin`. The **Integrations** panel on the dashboard shows which services are configured (from `/api/health`, which reports booleans only).
