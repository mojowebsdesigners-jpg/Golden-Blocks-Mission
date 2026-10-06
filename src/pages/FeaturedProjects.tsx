import { Link } from 'react-router-dom'
import { Check, MapPin } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/sections/common/PageHero'
import { FinalCTA } from '@/sections/common/FinalCTA'
import { ImageReveal, Reveal } from '@/animations/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { CategoryLabel, DemoBadge, StatusChip } from '@/components/common/ProjectBits'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { useAsync } from '@/hooks/useAsync'
import { getFeaturedProjects } from '@/services/content'
import { cn } from '@/lib/utils'

/** Projects the team is prioritising right now (projects marked "featured" in Admin → Projects). */
export default function FeaturedProjects() {
  const { data, loading, error, reload } = useAsync(() => getFeaturedProjects(24), [])

  return (
    <>
      <Seo title="Projects in Focus" path="/featured-projects" description="The church construction, renovation and community projects Golden Blocks Mission is prioritising right now." />
      <PageHero
        eyebrow="Projects in Focus"
        title="Where your gift builds right now."
        goldFrom={4}
        image="/images/gallery/construction-laying-blocks.webp"
        compact
        lede="The projects we are prioritising now."
      />

      <section className="bg-night py-24 md:py-32" aria-label="Featured projects">
        <div className="container-x">
          {loading ? (
            <PageLoader />
          ) : error ? (
            <ErrorState message="We could not load the featured projects." onRetry={reload} />
          ) : !data?.length ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <p className="font-serif text-2xl text-white">Our projects in focus will be published here soon.</p>
              
              <ButtonLink to="/projects" className="mt-8">All projects</ButtonLink>
            </div>
          ) : (
            <ol className="space-y-24 md:space-y-36">
              {data.map((p, i) => (
                <li key={p.id} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                  <div className={cn('relative lg:col-span-7', i % 2 === 1 && 'lg:order-2')}>
                    <Link to={`/projects/${p.slug}`} aria-label={`View project: ${p.title}`} className="group block">
                      <ImageReveal src={p.cover_image ?? '/images/gallery/construction-rising-frame.webp'} alt={p.title} className="aspect-[4/3] w-full" />
                    </Link>
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <StatusChip status={p.status} />
                      {p.is_demo && <DemoBadge />}
                    </div>
                    <span aria-hidden className="absolute -bottom-6 right-6 grid h-14 w-14 place-items-center bg-gold-bright font-mono text-sm text-[#2b2e33] shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <Reveal className="lg:col-span-5">
                    <CategoryLabel category={p.category} />
                    <h2 className="display-md mt-3 text-white">{p.title}</h2>
                    {p.location && (
                      <p className="mt-4 flex items-center gap-2 text-sm text-muted"><MapPin className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden /> {p.location}</p>
                    )}
                    {p.summary && <p className="lede mt-6">{p.summary}</p>}
                    {p.objectives.length > 0 && (
                      <ul className="mt-8 space-y-3 border-t border-white/10 pt-6">
                        {p.objectives.slice(0, 4).map((o) => (
                          <li key={o} className="flex gap-3 text-[0.95rem] text-silver-light">
                            <Check className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={2} aria-hidden /> {o}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-10 flex flex-wrap gap-3">
                      <ButtonLink to={`/donate?project=${p.id}`}>Support this project</ButtonLink>
                      <ButtonLink to={`/projects/${p.slug}`} variant="dark">View progress</ButtonLink>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <FinalCTA />
    </>
  )
}
