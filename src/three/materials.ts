import * as THREE from 'three'

/**
 * Physically based metals. Gold is tinted toward the brand's mustard (#FFC93C)
 * while staying a true metal; silver is a brushed, slightly rough finish. Both
 * rely on the studio environment map for their reflections — no emissive "glow".
 */
export function createGold(variant: 'champagne' | 'warm' | 'bright' = 'champagne') {
  const color = { champagne: '#f0c14a', warm: '#dca61c', bright: '#ffcb45' }[variant]
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: variant === 'bright' ? 0.16 : 0.24,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.25,
  })
}

export function createSilver(finish: 'polished' | 'brushed' = 'brushed') {
  return new THREE.MeshPhysicalMaterial({
    color: finish === 'polished' ? '#e9e9ea' : '#c4c6c9',
    metalness: 1,
    roughness: finish === 'polished' ? 0.1 : 0.3,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1.1,
  })
}

/** Soft radial sprite used for fake bloom around light sources. */
let glowTex: THREE.Texture | null = null
export function getGlowTexture() {
  if (glowTex) return glowTex
  const size = 256
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, 'rgba(255,248,225,1)')
  grd.addColorStop(0.18, 'rgba(255,232,170,0.55)')
  grd.addColorStop(0.45, 'rgba(232,193,100,0.14)')
  grd.addColorStop(1, 'rgba(232,193,100,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  glowTex = new THREE.CanvasTexture(c)
  glowTex.colorSpace = THREE.SRGBColorSpace
  return glowTex
}

/** Four-point star sprite for the Keel-style sparkles on the rings. */
let starTex: THREE.Texture | null = null
export function getStarTexture() {
  if (starTex) return starTex
  const s = 128
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.12, 'rgba(255,240,200,0.6)')
  grd.addColorStop(1, 'rgba(255,240,200,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, s, s)
  g.globalCompositeOperation = 'lighter'
  const ray = (w: number, h: number) => {
    const lg = g.createLinearGradient(s / 2 - w / 2, 0, s / 2 + w / 2, 0)
    lg.addColorStop(0, 'rgba(255,245,215,0)')
    lg.addColorStop(0.5, 'rgba(255,245,215,0.95)')
    lg.addColorStop(1, 'rgba(255,245,215,0)')
    g.fillStyle = lg
    g.fillRect(s / 2 - w / 2, s / 2 - h / 2, w, h)
  }
  ray(s, 2.5)
  g.translate(s / 2, s / 2)
  g.rotate(Math.PI / 2)
  g.translate(-s / 2, -s / 2)
  ray(s, 2.5)
  starTex = new THREE.CanvasTexture(c)
  starTex.colorSpace = THREE.SRGBColorSpace
  return starTex
}
