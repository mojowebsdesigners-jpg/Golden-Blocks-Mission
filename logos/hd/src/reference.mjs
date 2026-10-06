// Golden Blocks Mission — "Reference Blocks": the blocks from the client's reference image (ring removed),
// redrawn as vector from measurements of that image, with the one-line wordmark of the square HD logos.
// Square 1600×1600. Versions: white (as the reference), field (light grey), transparent, flat (print).
// usage: NODE_PATH=<dir with opentype.js + @fontsource/montserrat> node logos/hd/src/reference.mjs
//        then: node logos/hd/src/render.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { F, text, rect, ell, poly, P, diamond } from '../../lib/vector.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'svg')

// colours sampled from the reference image
const C = {
  faceTop: '#FDD13E', faceMid: '#F6BF1A', faceLow: '#E5A908', faceDeep: '#D8A005', edgeHi: '#FFE27F', edgeLo: '#C38E05',
  channel: '#363533', channelDeep: '#2A2A28', wallLit: '#F7E3A6', wallShade: '#A88A44',
  white: '#FFFFFF', field: '#BFC1C4', fieldHi: '#D2D4D7', grey: '#7C7F86', text: '#34373C', sub: '#4B4E55', yMid: '#F2B526', yDeep: '#D99A14',
}

// Block geometry in the reference image's pixel space. w/h = one block; channel widths as measured (29 / 27 px).
const geom = (w, h, x = 573, y = 238) => ({ X0: x, X1: x + w, X2: x + w + 29, X3: x + 2 * w + 29, Y0: y, Y1: y + h, Y2: y + h + 27, Y3: y + 2 * h + 27 })
const LOGOS = [
  { id: '7-reference-blocks', name: 'Reference Blocks', G: { X0: 573, X1: 744, X2: 773, X3: 943, Y0: 238, Y1: 396, Y2: 423, Y3: 585 }, k: 1.45 }, // exactly as measured from the reference (≈ square)
  { id: '8-reference-blocks-tall', name: 'Reference Blocks, tall', G: geom(150, 240), k: 1.2 }, // rectangular (portrait) blocks
  { id: '9-reference-blocks-tall-shadows', name: 'Reference Blocks, tall with shadows', G: geom(150, 240), k: 1.2, shadows: true }, // same, with extra depth shadows
  // logo 9 without the rules beside the field name: plain, and with the gold orbit ring of the reference put back
  { id: '10-tall-shadows-clean', name: 'Tall blocks with shadows', G: geom(150, 240), k: 1.2, shadows: true, rules: false },
  { id: '11-tall-shadows-ring', name: 'Tall blocks with shadows and ring', G: geom(150, 240), k: 1.2, shadows: true, rules: false, ring: true },
  // logo 8 (no block shadows) without the rules: plain, and with the ring
  { id: '12-tall-clean', name: 'Tall blocks', G: geom(150, 240), k: 1.2, rules: false },
  { id: '13-tall-ring', name: 'Tall blocks with ring', G: geom(150, 240), k: 1.2, rules: false, ring: true },
  // logos 10–13 with a lighter dark grey for the name (client: the charcoal read as black)
  { id: '14-shadows-clean-lighttext', name: 'Tall blocks with shadows', G: geom(150, 240), k: 1.2, shadows: true, rules: false, title: '#4A4E55' },
  { id: '15-shadows-ring-lighttext', name: 'Tall blocks with shadows and ring', G: geom(150, 240), k: 1.2, shadows: true, rules: false, ring: true, title: '#4A4E55' },
  { id: '16-clean-lighttext', name: 'Tall blocks', G: geom(150, 240), k: 1.2, rules: false, title: '#4A4E55' },
  { id: '17-ring-lighttext', name: 'Tall blocks with ring', G: geom(150, 240), k: 1.2, rules: false, ring: true, title: '#4A4E55' },
  // logos 16/17 with a softer (lighter) cross channel (client: the shadow cross was too dark)
  { id: '18-clean-lightcross', name: 'Tall blocks, lighter cross', G: geom(150, 240), k: 1.2, rules: false, title: '#4A4E55', cross: { main: '#5B5C60', deep: '#505155' } },
  { id: '19-ring-lightcross', name: 'Tall blocks with ring, lighter cross', G: geom(150, 240), k: 1.2, rules: false, ring: true, title: '#4A4E55', cross: { main: '#5B5C60', deep: '#505155' } },
  // the logo the organisation chose (19) with a third line under the field name
  { id: '20-final-sda', name: 'Golden Blocks Mission — chosen logo', G: geom(150, 240), k: 1.2, rules: false, ring: true, title: '#4A4E55', cross: { main: '#5B5C60', deep: '#505155' }, tagline: 'SEVENTH-DAY ADVENTIST CHURCH' },
  // final: same as 20 but the third line reads just SDA (client correction)
  { id: '21-final', name: 'Golden Blocks Mission — final logo', G: geom(150, 240), k: 1.2, rules: false, ring: true, title: '#4A4E55', cross: { main: '#5B5C60', deep: '#505155' }, tagline: 'SDA' },
]

