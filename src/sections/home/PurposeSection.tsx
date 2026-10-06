import { Reveal, SplitReveal, ImageReveal } from '@/animations/Reveal'
import { Parallax } from '@/animations/Parallax'
import { SCRIPTURE } from '@/data/site'

export function PurposeSection() {
  return (
    <section id="purpose" aria-labelledby="purpose-title" className="relative bg-night py-28 md:py-40">
      <div className="container-x">
        <div className="mb-16 flex items-center gap-4 md:mb-24">
          <span className="chip">01 — Our purpose</span>
          <span className="rule flex-1" />
        </div>

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <SplitReveal
              as="h2"
              text="More Than Bricks. More Than Buildings."
              className="display-lg max-w-[12ch]"
              wordClassName={(_, i) => (i >= 3 ? 'text-gold-metal italic' : undefined)}
            />
            <Reveal delay={0.15} className="mt-10 max-w-xl">
              <p className="lede">We build new churches and renew existing ones — places worthy of worship.</p>
            </Reveal>

            <Reveal delay={0.25} className="mt-14 border-l border-gold/50 pl-6">
              <blockquote className="font-serif text-2xl italic leading-snug text-white md:text-[1.75rem]">“{SCRIPTURE.psalm.text}”</blockquote>
              <p className="eyebrow mt-4 text-champagne/80">{SCRIPTURE.psalm.ref}</p>
            </Reveal>
          </div>

          <div className="relative lg:col-span-5">
            <ImageReveal
              src="/images/gallery/interiors-light-beam.webp"
              srcSet="/images/gallery/interiors-light-beam-xs.webp 480w, /images/gallery/interiors-light-beam-sm.webp 960w, /images/gallery/interiors-light-beam-1000.webp 1000w, /images/gallery/interiors-light-beam.webp 2400w"
              sizes="(min-width: 1024px) 32vw, 92vw"
              alt="Kyambogo Seventh-day Adventist Church in Kampala, Uganda"
              className="aspect-[3/4] w-full lg:w-[88%]"
            />
            <div className="relative -mt-24 ml-auto w-[62%] border-8 border-night md:-mt-32">
              <ImageReveal src="/images/gallery/construction-laying-blocks-sm.webp" alt="Builders laying concrete blocks course by course" className="aspect-[4/5] w-full" />
            </div>
            <p className="eyebrow mt-4 text-right text-[0.6rem] text-silver/60">Places of worship · places of service</p>
          </div>
        </div>
      </div>

      <div className="mt-28 md:mt-40">
        <Parallax amount={16} className="h-[52vh] min-h-[340px] md:h-[78vh]">
          <img
            src="/images/gallery/interiors-concrete-nave.webp"
            alt="The galleried sanctuary of an Adventist church"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </Parallax>
        <div className="container-x -mt-px grid gap-6 border-b border-white/10 py-8 md:grid-cols-3">
          {['Faith grows', 'Communities gather', 'Generations encounter God'].map((t, i) => (
            <Reveal key={t} delay={i * 0.08} className="flex items-baseline gap-4">
              <span className="font-mono text-[0.65rem] tracking-[0.2em] text-gold">0{i + 1}</span>
              <h3 className="font-serif text-xl text-white">{t}</h3>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
