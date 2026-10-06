// Golden Blocks Mission — HD collection (3D blocks style). Four concepts × 3 versions:
//   field       — light-grey background, full 3D shading (social media, screens, banners)
//   transparent — same artwork, no background
//   flat        — solid colours only, no gradients/blur, transparent (screen printing, embroidery)
// usage: NODE_PATH=<dir with opentype.js + @fontsource/montserrat> node logos/hd/src/hd.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { F, text, rr, rect, ell, poly, P, diamond, f2 } from '../../lib/vector.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'svg'); fs.mkdirSync(OUT, { recursive: true })

// Palette supplied by the client (#FFC93C, #BFC1C4, #7C7F86) plus darker tints for shading and legible text
const C = {
  yellow: '#FFC93C', yLight: '#FFDC7A', yPale: '#FFE9A8', yMid: '#F2B526', yDeep: '#D99A14', yDark: '#B37C0C',
  field: '#BFC1C4', fieldHi: '#D2D4D7', grey: '#7C7F86', text: '#34373C', sub: '#4B4E55', channel: '#2E3135',
}

const DEFS = `<defs>
  <linearGradient id="face" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.yLight}"/><stop offset=".55" stop-color="${C.yellow}"/><stop offset="1" stop-color="${C.yMid}"/></linearGradient>
  <linearGradient id="ring" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.yDeep}"/><stop offset=".45" stop-color="${C.yLight}"/><stop offset="1" stop-color="${C.yMid}"/></linearGradient>
  <linearGradient id="isoTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.yPale}"/><stop offset="1" stop-color="${C.yellow}"/></linearGradient>
  <linearGradient id="pin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.yLight}"/><stop offset=".6" stop-color="${C.yellow}"/><stop offset="1" stop-color="${C.yDeep}"/></linearGradient>
  <radialGradient id="fieldG" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="${C.fieldHi}"/><stop offset="1" stop-color="${C.field}"/></radialGradient>
  <radialGradient id="rays" cx=".5" cy="1" r="1"><stop offset=".35" stop-color="${C.yMid}"/><stop offset=".75" stop-color="${C.yellow}" stop-opacity=".85"/><stop offset="1" stop-color="${C.yLight}" stop-opacity=".25"/></radialGradient>
  <filter id="blur" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="14"/></filter>
</defs>`

// ---------- the shared 3D block cluster: four rectangular blocks, dark cross channel, extruded down-right ----------
function blocks3D({ cx, cy, w, h, gap, d }, flat) {
  const T = 2 * w + gap, H = 2 * h + gap
  const x0 = cx - (T + d) / 2, y0 = cy - (H + d) / 2
  let s = ''
  if (!flat) s += P(ell(cx + d / 2, y0 + H + d + 26, T * 0.62, 20), '#000', ' opacity=".28" filter="url(#blur)"')
  // dark channel forming the cross
  s += P(rect(x0 + w, y0, gap + d, H + d) + rect(x0, y0 + h, T + d, gap + d), C.channel)
  for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const x = x0 + i * (w + gap), y = y0 + j * (h + gap)
    s += P(poly([[x + w, y], [x + w + d, y + d], [x + w + d, y + h + d], [x + w, y + h]]), flat ? C.yDeep : C.yDeep)
    s += P(poly([[x, y + h], [x + w, y + h], [x + w + d, y + h + d], [x + d, y + h + d]]), flat ? C.yDark : C.yDark)
    s += P(rect(x, y, w, h), flat ? C.yellow : 'url(#face)')
    if (!flat) s += `<path d="M${f2(x + 3)} ${f2(y + h - 6)}V${f2(y + 3)}H${f2(x + w - 6)}" fill="none" stroke="${C.yPale}" stroke-width="4" opacity=".9"/>`
  }
  return { s, x0, y0, T: T + d, H: H + d }
}

// ---------- wordmark: name on one line, field name smaller below with rules ----------
let SKIP_WORDMARK = false // square layouts place the wordmark themselves
function wordmark(cx, y, flat) {
  if (SKIP_WORDMARK) return ''
  const t1 = text(F.extra, 'GOLDEN BLOCKS MISSION', { size: 104, x: cx, y, tracking: 0.035, maxWidth: 1240 })
  const t2 = text(F.semi, 'NORTH EAST KENYA FIELD', { size: 36, x: cx, y: y + 76, tracking: 0.34 })
  let s = P(t1.d, C.text) + P(t2.d, C.sub)
  const ry = y + 63, gapX = t2.width / 2 + 34, end = t1.width / 2
  for (const sg of [-1, 1]) {
    const a = cx + sg * gapX, b = cx + sg * end
    s += P(rect(Math.min(a, b), ry - 1.5, Math.abs(b - a), 3), C.grey) + P(diamond(b, ry, 8), flat ? C.yDeep : C.yMid)
  }
  return s
}

