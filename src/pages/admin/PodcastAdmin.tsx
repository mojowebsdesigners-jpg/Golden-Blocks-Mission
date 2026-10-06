import { useState, type FormEvent } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { podcastAdmin } from '@/services/admin'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { mediaKind } from '@/lib/media'
import { cn, errorMessage, thumbOf } from '@/lib/utils'
import type { PodcastEpisode } from '@/types'
import { Badge, ConfirmDelete, EmptyState, ImageUpload, PageHeader, Panel, SmallButton, useToast } from './ui'

const KIND_LABEL = { youtube: 'YouTube', spotify: 'Spotify', soundcloud: 'SoundCloud', apple: 'Apple Podcasts', audio: 'Audio file', link: 'Link' } as const

export default function PodcastAdmin() {
  const { data, loading, error, reload } = useAsync(podcastAdmin.list, [])
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const patch = async (ep: PodcastEpisode, p: Partial<PodcastEpisode>) => {
    try {
      await podcastAdmin.save(p, ep.id)
      reload()
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const title = String(f.get('title') ?? '').trim()
    const media_url = String(f.get('media_url') ?? '').trim()
    if (!/^https:\/\//.test(media_url)) return toast('The link must start with https://', 'error')
    setBusy(true)
    try {
      await podcastAdmin.save({ title, media_url, published: false, published_on: new Date().toISOString().slice(0, 10) })
      toast('Episode added as a draft — add details, then publish')
      form.reset()
      reload()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader
        title="Podcast"
        description="Paste a link to an episode on YouTube, Spotify, SoundCloud or Apple Podcasts, or a direct link to an audio file (.mp3/.m4a). It plays on the Podcast page. New episodes start as drafts."
      />
      <Panel title="Add an episode" className="mb-8">
        <form onSubmit={add} className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
          <input name="title" required minLength={2} maxLength={200} placeholder="Episode title" aria-label="Episode title" className="field !py-2 text-sm" />
          <input name="media_url" required type="url" placeholder="https://www.youtube.com/watch?v=… or https://open.spotify.com/episode/…" aria-label="Episode link" className="field !py-2 text-sm" />
          <SmallButton type="submit" tone="gold" loading={busy}>Add episode</SmallButton>
        </form>
      </Panel>

      {!data?.length ? (
        <EmptyState>No episodes yet. Add the first one above.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {data.map((ep) => (
            <li key={ep.id} className="grid gap-4 border border-white/10 bg-coal p-4 md:grid-cols-[160px_1fr]">
              <div>
                {ep.cover_image ? (
                  <img src={thumbOf(ep.cover_image)} alt="" className={cn('aspect-square w-full object-cover', !ep.published && 'opacity-40')} />
                ) : (
                  <div className="grid aspect-square w-full place-items-center border border-dashed border-white/15 text-xs text-muted">No cover</div>
                )}
                <div className="mt-2">
                  <ImageUpload folder="podcast" label="Cover image" onUploaded={async (r) => { await patch(ep, { cover_image: r.url }); toast('Cover updated') }} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {ep.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
                  <Badge tone="silver">{KIND_LABEL[mediaKind(ep.media_url).kind]}</Badge>
                </div>
                <input defaultValue={ep.title} aria-label="Title" className="field !py-2 text-sm" onBlur={(e) => e.target.value.trim() && e.target.value !== ep.title && patch(ep, { title: e.target.value.trim() })} />
                <input defaultValue={ep.media_url} aria-label="Episode link" className="field !py-2 text-sm" onBlur={(e) => {
                  const v = e.target.value.trim()
                  if (v === ep.media_url) return
                  if (!/^https:\/\//.test(v)) return toast('The link must start with https://', 'error')
                  patch(ep, { media_url: v })
                }} />
                <textarea defaultValue={ep.description ?? ''} rows={3} placeholder="Description (optional)" aria-label="Description" className="field !py-2 text-sm" onBlur={(e) => e.target.value !== (ep.description ?? '') && patch(ep, { description: e.target.value || null })} />
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="text-xs text-muted">Episode no.
                    <input type="number" min={1} defaultValue={ep.episode_number ?? ''} className="field mt-1 !py-2 text-sm" onBlur={(e) => patch(ep, { episode_number: e.target.value ? Number(e.target.value) : null })} />
                  </label>
                  <label className="text-xs text-muted">Length (minutes)
                    <input type="number" min={1} max={1000} defaultValue={ep.duration_minutes ?? ''} className="field mt-1 !py-2 text-sm" onBlur={(e) => patch(ep, { duration_minutes: e.target.value ? Number(e.target.value) : null })} />
                  </label>
                  <label className="text-xs text-muted">Release date
                    <input type="date" defaultValue={ep.published_on ?? ''} className="field mt-1 !py-2 text-sm" onChange={(e) => patch(ep, { published_on: e.target.value || null })} />
                  </label>
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <SmallButton tone={ep.published ? 'default' : 'gold'} onClick={() => patch(ep, { published: !ep.published })}>{ep.published ? 'Unpublish' : 'Publish'}</SmallButton>
                  <a href={ep.media_url} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 text-xs text-silver underline-offset-4 hover:underline">Open link</a>
                  <ConfirmDelete onConfirm={async () => { await podcastAdmin.remove(ep); toast('Episode deleted'); reload() }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
