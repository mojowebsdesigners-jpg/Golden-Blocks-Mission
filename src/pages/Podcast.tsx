import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Headphones, Play } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/sections/common/PageHero'
import { Reveal } from '@/animations/Reveal'
import { DemoBadge } from '@/components/common/ProjectBits'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { useAsync } from '@/hooks/useAsync'
import { getPodcastEpisodes } from '@/services/content'
import { mediaKind } from '@/lib/media'
import { cn, thumbOf } from '@/lib/utils'
import type { PodcastEpisode } from '@/types'

const FRAME_HEIGHT = { spotify: 232, soundcloud: 166, apple: 175 } as const

/**
 * Plays an episode in place. Nothing third-party loads until the visitor presses play
 * (faster page, and no YouTube/Spotify cookies before consent-by-click).
 */
function EpisodePlayer({ ep, large = false }: { ep: PodcastEpisode; large?: boolean }) {
  const [on, setOn] = useState(false)
  const media = ep.media_url ? mediaKind(ep.media_url) : null
  const cover = ep.cover_image ? thumbOf(ep.cover_image) : null

  if (!media) {
    return (
      <div className="theme-dark relative grid aspect-video place-items-center overflow-hidden bg-[#2f3237] p-6 text-center">
        {cover && <img src={cover} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-45" />}
        <p className="relative max-w-xs border border-dashed border-white/40 bg-black/50 px-4 py-3 text-sm text-silver-light">
          Demonstration — the episode player appears here once a real episode is added.
        </p>
      </div>
    )
  }
  if (media.kind === 'link') {
    return (
      <a href={ep.media_url} target="_blank" rel="noreferrer" className="btn-dark w-full justify-between">
        <span>Listen to this episode</span> <ExternalLink className="h-4 w-4" aria-hidden />
      </a>
    )
  }
  if (!on) {
    return (
      <button
        type="button"
        onClick={() => setOn(true)}
        aria-label={`Play: ${ep.title}`}
        className={cn('group relative block w-full overflow-hidden bg-[#2f3237]', media.kind === 'youtube' || large ? 'aspect-video' : 'aspect-[16/7]')}
      >
        {cover && <img src={cover} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />}
        <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-bright text-[#2b2e33] shadow-[0_12px_40px_-10px_rgb(0_0_0/0.6)] transition-transform duration-500 group-hover:scale-110">
            <Play className="ml-1 h-6 w-6" fill="currentColor" aria-hidden />
          </span>
        </span>
      </button>
    )
  }
  if (media.kind === 'audio') {
    return <audio controls autoPlay src={ep.media_url} className="w-full" aria-label={ep.title} />
  }
  const height = media.kind === 'youtube' ? undefined : FRAME_HEIGHT[media.kind]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn('w-full overflow-hidden bg-[#2f3237]', media.kind === 'youtube' && 'aspect-video')}>
      <iframe
        src={media.kind === 'youtube' ? `${media.embed}&autoplay=1` : media.embed}
        title={ep.title}
        className="h-full w-full"
        style={height ? { height } : undefined}
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
        allowFullScreen
      />
    </motion.div>
  )
}

function Meta({ ep }: { ep: PodcastEpisode }) {
  const bits = [
    ep.episode_number ? `Episode ${ep.episode_number}` : null,
    ep.published_on ? new Date(ep.published_on).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
    ep.duration_minutes ? `${ep.duration_minutes} min` : null,
  ].filter(Boolean)
  return bits.length ? <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-champagne">{bits.join(' · ')}</p> : null
}

export default function Podcast() {
  const { data, loading, error, reload } = useAsync(getPodcastEpisodes, [])
  const [latest, ...rest] = data ?? []

  return (
    <>
      <Seo title="Podcast" path="/podcast" description="The Golden Blocks Mission podcast — conversations on building, faith, mission and the communities we serve." />
      <PageHero
        eyebrow="Podcast"
        title="Stories of faith, built block by block."
        goldFrom={3}
        image="/images/gallery/interiors-light-rays.webp"
        compact
        lede="Conversations on building, faith and mission."
      />

      <section className="bg-night py-24 md:py-32" aria-label="Episodes">
        <div className="container-x">
          {loading ? (
            <PageLoader />
          ) : error ? (
            <ErrorState message="We could not load the podcast episodes." onRetry={reload} />
          ) : !latest ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <Headphones className="mx-auto h-10 w-10 text-gold" strokeWidth={1.2} aria-hidden />
              <p className="mt-6 font-serif text-2xl text-white">Our first episodes are on the way.</p>
              <p className="mt-3 text-muted">Check back soon.</p>
            </div>
          ) : (
            <>
              <article className="grid gap-10 lg:grid-cols-12 lg:items-center" aria-labelledby="latest-title">
                <div className="lg:col-span-7">
                  <EpisodePlayer ep={latest} large />
                </div>
                <Reveal className="lg:col-span-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="chip">Latest episode</span>
                    {latest.is_demo && <DemoBadge />}
                  </div>
                  <h2 id="latest-title" className="display-sm mt-6 text-white">{latest.title}</h2>
                  <div className="mt-4"><Meta ep={latest} /></div>
                  {latest.description && <p className="lede mt-6 whitespace-pre-line">{latest.description}</p>}
                </Reveal>
              </article>

              {rest.length > 0 && (
                <>
                  <div className="mb-12 mt-24 flex items-center gap-4">
                    <span className="chip">All episodes</span>
                    <span className="rule flex-1" />
                  </div>
                  <ul className="grid gap-x-10 gap-y-16 md:grid-cols-2">
                    {rest.map((ep, i) => (
                      <Reveal as="li" key={ep.id} delay={(i % 2) * 0.08} className="flex flex-col gap-5">
                        <EpisodePlayer ep={ep} />
                        <div>
                          <div className="flex flex-wrap items-center gap-3"><Meta ep={ep} />{ep.is_demo && <DemoBadge />}</div>
                          <h3 className="mt-3 font-serif text-[1.5rem] leading-snug text-white">{ep.title}</h3>
                          {ep.description && <p className="mt-3 line-clamp-4 text-[0.98rem] leading-relaxed text-muted">{ep.description}</p>}
                        </div>
                      </Reveal>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
