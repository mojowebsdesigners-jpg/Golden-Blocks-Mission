import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Reveal, SplitReveal } from '@/animations/Reveal'
import { SITE, WELCOME } from '@/data/site'

/** The organisation's welcome, kept to a headline, three doorways and a sign-off. */
export function WelcomeSection() {
  return (
    <section id="welcome" aria-labelledby="welcome-title" className="relative bg-night py-28 md:py-40">
      <div className="container-x">
        <div className="mb-16 flex items-center gap-4 md:mb-20">
          <span className="chip">Welcome</span>
          <span className="rule flex-1" />
        </div>

        <SplitReveal
          as="h2"
          text={WELCOME.title}
          className="display-lg max-w-[18ch]"
          wordClassName={(_, i) => (i >= 6 ? 'text-gold-metal italic' : undefined)}
        />
        <Reveal delay={0.15} className="mt-10 max-w-xl">
          <p className="lede">{WELCOME.lede}</p>
        </Reveal>

        <ul className="mt-16 grid border-l border-t border-white/10 md:grid-cols-3">
          {WELCOME.pillars.map((p, i) => (
            <Reveal as="li" key={p.k} delay={i * 0.08} className="border-b border-r border-white/10">
              <Link to={p.to} className="group flex h-full items-start justify-between gap-6 p-7 transition-colors hover:bg-white/[0.03] md:p-9">
                <span>
                  <span className="font-mono text-[0.65rem] tracking-[0.2em] text-gold">0{i + 1}</span>
                  <span className="mt-8 block font-serif text-[1.9rem] text-white">{p.k}</span>
                  <span className="mt-2 block text-sm text-muted">{p.t}</span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-gold transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
              </Link>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-16 flex flex-col gap-4 border-l border-gold/50 pl-6 md:flex-row md:items-baseline md:justify-between">
          <p className="font-serif text-2xl italic leading-snug text-white md:text-[1.75rem]">{WELCOME.invitation}</p>
          <p className="eyebrow shrink-0 text-champagne/80">{SITE.closing}</p>
        </Reveal>
      </div>
    </section>
  )
}