// cross: optional { main, deep } colours for the channel; its gradient is then defined as #chanX
function mark(flat, { X0, X1, X2, X3, Y0, Y1, Y2, Y3 }, shadows = false, cross) {
  const VX = (X1 + X2) / 2, VY = Y0 + 30 // bottom of the V-notch at the top of the vertical channel
  let s = ''
  if (!flat) s += P(ell((X0 + X3) / 2 + 6, Y3 + 18, (X3 - X0) * 0.55, 16), '#000', ' opacity=".22" filter="url(#blur)"')
  const fx = shadows && !flat
  const blocks = [[X0, Y0, X1 - X0, Y1 - Y0], [X2, Y0, X3 - X2, Y1 - Y0], [X0, Y2, X1 - X0, Y3 - Y2], [X2, Y2, X3 - X2, Y3 - Y2]]
  if (fx) {
    // each block casts a soft shadow down-right, plus a tight contact shadow on the ground
    for (const [x, y, w, h] of blocks) s += P(rect(x + 9, y + 14, w, h), '#000', ' opacity=".26" filter="url(#soft)"')
    s += P(ell((X0 + X3) / 2 + 4, Y3 + 6, (X3 - X0) * 0.48, 6), '#000', ' opacity=".35" filter="url(#tight)"')
  }
  // dark cross channel: vertical groove + horizontal groove with angled ends
  const chMain = cross ? cross.main : C.channel
  s += P(rect(X1, Y0, X2 - X1, Y3 - Y0), chMain)
  s += P(poly([[X0, Y1], [X3, Y1], [X3 - 18, Y2], [X0 + 30, Y2]]), flat ? chMain : cross ? 'url(#chanX)' : 'url(#chan)')
  // inner walls visible at the top of the vertical groove (V-notch)
  s += P(poly([[X1, Y0], [VX, Y0 + 4], [VX, VY], [X1, Y0 + 40]]), flat ? '#E9CC77' : 'url(#wallL)')
  s += P(poly([[VX, Y0 + 4], [X2, Y0], [X2, Y0 + 40], [VX, VY]]), C.wallShade)
  // the four faces
  for (const [x, y, w, h, g] of [[X0, Y0, X1 - X0, Y1 - Y0, 'faceA'], [X2, Y0, X3 - X2, Y1 - Y0, 'faceA'], [X0, Y2, X1 - X0, Y3 - Y2, 'faceB'], [X2, Y2, X3 - X2, Y3 - Y2, 'faceC']]) {
    s += P(rect(x, y, w, h), flat ? C.faceMid : `url(#${g})`)
    if (!flat) {
      s += P(rect(x, y, w, 2.2), C.edgeHi, ' opacity=".9"') // crisp lit top edge
      s += P(rect(x, y + h - 2.5, w, 2.5), C.edgeLo, ' opacity=".7"') // darker lower edge
      s += P(rect(x + w - 2, y, 2, h), C.edgeLo, ' opacity=".35"')
    }
  }
  if (fx) {
    // depth: faces darken toward the edges that drop into the cross channel
    const a = 24
    const strips = [
      [X1 - a, Y0, a, Y1 - Y0, 'aoR'], [X0, Y1 - a, X1 - X0, a, 'aoB'], // top-left block
      [X2, Y0, a, Y1 - Y0, 'aoL'], [X2, Y1 - a, X3 - X2, a, 'aoB'], // top-right block
      [X1 - a, Y2, a, Y3 - Y2, 'aoR'], [X0, Y2, X1 - X0, a, 'aoT'], // bottom-left block
      [X2, Y2, a, Y3 - Y2, 'aoL'], [X2, Y2, X3 - X2, a, 'aoT'], // bottom-right block
    ]
    for (const [x, y, w, h, g] of strips) s += P(rect(x, y, w, h), `url(#${g})`)
  }
  return s
}

