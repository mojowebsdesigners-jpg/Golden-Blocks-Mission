import { useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { gsap } from '@/animations/gsap'
import { SplitReveal } from '@/animations/Reveal'
import { prefersReducedMotion } from '@/lib/device'
import { cn } from '@/lib/utils'

/**
 * Inner-page hero: full-bleed architectural image that slowly pushes in and
 * darkens on scroll, a mono breadcrumb, a masked serif headline and an
 * optional lede. `goldFrom` marks the word index where the gold italic begins.
 */
export function PageHero({
  eyebrow,
  title,
  goldFrom,
  lede,
  image,
  imageAlt = '',
  imagePosition = 'center',
  children,
  compact = false,
}: {
  eyebrow: string
  title: string
  goldFrom?: number
  lede?: ReactNode
  image: string
  imageAlt?: string
  imagePosition?: string
  children?: ReactNode
  compact?: boolean
}) {
  const root = useRef<HTMLElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.to(img.current, { scale: 1.12, yPercent: 8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to(inner.current, { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className={cn('theme-dark relative flex items-end overflow-hidden bg-ink', compact ? 'min-h-[68svh]' : 'min-h-[88svh]')}>
      <motion.img
        ref={img}
        src={image}
        alt={imageAlt}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: imagePosition }}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/25" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-night/75 via-night/20 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-[72px] h-px bg-white/[0.08]" aria-hidden />

      <div ref={inner} className="container-x relative z-10 pb-16 pt-40 md:pb-24">
        <motion.p
          className="eyebrow mb-6 flex items-center gap-3 text-champagne"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <span className="h-px w-8 bg-champagne/70" /> {eyebrow}
        </motion.p>
        <SplitReveal
          as="h1"
          immediate
          delay={0.35}
          text={title}
          className="display-xl max-w-[15ch]"
          wordClassName={goldFrom !== undefined ? (_, i) => (i >= goldFrom ? 'text-gold-metal italic' : undefined) : undefined}
        />
        {lede && (
          <motion.div
            className="lede mt-8 max-w-2xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {lede}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  )
}

/** Small numbered section header used across inner pages. */
export function SectionLabel({ index, children, className, silver = false }: { index: string; children: ReactNode; className?: string; silver?: boolean }) {
  return (
    <div className={cn('mb-12 flex items-center gap-4', className)}>
      <span className={cn('chip', silver && 'chip-silver')}>{index} — {children}</span>
      <span className="rule flex-1" />
    </div>
  )
}
