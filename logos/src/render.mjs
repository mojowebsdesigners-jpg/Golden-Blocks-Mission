// Renders every SVG in logos/svg to a transparent high-res PNG (logos/png),
// builds logos/preview.html (all concepts + t-shirt mockups) and screenshots it to logos/preview.png.
// usage: node logos/src/render.mjs   (uses the project's puppeteer-core + local Chrome)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'manifest.json'), 'utf8'))
const PNG = path.join(ROOT, 'png'); fs.mkdirSync(PNG, { recursive: true })
const exe = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new' })
const page = await browser.newPage()

const TARGET = 3000 // px on the long side — enough for A3 shirt prints at 250+ dpi
for (const m of manifest) {
  const k = TARGET / Math.max(m.W, m.H), w = Math.round(m.W * k), h = Math.round(m.H * k)
  const svg = fs.readFileSync(path.join(ROOT, 'svg', m.file), 'utf8')
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await page.setContent(`<html><body style="margin:0;background:transparent"><img style="display:block;width:${w}px;height:${h}px" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`)
  await page.screenshot({ path: path.join(PNG, m.file.replace('.svg', '.png')), omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } })
}
console.log(`rendered ${manifest.length} PNGs`)

// ---------- preview sheet ----------
const C = { mustard: '#D9A21B', dark: '#3A3D42', light: '#E6E7E9' }
const shirt = (fill, logo, wide) => `
  <div class="shirt"><svg viewBox="0 0 300 300" aria-hidden="true"><path fill="${fill}" stroke="rgba(0,0,0,.12)" stroke-width="1.5"
    d="M105 22 L70 30 L18 62 L40 112 L70 100 L70 282 L230 282 L230 100 L260 112 L282 62 L230 30 L195 22 C188 42 170 52 150 52 C130 52 112 42 105 22Z"/></svg>
    <img src="svg/${logo}" style="width:${wide ? 36 : 26}%;top:${wide ? 36 : 30}%" alt=""></div>`
const concepts = [...new Map(manifest.map((m) => [m.concept, m])).values()]
const card = (c) => {
  const f = (v) => `${c.concept}_${v}.svg`
  const wide = c.concept.includes('horizontal')
  return `<section class="concept">
    <div class="head"><h2>${c.name}</h2><p>${c.note}</p></div>
    <div class="row ${wide ? 'wide' : ''}">
      <figure style="background:#fff"><img src="svg/${f('color')}" alt=""><figcaption>Full colour</figcaption></figure>
      <figure style="background:${C.dark}"><img src="svg/${f('dark')}" alt=""><figcaption class="inv">On dark</figcaption></figure>
      <figure style="background:#fff"><img src="svg/${f('mono-dark')}" alt=""><figcaption>One colour</figcaption></figure>
      <figure style="background:${C.mustard}"><img src="svg/${f('mono-white')}" alt=""><figcaption class="inv">White ink</figcaption></figure>
    </div>
    <div class="shirts">${shirt('#f4f4f2', f(c.concept.includes('gold') ? 'color' : 'color'), wide)}${shirt(C.dark, f('dark'), wide)}${shirt(C.mustard, f('mono-white'), wide)}${shirt('#1d1f22', f('dark'), wide)}</div>
  </section>`
}
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Golden Blocks Logos</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&display=swap" rel="stylesheet">
<style>
  :root{--mustard:${C.mustard};--dark:${C.dark};--light:${C.light};--bg:#f6f6f4}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--dark);font-family:Montserrat,system-ui,sans-serif}
  header{padding:56px 24px 24px;max-width:1240px;margin:auto} header h1{margin:0;font-weight:800;letter-spacing:.02em;font-size:clamp(28px,4vw,44px)}
  header p{margin:8px 0 0;opacity:.75;max-width:720px;line-height:1.5}
  .sw{display:flex;gap:10px;margin-top:18px}.sw span{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600}.sw i{width:22px;height:22px;border-radius:5px;border:1px solid rgba(0,0,0,.1)}
  main{max-width:1240px;margin:auto;padding:0 24px 64px}
  .concept{background:#fff;border-radius:18px;padding:28px;margin-top:28px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
  .head h2{margin:0;font-size:22px;font-weight:800}.head p{margin:6px 0 20px;opacity:.75;line-height:1.5}
  .row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.row.wide{grid-template-columns:1fr 1fr}
  figure{margin:0;border-radius:12px;border:1px solid rgba(0,0,0,.08);padding:26px 22px 40px;position:relative;display:grid;place-items:center;min-height:240px}
  figure img{width:100%;max-height:260px;object-fit:contain}
  figcaption{position:absolute;left:12px;bottom:10px;font-size:12px;font-weight:600;opacity:.6}.inv{color:#fff;opacity:.8}
  .shirts{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:14px}
  .shirt{position:relative;background:#eceae6;border-radius:12px;aspect-ratio:1}.shirt svg{width:100%;height:100%;display:block}
  .shirt img{position:absolute;left:50%;transform:translateX(-50%)}
  @media (max-width:760px){.row,.shirts{grid-template-columns:1fr 1fr}}
</style></head><body>
<header><h1>GOLDEN BLOCKS MISSION — Logo Concepts</h1>
<p>Six directions built from the hand sketch. Every concept comes in full colour, on-dark, one-colour and white-ink versions. All files are pure vectors with text converted to outlines — ready for screen printing, embroidery and the web.</p>
<div class="sw"><span><i style="background:${C.mustard}"></i>Mustard ${C.mustard}</span><span><i style="background:${C.dark}"></i>Dark grey ${C.dark}</span><span><i style="background:${C.light}"></i>Light grey ${C.light}</span></div></header>
<main>${concepts.map(card).join('')}</main></body></html>`
fs.writeFileSync(path.join(ROOT, 'preview.html'), html)
await page.setViewport({ width: 1300, height: 900, deviceScaleFactor: 1 })
await page.goto(pathToFileURL(path.join(ROOT, 'preview.html')).href, { waitUntil: 'networkidle0' })
await page.screenshot({ path: path.join(ROOT, 'preview.png'), fullPage: true })
await browser.close()
console.log('wrote preview.html + preview.png')