const W = 1600, H = 1000, CX = 800

// 1 — ORBIT: the reference style; a golden ring sweeps around the blocks, passing behind at the top and in front at the bottom
const ORBIT_BLOCKS = { cx: CX, cy: 375, w: 150, h: 175, gap: 24, d: 18 }
function orbit(flat) {
  const B = ORBIT_BLOCKS
  const ring = (clipId) => {
    const outer = ell(0, 0, 420, 128), inner = ell(16, -12, 394, 100)
    return `<g transform="translate(${CX} ${B.cy + 10}) rotate(-17)"><path d="${outer}${inner}" fill-rule="evenodd" fill="${flat ? C.yMid : 'url(#ring)'}" clip-path="url(#${clipId})"/></g>`
  }
  let s = `<clipPath id="back"><rect x="-600" y="-400" width="1200" height="400"/></clipPath><clipPath id="front"><rect x="-600" y="0" width="1200" height="400"/></clipPath>`
  s += ring('back') + blocks3D(B, flat).s + ring('front')
  return s + wordmark(CX, 815, flat)
}

// 2 — ISOMETRIC: four rectangular gold blocks on a dark base plate, seen in 3D; the gaps read as a cross from above
function iso(flat) {
  const c30 = Math.cos(Math.PI / 6), s30 = 0.5, a = 115, b = 145, h = 96, g = 22, base = 16
  const SX = a * 2 + g, SY = b * 2 + g
  const ox = CX - ((SX - SY) * c30) / 2, oy = 400 - ((SX + SY) * s30) / 2 + 55
  const p = (x, y, z) => [ox + (x - y) * c30, oy + (x + y) * s30 - z]
  const box = (x, y, z, dx, dy, dz, top, left, right) =>
    P(poly([p(x, y + dy, z), p(x + dx, y + dy, z), p(x + dx, y + dy, z + dz), p(x, y + dy, z + dz)]), left) + // face toward +y
    P(poly([p(x + dx, y, z), p(x + dx, y + dy, z), p(x + dx, y + dy, z + dz), p(x + dx, y, z + dz)]), right) + // face toward +x
    P(poly([p(x, y, z + dz), p(x + dx, y, z + dz), p(x + dx, y + dy, z + dz), p(x, y + dy, z + dz)]), top)
  let s = ''
  if (!flat) s += P(ell(CX, p(SX, SY, 0)[1] + 4, 330, 26), '#000', ' opacity=".25" filter="url(#blur)"')
  s += box(-8, -8, -base, SX + 16, SY + 16, base, C.channel, '#24272A', '#1C1E21')
  for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]])
    s += box(i * (a + g), j * (b + g), 0, a, b, h, flat ? C.yLight : 'url(#isoTop)', flat ? C.yDeep : C.yMid, flat ? C.yDark : C.yDeep)
  return s + wordmark(CX, 815, flat)
}

// 3 — SUNRISE: the blocks rise from the horizon with golden rays behind — hope dawning over the field
function sunrise(flat) {
  const B = { cx: CX, cy: 380, w: 140, h: 165, gap: 22, d: 16 }
  const hy = B.cy + (2 * B.h + B.gap + B.d) / 2 + 6 // horizon at the base of the blocks
  let rays = ''
  const n = 15, R = 400
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI + (i / n) * Math.PI + 0.035, a1 = Math.PI + ((i + 0.55) / n) * Math.PI + 0.035
    rays += poly([[CX, hy], [CX + R * Math.cos(a0), hy + R * Math.sin(a0)], [CX + R * Math.cos(a1), hy + R * Math.sin(a1)]])
  }
  let s = P(rays, flat ? C.yMid : 'url(#rays)')
  s += blocks3D(B, flat).s
  // tapered horizon line
  s += P(poly([[CX - 470, hy + 1], [CX, hy - 4], [CX + 470, hy + 1], [CX, hy + 6]]), C.text)
  return s + wordmark(CX, 815, flat)
}

