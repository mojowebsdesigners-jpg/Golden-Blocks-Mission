import { Seo } from '@/components/common/Seo'
import { PageHero, SectionLabel } from '@/sections/common/PageHero'
import { FinalCTA } from '@/sections/common/FinalCTA'
import { ImageReveal, Reveal, SplitReveal } from '@/animations/Reveal'
import { CompareSlider } from '@/components/common/CompareSlider'
import { ButtonLink } from '@/components/ui/Button'
import { SCRIPTURE } from '@/data/site'

const MARQUEE = ['community-choir', 'community-congregation', 'community-walking-together', 'community-prayer', 'community-full-sanctuary', 'community-children-service']
const YOUTH = [
  { img: 'outreach-classroom', t: 'Christian education' },
  { img: 'outreach-young-learner', t: 'Mentorship' },
  { img: 'community-children-service', t: "Children's ministry" },
  { img: 'outreach-running-children', t: 'Youth programmes' },
  { img: 'outreach-school-children', t: 'Discipleship' },
]

export default function Mission() {
  return (
    <>
      <Seo
        title="Our Mission"
        path="/mission"
        description="Church construction, church renovation, evangelism, community outreach, youth and children's development, and partnership — the work of Golden Blocks Mission."
      />
      <PageHero
        eyebrow="Our mission"
        title="Building churches. Transforming communities. Advancing the Gospel."
        goldFrom={4}
        image="/images/gallery/community-congregation.webp"
        imagePosition="center 40%"
        lede="Six areas of work. One purpose."
      />

      {/* 01 Construction — sticky text, stacked imagery */}
      <section id="construction" aria-labelledby="construction-title" className="scroll-mt-20 bg-night py-28 md:py-40">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionLabel index="01" className="mb-10">Church construction</SectionLabel>
              <h2 id="construction-title" className="display-md">Modern, welcoming, <span className="text-gold-metal italic">dignified.</span></h2>
              <p className="lede mt-8">
                From worship under trees to a permanent house of God.
              </p>
              <ul className="mt-10 space-y-4 text-[0.98rem] text-silver-light/85">
                {['Plan with the local church', 'Mobilise materials and labour', 'Build to last', 'Dedicate to God'].map((x) => (
                  <li key={x} className="flex gap-4"><span className="mt-2.5 h-px w-5 shrink-0 bg-gold" />{x}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-6 lg:col-start-7">
            <ImageReveal src="/images/gallery/construction-rising-frame.webp" alt="A concrete church frame rising on site" className="aspect-[4/3] w-full" />
            <div className="grid grid-cols-2 gap-6">
              <ImageReveal src="/images/gallery/construction-foundation-sm.webp" alt="Setting a foundation of concrete blocks" className="aspect-[3/4] w-full" />
              <ImageReveal src="/images/gallery/construction-mixing-mortar-sm.webp" alt="A builder mixing mortar on site" className="mt-16 aspect-[3/4] w-full" />
            </div>
            <ImageReveal src="/images/gallery/architecture-brick-cross-facade.webp" alt="A completed brick church facade crowned with a cross" className="aspect-[16/10] w-full" />
          </div>
        </div>
      </section>

      {/* 02 Renovation — comparison */}
      <section id="renovation" aria-labelledby="renovation-title" className="scroll-mt-20 bg-coal py-28 md:py-40">
        <div className="container-x">
          <SectionLabel index="02" silver>Church renovation</SectionLabel>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id="renovation-title" className="display-md">From worn <span className="text-silver-metal italic">to welcoming.</span></h2>
              <p className="lede mt-8">
                Honouring what was built before — safer, stronger, welcoming.
              </p>
              <p className="mt-6 text-sm text-muted">Drag to compare.</p>
            </div>
            <Reveal className="lg:col-span-8">
              <CompareSlider
                before="/images/gallery/renovation-scaffold-interior.webp"
                after="/images/gallery/interiors-white-sanctuary.webp"
                beforeLabel="Restoration"
                afterLabel="Renewed"
                alt="Church interior"
              />
              <p className="mt-3 text-xs text-muted">Illustrative imagery of two different buildings — not a single project.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 03 Evangelism — dark, scriptural, marquee */}
      <section id="evangelism" aria-labelledby="evangelism-title" className="theme-dark relative scroll-mt-20 overflow-hidden bg-ink py-28 md:py-40">
        <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2" aria-hidden>
          <svg viewBox="0 0 600 600" className="h-[90vmin] w-[90vmin] opacity-40">
            {[60, 120, 190, 270].map((r) => <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="#e8d5a3" strokeOpacity="0.25" />)}
          </svg>
        </div>
        <div className="container-x relative text-center">
          <span className="chip mb-10">03 — Evangelism &amp; Gospel advancement</span>
          <SplitReveal as="h2" text="Every sanctuary is a sending place." className="display-lg mx-auto max-w-[14ch]" wordClassName={(_, i) => (i >= 3 ? 'text-gold-metal italic' : undefined)} />
          <Reveal delay={0.1}>
            <p className="lede mx-auto mt-8 max-w-2xl">
              Buildings are never the goal — people are.
              </p>
            <figure className="mx-auto mt-12 max-w-xl">
              <blockquote className="font-serif text-2xl italic text-white md:text-3xl">“{SCRIPTURE.matthew.text}”</blockquote>
              <figcaption className="eyebrow mt-4 text-champagne/80">{SCRIPTURE.matthew.ref}</figcaption>
            </figure>
          </Reveal>
        </div>
        <div className="relative mt-20 overflow-hidden" aria-hidden>
          <div className="flex w-max animate-marquee gap-4">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <img key={i} src={`/images/gallery/${m}-sm.webp`} alt="" loading="lazy" className="h-56 w-80 object-cover opacity-80 md:h-72 md:w-[26rem]" />
            ))}
          </div>
        </div>
      </section>

      {/* 04 Outreach — mosaic */}
      <section id="outreach" aria-labelledby="outreach-title" className="scroll-mt-20 bg-night py-28 md:py-40">
        <div className="container-x">
          <SectionLabel index="04">Community outreach</SectionLabel>
          <div className="grid gap-6 md:grid-cols-12 md:grid-rows-[auto_auto]">
            <div className="md:col-span-5 md:row-span-2 md:self-center md:pr-8">
              <h2 id="outreach-title" className="display-md">Churches that <span className="text-gold-metal italic">serve their streets.</span></h2>
              <p className="lede mt-8">
                A church should be good news to its whole neighbourhood.
              </p>
              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-silver-light/85">
                {['Food & essentials', 'Health & wellbeing', 'Support for widows & orphans', 'Disaster response', 'Skills & livelihoods', 'Counselling & care'].map((x) => (
                  <li key={x} className="flex items-center gap-3"><span className="h-1.5 w-1.5 rotate-45 bg-gold" />{x}</li>
                ))}
              </ul>
            </div>
            <ImageReveal src="/images/gallery/outreach-shared-meal.webp" alt="Children sharing a meal together" className="aspect-[16/10] md:col-span-7" />
            <ImageReveal src="/images/gallery/outreach-gathering-sm.webp" alt="Neighbours gathering outdoors" className="aspect-square md:col-span-3" />
            <ImageReveal src="/images/gallery/outreach-smiling-child-sm.webp" alt="A smiling child" className="aspect-square md:col-span-4" />
          </div>
        </div>
      </section>

      {/* 05 Youth — horizontal strip */}
      <section id="youth" aria-labelledby="youth-title" className="scroll-mt-20 bg-coal py-28 md:py-40">
        <div className="container-x flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="chip mb-8">05 — Youth &amp; children’s development</span>
            <h2 id="youth-title" className="display-md max-w-[16ch]">For the generation <span className="text-gold-metal italic">who will inherit these walls.</span></h2>
          </div>
          <p className="max-w-md text-muted">
            Faith, character and leadership for the next generation.
              </p>
        </div>
        <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-8 lg:px-[5.5rem]" tabIndex={0} aria-label="Youth ministry images, scroll horizontally">
          {YOUTH.map((y, i) => (
            <figure key={y.img} className="group w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30vw]">
              <div className="overflow-hidden">
                <img src={`/images/gallery/${y.img}-sm.webp`} alt={y.t} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
              </div>
              <figcaption className="mt-4 flex items-baseline gap-4">
                <span className="font-mono text-[0.62rem] tracking-[0.22em] text-gold">0{i + 1}</span>
                <span className="font-serif text-xl text-white">{y.t}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 06 Partnership & stewardship */}
      <section id="partnership" aria-labelledby="stewardship-title" className="scroll-mt-20 bg-night py-28 md:py-40">
        <div className="container-x">
          <SectionLabel index="06">Partnership &amp; stewardship</SectionLabel>
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="stewardship-title" className="display-md">What none can build alone, <span className="text-gold-metal italic">all can build together.</span></h2>
              <p className="lede mt-8">
                Everyone holds part of what a sanctuary needs.
              </p>
              <ButtonLink to="/get-involved" className="mt-10">Ways to partner</ButtonLink>
            </div>
            <ol className="lg:col-span-6 lg:col-start-7">
              {[
                ['Pray', 'With the local congregation.'],
                ['Plan', 'With church leaders and professionals.'],
                ['Mobilise', 'Givers, partners and volunteers.'],
                ['Build', 'In stages, shared openly.'],
                ['Dedicate', 'And the ministry begins.'],
              ].map(([t, d], i) => (
                <Reveal as="li" key={t} delay={i * 0.06} className="grid grid-cols-[4rem_1fr] border-t border-white/10 py-7 last:border-b">
                  <span className="font-serif text-4xl text-gold-metal">{i + 1}</span>
                  <div>
                    <h3 className="font-serif text-2xl text-white">{t}</h3>
                    <p className="mt-2 text-muted">{d}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <FinalCTA title="Faith that builds beyond walls." goldFrom={3} />
    </>
  )
}
