import { motion, useReducedMotion } from 'framer-motion'
import { SplitReveal, Reveal } from '@/animations/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { SITE } from '@/data/site'

/** Closing call to action with the brand's concentric halo. */
export function FinalCTA({
  title = 'Build hope, dignity and better lives.',
  goldFrom = 1,
  primary = { to: '/donate', label: 'Make a Donation' },
  secondary = { to: '/get-involved#enquiry', label: 'Become a Partner' },
}: {
  title?: string
  goldFrom?: number
  primary?: { to: string; label: string }
  secondary?: { to: string; label: string }
}) {
  const reduce = useReducedMotion()
  return (
    <section aria-labelledby="cta-title" className="theme-dark relative overflow-hidden bg-night py-32 md:py-48">
      <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
        <svg viewBox="0 0 1000 1000" className="h-[150vmin] w-[150vmin] max-w-none">
          <defs>
            <radialGradient id="cta-core" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#f6e2a6" stopOpacity="0.35" />
              <stop offset="0.25" stopColor="#c49a36" stopOpacity="0.08" />
              <stop offset="1" stopColor="#c49a36" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="500" cy="500" r="480" fill="url(#cta-core)" />
          {[80, 150, 230, 320, 420].map((r, i) => (
            <motion.circle
              key={r}
              cx="500"
              cy="500"
              r={r}
              fill="none"
              stroke={i % 2 ? '#c0c0c0' : '#e8d5a3'}
              strokeOpacity={0.22 - i * 0.03}
              strokeWidth="1"
              initial={reduce ? false : { scale: 0.85, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: '500px 500px' }}
            />
          ))}
        </svg>
      </div>
      <div className="container-x relative text-center">
        <p className="eyebrow mb-8 text-champagne">Golden Blocks Mission</p>
        <SplitReveal as="h2" text={title} className="display-xl mx-auto max-w-[14ch]" wordClassName={(_, i) => (i >= goldFrom ? 'text-gold-metal italic' : undefined)} />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl font-serif text-lg italic text-silver-light/85">“{SITE.founding_message}”</p>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <ButtonLink to={primary.to}>{primary.label}</ButtonLink>
            <ButtonLink to={secondary.to} variant="dark">{secondary.label}</ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
