import { Parallax } from '@/animations/Parallax'
import { Reveal, SplitReveal } from '@/animations/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { SCRIPTURE } from '@/data/site'

const AREAS = ['Construction materials', 'Renovation', 'Church infrastructure', 'Missionary initiatives', 'Community outreach']

export function GivingSection() {
  return (
    <section id="giving" aria-labelledby="giving-title" className="relative overflow-hidden bg-ink">
      <Parallax amount={14} className="absolute inset-0 h-full">
        <img
          src="/images/gallery/construction-carrying-block.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-[center_30%] opacity-60"
        />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" aria-hidden />

      <div className="container-x relative grid gap-16 py-28 md:py-40 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <span className="chip mb-8">05 — The power of giving</span>
          <SplitReveal as="h2" text="Your giving builds more than walls." className="display-lg max-w-[11ch]" wordClassName={(_, i) => (i >= 3 ? 'text-gold-metal italic' : undefined)} />
          <Reveal delay={0.1}>
            <p className="lede mt-8 max-w-lg">Every gift is a block in a house of worship.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink to="/donate">Give to the mission</ButtonLink>
              <ButtonLink to="/get-involved" variant="dark">Other ways to help</ButtonLink>
            </div>
            <figure className="mt-14 max-w-md">
              <blockquote className="font-serif text-lg italic leading-relaxed text-silver-light/90">“{SCRIPTURE.corinthians.text}”</blockquote>
              <figcaption className="eyebrow mt-3 text-champagne/80">{SCRIPTURE.corinthians.ref}</figcaption>
            </figure>
          </Reveal>
        </div>

        <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
          <p className="eyebrow mb-6 text-silver/70">What your gifts support</p>
          <ul className="border-t border-white/12">
            {AREAS.map((t, i) => (
              <Reveal as="li" key={t} delay={i * 0.06} className="group grid grid-cols-[2.5rem_1fr] gap-4 border-b border-white/12 py-6">
                <span className="pt-1 font-mono text-[0.65rem] tracking-[0.2em] text-gold">0{i + 1}</span>
                <h3 className="font-serif text-[1.45rem] text-white transition-colors duration-500 group-hover:text-gold-bright">{t}</h3>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
