import { Seo } from '@/components/common/Seo'
import { ShareButton } from '@/components/common/ShareButton'
import { ButtonLink } from '@/components/ui/Button'
import { PageHero, SectionLabel } from '@/sections/common/PageHero'
import { FinalCTA } from '@/sections/common/FinalCTA'
import { Reveal } from '@/animations/Reveal'
import { ACKNOWLEDGMENT_GROUPS, SCRIPTURE, SITE } from '@/data/site'

export default function Acknowledgments() {
  return (
    <>
      <Seo
        title="Acknowledgments"
        path="/acknowledgments"
        description="A shoutout to the donors, churches, partners, volunteers and prayer partners who make the work of Golden Blocks Mission — North East Kenya Field possible."
      />
      <PageHero
        eyebrow="Acknowledgments"
        title="Thank you for building with us."
        goldFrom={3}
        image="/images/gallery/community-choir.webp"
        imagePosition="center 35%"
        compact
        lede="A shoutout to everyone who gives, serves and prays."
      />

      <section aria-labelledby="thanks-title" className="bg-night py-28 md:py-36">
        <div className="container-x">
          <SectionLabel index="01">Shoutouts</SectionLabel>
          <h2 id="thanks-title" className="display-lg max-w-[14ch]">
            Every contribution <span className="text-gold-metal italic">matters.</span>
          </h2>

          <ul className="mt-16 grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {ACKNOWLEDGMENT_GROUPS.map((g, i) => (
              <Reveal as="li" key={g.title} delay={(i % 3) * 0.06} className="border-b border-r border-white/10 p-7 md:p-9">
                <span className="font-mono text-[0.65rem] tracking-[0.24em] text-gold">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-8 font-serif text-[1.75rem] text-white">{g.title}</h3>
                <p className="mt-2 text-sm text-muted">{g.text}</p>
                {g.names.length > 0 ? (
                  <ul className="mt-6 space-y-1.5 text-silver-light">
                    {g.names.map((n) => <li key={n}>{n}</li>)}
                  </ul>
                ) : (
                  <p className="mt-6 text-sm italic text-muted/80">Names will appear here with permission.</p>
                )}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="shoutout-title" className="bg-coal py-24 md:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <figure className="border-l border-gold/60 pl-5">
              <blockquote className="font-serif text-2xl italic text-white md:text-[1.75rem]">“{SCRIPTURE.philippians.text}”</blockquote>
              <figcaption className="eyebrow mt-3 text-champagne/80">{SCRIPTURE.philippians.ref}</figcaption>
            </figure>
            <h2 id="shoutout-title" className="display-sm mt-14">Know someone who deserves a shoutout?</h2>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <ButtonLink to="/contact?subject=Shoutout">Send a shoutout</ButtonLink>
            <ShareButton title={SITE.name} text={`${SITE.name} — ${SITE.field}`} url={`${window.location.origin}/`} label="Share the mission" />
          </div>
        </div>
      </section>

      <FinalCTA title="Join the people we thank." goldFrom={2} />
    </>
  )
}
