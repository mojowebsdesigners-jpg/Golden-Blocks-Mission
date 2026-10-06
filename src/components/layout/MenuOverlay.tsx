import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { NAV_LINKS, SCRIPTURE } from '@/data/site'
import { useLenis } from './SmoothScroll'
import { useSettings } from '@/components/common/SettingsProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { cn } from '@/lib/utils'

const PREVIEW: Record<string, string> = {
  '/': '/images/gallery/architecture-modernist-sanctuary-sm.webp',
  '/about': '/images/gallery/interiors-light-beam-sm.webp',
  '/mission': '/images/gallery/community-choir-sm.webp',
  '/projects': '/images/gallery/construction-rising-frame-sm.webp',
  '/featured-projects': '/images/gallery/construction-laying-blocks-sm.webp',
  '/sponsorship': '/images/gallery/construction-carrying-block-sm.webp',
  '/podcast': '/images/gallery/interiors-light-beam-sm.webp',
  '/faqs': '/images/gallery/details-bible-stand-sm.webp',
  '/gallery': '/images/gallery/architecture-crown-church-sm.webp',
  '/get-involved': '/images/gallery/construction-carrying-block-sm.webp',
  '/contact': '/images/gallery/interiors-timber-cross-sm.webp',
}

const EASE = [0.76, 0, 0.24, 1] as const

/** Fullscreen serif navigation overlay (Ethan Vale-inspired), used on every breakpoint. */
export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lenis = useLenis()
  const { settings } = useSettings()
  const [hovered, setHovered] = useState<string>('/')
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement
      lenis?.stop()
      document.documentElement.style.overflow = 'hidden'
      setTimeout(() => closeRef.current?.focus(), 50)
    } else {
      lenis?.start()
      document.documentElement.style.overflow = ''
      returnFocus.current?.focus?.()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, lenis, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="theme-dark fixed inset-0 z-[60] overflow-y-auto bg-ink"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="grain pointer-events-none absolute inset-0" aria-hidden />
          <div className="container-x relative flex min-h-full flex-col">
            <div className="flex h-[72px] items-center justify-between">
              <span className="eyebrow text-champagne/80">Golden Blocks Mission</span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-12 w-12 place-items-center rounded-full border border-white/20 text-white transition-all duration-500 hover:rotate-90 hover:border-gold"
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>

            <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.25fr_1fr]">
              <nav aria-label="Menu">
                <ul className="space-y-1">
                  {[...NAV_LINKS, { to: '/donate', label: 'Donate' } as const].map((l, i) => (
                    <li key={l.to} className="overflow-hidden">
                      <motion.div
                        initial={{ y: '105%' }}
                        animate={{ y: '0%' }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.05 }}
                      >
                        <NavLink
                          to={l.to}
                          end={l.to === '/'}
                          onMouseEnter={() => setHovered(l.to)}
                          onFocus={() => setHovered(l.to)}
                          onClick={onClose}
                          className={({ isActive }) =>
                            cn(
                              'group flex items-baseline gap-5 py-1 font-serif text-[clamp(2rem,min(6vw,7.2vh),4.5rem)] leading-[1.05] tracking-[-0.02em] transition-colors duration-500',
                              isActive ? 'text-gold-metal' : 'text-white/55 hover:text-white',
                            )
                          }
                        >
                          <span className="w-8 font-mono text-[0.65rem] tracking-[0.2em] text-silver/60">{String(i + 1).padStart(2, '0')}</span>
                          <span className="transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-3">{l.label}</span>
                        </NavLink>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </nav>

              <motion.div
                className="relative hidden aspect-[4/5] max-h-[68vh] overflow-hidden lg:block"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={hovered}
                    src={PREVIEW[hovered] ?? PREVIEW['/']}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <figure className="absolute inset-x-6 bottom-6">
                  <blockquote className="font-serif text-xl italic leading-snug text-white">“{SCRIPTURE.exodus.text}”</blockquote>
                  <figcaption className="eyebrow mt-3 text-champagne">{SCRIPTURE.exodus.ref}</figcaption>
                </figure>
              </motion.div>
            </div>

            <div className="grid gap-4 border-t border-white/10 py-6 text-sm text-muted sm:grid-cols-3">
              <p>{settings.email ? <a className="link-underline text-silver-light" href={`mailto:${settings.email}`}>{settings.email}</a> : <Placeholder label="Email address" />}</p>
              <p>{settings.phone ? <a className="link-underline text-silver-light" href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a> : <Placeholder label="Phone number" />}</p>
              <p className="sm:text-right">Building His House. Advancing His Mission.</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
