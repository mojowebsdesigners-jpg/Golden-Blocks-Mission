# Golden Blocks Mission — website

**Building His House. Advancing His Mission.**

A cinematic, multi-page website for Golden Blocks Mission. It has scroll-driven 3D storytelling, an admin dashboard, Supabase for the backend, and real payment integrations: M-Pesa through Daraja STK Push, and cards through Paystack.

| | |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Motion & 3D | GSAP ScrollTrigger, Lenis, Framer Motion, Three.js, React Three Fiber, drei |
| Backend | Supabase (Postgres + Row Level Security, Auth, Storage) and Vercel serverless functions (`/api`) |
| Payments | M-Pesa Daraja STK Push, Paystack (one-time and monthly cards), bank-transfer pledges |
| Hosting | Vercel |

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in values (see docs/SETUP.md)
npm run dev                    # http://localhost:5173 (also serves /api locally)
```

The site still runs without any environment variables:
- It shows the curated gallery and clearly labelled **demonstration** projects.
- Contact details appear as marked placeholders.
- Forms and payments say honestly that the backend is not connected yet.

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server with a local emulation of the Vercel `/api` functions |
| `npm run build` | Type-check, production build and `dist/sitemap.xml` |
| `npm run preview` | Preview the production build |
| `npm run test:sql` | Applies every migration and the seed to an in-memory Postgres, then runs 34 RLS and security checks |

## Pages

`/` · `/about` · `/mission` · `/projects` · `/projects/:slug` · `/gallery` · `/get-involved` · `/donate` · `/donate/thank-you` · `/contact` · `/privacy` · `/terms` · `/credits` · `/admin`

## Project structure

```
api/                     Vercel serverless functions (payments, webhooks, status, health)
  _lib/                  shared server code: Supabase service client, Daraja, Paystack, email
public/images/gallery/   55 curated, colour-graded photos (2400px + 960px + 480px WebP)
src/
  animations/            reveal, parallax, pixel-dissolve, GSAP setup
  components/            layout (nav, menu, footer, rail), forms, ui, common
  data/                  editorial copy, gallery manifest, demo projects
  pages/                 one file per route; pages/admin/ holds the dashboard
  sections/              homepage sections and shared page sections
  services/              data access (public content, forms, donations, admin)
  three/                 3D scenes: interactive name, block-assembly church, gallery sphere
supabase/
  migrations/            schema, RLS, storage, admin functions
  seed.sql               organisation settings, gallery and demo projects
docs/                    SETUP.md, DEPLOYMENT.md, CONTENT.md
```

## Documentation

- **[docs/SETUP.md](docs/SETUP.md)**: Supabase, the first administrator, M-Pesa, Paystack and email.
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**: Vercel deployment and the go-live checklist.
- **[docs/CONTENT.md](docs/CONTENT.md)**: what is placeholder or demonstration content, and how to replace it.
