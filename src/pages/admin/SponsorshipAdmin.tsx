import { useState, type FormEvent } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { sponsorshipAdmin } from '@/services/admin'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { cn, errorMessage, thumbOf } from '@/lib/utils'
import type { SponsorshipProgram } from '@/types'
import { Badge, ConfirmDelete, EmptyState, ImageUpload, PageHeader, Panel, SmallButton, useToast } from './ui'

export default function SponsorshipAdmin() {
  const { data, loading, error, reload } = useAsync(sponsorshipAdmin.list, [])
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const patch = async (s: SponsorshipProgram, p: Partial<SponsorshipProgram>) => {
    try {
      await sponsorshipAdmin.save(p, s.id)
      reload()
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setBusy(true)
    try {
      await sponsorshipAdmin.save({ title: String(new FormData(form).get('title')).trim(), display_order: (data?.length ?? 0) + 1, published: false })
      toast('Programme added as a draft — fill in the details, then publish')
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
        title="Sponsorship programmes"
        description="Programmes listed on the Sponsorship page. Visitors who choose one send a sponsorship enquiry, which arrives under Partnerships."
      />
      <Panel title="Add a programme" className="mb-8">
        <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row">
          <input name="title" required minLength={2} maxLength={160} placeholder="Programme name, e.g. Sponsor a Roof" aria-label="Programme name" className="field !py-2 text-sm" />
          <SmallButton type="submit" tone="gold" loading={busy}>Add programme</SmallButton>
        </form>
      </Panel>

      {!data?.length ? (
        <EmptyState>No programmes yet.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {data.map((s) => (
            <li key={s.id} className="grid gap-4 border border-white/10 bg-coal p-4 md:grid-cols-[200px_1fr]">
              <div>
                {s.cover_image ? (
                  <img src={thumbOf(s.cover_image)} alt="" className={cn('aspect-[4/3] w-full object-cover', !s.published && 'opacity-40')} />
                ) : (
                  <div className="grid aspect-[4/3] w-full place-items-center border border-dashed border-white/15 text-xs text-muted">No image</div>
                )}
                <div className="mt-2"><ImageUpload folder="sponsorship" label="Image" onUploaded={async (r) => { await patch(s, { cover_image: r.url }); toast('Image updated') }} /></div>
              </div>
              <div className="flex flex-col gap-2">
                <div>{s.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}</div>
                <input defaultValue={s.title} aria-label="Programme name" className="field !py-2 text-sm" onBlur={(e) => e.target.value.trim() && e.target.value !== s.title && patch(s, { title: e.target.value.trim() })} />
                <input defaultValue={s.summary ?? ''} maxLength={400} placeholder="One-line summary shown on the card" aria-label="Summary" className="field !py-2 text-sm" onBlur={(e) => e.target.value !== (s.summary ?? '') && patch(s, { summary: e.target.value || null })} />
                <textarea defaultValue={s.description} rows={4} placeholder="What the sponsorship funds and how sponsors are kept informed" aria-label="Description" className="field !py-2 text-sm" onBlur={(e) => e.target.value !== s.description && patch(s, { description: e.target.value })} />
                <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
                  <input defaultValue={s.amount_label ?? ''} maxLength={80} placeholder="Amount, e.g. KES 2,000 / month" aria-label="Amount" className="field !py-2 text-sm" onBlur={(e) => e.target.value !== (s.amount_label ?? '') && patch(s, { amount_label: e.target.value || null })} />
                  <input type="number" defaultValue={s.display_order} aria-label="Display order" className="field !py-2 text-sm" onBlur={(e) => Number(e.target.value) !== s.display_order && patch(s, { display_order: Number(e.target.value) })} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <SmallButton tone={s.published ? 'default' : 'gold'} onClick={() => patch(s, { published: !s.published })}>{s.published ? 'Unpublish' : 'Publish'}</SmallButton>
                  <ConfirmDelete onConfirm={async () => { await sponsorshipAdmin.remove(s); toast('Programme deleted'); reload() }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
