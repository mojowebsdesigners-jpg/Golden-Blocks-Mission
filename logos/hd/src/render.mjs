// Renders logos/hd/svg → 4K PNGs (4000 px wide, transparent where the SVG has no background).
// usage: node logos/hd/src/render.mjs   (set ONLY=<text> to render only files whose name contains it)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'manifest.json'), 'utf8'))
  .filter((m) => !process.env.ONLY || m.file.includes(process.env.ONLY)) // e.g. ONLY=reference-blocks
const PNG = path.join(ROOT, 'png'); fs.mkdirSync(PNG, { recursive: true })
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' })
const page = await browser.newPage()
for (const m of manifest) {
  const w = 4000, h = Math.round((m.H / m.W) * w)
  const svg = fs.readFileSync(path.join(ROOT, 'svg', m.file)).toString('base64')
  await page.setViewport({ width: w, height: h })
  await page.setContent(`<body style="margin:0;background:transparent"><img style="display:block;width:${w}px;height:${h}px" src="data:image/svg+xml;base64,${svg}">`)
  // a PNG that is open in an image viewer on Windows is locked; skip it rather than abort the whole run
  try { await page.screenshot({ path: path.join(PNG, m.file.replace('.svg', '.png')), omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } }) }
  catch (e) { console.warn(`skipped ${m.file} (file locked?): ${e.code || e.message}`) }
}
await browser.close()
console.log(`rendered ${manifest.length} PNGs at 4000px`)