const DEFS = `<defs>
  <linearGradient id="faceA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.faceTop}"/><stop offset=".45" stop-color="${C.faceMid}"/><stop offset="1" stop-color="${C.faceLow}"/></linearGradient>
  <linearGradient id="faceB" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${C.faceTop}"/><stop offset=".35" stop-color="${C.faceMid}"/><stop offset="1" stop-color="${C.faceLow}"/></linearGradient>
  <linearGradient id="faceC" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${C.faceTop}"/><stop offset=".4" stop-color="${C.faceMid}"/><stop offset="1" stop-color="${C.faceDeep}"/></linearGradient>
  <linearGradient id="chan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.channelDeep}"/><stop offset="1" stop-color="${C.channel}"/></linearGradient>
  <linearGradient id="wallL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.wallLit}"/><stop offset="1" stop-color="#D9B860"/></linearGradient>
  <radialGradient id="fieldG" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="${C.fieldHi}"/><stop offset="1" stop-color="${C.field}"/></radialGradient>
  <filter id="blur" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="10"/></filter>
</defs>`

// extra defs used only by the depth-shadow variant
const DEFS_SHADOWS = `
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="tight" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="4"/></filter>
  <linearGradient id="aoL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A3A00" stop-opacity=".32"/><stop offset="1" stop-color="#5A3A00" stop-opacity="0"/></linearGradient>
  <linearGradient id="aoR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#5A3A00" stop-opacity=".32"/><stop offset="1" stop-color="#5A3A00" stop-opacity="0"/></linearGradient>
  <linearGradient id="aoT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A3A00" stop-opacity=".32"/><stop offset="1" stop-color="#5A3A00" stop-opacity="0"/></linearGradient>
  <linearGradient id="aoB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5A3A00" stop-opacity=".36"/><stop offset="1" stop-color="#5A3A00" stop-opacity="0"/></linearGradient>`

// the one-line wordmark, identical to the square HD logos
function wordmark(cx, y, flat, rules = true, title = C.text, tagline) {
  const t1 = text(F.extra, 'GOLDEN BLOCKS MISSION', { size: 104, x: cx, y, tracking: 0.035, maxWidth: 1240 })
  const t2 = text(F.semi, 'NORTH EAST KENYA FIELD', { size: 36, x: cx, y: y + 76, tracking: 0.34 })
  let s = P(t1.d, title) + P(t2.d, C.sub)
  // optional third line, a step smaller than the field name, in the same style
  if (tagline) s += P(text(F.semi, tagline, { size: 29, x: cx, y: y + 136, tracking: 0.3 }).d, C.sub)
  if (!rules) return s
  const ry = y + 63, gapX = t2.width / 2 + 34, end = t1.width / 2
  for (const sg of [-1, 1]) {
    const a = cx + sg * gapX, b = cx + sg * end
    s += P(rect(Math.min(a, b), ry - 1.5, Math.abs(b - a), 3), C.grey) + P(diamond(b, ry, 8), flat ? C.yDeep : C.yMid)
  }
  return s
}

const S = 1600, CX = 800
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'manifest.json'), 'utf8')).filter((m) => !LOGOS.some((L) => L.id === m.id))
// Gold orbit ring around the mark (mark coordinates): a tapered ellipse tilted like the reference.
// The upper half is drawn behind the blocks and the lower half in front of them.
const DEFS_RING = `
  <linearGradient id="ring" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.yDeep}"/><stop offset=".45" stop-color="${C.edgeHi}"/><stop offset="1" stop-color="${C.yMid}"/></linearGradient>
  <clipPath id="ringBack"><rect x="-500" y="-300" width="1000" height="300"/></clipPath>
  <clipPath id="ringFront"><rect x="-500" y="0" width="1000" height="300"/></clipPath>`
