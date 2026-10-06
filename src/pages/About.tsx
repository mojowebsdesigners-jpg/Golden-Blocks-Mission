import { Seo } from '@/components/common/Seo'
import { PageHero, SectionLabel } from '@/sections/common/PageHero'
import { PartnershipSDA } from '@/sections/common/PartnershipSDA'
import { FinalCTA } from '@/sections/common/FinalCTA'
import { ImageReveal, Reveal, SplitReveal } from '@/animations/Reveal'
import { Parallax } from '@/animations/Parallax'
import { SCRIPTURE, SITE, VALUES } from '@/data/site'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

export default function About() {
  return (
    <>
      <Seo
        title="About Us"
        path="/about"
        description="Who we are, why Golden Blocks Mission exists, the meaning behind our name, our vision, mission, values and our relationship with the Seventh-day Adventist Church."
      />
      <PageHero
        eyebrow="About us"
        title="A mission measured in sanctuaries and souls."
        goldFrom={4}
        image="/images/gallery/interiors-light-rays.webp"
        imagePosition="center 30%"
        lede="Building and renewing churches. Advancing the Gospel."
      />

      {/* Who we are — editorial split */}
      <section className="bg-night py-28 md:py-40" aria-labelledby="who-title">
        <div className="container-x">
          <SectionLabel index="01">Who we are</SectionLabel>
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="who-title" className="display-md lg:sticky lg:top-32">
                Builders, givers and believers — <span className="text-gold-metal italic">united by one house.</span>
              </h2>
            </div>
            <div className="space-y-7 lg:col-span-6 lg:col-start-7">
              <Reveal>
                <p className="font-serif text-2xl leading-[1.45] text-white md:text-[1.75rem]">
                  <span className="float-left mr-3 mt-1 font-serif text-[4.6rem] leading-[0.8] text-gold-metal">W</span>
                  e believe the places where God’s people gather should reflect the worth of the One they worship.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Why we exist — full-width image with scripture */}
      <section aria-labelledby="why-title" className="relative">
        <Parallax amount={18} className="h-[80svh] min-h-[480px]">
          <img src="/images/gallery/interiors-stone-pews.webp" alt="A congregation gathered for Sabbath worship" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/70" />
        <div className="container-x absolute inset-x-0 bottom-0 pb-16 md:pb-24">
          <span className="chip mb-6">02 — Why we exist</span>
          <h2 id="why-title" className="display-lg max-w-[16ch]">Because worship deserves a worthy home.</h2>
          <figure className="mt-10 max-w-lg border-l border-gold/60 pl-5">
            <blockquote className="font-serif text-xl italic text-white">“{SCRIPTURE.exodus.text}”</blockquote>
            <figcaption className="eyebrow mt-3 text-champagne/80">{SCRIPTURE.exodus.ref}</figcaption>
          </figure>
        </div>
      </section>

      {/* The story behind the name */}
      <section aria-labelledby="name-title" className="bg-night py-28 md:py-40">
        <div className="container-x">
          <SectionLabel index="03">The story behind our name</SectionLabel>
          <SplitReveal as="h2" text="Why gold. Why blocks." className="display-lg" wordClassName={(_, i) => (i === 1 ? 'text-gold-metal italic' : i === 3 ? 'text-silver-metal italic' : undefined)} />
          <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-2">
            <Reveal className="bg-night p-8 md:p-12">
              <div className="mb-10 h-20 w-32 bg-[linear-gradient(135deg,#ffdc7a_0%,#ffc93c_35%,#d99a14_70%,#ffd566_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,.6)]" aria-hidden />
              <h3 className="font-serif text-3xl text-white">Gold</h3>
              <p className="mt-4 leading-relaxed text-muted">Our finest, freely offered back to God.</p>
            </Reveal>
            <Reveal delay={0.1} className="bg-night p-8 md:p-12">
              <div className="mb-10 flex gap-1.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-20 w-10 bg-[linear-gradient(135deg,#e6e7e9_0%,#bfc1c4_50%,#7c7f86_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,.8)]" />
                ))}
              </div>
              <h3 className="font-serif text-3xl text-white">Blocks</h3>
              <p className="mt-4 leading-relaxed text-muted">Many humble parts, joined into one house.</p>
            </Reveal>
          </div>
          <Reveal className="mx-auto mt-20 max-w-4xl text-center">
            <p className="eyebrow mb-6 text-champagne">Our founding conviction</p>
            <blockquote className="font-serif text-[clamp(1.6rem,3.2vw,2.8rem)] italic leading-[1.3] text-white">“{SITE.founding_message}”</blockquote>
          </Reveal>
        </div>
      </section>

      {/* Vision & Mission */}
      <section aria-label="Vision and mission" className="bg-coal py-28 md:py-36">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          {[
            { k: 'Our vision', t: 'Communities transformed through worthy places of worship.', img: '/images/gallery/architecture-crown-church-sm.webp' },
            { k: 'Our mission', t: 'To build and restore churches, and advance the Gospel.', img: '/images/gallery/construction-blockwork-sm.webp' },
          ].map((b, i) => (
            <Reveal key={b.k} delay={i * 0.1} className="group relative overflow-hidden border border-white/10 p-8 md:p-12">
              <img src={b.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-[0.12] transition-all duration-[1.4s] group-hover:scale-105 group-hover:opacity-20" />
              <div className="relative">
                <p className="eyebrow text-champagne">0{4 + i} — {b.k}</p>
                <p className="mt-10 font-serif text-[clamp(1.6rem,2.6vw,2.35rem)] leading-[1.25] text-white">{b.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values-title" className="bg-night py-28 md:py-40">
        <div className="container-x">
          <SectionLabel index="06">Our values</SectionLabel>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 id="values-title" className="display-lg max-w-[12ch]">Eight stones in <span className="text-gold-metal italic">one foundation.</span></h2>
          </div>
          <ul className="mt-16 grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal as="li" key={v.name} delay={(i % 4) * 0.06} className="group relative overflow-hidden border-b border-r border-white/10 p-7 md:p-9">
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-[linear-gradient(180deg,rgba(255,201,60,0.22),rgba(255,201,60,0.04))] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" aria-hidden />
                <span className="relative font-mono text-[0.65rem] tracking-[0.24em] text-gold">{ROMAN[i]}</span>
                <h3 className="relative mt-10 font-serif text-[1.9rem] text-white">{v.name}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-muted">{v.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Christian foundation */}
      <section aria-labelledby="foundation-title" className="bg-coal py-28 md:py-40">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <ImageReveal src="/images/gallery/details-bible-stand.webp" alt="An open Bible resting on its stand" className="aspect-[4/5] w-full" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:self-center">
            <span className="chip mb-8">07 — Our Christian foundation</span>
            <h2 id="foundation-title" className="display-md">Built on the Rock, <span className="text-gold-metal italic">for His glory.</span></h2>
            <Reveal className="mt-8 space-y-5">
              <p className="lede">Faith in Jesus Christ. The authority of Scripture.</p>
              <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
                {[SCRIPTURE.psalm].map((s) => (
                  <li key={s.ref} className="grid gap-2 py-5 md:grid-cols-[1fr_auto] md:gap-8">
                    <p className="font-serif text-lg italic text-silver-light">“{s.text}”</p>
                    <p className="eyebrow text-champagne/80 md:text-right">{s.ref}</p>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted">Scripture quotations are from the King James Version.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <PartnershipSDA index="08" />
      <FinalCTA title="Become part of the story we are building." goldFrom={5} />
    </>
  )
}
