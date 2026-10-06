import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollTrigger } from '@/animations/gsap'
import { useLenis } from './SmoothScroll'
import { cn } from '@/lib/utils'
import { usePastFirstSection } from '@/hooks/usePastFirstSection'

/**
 * Keel-inspired left rail: a full-height hairline, the active section's name
 * beneath the header, and a column of ticks (one per section) that doubles as
 * in-page navigation. Desktop only.
 */
export function SectionRail({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(0)
  const lenis = useLenis()
  const visible = usePastFirstSection()

  useEffect(() => {
    const triggers = sections.map((s, i) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        refreshPriority: -1,
        onToggle: (self) => self.isActive && setActive(i),
      }),
    )
    // Pinned sections are created after this effect; re-measure once they exist.
    const id = window.setTimeout(() => {
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    }, 400)
    return () => {
      window.clearTimeout(id)
      triggers.forEach((t) => t.kill())
    }
  }, [sections])

  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    lenis ? lenis.scrollTo(el) : el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav aria-label="Page sections" className={cn('pointer-events-none fixed inset-y-0 left-0 z-40 hidden w-[4.5rem] transition-opacity duration-700 lg:block', !visible && 'invisible opacity-0')}>
      <div className="absolute inset-y-0 left-[2.25rem] w-px bg-white/[0.09]" aria-hidden />
      <div className="absolute left-[2.25rem] top-[96px]">
        <div className="flex items-center" aria-hidden>
          <span className="h-px w-4 bg-gold-bright" />
          <span className="relative ml-3 block h-3 w-40 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={active}
                className="absolute left-0 top-0 whitespace-nowrap bg-night/90 pr-2 font-mono text-[0.58rem] uppercase leading-3 tracking-[0.26em] text-champagne"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {sections[active]?.label}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
        <ul className="pointer-events-auto mt-3 space-y-0">
          {sections.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(s.id)}
                aria-current={i === active ? 'true' : undefined}
                aria-label={`Go to section: ${s.label}`}
                className="group flex h-4 items-center"
              >
                <span className={cn('block h-px transition-all duration-500', i === active ? 'w-3.5 bg-white/80' : 'w-2 bg-white/30 group-hover:w-3 group-hover:bg-white/60')} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
