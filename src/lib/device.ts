/** Lightweight capability checks used to scale down 3D on weaker devices. */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

let webglCache: boolean | null = null
export function hasWebGL() {
  if (webglCache !== null) return webglCache
  try {
    const c = document.createElement('canvas')
    webglCache = Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webglCache = false
  }
  return webglCache
}

export function isSmallScreen() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
}

export function isLowPowerDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 8
  const mem = nav.deviceMemory ?? 8
  return cores <= 4 || mem <= 4 || isSmallScreen()
}