// 4 — FIELD PIN: a golden location pin holding the blocks — the mission planted in North East Kenya
function pin(flat) {
  const cx = CX, cy0 = 262, R = 180, L = 365
  const beta = Math.acos(R / L), qx = R * Math.sin(beta), qy = cy0 + R * Math.cos(beta)
  const pinD = `M${cx} ${cy0 + L}L${f2(cx + qx)} ${f2(qy)}A${R} ${R} 0 1 0 ${f2(cx - qx)} ${f2(qy)}Z`
  let s = ''
  s += P(ell(cx, cy0 + L + 8, 150, 22), flat ? C.grey : '#000', flat ? ' opacity=".5"' : ' opacity=".3" filter="url(#blur)"')
  s += P(ell(cx, cy0 + L + 6, 70, 11), 'none', ` stroke="${C.grey}" stroke-width="4"`)
  s += P(pinD, flat ? C.yellow : 'url(#pin)')
  if (!flat) s += P(pinD, 'none', ` stroke="${C.yDeep}" stroke-width="3" opacity=".6"`)
  s += P(ell(cx, cy0, R - 30, R - 30), C.text)
  s += blocks3D({ cx, cy: cy0, w: 70, h: 84, gap: 13, d: 9 }, flat).s
  return s + wordmark(CX, 815, flat)
}

// 5 — BLOCKS: the Orbit design with only the ring removed (same block size and position)
const BLOCKS = ORBIT_BLOCKS
function blocksOnly(flat) {
  return blocks3D(BLOCKS, flat).s + wordmark(CX, 815, flat)
}
// 6 — BLOCKS, NO TEXT: cropped tight around the blocks (and their shadow)
function blocksNoText(flat) {
  const b = blocks3D(BLOCKS, flat)
  const padX = flat ? 40 : b.T * 0.2 + 50 // room for the blurred shadow
  return { s: b.s, view: [b.x0 - padX, b.y0 - 40, b.T + 2 * padX, b.H + (flat ? 80 : 130)] }
}

const CONCEPTS = [
  { id: '1-orbit', name: 'Orbit', build: orbit },
  { id: '2-isometric', name: 'Isometric', build: iso },
  { id: '3-sunrise', name: 'Sunrise', build: sunrise },
  { id: '4-field-pin', name: 'Field Pin', build: pin },
  { id: '5-blocks', name: 'Blocks', build: blocksOnly },
  { id: '6-blocks-no-text', name: 'Blocks, no text', build: blocksNoText, variants: ['transparent', 'flat'] },
]
const manifest = []
for (const c of CONCEPTS) for (const v of c.variants || ['field', 'transparent', 'flat']) {
  const flat = v === 'flat'
  let s = flat ? '' : DEFS
  if (v === 'field') s += `<rect width="${W}" height="${H}" fill="url(#fieldG)"/>`
  const out = c.build(flat)
  s += typeof out === 'string' ? out : out.s
  const [vx, vy, vw, vh] = out.view || [0, 0, W, H]
  const file = `golden-blocks_hd_${c.id}_${v}.svg`
  fs.writeFileSync(path.join(OUT, file), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f2(vx)} ${f2(vy)} ${f2(vw)} ${f2(vh)}" width="${f2(vw)}" height="${f2(vh)}">\n<title>Golden Blocks Mission — ${c.name} (${v})</title>\n${s}\n</svg>\n`)
  manifest.push({ id: c.id, name: c.name, variant: v, file, W: vw, H: vh })
}

// ---------- 1:1 square versions: mark enlarged and centred, wordmark underneath ----------
const S = 1600
for (const c of CONCEPTS) for (const v of c.variants || ['field', 'transparent', 'flat']) {
  const flat = v === 'flat'
  let s = flat ? '' : DEFS, view = [0, 0, S, S]
  if (v === 'field') s += `<rect width="${S}" height="${S}" fill="url(#fieldG)"/>`
  if (c.id === '6-blocks-no-text') {
    const out = c.build(flat), [x, y, w, h] = out.view, side = Math.max(w, h)
    s += out.s; view = [x + w / 2 - side / 2, y + h / 2 - side / 2, side, side]
  } else {
    SKIP_WORDMARK = true; const mark = c.build(flat); SKIP_WORDMARK = false
    s += `<g transform="translate(${CX} 650) scale(1.4) translate(${-CX} -400)">${mark}</g>` + wordmark(CX, 1215, flat)
  }
  const file = `golden-blocks_square_${c.id}_${v}.svg`
  fs.writeFileSync(path.join(OUT, file), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view.map(f2).join(' ')}" width="${f2(view[2])}" height="${f2(view[3])}">
<title>Golden Blocks Mission — ${c.name}, square (${v})</title>
${s}
</svg>
`)
  manifest.push({ id: c.id, name: c.name, variant: v, file, W: view[2], H: view[3], square: true })
}
fs.writeFileSync(path.join(ROOT, 'src', 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`wrote ${manifest.length} SVGs → ${OUT}`)
