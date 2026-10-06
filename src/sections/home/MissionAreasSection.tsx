import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { gsap } from '@/animations/gsap'
import { MISSION_AREAS } from '@/data/site'
import { prefersReducedMotion } from '@/lib/device'
import { Reveal } from '@/animations/Reveal'

function AreaCard({ area, className }: { area: (typeof MISSION_AREAS)[number]; className?: string }) {
  return (
    <Link
      to={area.to}
      className={`group relative block overflow-hidden bg-card ${className ?? ''}`}
      aria-label={`${area.title} — learn more`}
    >
      <img
        src={area.image.replace('.webp', '-sm.webp')}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 transition-opacity duration-700 group-hover:from-black/95" />
      <div className="absolute inset-0 border border-white/10 transition-colors duration-700 group-hover:border-gold/50" />
      <div className="theme-dark relative flex h-full flex-col justify-between p-6 md:p-7">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[0.68rem] tracking-[0.24em] text-champagne">{area.index}</span>
          <span className="grid h-10 w-10 place-items-center border border-white/25 text-white transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-black">
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </div>
        <div>
          <h3 className="font-serif text-[1.75rem] leading-[1.1] text-white md:text-[2rem]">{area.title}</h3>
          <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-silver-light/85 transition-all duration-700 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
            {area.short}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function MissionAreasSection() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px)', () => {
      const el = track.current!
      const distance = () => el.scrollWidth - window.innerWidth + 64
      gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={section} id="areas" aria-labelledby="areas-title" className="relative overflow-hidden bg-coal py-24 lg:flex lg:h-[100svh] lg:items-center lg:py-0">
      <div ref={track} className="flex flex-col gap-6 px-4 sm:px-8 lg:flex-row lg:items-stretch lg:gap-6 lg:pl-[5.5rem] lg:pr-16">
        <div className="flex shrink-0 flex-col justify-center lg:w-[34vw] lg:pr-10">
          <span className="chip mb-8 self-start">03 — Our mission areas</span>
          <h2 id="areas-title" className="display-lg max-w-[11ch]">
            Faith that builds <span className="text-gold-metal italic">beyond walls.</span>
          </h2>
          <p className="lede mt-8 max-w-md">Six areas of work. One mission.</p>
          <p className="eyebrow mt-10 hidden items-center gap-3 text-silver/70 lg:flex">
            <span className="h-px w-10 bg-silver/50" /> Scroll to explore
          </p>
        </div>
        {MISSION_AREAS.map((a, i) => (
          <Reveal key={a.slug} delay={i * 0.04} className="shrink-0 lg:!opacity-100 lg:!transform-none">
            <AreaCard area={a} className="aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-auto lg:h-[72svh] lg:w-[min(30vw,460px)]" />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
