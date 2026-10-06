import { useCallback, useRef, useState } from 'react'
import { ChevronsLeftRight } from 'lucide-react'

/** Accessible before/after slider (pointer, touch and keyboard). */
export function CompareSlider({ before, after, beforeLabel, afterLabel, alt }: {
  before: string
  after: string
  beforeLabel: string
  afterLabel: string
  alt: string
}) {
  const [pos, setPos] = useState(50)
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const move = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }, [])

  return (
    <div
      ref={box}
      className="relative aspect-[16/10] w-full touch-pan-y select-none overflow-hidden bg-card"
      onPointerDown={(e) => {
        dragging.current = true
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        move(e.clientX)
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <img src={after} alt={`${alt} — ${afterLabel}`} loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={`${alt} — ${beforeLabel}`} loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <span className="theme-dark chip chip-silver absolute left-4 top-4 !bg-black/75">{beforeLabel}</span>
      <span className="theme-dark chip absolute right-4 top-4 !bg-black/75">{afterLabel}</span>
      <div className="absolute inset-y-0 w-px bg-gold-bright" style={{ left: `${pos}%` }} aria-hidden />
      <button
        type="button"
        role="slider"
        aria-label="Compare images"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5))
          if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5))
        }}
        className="absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full border border-gold-bright bg-black/70 text-gold-bright backdrop-blur"
        style={{ left: `${pos}%` }}
      >
        <ChevronsLeftRight className="h-5 w-5" strokeWidth={1.5} />
      </button>
    </div>
  )
}
