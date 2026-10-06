// Writes dist/sitemap.xml after `vite build`. Project detail pages are added
// when Supabase credentials are available at build time.
import fs from 'node:fs'
import path from 'node:path'

const site = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://goldenblocksmission.org').replace(/\/$/, '')
const routes = ['/', '/about', '/mission', '/projects', '/featured-projects', '/sponsorship', '/podcast', '/gallery', '/get-involved', '/faqs', '/donate', '/contact', '/privacy', '/terms', '/acknowledgments', '/credits']
let projects = []
const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if (url && key) {
  try {
    const res = await fetch(`${url}/rest/v1/projects?select=slug,updated_at,is_demo&published=eq.true`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    if (res.ok) projects = (await res.json()).filter((p) => !p.is_demo)
  } catch (e) {
    console.warn('[sitemap] could not fetch projects:', e.message)
  }
}
const today = new Date().toISOString().slice(0, 10)
const entries = [
  ...routes.map((r) => ({ loc: site + r, lastmod: today, priority: r === '/' ? '1.0' : '0.8' })),
  ...projects.map((p) => ({ loc: `${site}/projects/${p.slug}`, lastmod: (p.updated_at || today).slice(0, 10), priority: '0.7' })),
]
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
  .map((e) => `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod><priority>${e.priority}</priority></url>`)
  .join('\n')}\n</urlset>\n`
const out = path.resolve(import.meta.dirname, '..', 'dist')
fs.mkdirSync(out, { recursive: true })
fs.writeFileSync(path.join(out, 'sitemap.xml'), xml)
const robots = path.join(out, 'robots.txt')
if (fs.existsSync(robots)) fs.writeFileSync(robots, fs.readFileSync(robots, 'utf8').replace(/Sitemap: .*/, `Sitemap: ${site}/sitemap.xml`))
console.log(`[sitemap] ${entries.length} URLs → dist/sitemap.xml`)
