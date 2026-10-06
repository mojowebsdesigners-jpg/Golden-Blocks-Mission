// Renders final SVGs → transparent 3000px PNGs, plus one presentation image per logo
// (logo/showcase-*.png) and a shirt mockup per logo. usage: node logos/final/src/render.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'manifest.json'), 'utf8'))
const PNG = path.join(ROOT, 'png'); fs.mkdirSync(PNG, { recursive: true })
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' })
const page = await browser.newPage()
const uri = (file) => `data:image/svg+xml;base64,${fs.readFileSync(path.join(ROOT, 'svg', file)).toString('base64')}`

for (const m of manifest) {
  const k = 3000 / Math.max(m.W, m.H), w = Math.round(m.W * k), h = Math.round(m.H * k)
  await page.setViewport({ width: w, height: h })
  await page.setContent(`<body style="margin:0;background:transparent"><img style="display:block;width:${w}px;height:${h}px" src="${uri(m.file)}">`)
  await page.screenshot({ path: path.join(PNG, m.file.replace('.svg', '.png')), omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } })
}

// presentation boards
const shirtPath = 'M105 22 L70 30 L18 62 L40 112 L70 100 L70 282 L230 282 L230 100 L260 112 L282 62 L230 30 L195 22 C188 42 170 52 150 52 C130 52 112 42 105 22Z'
const shirt = (fill, file, width) => `<div style="position:relative;width:560px;height:560px">
  <svg viewBox="0 0 300 300" style="width:100%;height:100%;filter:drop-shadow(0 18px 30px rgba(0,0,0,.25))"><path d="${shirtPath}" fill="${fill}"/>
  <path d="M105 22 C112 42 130 52 150 52 C170 52 188 42 195 22" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5"/></svg>
  <img src="${uri(file)}" style="position:absolute;left:50%;top:27%;width:${width}%;transform:translateX(-50%)"></div>`
const boards = {
  'gold-bars': { bg: 'radial-gradient(circle at 50% 40%,#f7f5ef,#e4e1d8)', main: 'full', shirts: [['#2B2E32', 'flat', 30], ['#F2F1EC', 'flat', 30], ['#D9A21B', 'mono-white', 30]] },
  'emblem-seal': { bg: 'radial-gradient(circle at 50% 40%,#43474d,#202226)', main: 'full', shirts: [['#2B2E32', 'flat', 30], ['#F2F1EC', 'flat', 30], ['#D9A21B', 'mono-white', 30]] },
}
for (const [id, b] of Object.entries(boards)) {
  const f = (v) => `golden-blocks_${id}_${v}.svg`
  // 1) hero showcase
  await page.setViewport({ width: 2400, height: 1600 })
  await page.setContent(`<body style="margin:0;width:2400px;height:1600px;background:${b.bg};display:grid;place-items:center">
    <img src="${uri(f(b.main))}" style="height:1240px;filter:drop-shadow(0 30px 60px rgba(0,0,0,.28))">`)
  await page.screenshot({ path: path.join(ROOT, `showcase_${id}.png`) })
  // 2) shirt mockups
  await page.setViewport({ width: 2400, height: 1000 })
  await page.setContent(`<body style="margin:0;width:2400px;height:1000px;background:linear-gradient(#eeece6,#dedad0);display:flex;align-items:center;justify-content:space-evenly">
    ${b.shirts.map(([c, v, w]) => shirt(c, f(v), w)).join('')}`)
  await page.screenshot({ path: path.join(ROOT, `shirts_${id}.png`) })
}
await browser.close()
console.log(`rendered ${manifest.length} PNGs + showcase/shirt boards`)
