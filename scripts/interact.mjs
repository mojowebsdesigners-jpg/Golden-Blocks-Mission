// Dev QA: drives key interactions in a real browser and reports results.
import puppeteer from 'puppeteer-core'
const out = process.argv[2] ?? '.'
const exe = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.setViewport({ width: 1280, height: 860 })
const base = 'http://localhost:5173'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const report = (ok, label) => console.log(`${ok ? '✔' : '✘'} ${label}`)
const text = () => page.evaluate(() => document.body.innerText)

if (process.argv[3] === 'gallery-only') { await galleryTest(); process.exit(0) }
// 1. Contact form validation + backend-not-connected handling
await page.goto(`${base}/contact`, { waitUntil: 'networkidle0' })
await wait(1500)
await page.click('form[aria-label="Contact form"] button[type=submit]')
await wait(500)
let t = await text()
report(t.includes('Please enter your full name') && t.includes('Enter a valid email address'), 'contact: empty submit shows validation errors')
await page.type('input[autocomplete=name]', 'Test Person')
await page.type('input[type=email]', 'test@example.org')
const inputs = await page.$$('form[aria-label="Contact form"] input')
await inputs[4].type('Question about projects') // subject
await page.type('form[aria-label="Contact form"] textarea', 'Hello, I would like to learn more about your work.')
await page.click('form[aria-label="Contact form"] button[type=submit]')
await wait(1200)
t = await text()
report(t.includes('backend is not connected yet'), 'contact: shows honest error when Supabase is not configured')
await page.screenshot({ path: `${out}/i_contact.jpg`, type: 'jpeg', quality: 70 })

// 2. Partnership tab switch
await page.evaluate(() => [...document.querySelectorAll('[role=tab]')].find((b) => b.textContent.includes('Partnership'))?.click())
await wait(500)
report(!!(await page.$('form[aria-label="Partnership enquiry form"]')), 'contact: partnership tab shows enquiry form')

// 3. Donate: M-Pesa validation and 503 handling
await page.goto(`${base}/donate`, { waitUntil: 'networkidle0' })
await wait(1500)
await page.click('form[aria-label="Donation form"] button[type=submit]')
await wait(500)
t = await text()
report(t.includes('Enter an amount') || t.includes('greater than zero'), 'donate: empty submit asks for amount')
await page.type('#amount', '1500')
await page.type('input[autocomplete=name]', 'Grace Donor')
await page.type('input[type=email]', 'grace@example.org')
await page.type('input[type=tel]', '0712345678')
await page.click('form[aria-label="Donation form"] button[type=submit]')
await wait(1500)
t = await text()
report(t.includes('M-Pesa giving is not available yet'), 'donate: M-Pesa shows honest "not available" when unconfigured (no fake success)')
const monthlyDisabled = await page.evaluate(() => document.querySelector('input[value=monthly]')?.disabled)
report(monthlyDisabled === true, 'donate: monthly disabled for M-Pesa')
await page.evaluate(() => [...document.querySelectorAll('label')].find((l) => l.textContent.includes('Bank transfer'))?.click())
await wait(300)
await page.click('form[aria-label="Donation form"] button[type=submit]')
await wait(1500)
t = await text()
report(t.includes('not available yet') && !t.includes('Pledge recorded'), 'donate: bank pledge refuses without database (no fake pledge)')
await page.screenshot({ path: `${out}/i_donate.jpg`, type: 'jpeg', quality: 70 })

// 4. Thank-you page never claims success without verification
await page.goto(`${base}/donate/thank-you?reference=GBM-ABCDEFGH`, { waitUntil: 'networkidle0' })
await wait(1500)
t = await text()
report(!t.includes('Payment verified') && t.includes('could not confirm'), 'thank-you: unverifiable reference is not shown as success')

// 5. Menu overlay + keyboard close
await page.goto(`${base}/about`, { waitUntil: 'networkidle0' })
await wait(800)
const hiddenOnHero = await page.$eval('header', (h) => getComputedStyle(h).opacity === '0')
report(hiddenOnHero, 'navbar: hidden over the first section')
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.1))
await wait(1200)
report(await page.$eval('header', (h) => Number(getComputedStyle(h).opacity) > 0.9), 'navbar: visible from the second section')
await page.click('button[aria-label="Open menu"]')
await wait(1200)
report(!!(await page.$('#site-menu')), 'menu: overlay opens')
await page.screenshot({ path: `${out}/i_menu.jpg`, type: 'jpeg', quality: 70 })
await page.keyboard.press('Escape')
await wait(1200)
report(!(await page.$('#site-menu')), 'menu: Escape closes overlay')

// 6. Projects filter + detail navigation
await page.goto(`${base}/projects`, { waitUntil: 'networkidle0' })
await wait(1200)
await page.evaluate(() => [...document.querySelectorAll('[role=tab]')].find((b) => b.textContent.includes('Completed'))?.click())
await wait(1200)
const cards = await page.$$eval('article h2', (els) => els.map((e) => e.textContent))
report(cards.length === 1 && cards[0].includes('Chapel'), `projects: "Completed" filter shows 1 project (${cards.join(', ')})`)
report(page.url().includes('filter=completed'), 'projects: filter reflected in URL')

async function galleryTest() {
await page.goto(`${base}/gallery`, { waitUntil: 'networkidle0' })
await wait(2000)
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.3))
await wait(1500)
await page.evaluate(() => document.querySelector('button[aria-label^="View image"]').click())
await wait(1000)
const c1 = await page.$eval('[role=dialog] span.font-mono', (e) => e.textContent)
await page.keyboard.press('ArrowRight')
await wait(800)
const c2 = await page.$eval('[role=dialog] span.font-mono', (e) => e.textContent)
report(c1 !== c2, `gallery: lightbox opens and arrow key advances (${c1} → ${c2})`)
const credit = await page.$eval('[role=dialog]', (e) => e.innerText.includes('Photo:'))
report(credit, 'gallery: lightbox shows photo credit')
await page.screenshot({ path: `${out}/i_lightbox.jpg`, type: 'jpeg', quality: 70 })
await page.keyboard.press('Escape')
}
await galleryTest()

// 8. 404
await page.goto(`${base}/does-not-exist`, { waitUntil: 'networkidle0' })
await wait(800)
report((await text()).includes('This stone has not been laid yet'), '404 page renders for unknown routes')

console.log(errors.length ? `\nConsole errors:\n${errors.slice(0, 10).join('\n')}` : '\nNo console errors')
await browser.close()
