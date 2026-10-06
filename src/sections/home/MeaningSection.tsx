import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from '@/animations/gsap'
import { SceneCanvas } from '@/three/SceneCanvas'
import { BlocksAssembly } from '@/three/BlocksAssembly'
import { SCRIPTURE, SITE } from '@/data/site'
import { isLowPowerDevice, prefersReducedMotion } from '@/lib/device'

const STEPS = [
  {
    label: 'The gold',
    title: 'One precious offering.',
    body: 'Gold speaks of riches, value, sacrifice and generosity — what is most precious, brought freely to God.',
  },
  {
    label: 'The blocks',
    title: 'The material of His house.',
    body: 'Blocks are the humble, physical stuff of a place of worship. Ordinary things, made holy by their purpose.',
  },
  {
    label: 'Together',
    title: 'Every block builds a legacy.',
    body: 'Alone, a block is only a block. Laid together — course upon course, gift upon gift — it becomes a sanctuary.',
  },
  {
    label: 'The calling',
    title: 'Bring your gold to the Father.',
    body: SITE.founding_message,
  },
]

function StaticFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <img src="/images/gallery/architecture-modernist-sanctuary.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-night" />
    </div>
  )
}

export function MeaningSection() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [step, setStep] = useState(0)
  const marker = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const [reduced] = useState(prefersReducedMotion)
  const [lowPower] = useState(isLowPowerDevice)

  useEffect(() => {
    if (reduced) {
      progress.current = 1
      setStep(3)
      return
    }
    if (!section.current) return
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: '+=320%',
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            progress.current = self.progress
            setStep(Math.min(3, Math.floor(self.progress * 4.2)))
            const pct = Math.round(self.progress * 100)
            const top = `${14 + pct * 0.72}%`
            if (marker.current) marker.current.style.top = top
            if (label.current) {
              label.current.style.top = `calc(${top} - 0.45rem)`
              label.current.textContent = `${pct}%`
            }
          },
        },
      })
    }, section)
    return () => ctx.revert()
  }, [reduced])

  const s = STEPS[step]

  return (
    <section ref={section} id="meaning" aria-labelledby="meaning-title" className="theme-dark relative h-[100svh] min-h-[640px] overflow-hidden bg-[#2f3237]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,#45413a_0%,#2f3237_60%)]" aria-hidden />
      <SceneCanvas fallback={<StaticFallback />} camera={{ position: [0, 2.4, 6], fov: 36 }} shadows>
        <BlocksAssembly progress={progress} lowPower={lowPower} />
      </SceneCanvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#2f3237] via-[#2f3237]/60 to-transparent md:via-[#2f3237]/25" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#2f3237] via-[#2f3237]/85 to-transparent md:hidden" aria-hidden />

      <div className="container-x relative z-10 flex h-full flex-col justify-end pb-14 pt-28 md:justify-center md:pb-0">
        <span className="chip mb-6 self-start md:mb-8">02 — The meaning of Golden Blocks</span>
        <h2 id="meaning-title" className="sr-only">The meaning of Golden Blocks</h2>
        <div className="relative min-h-[15rem] max-w-[34rem] md:min-h-[19rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, y: -18, transition: { duration: 0.35 } }}
            >
              <p className="eyebrow mb-4 text-champagne">{String(step + 1).padStart(2, '0')} / {s.label}</p>
              <p className={step === 3 ? 'display-md font-serif text-gold-metal italic' : 'display-md font-serif text-white'}>{s.title}</p>
              <p className={step === 3 ? 'mt-6 font-serif text-xl italic leading-relaxed text-silver-light md:text-2xl' : 'lede mt-6'}>
                {step === 3 ? `“${s.body}”` : s.body}
              </p>
              {step === 3 && <p className="eyebrow mt-5 text-silver/70">{SCRIPTURE.haggai.text} — {SCRIPTURE.haggai.ref}</p>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Keel-style progress rail */}
      <div className="pointer-events-none absolute bottom-0 right-6 top-0 z-10 hidden w-24 md:block lg:right-14" aria-hidden>
        <div className="absolute inset-y-[14%] left-0 w-px bg-white/10" />
        {Array.from({ length: 11 }, (_, i) => (
          <span key={i} className="absolute left-0 h-px bg-white/30" style={{ top: `${14 + i * 7.2}%`, width: i % 5 === 0 ? 22 : 12 }} />
        ))}
        <span ref={marker} className="absolute left-0 h-px w-8 bg-gold-bright" style={{ top: reduced ? '86%' : '14%' }} />
        <span ref={label} className="absolute left-10 font-mono text-[0.6rem] tracking-[0.2em] text-champagne" style={{ top: reduced ? 'calc(86% - 0.45rem)' : 'calc(14% - 0.45rem)' }}>
          {reduced ? '100%' : '0%'}
        </span>
      </div>
    </section>
  )
}
