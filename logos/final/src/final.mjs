// Golden Blocks Mission — FINAL logos (two standalone marks: "Gold Bars" and "Emblem Seal").
// Pure-vector SVG, text converted to outlines. Variants:
//   full  — gradients + glow (screens, DTG/digital print, social media)
//   flat  — solid spot colours only (screen printing, embroidery, vinyl)
//   mono-dark / mono-white — single ink
// usage: NODE_PATH=<dir with opentype.js + @fontsource/montserrat> node logos/final/src/final.mjs
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(process.env.NODE_PATH ? path.join(process.env.NODE_PATH, 'x.js') : import.meta.url)
const opentype = require('opentype.js')
const loadFont = (w) => { const b = fs.readFileSync(require.resolve(`@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff`)); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)) }
const F = { med: loadFont(500), semi: loadFont(600), bold: loadFont(700), extra: loadFont(800) }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'svg'); fs.mkdirSync(OUT, { recursive: true })

const C = {
  gold: '#D9A21B', goldDeep: '#B5850F', goldDark: '#8F680A', goldLight: '#EDBE45', goldPale: '#F6D978',
  dark: '#3A3D42', darker: '#2B2E32', darkest: '#212327', light: '#E6E7E9', white: '#FFFFFF',
}

// ---------- text → outlines ----------
function layout(font, str, size, tracking = 0) {
  const scale = size / font.unitsPerEm, glyphs = font.stringToGlyphs(str)
  let x = 0; const items = []
  glyphs.forEach((g, i) => {
    items.push({ g, x }); x += g.advanceWidth * scale + tracking
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale
  })
  return { items, width: x - tracking, scale }
}
function text(font, str, { size, x = 0, y = 0, anchor = 'middle', tracking = 0, maxWidth }) {
  let L = layout(font, str, size, tracking * size)
  if (maxWidth && L.width > maxWidth) { size *= maxWidth / L.width; L = layout(font, str, size, tracking * size) }
  const x0 = anchor === 'middle' ? x - L.width / 2 : anchor === 'end' ? x - L.width : x
  return { d: L.items.map(({ g, x: gx }) => g.getPath(x0 + gx, y, size).toPathData(2)).join(''), width: L.width, size }
}
function arcText(font, str, { cx, cy, r, size, tracking = 0, side = 'top' }) {
  const L = layout(font, str, size, tracking * size)
  const capH = (font.tables.os2.sCapHeight || font.unitsPerEm * 0.7) * L.scale
  const rb = side === 'top' ? r - capH / 2 : r + capH / 2
  return L.items.map(({ g, x }) => {
    const adv = g.advanceWidth * L.scale, s = x + adv / 2 - L.width / 2
    const th = side === 'top' ? -Math.PI / 2 + s / rb : Math.PI / 2 - s / rb
    const d = g.getPath(-adv / 2, 0, size).toPathData(2)
    return d ? `<path transform="translate(${(cx + rb * Math.cos(th)).toFixed(2)} ${(cy + rb * Math.sin(th)).toFixed(2)}) rotate(${((th * 180) / Math.PI + (side === 'top' ? 90 : -90)).toFixed(3)})" d="${d}"/>` : ''
  }).join('')
}

// ---------- shapes ----------
const f2 = (n) => +n.toFixed(2)
const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
const rect = (x, y, w, h) => `M${x} ${y}H${x + w}V${y + h}H${x}Z`
const circ = (cx, cy, r) => `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`
const poly = (pts) => 'M' + pts.map((p) => p.map(f2).join(' ')).join('L') + 'Z'
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const diamond = (cx, cy, r) => poly([[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]])

const DEFS_FULL = `<defs>
  <linearGradient id="face" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.goldPale}"/><stop offset=".45" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDeep}"/></linearGradient>
  <linearGradient id="top" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FBE7A1"/><stop offset="1" stop-color="${C.goldLight}"/></linearGradient>
  <linearGradient id="left" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.goldLight}"/><stop offset="1" stop-color="${C.gold}"/></linearGradient>
  <linearGradient id="right" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.goldDeep}"/><stop offset="1" stop-color="${C.goldDark}"/></linearGradient>
  <linearGradient id="goldText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.goldPale}"/><stop offset="1" stop-color="${C.gold}"/></linearGradient>
  <radialGradient id="tileBg" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="#4A4E54"/><stop offset=".6" stop-color="${C.dark}"/><stop offset="1" stop-color="${C.darkest}"/></radialGradient>
  <radialGradient id="disc" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#4B4F56"/><stop offset=".7" stop-color="${C.dark}"/><stop offset="1" stop-color="${C.darkest}"/></radialGradient>
  <radialGradient id="band" cx=".5" cy=".4" r=".65"><stop offset="0" stop-color="#F4F5F6"/><stop offset="1" stop-color="#D3D5D8"/></radialGradient>
  <radialGradient id="glowG"><stop offset="0" stop-color="${C.gold}" stop-opacity=".45"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>
  <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>`

