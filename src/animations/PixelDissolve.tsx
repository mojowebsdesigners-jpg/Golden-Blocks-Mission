import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { gsap } from '@/animations/gsap'

/**
 * Keel-style pixel dissolve: a canvas of square cells that fill in a random
 * order as `progress` advances, with a sparse gold fringe at the leading edge.
 * Reads progress from a ref on the GSAP ticker (no React re-renders).
 */
export function PixelDissolve({ progress, from = 0.7, to = 1, color = '#101010', cell = 34 }: {
  progress: MutableRefObject<number>
  from?: number
  to?: number
  color?: string
  cell?: number
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const order = useMemo(() => new Float32Array(4096).map(() => Math.random()), [])

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')!
    let last = -1
    let w = 0
    let h = 0
    const resize = () => {
      w = c.clientWidth
      h = c.clientHeight
      c.width = Math.ceil(w / cell)
      c.height = Math.ceil(h / cell)
      last = -1
    }
    resize()
    window.addEventListener('resize', resize)
    const tick = () => {
      const p = Math.min(1, Math.max(0, (progress.current - from) / (to - from)))
      if (Math.abs(p - last) < 0.002) return
      last = p
      ctx.clearRect(0, 0, c.width, c.height)
      if (p <= 0) return
      const cols = c.width
      const rows = c.height
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) % order.length
          // bias the dissolve to sweep upward from the bottom edge
          const v = order[idx] * 0.65 + (1 - y / rows) * 0.35
          if (v < p) {
            ctx.fillStyle = color
            ctx.fillRect(x, y, 1, 1)
          } else if (v < p + 0.035) {
            ctx.fillStyle = order[idx] > 0.5 ? 'rgba(255,201,60,0.38)' : 'rgba(124,127,134,0.3)'
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', resize)
    }
  }, [progress, from, to, color, cell, order])

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full [image-rendering:pixelated]" />
}