function ring(G, half, flat, shadows) {
  const cx = (G.X0 + G.X3) / 2, cy = (G.Y0 + G.Y3) / 2 - 10
  const d = ell(0, 0, 330, 106) + ell(14, -11, 311, 86)
  const shadow = half === 'Front' && shadows && !flat ? `<path d="${d}" fill-rule="evenodd" fill="#000" opacity=".22" filter="url(#soft)" transform="translate(4 9)" clip-path="url(#ringFront)"/>` : ''
  return `<g transform="translate(${cx} ${cy}) rotate(-20)">${shadow}<path d="${d}" fill-rule="evenodd" fill="${flat ? C.yMid : 'url(#ring)'}" clip-path="url(#ring${half})"/></g>`
}

for (const { id, name, G, k, shadows, rules = true, ring: withRing, title, cross, tagline } of LOGOS) for (const v of ['white', 'field', 'transparent', 'flat']) {
  const mcx = (G.X0 + G.X3) / 2, mcy = (G.Y0 + G.Y3) / 2
  const flat = v === 'flat'
  const extra = (shadows && !flat ? DEFS_SHADOWS : '') + (withRing ? DEFS_RING : '') +
    (cross && !flat ? `
  <linearGradient id="chanX" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cross.deep}"/><stop offset="1" stop-color="${cross.main}"/></linearGradient>` : '')
  let s = flat ? (withRing ? `<defs>${DEFS_RING}</defs>` : '') : extra ? DEFS.replace('</defs>', `${extra}
</defs>`) : DEFS
  if (v === 'white') s += `<rect width="${S}" height="${S}" fill="${C.white}"/>`
  if (v === 'field') s += `<rect width="${S}" height="${S}" fill="url(#fieldG)"/>`
  const body = withRing ? ring(G, 'Back', flat, shadows) + mark(flat, G, shadows, cross) + ring(G, 'Front', flat, shadows) : mark(flat, G, shadows, cross)
  s += `<g transform="translate(${CX} 640) scale(${k}) translate(${-mcx} ${-mcy})">${body}</g>`
  s += wordmark(CX, 1215, flat, rules, title, tagline)
  const file = `golden-blocks_square_${id}_${v}.svg`
  fs.writeFileSync(path.join(OUT, file), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">\n<title>Golden Blocks Mission — ${name} (${v})</title>\n${s}\n</svg>\n`)
  manifest.push({ id, name, variant: v, file, W: S, H: S, square: true })
}
// ---------- website assets from the final logo (21): the mark alone (blocks + ring), no text ----------
// gbm-mark.svg: cropped tight, for the site header/footer. favicon.svg: same mark centred in a square.
{
  const F21 = LOGOS.find((L) => L.id === '21-final')
  const { G, cross } = F21
  const mcx = (G.X0 + G.X3) / 2, mcy = (G.Y0 + G.Y3) / 2
  const extra = DEFS_RING + `\n  <linearGradient id="chanX" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cross.deep}"/><stop offset="1" stop-color="${cross.main}"/></linearGradient>`
  const body = ring(G, 'Back', false, false) + mark(false, G, false, cross) + ring(G, 'Front', false, false)
  const defs = DEFS.replace('</defs>', `${extra}\n</defs>`)
  const view = [mcx - 328, mcy - 266, 656, 570] // ring ±312 wide, blocks ±254 tall + ground shadow
  const PUB = path.resolve(ROOT, '..', '..', 'public')
  const svg = (vb) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}">\n<title>Golden Blocks Mission</title>\n${defs}\n${body}\n</svg>\n`
  fs.mkdirSync(path.join(PUB, 'images', 'brand'), { recursive: true })
  fs.writeFileSync(path.join(PUB, 'images', 'brand', 'gbm-mark.svg'), svg(view))
  const side = view[2]
  fs.writeFileSync(path.join(PUB, 'icons', 'favicon.svg'), svg([view[0], view[1] + view[3] / 2 - side / 2, side, side]))
  console.log('wrote public/images/brand/gbm-mark.svg + public/icons/favicon.svg')
}

fs.writeFileSync(path.join(ROOT, 'src', 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`wrote ${LOGOS.length * 4} reference-blocks SVGs`)
