import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/sections/common/PageHero'
import { FinalCTA } from '@/sections/common/FinalCTA'
import { useAsync } from '@/hooks/useAsync'
import { getProjects } from '@/services/content'
import { PROJECT_FILTERS } from '@/data/site'
import { CategoryLabel, DemoBadge, StatusChip } from '@/components/common/ProjectBits'
import { ErrorState } from '@/components/common/PageLoader'
import { cn, thumbOf } from '@/lib/utils'
import type { Project } from '@/types'

function matches(p: Project, f: string) {
  if (f === 'all') return true
  if (['construction', 'renovation', 'community'].includes(f)) return p.category === f
  return p.status === f
}

export default function Projects() {
  const { data, loading, error, reload } = useAsync(getProjects, [])
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState(params.get('filter') ?? 'all')
  const projects = useMemo(() => (data ?? []).filter((p) => matches(p, filter)), [data, filter])
  const anyDemo = (data ?? []).some((p) => p.is_demo)

  const choose = (f: string) => {
    setFilter(f)
    setParams(f === 'all' ? {} : { filter: f }, { replace: true, preventScrollReset: true })
  }

  return (
    <>
      <Seo title="Projects" path="/projects" description="Church construction, renovation and community projects supported by Golden Blocks Mission — ongoing, completed and planned." />
      <PageHero
        eyebrow="Projects"
        title="Every block builds a legacy."
        goldFrom={3}
        image="/images/gallery/construction-rising-frame.webp"
        compact
        lede="Accomplished, underway and planned — see the work you support."
      />

      <section className="bg-night pb-28 pt-12 md:pb-40" aria-label="Project portfolio">
        <div className="container-x">
          <div className="sticky top-[72px] z-20 -mx-4 border-b border-white/10 bg-night/95 px-4 py-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
            <div role="tablist" aria-label="Filter projects" className="no-scrollbar flex gap-2 overflow-x-auto">
              {PROJECT_FILTERS.map((f) => (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={filter === f.value}
                  onClick={() => choose(f.value)}
                  className={cn(
                    'shrink-0 border px-4 py-2.5 font-mono text-[0.64rem] uppercase tracking-[0.2em] transition-all duration-300',
                    filter === f.value ? 'border-gold bg-gold text-black' : 'border-white/15 text-silver-light/80 hover:border-white/40 hover:text-white',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {anyDemo && (
            <p className="mt-8 border border-dashed border-champagne/40 px-4 py-3 text-sm text-champagne/90">
              Demonstration projects — replaced when real projects are published.
            </p>
          )}

          {loading && (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-[4/3] animate-pulse bg-white/[0.03]" />)}
            </div>
          )}
          {error && <div className="mt-12"><ErrorState message="Projects could not be loaded right now." onRetry={reload} /></div>}

          {!loading && !error && (
            <motion.div layout className="mt-12 grid gap-x-6 gap-y-16 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {projects.map((p, i) => (
                  <motion.article
                    layout
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (i % 2) * 0.06 }}
                    className={cn(i % 4 === 1 && 'md:mt-24', i % 4 === 3 && 'md:-mt-0')}
                  >
                    <Link to={`/projects/${p.slug}`} className="group block" aria-label={`View project: ${p.title}`}>
                      <div className="relative overflow-hidden">
                        <img
                          src={thumbOf(p.cover_image)}
                          alt={p.title}
                          loading="lazy"
                          className={cn('w-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]', i % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <StatusChip status={p.status} />
                          {p.is_demo && <DemoBadge />}
                        </div>
                        <span className="absolute bottom-4 right-4 grid h-11 w-11 translate-y-3 place-items-center bg-gold text-black opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="mt-6 flex items-start justify-between gap-6">
                        <div>
                          <CategoryLabel category={p.category} />
                          <h2 className="mt-2 font-serif text-[1.85rem] leading-tight text-white transition-colors group-hover:text-gold-bright">{p.title}</h2>
                          {p.location && <p className="mt-2 flex items-center gap-2 text-sm text-muted"><MapPin className="h-3.5 w-3.5 text-gold" />{p.location}</p>}
                        </div>
                        <span className="font-mono text-[0.65rem] tracking-[0.2em] text-silver/50">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="mt-16 border border-white/10 p-12 text-center">
              <p className="font-serif text-2xl text-white">{(data ?? []).length ? 'No projects match this filter yet.' : 'Projects will be published here soon.'}</p>
              {filter !== 'all' && (
                <button onClick={() => choose('all')} className="eyebrow mt-6 text-gold-bright underline-offset-4 hover:underline">Show all projects</button>
              )}
            </div>
          )}
        </div>
      </section>
      <FinalCTA title="Help raise the next sanctuary." goldFrom={3} />
    </>
  )
}
