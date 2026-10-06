// Golden Blocks Mission — logo generator.
// Builds every concept/variant as pure-vector SVG (all text converted to outlines,
// so files print identically everywhere — no fonts needed on the printer's machine).
// usage: node logos/src/generate.mjs   (needs opentype.js + @fontsource/montserrat resolvable via NODE_PATH)
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(process.env.NODE_PATH ? path.join(process.env.NODE_PATH, 'x.js') : import.meta.url)
const opentype = require('opentype.js')
const fontFile = (w) => require.resolve(`@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff`)
const loadFont = (w) => { const b = fs.readFileSync(fontFile(w)); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)) }
const BOLD = loadFont(700), EXTRA = loadFont(800), MED = loadFont(500)

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'svg')
fs.mkdirSync(OUT, { recursive: true })

// Brand palette (from the brief: mustard yellow, dark grey, light grey)
export const C = { mustard: '#D9A21B', mustardDeep: '#B5850F', mustardLight: '#EDBE45', dark: '#3A3D42', light: '#E6E7E9', white: '#FFFFFF' }

// ---------- text → outlined path ----------
function layout(font, str, size, tracking = 0) {
  const scale = size / font.unitsPerEm
  const glyphs = font.stringToGlyphs(str)
  let x = 0; const items = []
  glyphs.forEach((g, i) => {
    items.push({ g, x })
    x += g.advanceWidth * scale + tracking
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale
  })
  return { items, width: x - tracking, scale }
}
// returns {d, width}. anchor: start|middle|end. maxWidth shrinks size to fit.
function text(font, str, { size, x = 0, y = 0, anchor = 'middle', tracking = 0, maxWidth }) {
  let L = layout(font, str, size, tracking * size)
  if (maxWidth && L.width > maxWidth) { size *= maxWidth / L.width; L = layout(font, str, size, tracking * size) }
  const x0 = anchor === 'middle' ? x - L.width / 2 : anchor === 'end' ? x - L.width : x
  const d = L.items.map(({ g, x: gx }) => g.getPath(x0 + gx, y, size).toPathData(2)).join('')
  return { d, width: L.width, size }
}
// text around a circle. side 'top' reads clockwise over the top, 'bottom' reads left→right under.
function arcText(font, str, { cx, cy, r, size, tracking = 0, side = 'top' }) {
  const L = layout(font, str, size, tracking * size)
  const capH = (font.tables.os2.sCapHeight || font.unitsPerEm * 0.7) * L.scale
  const rb = side === 'top' ? r - capH / 2 : r + capH / 2 // baseline radius so caps are centred on r
  const out = []
  L.items.forEach(({ g, x }) => {
    const adv = g.advanceWidth * L.scale
    const s = x + adv / 2 - L.width / 2
    const th = side === 'top' ? -Math.PI / 2 + s / rb : Math.PI / 2 - s / rb
    const px = cx + rb * Math.cos(th), py = cy + rb * Math.sin(th)
    const rot = (th * 180) / Math.PI + (side === 'top' ? 90 : -90)
    const d = g.getPath(-adv / 2, 0, size).toPathData(2)
    if (d) out.push(`<path transform="translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${rot.toFixed(3)})" d="${d}"/>`)
  })
  return out.join('')
}

// ---------- shape helpers ----------
const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
const circ = (cx, cy, r) => `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`

// four blocks in a 2×2 grid. rows = [topHeight, bottomHeight]
function blocks({ cx, y, w, rows, gap, r = 8 }) {
  const x1 = cx - gap / 2 - w, x2 = cx + gap / 2
  const y2 = y + rows[0] + gap
  return [rr(x1, y, w, rows[0], r), rr(x2, y, w, rows[0], r), rr(x1, y2, w, rows[1], r), rr(x2, y2, w, rows[1], r)]
}

// Variants: color (light-grey tile, mustard blocks, dark letters), dark (for dark shirts/backgrounds),
// mono-dark / mono-white (single ink — cheapest screen print / embroidery / stamps)
const VARIANTS = ['color', 'dark', 'mono-dark', 'mono-white']
function palette(v) {
  switch (v) {
    case 'color': return { tile: C.light, block: C.mustard, ink: C.dark, sub: C.dark, accent: C.mustard }
    case 'dark': return { tile: null, block: C.mustard, ink: C.light, sub: C.light, accent: C.mustard }
    case 'mono-dark': return { tile: null, block: C.dark, ink: C.dark, sub: C.dark, accent: C.dark, mono: true }
    case 'mono-white': return { tile: null, block: C.white, ink: C.white, sub: C.white, accent: C.white, mono: true }
  }
}

