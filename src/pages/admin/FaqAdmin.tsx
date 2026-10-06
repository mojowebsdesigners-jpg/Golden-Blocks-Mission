import { useState, type FormEvent } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { faqAdmin } from '@/services/admin'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { errorMessage } from '@/lib/utils'
import type { Faq } from '@/types'
import { Badge, ConfirmDelete, EmptyState, PageHeader, Panel, SmallButton, useToast } from './ui'

export default function FaqAdmin() {
  const { data, loading, error, reload } = useAsync(faqAdmin.list, [])
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const categories = [...new Set((data ?? []).map((f) => f.category))]

  const patch = async (f: Faq, p: Partial<Faq>) => {
    try {
      await faqAdmin.save(p, f.id)
      reload()
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    setBusy(true)
    try {
      await faqAdmin.save({
        category: String(f.get('category') || 'General').trim(),
        question: String(f.get('question')).trim(),
        answer: String(f.get('answer')).trim(),
        display_order: (data?.length ?? 0) + 1,
        published: true,
      })
      toast('Question added')
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
      <PageHeader title="FAQs" description="Questions appear on the FAQs page grouped by category, in display order. Hide a question to take it off the site without deleting it." />
      <Panel title="Add a question" className="mb-8">
        <form onSubmit={add} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <input name="category" list="faq-categories" placeholder="Category, e.g. Giving" aria-label="Category" maxLength={60} className="field !py-2 text-sm" />
            <datalist id="faq-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            <input name="question" required minLength={5} maxLength={300} placeholder="Question" aria-label="Question" className="field !py-2 text-sm" />
          </div>
          <textarea name="answer" required minLength={2} maxLength={4000} rows={3} placeholder="Answer" aria-label="Answer" className="field !py-2 text-sm" />
          <div><SmallButton type="submit" tone="gold" loading={busy}>Add question</SmallButton></div>
        </form>
      </Panel>

      {!data?.length ? (
        <EmptyState>No questions yet.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {data.map((f) => (
            <li key={f.id} className="grid gap-2 border border-white/10 bg-coal p-4">
              <div className="flex flex-wrap items-center gap-2">
                {!f.published && <Badge>Hidden</Badge>}
                <input defaultValue={f.category} list="faq-categories" aria-label="Category" className="field !w-48 !py-1.5 text-xs" onBlur={(e) => e.target.value.trim() && e.target.value !== f.category && patch(f, { category: e.target.value.trim() })} />
                <label className="flex items-center gap-2 text-xs text-muted">Order
                  <input type="number" defaultValue={f.display_order} className="field !w-20 !py-1.5 text-xs" onBlur={(e) => Number(e.target.value) !== f.display_order && patch(f, { display_order: Number(e.target.value) })} />
                </label>
              </div>
              <input defaultValue={f.question} aria-label="Question" className="field !py-2 text-sm font-medium" onBlur={(e) => e.target.value.trim() && e.target.value !== f.question && patch(f, { question: e.target.value.trim() })} />
              <textarea defaultValue={f.answer} rows={3} aria-label="Answer" className="field !py-2 text-sm" onBlur={(e) => e.target.value.trim() && e.target.value !== f.answer && patch(f, { answer: e.target.value.trim() })} />
              <div className="flex flex-wrap gap-2">
                <SmallButton onClick={() => patch(f, { published: !f.published })}>{f.published ? 'Hide' : 'Show on site'}</SmallButton>
                <ConfirmDelete onConfirm={async () => { await faqAdmin.remove(f); toast('Question deleted'); reload() }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
