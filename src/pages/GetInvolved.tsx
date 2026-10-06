import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BrickWall, Building2, Church, HandCoins, HardHat, HeartHandshake, Ruler, Sparkles, Users, type LucideIcon } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { PageHero, SectionLabel } from '@/sections/common/PageHero'
import { PartnershipForm } from '@/components/forms/PartnershipForm'
import { Reveal } from '@/animations/Reveal'
import { useLenis } from '@/components/layout/SmoothScroll'
import { INVOLVEMENT, SCRIPTURE } from '@/data/site'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = { HandCoins, Church, Building2, Users, BrickWall, HardHat, Sparkles, Ruler, HeartHandshake }

export default function GetInvolved() {
  const [type, setType] = useState<string | undefined>()
  const lenis = useLenis()

  const choose = (key: string) => {
    setType(key)
    const el = document.getElementById('enquiry')
    if (el) lenis ? lenis.scrollTo(el, { offset: -90 }) : el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Seo title="Get Involved" path="/get-involved" description="Give, partner, volunteer, donate materials, fundraise, offer professional expertise or pray — the many ways to build with Golden Blocks Mission." />
      <PageHero
        eyebrow="Get involved"
        title="Bring your gold. Bring your gifts."
        goldFrom={3}
        image="/images/gallery/construction-carrying-stone.webp"
        imagePosition="center 30%"
        lede="Every contribution matters — finance, materials, skills, service or prayer."
      />

      <section className="bg-night py-28 md:py-36" aria-labelledby="ways-title">
        <div className="container-x">
          <SectionLabel index="01">Ways to build with us</SectionLabel>
          <h2 id="ways-title" className="display-lg max-w-[14ch]">Nine ways to lay <span className="text-gold-metal italic">a block.</span></h2>

          <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {INVOLVEMENT.map((w, i) => {
              const Icon = ICONS[w.icon]
              const isFeature = i === 0
              return (
                <Reveal
                  key={w.key}
                  delay={(i % 3) * 0.06}
                  className={cn('group relative flex flex-col overflow-hidden bg-night p-8 md:p-10', isFeature && 'md:col-span-2 lg:col-span-2 lg:row-span-1')}
                >
                  {isFeature && (
                    <>
                      <img src="/images/gallery/construction-carrying-block-sm.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-25 transition-transform duration-[1.6s] group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-transparent" />
                    </>
                  )}
                  <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-700 group-hover:scale-x-100" aria-hidden />
                  <div className="relative flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center border border-gold/30 text-gold-bright transition-colors duration-500 group-hover:border-gold group-hover:bg-gold/10">
                      <Icon className="h-5 w-5" strokeWidth={1.4} />
                    </span>
                    <span className="font-mono text-[0.62rem] tracking-[0.22em] text-silver/50">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className={cn('relative mt-10 font-serif text-white', isFeature ? 'text-4xl' : 'text-[1.7rem]')}>{w.title}</h3>
                  <p className={cn('relative mt-3 flex-1 leading-relaxed text-muted', isFeature && 'max-w-md text-silver-light/85')}>{w.text}</p>
                  <div className="relative mt-8">
                    {'href' in w && w.href ? (
                      <Link to={w.href} className="btn-gold">
                        <span>{w.cta}</span>
                        <span className="btn-arrow"><ArrowRight className="h-3 w-3" /></span>
                      </Link>
                    ) : (
                      <button type="button" onClick={() => choose(w.key)} className="eyebrow inline-flex items-center gap-3 text-gold-bright transition-colors hover:text-white">
                        {w.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section id="enquiry" className="scroll-mt-24 bg-coal py-28 md:py-36" aria-labelledby="enquiry-title">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <span className="chip mb-8">02 — Partnership enquiry</span>
              <h2 id="enquiry-title" className="display-md">Let’s build <span className="text-gold-metal italic">together.</span></h2>
              <p className="lede mt-6">Tell us how you would like to help.</p>
              <figure className="mt-12 border-l border-gold/50 pl-5">
                <blockquote className="font-serif text-lg italic text-silver-light">“{SCRIPTURE.peter.text}”</blockquote>
                <figcaption className="eyebrow mt-3 text-champagne/80">{SCRIPTURE.peter.ref}</figcaption>
              </figure>
            </div>
          </div>
          <div className="border border-white/10 bg-night p-6 md:p-10 lg:col-span-7 lg:col-start-6">
            <PartnershipForm defaultType={type} />
          </div>
        </div>
      </section>
    </>
  )
}