// A bevelled gold bar. mode: full | flat | mono
function bar(x, y, w, h, k, mode, ink) {
  if (mode === 'mono') {
    // engraved look in one ink: solid rim, hairline gap, solid face
    const g = Math.max(4, k * 0.28)
    return P(rect(x, y, w, h) + rect(x + k - g, y + k - g, w - 2 * (k - g), h - 2 * (k - g)) + rect(x + k, y + k, w - 2 * k, h - 2 * k), ink, ' fill-rule="evenodd"')
  }
  const full = mode === 'full'
  const col = full ? { face: 'url(#face)', top: 'url(#top)', left: 'url(#left)', right: 'url(#right)', bot: C.goldDark }
    : { face: C.gold, top: C.goldLight, left: C.goldLight, right: C.goldDeep, bot: C.goldDeep }
  const X = x + w, Y = y + h
  let s = ''
  s += P(poly([[x, y], [X, y], [X - k, y + k], [x + k, y + k]]), col.top)
  s += P(poly([[x, y], [x + k, y + k], [x + k, Y - k], [x, Y]]), col.left)
  s += P(poly([[X, y], [X, Y], [X - k, Y - k], [X - k, y + k]]), col.right)
  s += P(poly([[x, Y], [x + k, Y - k], [X - k, Y - k], [X, Y]]), col.bot)
  s += P(rect(x + k, y + k, w - 2 * k, h - 2 * k), col.face)
  if (full) {
    // diagonal shine streak clipped to the face
    const fx = x + k, fy = y + k, fw = w - 2 * k, fh = h - 2 * k
    s += `<path d="${poly([[fx + fw * 0.1, fy], [fx + fw * 0.38, fy], [fx + fw * 0.02, fy + fh * 0.55], [fx, fy + fh * 0.55], [fx, fy + fh * 0.26]])}" fill="#fff" opacity=".22"/>`
    s += `<path d="${poly([[fx + fw * 0.5, fy], [fx + fw * 0.6, fy], [fx + fw * 0.08, fy + fh * 0.8], [fx, fy + fh * 0.8], [fx, fy + fh * 0.76]])}" fill="#fff" opacity=".12"/>`
  }
  return s
}
function barGrid({ cx, y, w, h, gap, k }, mode, ink) {
  const xs = [cx - gap / 2 - w, cx + gap / 2], ys = [y, y + h + gap]
  let s = ''
  for (const yy of ys) for (const xx of xs) s += bar(xx, yy, w, h, k, mode, ink)
  return s
}

// laurel branch (left side), drawn around (cx,cy); mirror for the right
function laurel(cx, cy, r, a0, a1, n, leaf, fill, stroke) {
  const pt = (a, rad = r) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]
  const toR = (d) => (d * Math.PI) / 180
  let s = `<path d="M${pt(toR(a0)).map(f2).join(' ')}A${r} ${r} 0 0 1 ${pt(toR(a1)).map(f2).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${leaf * 0.22}" stroke-linecap="round"/>`
  for (let i = 0; i < n; i++) {
    const a = toR(a0 + ((a1 - a0) * (i + 0.6)) / n)
    const [px, py] = pt(a)
    const tang = (a * 180) / Math.PI + 90 // direction of travel (clockwise)
    const sc = 1 - (i / n) * 0.35 // leaves get smaller toward the tip
    for (const side of [-1, 1]) {
      const ang = tang + side * 38
      s += `<ellipse cx="0" cy="${-leaf * sc}" rx="${f2(leaf * 0.36 * sc)}" ry="${f2(leaf * sc)}" fill="${fill}" transform="translate(${f2(px)} ${f2(py)}) rotate(${f2(ang + 90)})"/>`
    }
  }
  const [tx, ty] = pt(toR(a1))
  s += `<ellipse cx="0" cy="${-leaf * 0.6}" rx="${f2(leaf * 0.26)}" ry="${f2(leaf * 0.7)}" fill="${fill}" transform="translate(${f2(tx)} ${f2(ty)}) rotate(${f2(a1 + 180)})"/>`
  return s
}

