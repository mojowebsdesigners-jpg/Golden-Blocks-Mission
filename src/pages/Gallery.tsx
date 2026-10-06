import { Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Seo } from '@/components/common/Seo'
import { SceneCanvas } from '@/three/SceneCanvas'
import { GallerySphere } from '@/three/GallerySphere'
import { Lightbox } from '@/components/common/Lightbox'
import { ErrorState } from '@/components/common/PageLoader'
import { FinalCTA } from '@/sections/common/FinalCTA'
import { useAsync } from '@/hooks/useAsync'
import { getGallery } from '@/services/content'
import { GALLERY_CATEGORIES } from '@/data/site'
import { cn, thumbOf } from '@/lib/utils'

const xs = (u: string) => (u.startsWith('/images/gallery/') ? u.replace(/(-sm)?\.webp$/, '-xs.webp') : u)

export default function Gallery() {
  const { data, loading, error, reload } = useAsync(getGallery, [])
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState<number | null>(null)
  const all = useMemo(() => data ?? [], [data])
  const items = useMemo(() => (filter === 'all' ? all : all.filter((g) => g.category === filter)), [all, filter])
  const counts = useMemo(() => Object.fromEntries(GALLERY_CATEGORIES.map((c) => [c.value, c.value === 'all' ? all.length : all.filter((g) => g.category === c.value).length])), [all])

  const sphereItems = useMemo(
    () => all.slice(0, 34).map((g) => ({ id: g.id, src: xs(g.thumb_url ?? g.image_url), aspect: g.width && g.height ? g.width / g.height : 1.4 })),
    [all],
  )
  const lightboxItems = useMemo(
    () =>
      items.map((g) => ({
        src: g.image_url,
        alt: g.title,
        title: g.title,
        caption: g.description,
        meta: GALLERY_CATEGORIES.find((c) => c.value === g.category)?.label,
        credit: { author: g.credit_author, license: g.credit_license, source: g.credit_source },
      })),
    [items],
  )

  const openById = (id: string) => {
    setFilter('all')
    const idx = all.findIndex((g) => g.id === id)
    if (idx >= 0) setOpen(idx)
  }

  return (
    <>
      <Seo title="Gallery" path="/gallery" description="Architecture, interiors, construction, renovation, community and outreach — images that tell the story of building for His glory." />

      {/* Ethan Vale-inspired sphere hero */}
      <section className="theme-dark relative h-[100svh] min-h-[620px] overflow-hidden bg-ink" aria-label="Interactive gallery sphere">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#45413a_0%,#26282c_65%)]" aria-hidden />
        {sphereItems.length > 0 && (
          <SceneCanvas
            className="touch-pan-y"
            camera={{ position: [0, 0, 11], fov: 42 }}
            fallback={
              <div className="absolute inset-0 grid grid-cols-3 gap-2 p-2 opacity-40 md:grid-cols-6">
                {sphereItems.slice(0, 18).map((s) => <img key={s.id} src={s.src} alt="" className="h-full w-full object-cover" />)}
              </div>
            }
          >
            <Suspense fallback={null}>
              <GallerySphere items={sphereItems} onOpen={openById} />
            </Suspense>
          </SceneCanvas>
        )}
        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.p className="eyebrow mb-5 text-champagne" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Gallery
          </motion.p>
          <motion.h1
            className="display-xl max-w-[12ch] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Building for <span className="text-gold-metal italic">His glory.</span>
          </motion.h1>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="container-x flex items-end justify-between pb-8">
            <p className="hidden max-w-xs text-sm leading-relaxed text-silver-light/75 md:block">
              Drag the sphere, or select an image.
            </p>
            <p className="eyebrow flex items-center gap-3 text-silver/70"><span className="h-px w-10 bg-silver/60" /> Drag to rotate</p>
          </div>
        </div>
      </section>

      <section className="bg-night pb-28 pt-16 md:pb-40" aria-label="Image archive">
        <div className="container-x">
          <div className="sticky top-[72px] z-20 -mx-4 mb-10 border-b border-white/10 bg-night/95 px-4 py-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
            <div role="tablist" aria-label="Filter gallery by category" className="no-scrollbar flex gap-2 overflow-x-auto">
              {GALLERY_CATEGORIES.filter((c) => c.value === 'all' || counts[c.value]).map((c) => (
                <button
                  key={c.value}
                  role="tab"
                  aria-selected={filter === c.value}
                  onClick={() => setFilter(c.value)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 border px-4 py-2.5 font-mono text-[0.64rem] uppercase tracking-[0.2em] transition-all duration-300',
                    filter === c.value ? 'border-gold bg-gold text-black' : 'border-white/15 text-silver-light/80 hover:border-white/40 hover:text-white',
                  )}
                >
                  {c.label} <span className="opacity-60">{counts[c.value]}</span>
                </button>
              ))}
            </div>
          </div>

          {loading && <div className="h-[60vh] animate-pulse bg-white/[0.03]" />}
          {error && <ErrorState message="The gallery could not be loaded right now." onRetry={reload} />}

          <motion.div layout className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            <AnimatePresence mode="popLayout">
              {items.map((g, i) => (
                <motion.figure
                  layout
                  key={g.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -5% 0px' }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (i % 4) * 0.05 }}
                  className="mb-4 break-inside-avoid"
                >
                  <button type="button" onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden bg-card text-left" aria-label={`View image: ${g.title}`}>
                    <img
                      src={thumbOf(g.thumb_url ?? g.image_url)}
                      alt={g.title}
                      loading="lazy"
                      decoding="async"
                      width={g.width ?? undefined}
                      height={g.height ?? undefined}
                      style={g.width && g.height ? { aspectRatio: `${g.width} / ${g.height}` } : undefined}
                      className="h-auto w-full transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <figcaption className="theme-dark absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="eyebrow text-[0.58rem] text-champagne">{GALLERY_CATEGORIES.find((c) => c.value === g.category)?.label}</span>
                      <span className="mt-1 block font-serif text-lg leading-snug text-white">{g.title}</span>
                    </figcaption>
                  </button>
                </motion.figure>
              ))}
            </AnimatePresence>
          </motion.div>
          <p className="mt-10 text-xs text-muted">
            Photographs are used under their respective open licences; credits appear in each image viewer and on the <Link to="/credits" className="underline underline-offset-2 hover:text-white">image credits</Link> page.
          </p>
        </div>
        <Lightbox items={lightboxItems} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
      </section>
      <FinalCTA title="Help us add the next sanctuary to this gallery." goldFrom={5} />
    </>
  )
}
