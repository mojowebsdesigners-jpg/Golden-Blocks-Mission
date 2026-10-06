import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getFeaturedProjects } from '@/services/content'
import { ImageReveal, Reveal, SplitReveal } from '@/animations/Reveal'
import { CategoryLabel, DemoBadge, StatusChip } from '@/components/common/ProjectBits'
import { ErrorState } from '@/components/common/PageLoader'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function FeaturedProjectsSection() {
  const { data, loading, error, reload } = useAsync(() => getFeaturedProjects(3), [])
  const projects = data ?? []
  const anyDemo = projects.some((p) => p.is_demo)

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative bg-night py-28 md:py-40">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="chip mb-8">04 — Featured projects</span>
            <SplitReveal as="h2" text="Sanctuaries in the making." className="display-lg max-w-[12ch]" wordClassName={(_, i) => (i >= 2 ? 'text-gold-metal italic' : undefined)} />
          </div>
          <Reveal className="max-w-sm">
            <p className="text-muted">Churches being built and restored.</p>
            <Link to="/projects" className="eyebrow mt-5 inline-flex items-center gap-3 text-gold-bright hover:text-white">
              View all projects <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        {anyDemo && (
          <p className="mt-10 border border-dashed border-champagne/40 px-4 py-3 text-sm text-champagne/90">
            Demonstration projects — replaced when real projects are published.
          </p>
        )}

        <div className="mt-16 space-y-24 md:mt-24 md:space-y-36">
          {loading && <div className="h-[50vh] animate-pulse bg-white/[0.03]" />}
          {error && <ErrorState message="Projects could not be loaded right now." onRetry={reload} />}
          {!loading && !error && projects.length === 0 && (
            <div className="border border-white/10 p-10 text-center">
              <p className="font-serif text-2xl text-white">Our first projects will be published here soon.</p>
              
              <ButtonLink to="/get-involved" variant="dark" className="mt-8">Get involved</ButtonLink>
            </div>
          )}
          {projects.map((p, i) => (
            <article key={p.id} className="grid items-center gap-10 md:grid-cols-12">
              <Link
                to={`/projects/${p.slug}`}
                className={cn('group relative block md:col-span-7', i % 2 && 'md:order-2 md:col-start-6')}
                aria-label={`View project: ${p.title}`}
              >
                <ImageReveal
                  src={p.cover_image ?? '/images/gallery/architecture-modernist-sanctuary.webp'}
                  alt={p.title}
                  className="aspect-[16/11] w-full"
                  imgClassName="transition-transform duration-[1.6s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
                />
                <div className="absolute left-4 top-4 flex gap-2">
                  <StatusChip status={p.status} />
                  {p.is_demo && <DemoBadge />}
                </div>
              </Link>
              <Reveal className={cn('md:col-span-5', i % 2 ? 'md:order-1 md:col-span-4 md:col-start-1' : 'md:col-start-9 md:col-span-4')}>
                <p className="font-mono text-[0.65rem] tracking-[0.24em] text-silver/60">0{i + 1}</p>
                <div className="mt-4"><CategoryLabel category={p.category} /></div>
                <h3 className="display-sm mt-3 text-white">{p.title}</h3>
                {p.location && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-silver-light/80">
                    <MapPin className="h-3.5 w-3.5 text-gold" /> {p.location}
                  </p>
                )}
                <p className="mt-5 line-clamp-2 leading-relaxed text-muted">{p.summary ?? p.description.slice(0, 120)}</p>
                <Link to={`/projects/${p.slug}`} className="btn-dark mt-8">
                  <span>View project</span>
                  <span className="btn-arrow"><ArrowRight className="h-3 w-3" /></span>
                </Link>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