const NAME = 'GOLDEN BLOCKS MISSION'
const FIELD = 'North East Kenya Field'

// Two-line wordmark used under stacked marks
function wordmark(p, { cx, y, width }) {
  const t1 = text(EXTRA, NAME, { size: 80, x: cx, y, tracking: 0.05, maxWidth: width })
  const t2 = text(MED, FIELD, { size: t1.size * 0.78, x: cx, y: y + t1.size * 1.15, tracking: 0.03 })
  return P(t1.d, p.ink) + P(t2.d, p.sub, ' opacity="' + (p.mono ? 1 : 0.85) + '"')
}

// ---------- concepts ----------
const concepts = [
  {
    id: '01-classic',
    name: 'Classic — straight from your sketch',
    note: 'Four golden blocks on a soft light-grey tile, name in dark grey underneath. Exactly your drawing, cleaned up.',
    build(v) {
      const p = palette(v), W = 1000, H = 1100
      let s = p.tile ? P(rr(0, 0, W, H, 56), p.tile) : ''
      s += blocks({ cx: W / 2, y: 150, w: 175, rows: [265, 265], gap: 30 }).map((d) => P(d, p.block)).join('')
      s += wordmark(p, { cx: W / 2, y: 885, width: 880 })
      return { W, H, s }
    },
  },
  {
    id: '02-cross',
    name: 'Hidden Cross',
    note: 'Same four blocks, but the top pair is shorter — the gaps between them quietly form a cross. Simple, meaningful, memorable.',
    build(v) {
      const p = palette(v), W = 1000, H = 1100
      let s = p.tile ? P(rr(0, 0, W, H, 56), p.tile) : ''
      s += blocks({ cx: W / 2, y: 140, w: 180, rows: [175, 365], gap: 34 }).map((d) => P(d, p.block)).join('')
      s += wordmark(p, { cx: W / 2, y: 885, width: 880 })
      return { W, H, s }
    },
  },
  {
    id: '03-rising',
    name: 'Rising Blocks',
    note: 'From the outline squares at the top of your sketch: solid blocks already laid, outlined blocks still to come — a mission that keeps building.',
    build(v) {
      const p = palette(v), W = 1000, H = 1100
      let s = p.tile ? P(rr(0, 0, W, H, 56), p.tile) : ''
      const sz = 150, gap = 24, cx = W / 2, x1 = cx - gap / 2 - sz, x2 = cx + gap / 2, y0 = 110, sw = 12
      // ghost row (outlined)
      for (const x of [x1, x2]) s += `<path d="${rr(x + sw / 2, y0 + sw / 2, sz - sw, sz - sw, 6)}" fill="none" stroke="${p.block}" stroke-width="${sw}"/>`
      for (const r of [1, 2]) for (const x of [x1, x2]) s += P(rr(x, y0 + r * (sz + gap), sz, sz, 8), p.block)
      s += wordmark(p, { cx: W / 2, y: 885, width: 880 })
      return { W, H, s }
    },
  },
  {
    id: '04-emblem',
    name: 'Round Emblem',
    note: 'A badge with the name around the ring. Made for shirt chests, caps, stickers and stamps.',
    build(v) {
      const p = palette(v), W = 1000, H = 1000, cx = 500, cy = 500
      const ring = p.tile ? C.dark : p.ink
      let s = ''
      if (p.tile) s += P(circ(cx, cy, 496), p.tile)
      s += `<circle cx="${cx}" cy="${cy}" r="482" fill="none" stroke="${ring}" stroke-width="14"/>`
      s += `<g fill="${p.ink}">` + arcText(BOLD, NAME, { cx, cy, r: 405, size: 60, tracking: 0.07, side: 'top' })
      s += arcText(MED, FIELD.toUpperCase(), { cx, cy, r: 405, size: 50, tracking: 0.1, side: 'bottom' }) + '</g>'
      // little block separators at 9 and 3 o'clock
      for (const sx of [cx - 405, cx + 405]) s += P(rr(sx - 14, cy - 14, 28, 28, 4), p.accent, ` transform="rotate(45 ${sx} ${cy})"`)
      const bl = blocks({ cx, y: cy - 165, w: 118, rows: [150, 150], gap: 30, r: 7 })
      if (p.mono) {
        // single ink: solid disc with the blocks knocked out
        s += P(circ(cx, cy, 318) + bl.join(''), p.ink, ' fill-rule="evenodd"')
      } else {
        s += P(circ(cx, cy, 318), p.tile ? C.dark : 'none', p.tile ? '' : ` stroke="${p.ink}" stroke-width="10"`)
        s += bl.map((d) => P(d, p.block)).join('')
      }
      return { W, H, s }
    },
  },
  {
    id: '05-horizontal',
    name: 'Horizontal Lockup',
    note: 'Mark on the left, name on the right — for the website header, letterheads, banners and the back of shirts.',
    build(v) {
      const p = palette(v), W = 2000, H = 520
      let s = ''
      const T = 520
      if (p.tile) s += P(rr(0, 0, T, T, 44), p.tile)
      s += blocks({ cx: T / 2, y: 75, w: 140, rows: [170, 170], gap: 24 }).map((d) => P(d, p.block)).join('')
      const ink = p.tile ? C.dark : p.ink
      const t1 = text(EXTRA, 'GOLDEN BLOCKS', { size: 150, x: T + 70, y: 255, anchor: 'start', tracking: 0.02 })
      const t2 = text(BOLD, 'MISSION', { size: 92, x: T + 74, y: 370, anchor: 'start', tracking: 0.32 })
      const t3 = text(MED, FIELD, { size: 54, x: T + 74, y: 455, anchor: 'start', tracking: 0.03 })
      s += P(t1.d, ink) + P(t2.d, p.tile ? C.mustardDeep : p.accent) + P(t3.d, ink, p.mono ? '' : ' opacity="0.8"')
      return { W: Math.ceil(T + 74 + Math.max(t1.width, t2.width) + 20), H, s }
    },
  },
  {
    id: '06-gold-bars',
    name: 'Gold Bars (premium)',
    note: 'Dark grey tile, blocks with a light bevel so they read like gold bars. Two flat colours plus grey — still screen-printable.',
    build(v) {
      const p = palette(v), W = 1000, H = 1100
      let s = ''
      const premium = v === 'color'
      if (premium) s += P(rr(0, 0, W, H, 56), C.dark)
      const B = { cx: W / 2, y: 150, w: 175, rows: [265, 265], gap: 30 }
      const bl = blocks(B)
      if (p.mono) s += bl.map((d) => P(d, p.block)).join('')
      else {
        const x1 = B.cx - B.gap / 2 - B.w, x2 = B.cx + B.gap / 2, ys = [B.y, B.y + B.rows[0] + B.gap], k = 22
        for (const x of [x1, x2]) for (const y of ys) {
          s += P(rr(x, y, B.w, 265, 8), C.mustardDeep)
          // bevel: lighter face inset, brighter top-left edge
          s += P(`M${x + k} ${y + k}H${x + B.w - k}V${y + 265 - k}H${x + k}Z`, C.mustard)
          s += P(`M${x + 8} ${y}H${x + B.w - 8}L${x + B.w - k} ${y + k}H${x + k}V${y + 265 - k}L${x} ${y + 265 - 8}V${y + 8}Z`, C.mustardLight)
        }
      }
      s += wordmark(premium ? { ...p, ink: C.light, sub: C.light } : p, { cx: W / 2, y: 885, width: 880 })
      return { W, H, s }
    },
  },
  {
    id: '07-icon',
    name: 'Icon only',
    note: 'Just the four blocks — for profile pictures, the website favicon, app icons, sleeve prints and embroidered caps.',
    build(v) {
      const p = palette(v), W = 1000, H = 1000
      let s = p.tile ? P(rr(0, 0, W, H, 200), p.tile) : ''
      s += blocks({ cx: W / 2, y: 170, w: 250, rows: [315, 315], gap: 30, r: 14 }).map((d) => P(d, p.block)).join('')
      return { W, H, s }
    },
  },
]

const manifest = []
for (const c of concepts) {
  for (const v of VARIANTS) {
    const { W, H, s } = c.build(v)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n<title>Golden Blocks Mission — ${c.name} (${v})</title>\n${s}\n</svg>\n`
    const file = `${c.id}_${v}.svg`
    fs.writeFileSync(path.join(OUT, file), svg)
    manifest.push({ concept: c.id, name: c.name, note: c.note, variant: v, file, W, H })
  }
}
fs.writeFileSync(path.join(OUT, '..', 'src', 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`wrote ${manifest.length} SVGs to ${OUT}`)
