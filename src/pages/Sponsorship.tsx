import { useState } from 'react'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/sections/common/PageHero'
import { ImageReveal, Reveal, SplitReveal } from '@/animations/Reveal'
import { PartnershipForm } from '@/components/forms/PartnershipForm'
import { DemoBadge } from '@/components/common/ProjectBits'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { useLenis } from '@/components/layout/SmoothScroll'
import { useAsync } from '@/hooks/useAsync'
import { getSponsorshipPrograms } from '@/services/content'
import type { SponsorshipProgram } from '@/types'

const STEPS = [
  ['Choose a programme', 'Pick what you want to support.'],
  ['Send an enquiry', 'A few details about you.'],
  ['We confirm the details', 'Our team contacts you personally.'],
] as const

export default function Sponsorship() {
  const { data, loading, error, reload } = useAsync(getSponsorshipPrograms, [])
  const [chosen, setChosen] = useState<string>()
  const lenis = useLenis()

  const sponsor = (p: SponsorshipProgram) => {
    setChosen(`I would like to sponsor the “${p.title}” programme. Please contact me with the details.`)
    const form = document.getElementById('sponsor-enquiry')
    if (form) (lenis ? lenis.scrollTo(form, { offset: -90 }) : form.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <>
      <Seo title="Sponsorship Programs" path="/sponsorship" description="Sponsor a programme with Golden Blocks Mission — regular support for church construction, renovation, outreach and ministry." />
      <PageHero
        eyebrow="Sponsorship Programs"
        title="Stand behind the work, month after month."
        goldFrom={4}
        image="/images/gallery/construction-carrying-block.webp"
        compact
        lede="Steady support for the builders, congregations and ministries."
      />

      <section className="bg-night py-24 md:py-32" aria-labelledby="programmes-title">
        <div className="container-x">
          <div className="mb-14 flex items-center gap-4">
            <span className="chip">Programmes</span>
            <span className="rule flex-1" />
          </div>
          <SplitReveal as="h2" text="Choose where your support goes." className="display-md mb-14 max-w-[18ch]" wordClassName={(_, i) => (i >= 3 ? 'text-gold-metal italic' : undefined)} />
          <h2 id="programmes-title" className="sr-only">Sponsorship programmes</h2>

          {loading ? (
            <PageLoader />
          ) : error ? (
            <ErrorState message="We could not load the sponsorship programmes." onRetry={reload} />
          ) : !data?.length ? (
            <p className="max-w-xl font-serif text-2xl text-white">Programmes coming soon. Register your interest below.</p>
          ) : (
            <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
              {data.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 3) * 0.08} className="flex flex-col border border-white/10 bg-card">
                  <div className="relative">
                    {p.cover_image ? (
                      <ImageReveal src={p.cover_image} alt="" className="aspect-[4/3] w-full" />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-[linear-gradient(135deg,#ffdc7a,#ffc93c_45%,#d99a14)]" aria-hidden />
                    )}
                    {p.is_demo && <DemoBadge className="absolute left-4 top-4" />}
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <h3 className="font-serif text-[1.65rem] leading-tight text-white">{p.title}</h3>
                    {p.amount_label && <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-champagne">{p.amount_label}</p>}
                    {p.summary && <p className="mt-4 leading-relaxed text-silver-light">{p.summary}</p>}
                    {p.description && <p className="mt-3 text-sm leading-relaxed text-muted">{p.description}</p>}
                    <div className="mt-auto pt-8">
                      <button type="button" onClick={() => sponsor(p)} className="btn-gold w-full justify-between">
                        <span>Sponsor this programme</span>
                        <span className="btn-arrow" aria-hidden>→</span>
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-coal py-24 md:py-28" aria-labelledby="how-title">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="chip">How it works</span>
            <h2 id="how-title" className="display-sm mt-6 max-w-[14ch]">Three simple steps.</h2>
          </div>
          <ol className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            {STEPS.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 0.08} className="border-t-2 border-gold-bright pt-6">
                <span className="font-mono text-[0.7rem] tracking-[0.24em] text-champagne">0{i + 1}</span>
                <h3 className="mt-3 font-serif text-xl text-white">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="sponsor-enquiry" className="scroll-mt-24 bg-night py-24 md:py-32" aria-labelledby="sponsor-form-title">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="chip">Sponsorship enquiry</span>
            <h2 id="sponsor-form-title" className="display-sm mt-6">Become a sponsor.</h2>
            
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <PartnershipForm defaultType="sponsorship" defaultMessage={chosen} />
          </div>
        </div>
      </section>
    </>
  )
}
