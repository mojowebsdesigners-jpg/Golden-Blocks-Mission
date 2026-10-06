import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'
import { ShareButton } from '@/components/common/ShareButton'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/sections/common/PageHero'
import { FinalCTA } from '@/sections/common/FinalCTA'
import { useAsync } from '@/hooks/useAsync'
import { getProjectBySlug } from '@/services/content'
import { CATEGORY_LABEL } from '@/data/site'
import { DemoBadge, StatusChip } from '@/components/common/ProjectBits'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { Lightbox } from '@/components/common/Lightbox'
import { Reveal } from '@/animations/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { formatDate, thumbOf } from '@/lib/utils'

export default function ProjectDetail() {
  const { slug = '' } = useParams()
  const { data, loading, error, reload } = useAsync(() => getProjectBySlug(slug), [slug])
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (loading) return <PageLoader label="Loading project" />
  if (error)
    return (
      <div className="container-x py-40">
        <ErrorState message="This project could not be loaded right now." onRetry={reload} />
      </div>
    )
  if (!data)
    return (
      <div className="container-x grid min-h-[70vh] place-items-center py-40 text-center">
        <Seo title="Project not found" path={`/projects/${slug}`} noindex />
        <div>
          <p className="eyebrow text-champagne">404</p>
          <h1 className="display-md mt-4">This project could not be found.</h1>
          <ButtonLink to="/projects" variant="dark" className="mt-8">All projects</ButtonLink>
        </div>
      </div>
    )

  const { project: p, images, updates } = data
  const gallery = images.map((im) => ({ src: im.image_url, alt: im.caption ?? p.title, title: p.title, caption: im.caption }))
  const facts = [
    { k: 'Category', v: CATEGORY_LABEL[p.category] },
    { k: 'Status', v: <StatusChip status={p.status} /> },
    { k: 'Location', v: p.location },
    { k: 'Start date', v: formatDate(p.start_date) },
    { k: 'Completion', v: formatDate(p.completion_date) ?? (p.status === 'completed' ? null : 'In progress') },
  ].filter((f) => f.v)

  return (
    <>
      <Seo title={p.title} path={`/projects/${p.slug}`} description={p.summary ?? p.description.slice(0, 155)} image={p.cover_image ?? undefined} noindex={p.is_demo} />
      <PageHero
        eyebrow={CATEGORY_LABEL[p.category] ?? 'Project'}
        title={p.title}
        image={p.cover_image ?? '/images/gallery/architecture-modernist-sanctuary.webp'}
        compact
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <StatusChip status={p.status} />
          {p.is_demo && <DemoBadge />}
          {p.location && <span className="flex items-center gap-2 text-sm text-silver-light/85"><MapPin className="h-4 w-4 text-gold" /> {p.location}</span>}
        </div>
      </PageHero>

      <section className="bg-night py-20 md:py-32">
        <div className="container-x">
          <Link to="/projects" className="eyebrow inline-flex items-center gap-3 text-silver hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> All projects
          </Link>
          {p.is_demo && (
            <p className="mt-8 border border-dashed border-champagne/40 px-4 py-3 text-sm text-champagne/90">
              Demonstration content — not a real project.
            </p>
          )}
          <div className="mt-12 grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="display-sm">About this project</h2>
              <div className="mt-6 space-y-5 whitespace-pre-line text-[1.05rem] leading-relaxed text-silver-light/85">{p.description}</div>

              {p.objectives?.length > 0 && (
                <div className="mt-14">
                  <h3 className="eyebrow mb-6 text-champagne">Project objectives</h3>
                  <ol className="border-t border-white/10">
                    {p.objectives.map((o, i) => (
                      <li key={i} className="grid grid-cols-[3rem_1fr] border-b border-white/10 py-5">
                        <span className="font-mono text-[0.65rem] tracking-[0.2em] text-gold">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-silver-light">{o}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="border border-white/10 bg-coal p-7 lg:sticky lg:top-28">
                <p className="eyebrow mb-6 text-champagne">Project details</p>
                <dl className="divide-y divide-white/10">
                  {facts.map((f) => (
                    <div key={f.k} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                      <dt className="text-muted">{f.k}</dt>
                      <dd className="text-right text-white">{f.v}</dd>
                    </div>
                  ))}
                </dl>
                <ButtonLink to={`/donate?project=${p.id}`} className="mt-8 w-full justify-between">Support this project</ButtonLink>
                <ButtonLink to="/get-involved" variant="dark" className="mt-3 w-full justify-between">Partner with us</ButtonLink>
                <ShareButton title={p.title} text={p.summary ?? undefined} label="Share this project" className="mt-3 w-full justify-between" />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-coal py-20 md:py-28" aria-labelledby="project-gallery">
          <div className="container-x">
            <h2 id="project-gallery" className="display-sm mb-10">Project gallery</h2>
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
              {gallery.map((g, i) => (
                <button key={g.src + i} onClick={() => setLightbox(i)} className="group block w-full overflow-hidden" aria-label={`Open image ${i + 1}`}>
                  <img src={thumbOf(g.src)} alt={g.alt} loading="lazy" className="w-full transition-transform duration-[1.2s] group-hover:scale-105" />
                </button>
              ))}
            </div>
          </div>
          <Lightbox items={gallery} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />
        </section>
      )}

      <section className="bg-night py-20 md:py-28" aria-labelledby="project-updates">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="project-updates" className="display-sm">Project updates</h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {updates.length === 0 ? (
              <p className="border border-white/10 p-8 text-muted">No updates yet.</p>
            ) : (
              <ol className="relative border-l border-white/15 pl-8">
                {updates.map((u) => (
                  <Reveal as="li" key={u.id} className="relative pb-12 last:pb-0">
                    <span className="absolute -left-[37px] top-1.5 h-2.5 w-2.5 rotate-45 bg-gold" aria-hidden />
                    <p className="eyebrow flex items-center gap-2 text-[0.6rem] text-champagne/80"><Calendar className="h-3 w-3" />{formatDate(u.created_at, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <h3 className="mt-2 font-serif text-2xl text-white">{u.title}</h3>
                    <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">{u.content}</p>
                    {u.images?.length > 0 && (
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        {u.images.map((src) => <img key={src} src={src} alt="" loading="lazy" className="aspect-square w-full object-cover" />)}
                      </div>
                    )}
                  </Reveal>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>
      <FinalCTA title="Every gift lays another block." goldFrom={3} primary={{ to: `/donate?project=${p.id}`, label: 'Give to this project' }} />
    </>
  )
}
