import { useMemo, useState } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { deleteGalleryItem, listGallery, saveGalleryItem } from '@/services/admin'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { GALLERY_CATEGORIES } from '@/data/site'
import { cn, errorMessage, thumbOf } from '@/lib/utils'
import type { GalleryCategory, GalleryItem } from '@/types'
import { Badge, ConfirmDelete, EmptyState, ImageUpload, PageHeader, SmallButton, useToast } from './ui'

const CATS = GALLERY_CATEGORIES.filter((c) => c.value !== 'all')

export default function GalleryAdmin() {
  const { data, loading, error, reload } = useAsync(listGallery, [])
  const toast = useToast()
  const [cat, setCat] = useState<GalleryCategory>('architecture')
  const [filter, setFilter] = useState<string>('all')
  const items = useMemo(() => (data ?? []).filter((g) => filter === 'all' || g.category === filter), [data, filter])

  const patch = async (g: GalleryItem, p: Partial<GalleryItem>) => {
    try {
      await saveGalleryItem(p, g.id)
      reload()
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  if (loading) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Upload high-resolution images (they are optimised to 2400px automatically). Titles become alt text, so describe what the image shows."
        actions={
          <div className="flex items-center gap-2">
            <select value={cat} onChange={(e) => setCat(e.target.value as GalleryCategory)} className="field !w-auto !py-2 text-sm" aria-label="Category for new uploads">
              {CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ImageUpload
              folder="gallery"
              multiple
              label="Upload images"
              onUploaded={async (r) => {
                await saveGalleryItem({ title: r.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '), image_url: r.url, thumb_url: null, category: cat, width: r.width, height: r.height, published: true, display_order: (data?.length ?? 0) + 1 })
                toast('Image added')
                reload()
              }}
            />
          </div>
        }
      />
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {GALLERY_CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setFilter(c.value)} className={cn('shrink-0 border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em]', filter === c.value ? 'border-gold bg-gold text-black' : 'border-white/15 text-silver')}>
            {c.label}
          </button>
        ))}
      </div>
      {!items.length ? (
        <EmptyState>No images in this category yet.</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((g) => (
            <li key={g.id} className="flex flex-col border border-white/10 bg-coal">
              <div className="relative">
                <img src={thumbOf(g.thumb_url ?? g.image_url)} alt={g.title} loading="lazy" className={cn('aspect-[4/3] w-full object-cover', !g.published && 'opacity-40')} />
                <div className="absolute left-2 top-2 flex gap-1">
                  {!g.published && <Badge>Hidden</Badge>}
                  {g.featured && <Badge tone="gold">Featured</Badge>}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <input defaultValue={g.title} aria-label="Title / alt text" className="field !py-2 text-sm" onBlur={(e) => e.target.value !== g.title && e.target.value.trim() && patch(g, { title: e.target.value.trim() })} />
                <textarea defaultValue={g.description ?? ''} placeholder="Description (optional)" aria-label="Description" rows={2} className="field !py-2 text-sm" onBlur={(e) => e.target.value !== (g.description ?? '') && patch(g, { description: e.target.value || null })} />
                <div className="flex gap-2">
                  <select defaultValue={g.category} aria-label="Category" className="field !py-2 text-sm" onChange={(e) => patch(g, { category: e.target.value as GalleryCategory })}>
                    {CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <input type="number" defaultValue={g.display_order} aria-label="Display order" className="field !w-20 !py-2 text-sm" onBlur={(e) => Number(e.target.value) !== g.display_order && patch(g, { display_order: Number(e.target.value) })} />
                </div>
                {g.credit_author && <p className="text-[0.7rem] text-muted">Credit: {g.credit_author} · {g.credit_license}</p>}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <SmallButton onClick={() => patch(g, { published: !g.published })}>{g.published ? 'Hide' : 'Publish'}</SmallButton>
                  <SmallButton onClick={() => patch(g, { featured: !g.featured })}>{g.featured ? 'Unfeature' : 'Feature'}</SmallButton>
                  <ConfirmDelete onConfirm={async () => { await deleteGalleryItem(g); toast('Image deleted'); reload() }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
