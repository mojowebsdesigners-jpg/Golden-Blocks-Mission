# Deployment (Vercel)

## Deploy

1. Push the repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository. The framework preset is detected from `vercel.json`:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add every variable from `.env.example` under **Settings → Environment Variables**, for Production and Preview. Set `VITE_SITE_URL` and `SITE_URL` to the final domain.
4. Deploy, then add your custom domain under **Settings → Domains**.
5. Update the domain in:
   - Supabase **Auth → URL configuration** (see SETUP.md)
   - the Paystack webhook URL
   - Daraja, if you registered fixed URLs
   - `public/robots.txt`. The sitemap line is rewritten automatically at build time from `VITE_SITE_URL`.

### What `vercel.json` configures

- SPA rewrites, so routes like `/projects/slug` serve `index.html`. `/api/*` serves the serverless functions.
- Security headers: Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy and Permissions-Policy.
- Long-lived caching for hashed assets and images.

If you later embed third-party content (maps, video), widen the CSP for those origins only.

## Go-live checklist

**Organisation content (Admin → Settings)**
- [ ] Email, phone, address, office hours and social links entered (placeholders disappear automatically)
- [ ] Bank details entered and double-checked
- [ ] SDA logo uploaded, but **only after written usage permission**; the partnership statement reviewed

**Projects and gallery (Admin → Projects / Gallery)**
- [ ] Real projects created and published
- [ ] Demonstration projects deleted, or edited with "Demonstration content" unticked
- [ ] Gallery reviewed; add the organisation's own photographs as they become available

**Payments**
- [ ] M-Pesa switched to `MPESA_ENV=production` with live credentials, and tested with a small real payment
- [ ] Paystack switched to the live secret key, live webhook URL set, and a real card payment tested
- [ ] Confirmation email received for both tests
- [ ] A bank pledge recorded and marked received in Admin → Donations

**Legal and housekeeping**
- [ ] Privacy Policy and Terms reviewed and approved (template text is marked on those pages), ideally against the Kenya Data Protection Act 2019
- [ ] Public sign-ups disabled in Supabase Auth
- [ ] Supabase backups / Point-in-Time Recovery enabled on a paid plan
- [ ] `npm run test:sql` passes; `npm run build` passes

## Performance notes

- Every route is code-split. The Three.js bundle loads only on pages with 3D (Home, Gallery) and only when a scene nears the viewport.
- 3D scenes pause rendering when offscreen. They reduce pixel ratio, shadows and object counts on phones and low-power devices. Without WebGL, they fall back to static imagery.
- `prefers-reduced-motion` disables smooth scrolling, pinning and the scroll animations; content stays fully accessible.
- Gallery images ship in three sizes (2400 / 960 / 480 px WebP). Admin uploads are resized to at most 2400 px in the browser before storage.
