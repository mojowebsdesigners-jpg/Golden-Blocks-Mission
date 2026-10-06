// Shared helpers for the logo scripts: Montserrat → outlined SVG paths, and basic shape builders.
// Needs opentype.js + @fontsource/montserrat resolvable (set NODE_PATH to a folder that has them).
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(process.env.NODE_PATH ? path.join(process.env.NODE_PATH, 'x.js') : import.meta.url)
const opentype = require('opentype.js')
const loadFont = (w) => { const b = fs.readFileSync(require.resolve(`@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff`)); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)) }
export const F = { med: loadFont(500), semi: loadFont(600), bold: loadFont(700), extra: loadFont(800), black: loadFont(900) }

function layout(font, str, size, tracking = 0) {
  const scale = size / font.unitsPerEm, glyphs = font.stringToGlyphs(str)
  let x = 0; const items = []
  glyphs.forEach((g, i) => {
    items.push({ g, x }); x += g.advanceWidth * scale + tracking
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale
  })
  return { items, width: x - tracking, scale }
}
// Outlined text. tracking is a fraction of size. maxWidth shrinks the size to fit.
export function text(font, str, { size, x = 0, y = 0, anchor = 'middle', tracking = 0, maxWidth }) {
  let L = layout(font, str, size, tracking * size)
  if (maxWidth && L.width > maxWidth) { size *= maxWidth / L.width; L = layout(font, str, size, tracking * size) }
  const x0 = anchor === 'middle' ? x - L.width / 2 : anchor === 'end' ? x - L.width : x
  return { d: L.items.map(({ g, x: gx }) => g.getPath(x0 + gx, y, size).toPathData(2)).join(''), width: L.width, size, x0 }
}

export const f2 = (n) => +n.toFixed(2)
export const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
export const rect = (x, y, w, h) => `M${f2(x)} ${f2(y)}H${f2(x + w)}V${f2(y + h)}H${f2(x)}Z`
export const circ = (cx, cy, r) => `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`
export const ell = (cx, cy, rx, ry) => `M${f2(cx - rx)} ${f2(cy)}A${f2(rx)} ${f2(ry)} 0 1 0 ${f2(cx + rx)} ${f2(cy)}A${f2(rx)} ${f2(ry)} 0 1 0 ${f2(cx - rx)} ${f2(cy)}Z`
export const poly = (pts) => 'M' + pts.map((p) => p.map(f2).join(' ')).join('L') + 'Z'
export const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
export const diamond = (cx, cy, r) => poly([[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]])
