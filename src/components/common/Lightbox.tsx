import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useLenis } from '@/components/layout/SmoothScroll'

export interface LightboxItem {
  src: string
  alt: string
  title?: string | null
  caption?: string | null
  meta?: string | null
  credit?: { author?: string | null; license?: string | null; source?: string | null } | null
}

/** Fullscreen image viewer with keyboard, swipe and neighbour preloading. */
export function Lightbox({ items, index, onClose, onIndex }: {
  items: LightboxItem[]
  index: number | null
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const lenis = useLenis()
  const open = index !== null
  const closeBtn = useRef<HTMLButtonElement>(null)
  const startX = useRef<number | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const prev = useCallback(() => index !== null && onIndex((index - 1 + items.length) % items.length), [index, items.length, onIndex])
  const next = useCallback(() => index !== null && onIndex((index + 1) % items.length), [index, items.length, onIndex])

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    closeBtn.current?.focus()
    return () => {
      lenis?.start()
      document.documentElement.style.overflow = ''
      returnFocus.current?.focus?.()
    }
  }, [open, lenis])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, prev, next])

  // Preload neighbours for instant navigation.
  useEffect(() => {
    if (index === null) return
    ;[index - 1, index + 1].forEach((i) => {
      const it = items[(i + items.length) % items.length]
      if (it) new Image().src = it.src
    })
  }, [index, items])

  const item = index !== null ? items[index] : null

  return createPortal(
    <AnimatePresence>
      {open && item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.title ?? 'Image viewer'}
          className="theme-dark fixed inset-0 z-[80] flex flex-col bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onPointerDown={(e) => (startX.current = e.clientX)}
          onPointerUp={(e) => {
            if (startX.current === null) return
            const dx = e.clientX - startX.current
            if (Math.abs(dx) > 60) (dx > 0 ? prev : next)()
            startX.current = null
          }}
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8">
            <span className="font-mono text-[0.68rem] tracking-[0.22em] text-silver">
              {String(index! + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <button ref={closeBtn} onClick={onClose} aria-label="Close viewer" className="flex items-center gap-3 border border-white/20 px-4 py-2 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-white transition-colors hover:border-gold">
              Close <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={item.src}
                src={item.src}
                alt={item.alt}
                className="max-h-full max-w-full object-contain shadow-2xl"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                draggable={false}
              />
            </AnimatePresence>
            {items.length > 1 && (
              <>
                <button onClick={prev} aria-label="Previous image" className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-white/20 bg-black/50 text-white transition-colors hover:border-gold hover:text-gold-bright md:left-6">
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <button onClick={next} aria-label="Next image" className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-white/20 bg-black/50 text-white transition-colors hover:border-gold hover:text-gold-bright md:right-6">
                  <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          <div className="shrink-0 px-4 pb-6 pt-4 md:px-24">
            <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-[1fr_1.2fr] md:gap-10">
              <div>
                {item.title && <p className="font-serif text-2xl text-white">{item.title}</p>}
                {item.meta && <p className="eyebrow mt-1 text-[0.6rem] text-champagne/80">{item.meta}</p>}
              </div>
              <div className="text-sm text-muted">
                {item.caption && <p className="text-silver-light/85">{item.caption}</p>}
                {item.credit?.author && (
                  <p className="mt-1 text-xs">
                    Photo: {item.credit.author}
                    {item.credit.license && <> · {item.credit.license}</>}
                    {item.credit.source && (
                      <> · <a href={item.credit.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">Source</a></>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