// ================= LOGO 1: GOLD BARS =================
// opts.bare: no tile, frame or glow (transparent background). opts.only: the four bars and nothing else.
function goldBars(v, opts = {}) {
  const W = 1000, H = 1150, mono = v.startsWith('mono'), full = v.startsWith('full'), bare = opts.bare || opts.only
  const ink = v === 'mono-white' ? C.white : v === 'mono-dark' ? C.dark : null
  const gold = mono ? ink : full ? 'url(#goldText)' : C.gold
  const lightInk = mono ? ink : bare && !v.endsWith('on-dark') ? C.dark : C.light
  let s = full ? DEFS_FULL : ''
  if (!mono && !bare) s += P(rr(0, 0, W, H, 60), full ? 'url(#tileBg)' : C.dark)
  // fine inner frame with corner diamonds
  const m = 34
  if (!bare) s += `<path d="${rr(m, m, W - 2 * m, H - 2 * m, 34)}" fill="none" stroke="${gold}" stroke-width="3" opacity="${mono ? 1 : 0.75}"/>`
  if (!bare) for (const [dx, dy] of [[m + 34, m], [W - m - 34, m], [m + 34, H - m], [W - m - 34, H - m]]) s += P(diamond(dx, dy, 9), gold)
  // glow + floor shadow behind the bars
  const B = { cx: W / 2, y: 150, w: 172, h: 245, gap: 24, k: 20 }
  const gh = 2 * B.h + B.gap
  if (full && !bare) {
    s += `<ellipse cx="${W / 2}" cy="${B.y + gh / 2}" rx="360" ry="330" fill="url(#glowG)"/>`
    s += `<ellipse cx="${W / 2}" cy="${B.y + gh + 18}" rx="230" ry="16" fill="#000" opacity=".35" filter="url(#soft)"/>`
    s = s.replace('</defs>', '<filter id="soft" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="9"/></filter></defs>')
  }
  s += barGrid(B, mono ? 'mono' : full ? 'full' : 'flat', ink)
  if (opts.only) return { W: B.w * 2 + B.gap + 40, H: gh + 40, x0: B.cx - B.gap / 2 - B.w - 20, y0: B.y - 20, s }
  // wordmark
  const y1 = 790
  const t1 = text(F.extra, 'GOLDEN BLOCKS', { size: 104, x: W / 2, y: y1, tracking: 0.04, maxWidth: 780 })
  s += P(t1.d, lightInk)
  const t2 = text(F.bold, 'MISSION', { size: 54, x: W / 2, y: y1 + 92, tracking: 0.55 })
  s += P(t2.d, gold)
  // flanking rules with diamond ends
  const half = t2.width / 2 + 34, ry = y1 + 72
  for (const sgn of [-1, 1]) {
    const a = W / 2 + sgn * half, b = W / 2 + sgn * (t1.width / 2)
    s += P(rect(Math.min(a, b), ry - 1.5, Math.abs(b - a), 3), gold) + P(diamond(b + sgn * 8, ry, 7), gold)
  }
  const t3 = text(F.semi, 'NORTH EAST KENYA FIELD', { size: 31, x: W / 2, y: y1 + 168, tracking: 0.32 })
  s += P(t3.d, lightInk, mono ? '' : ' opacity=".82"')
  // ornament: three tiny blocks under the field line
  for (const dx of [-26, 0, 26]) s += P(rect(W / 2 + dx - 7, y1 + 205, 14, 14), gold, dx ? ' opacity=".55"' : '')
  if (bare) return { W: 860, H: 920, x0: 70, y0: 120, s }
  return { W, H, s }
}

