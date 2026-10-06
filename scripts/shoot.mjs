// Dev QA helper: captures screenshots of a route at given scroll positions.
// usage: node scripts/shoot.mjs <path> <outPrefix> [width] [height] [scrollYs comma-separated, in viewport heights]
import puppeteer from 'puppeteer-core'
const [, , path = '/', out = 'shot', w = '1440', h = '900', ys = '0'] = process.argv
const exe = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage()
const logs = []
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`) })
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => logs.push(`[reqfail] ${r.url()} ${r.failure()?.errorText}`))
page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`) })
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 })
await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise((r) => setTimeout(r, Number(process.env.SETTLE || 3500)))
let i = 0
for (const tok of ys.split(',')) {
  await page.evaluate((t) => {
    // "1.5" = 1.5 viewport heights; "#id@0.5" = section top (pin-spacer aware) + 0.5 viewport heights
    let y = 0
    if (t.startsWith('#')) {
      const [sel, off = '0'] = t.split('@')
      const el = document.querySelector(sel)
      const host = el?.closest('.pin-spacer') ?? el
      y = (host ? host.getBoundingClientRect().top + window.scrollY : 0) + Number(off) * window.innerHeight
    } else y = Number(t) * window.innerHeight
    window.scrollTo(0, y)
  }, tok)
  await new Promise((r) => setTimeout(r, 2200))
  await page.screenshot({ path: `${out}_${String(i++).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 70 })
}
const metrics = await page.evaluate(() => ({ scrollH: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > window.innerWidth }))
console.log(JSON.stringify(metrics))
console.log(logs.slice(0, 40).join('\n'))
await browser.close()