// ================= LOGO 2: EMBLEM SEAL =================
function emblem(v) {
  const W = 1000, H = 1000, cx = 500, cy = 500, full = v === 'full', mono = v.startsWith('mono')
  const ink = v === 'mono-white' ? C.white : v === 'mono-dark' ? C.dark : null
  const gold = mono ? ink : full ? 'url(#goldText)' : C.gold
  const darkInk = mono ? ink : C.dark
  let s = full ? DEFS_FULL : ''
  // outer rim + light band
  if (!mono) {
    s += P(circ(cx, cy, 497), full ? C.darkest : C.dark)
    s += P(circ(cx, cy, 482), full ? 'url(#band)' : C.light)
  } else s += `<circle cx="${cx}" cy="${cy}" r="490" fill="none" stroke="${ink}" stroke-width="12"/>`
  // double hairlines framing the text ring
  for (const r of [466, 458, 352, 344]) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${darkInk}" stroke-width="${r === 466 || r === 344 ? 4 : 1.5}"/>`
  // ring text
  s += `<g fill="${darkInk}">` + arcText(F.extra, 'GOLDEN BLOCKS MISSION', { cx, cy, r: 405, size: 58, tracking: 0.08, side: 'top' })
  s += arcText(F.bold, 'NORTH EAST KENYA FIELD', { cx, cy, r: 405, size: 44, tracking: 0.14, side: 'bottom' }) + '</g>'
  // separators: gold diamond + two dots, at 9 and 3 o'clock
  for (const sx of [cx - 405, cx + 405]) {
    s += P(diamond(sx, cy, 15), gold)
    for (const dy of [-34, 34]) s += P(circ(sx, cy + dy, 4.5), darkInk)
  }
  // inner disc
  const R = 330
  if (!mono) {
    s += P(circ(cx, cy, R), full ? 'url(#disc)' : C.dark)
    // sunburst rays
    const rays = 48; let d = ''
    for (let i = 0; i < rays; i += 2) {
      const a0 = (i / rays) * 2 * Math.PI, a1 = ((i + 1) / rays) * 2 * Math.PI
      d += poly([[cx, cy], [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], [cx + R * Math.cos(a1), cy + R * Math.sin(a1)]])
    }
    s += P(d, full ? '#fff' : '#45494F', full ? ' opacity=".045"' : '')
    if (full) s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#glowG)" opacity=".8"/>`
  } else s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${ink}" stroke-width="6"/>`
  // gold inner ring + beaded ring
  s += `<circle cx="${cx}" cy="${cy}" r="${R - 16}" fill="none" stroke="${gold}" stroke-width="4"/>`
  for (let i = 0; i < 72; i++) { const a = (i / 72) * 2 * Math.PI; s += P(circ(cx + (R - 30) * Math.cos(a), cy + (R - 30) * Math.sin(a), 2.6), gold, mono ? '' : ' opacity=".7"') }
  // laurel wreath around the bars (left branch, mirrored)
  const leafCol = mono ? ink : full ? 'url(#goldText)' : C.gold
  const branch = laurel(cx, cy, 238, 118, 228, 8, 26, leafCol, leafCol)
  s += `<g>${branch}</g><g transform="translate(${2 * cx} 0) scale(-1 1)">${branch}</g>`
  // bars
  const B = { cx, y: cy - 150 - 4, w: 104, h: 142, gap: 16, k: 13 }
  if (full) s += `<ellipse cx="${cx}" cy="${cy + 160}" rx="130" ry="10" fill="#000" opacity=".4" filter="url(#soft)"/>`
  if (full) s = s.replace('</defs>', '<filter id="soft" x="-50%" y="-300%" width="200%" height="700%"><feGaussianBlur stdDeviation="7"/></filter></defs>')
  s += barGrid(B, mono ? 'mono' : full ? 'full' : 'flat', ink)
  // small star-like diamond above at 12 o'clock inside disc
  s += P(diamond(cx, cy - 238, 11), gold)
  s += P(diamond(cx, cy + 238, 11), gold)
  return { W, H, s }
}

const LOGOS = [
  { id: 'gold-bars', name: 'Gold Bars', build: goldBars },
  { id: 'gold-bars-transparent', name: 'Gold Bars, no background', build: (v) => goldBars(v, { bare: true }), variants: ['full', 'flat', 'full-on-dark', 'mono-dark', 'mono-white'] },
  { id: 'gold-bars-blocks-only', name: 'Gold Bars, blocks only', build: (v) => goldBars(v, { only: true }) },
  { id: 'emblem-seal', name: 'Emblem Seal', build: emblem },
]
const VARIANTS = ['full', 'flat', 'mono-dark', 'mono-white']
const manifest = []
for (const L of LOGOS) for (const v of L.variants || VARIANTS) {
  const { W, H, s, x0 = 0, y0 = 0 } = L.build(v)
  const file = `golden-blocks_${L.id}_${v}.svg`
  fs.writeFileSync(path.join(OUT, file), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${W} ${H}" width="${W}" height="${H}">\n<title>Golden Blocks Mission — ${L.name} (${v})</title>\n${s}\n</svg>\n`)
  manifest.push({ id: L.id, name: L.name, variant: v, file, W, H })
}
fs.writeFileSync(path.join(ROOT, 'src', 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`wrote ${manifest.length} SVGs → ${OUT}`)
