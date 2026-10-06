import { useMemo, useState } from 'react'
import { Download, Mail, Phone } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { deleteEnquiry, listEnquiries, listMessages, setEnquiryStatus } from '@/services/admin'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { PARTNERSHIP_TYPES } from '@/data/site'
import { cn, errorMessage, formatDate } from '@/lib/utils'
import type { ContactMessage, EnquiryStatus, PartnershipEnquiry } from '@/types'
import { Badge, ConfirmDelete, EmptyState, PageHeader, SmallButton, downloadCsv, useToast } from './ui'
import { useAdmin } from './AdminApp'

type Item = (ContactMessage | PartnershipEnquiry) & { _name: string; _title: string }
const STATUSES: EnquiryStatus[] = ['new', 'in_progress', 'resolved', 'archived']
const TONE = { new: 'gold', in_progress: 'silver', resolved: 'green', archived: 'neutral' } as const

export default function InboxAdmin({ kind }: { kind: 'messages' | 'enquiries' }) {
  const table = kind === 'messages' ? 'contact_messages' : 'partnership_enquiries'
  const { isAdmin } = useAdmin()
  const toast = useToast()
  const [filter, setFilter] = useState<EnquiryStatus | 'open' | 'all'>('open')
  const [selected, setSelected] = useState<string | null>(null)
  const { data, loading, error, reload } = useAsync<Item[]>(async () => {
    if (kind === 'messages') return (await listMessages()).map((m) => ({ ...m, _name: m.full_name, _title: m.subject }))
    return (await listEnquiries()).map((e) => ({ ...e, _name: e.contact_person, _title: PARTNERSHIP_TYPES.find((t) => t.value === e.partnership_type)?.label ?? e.partnership_type }))
  }, [kind])

  const items = useMemo(() => (data ?? []).filter((i) => filter === 'all' || (filter === 'open' ? i.status === 'new' || i.status === 'in_progress' : i.status === filter)), [data, filter])
  const current = items.find((i) => i.id === selected) ?? items[0]

  const update = async (id: string, status: EnquiryStatus) => {
    try {
      await setEnquiryStatus(table, id, status)
      toast('Status updated')
      reload()
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  return (
    <>
      <PageHeader
        title={kind === 'messages' ? 'Contact messages' : 'Partnership enquiries'}
        description={kind === 'messages' ? 'Messages sent through the contact form.' : 'Enquiries from the Get Involved and Contact pages.'}
        actions={<SmallButton disabled={!data?.length} onClick={() => downloadCsv(`${table}.csv`, (data ?? []).map(({ _name, _title, ...r }) => r))}><Download className="h-3.5 w-3.5" /> Export CSV</SmallButton>}
      />
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {(['open', ...STATUSES, 'all'] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={cn('shrink-0 border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em]', filter === s ? 'border-gold bg-gold text-black' : 'border-white/15 text-silver')}>{s.replace('_', ' ')}</button>
        ))}
      </div>
      {loading ? <PageLoader /> : error ? <ErrorState message={error.message} onRetry={reload} /> : !items.length ? (
        <EmptyState>Nothing here right now.</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
          <ul className="max-h-[70vh] divide-y divide-white/10 overflow-y-auto border border-white/10" data-lenis-prevent>
            {items.map((i) => (
              <li key={i.id}>
                <button onClick={() => setSelected(i.id)} className={cn('w-full p-4 text-left transition-colors', current?.id === i.id ? 'bg-gold/[0.07]' : 'hover:bg-white/[0.03]')}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('truncate', i.status === 'new' ? 'text-white' : 'text-silver-light')}>{i._name}</span>
                    <Badge tone={TONE[i.status]}>{i.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-silver">{i._title}</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(i.created_at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </button>
              </li>
            ))}
          </ul>
          {current && (
            <article className="border border-white/10 bg-coal p-6">
              <p className="field-label">{formatDate(current.created_at, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <h2 className="mt-3 font-serif text-2xl text-white">{current._title}</h2>
              <p className="mt-1 text-silver-light">{current._name}{'organisation_name' in current && current.organisation_name ? ` · ${current.organisation_name}` : ''}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <a href={`mailto:${current.email}?subject=${encodeURIComponent('Re: ' + current._title)}`} className="flex items-center gap-2 text-gold-bright hover:underline"><Mail className="h-4 w-4" /> {current.email}</a>
                {current.phone && <a href={`tel:${current.phone}`} className="flex items-center gap-2 text-gold-bright hover:underline"><Phone className="h-4 w-4" /> {current.phone}</a>}
              </div>
              <p className="mt-6 whitespace-pre-wrap border-t border-white/10 pt-6 leading-relaxed text-silver-light">{current.message}</p>
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
                <span className="field-label mr-2">Status</span>
                {STATUSES.map((s) => (
                  <SmallButton key={s} tone={current.status === s ? 'gold' : 'default'} onClick={() => update(current.id, s)}>{s.replace('_', ' ')}</SmallButton>
                ))}
                {isAdmin && <span className="ml-auto"><ConfirmDelete onConfirm={async () => { await deleteEnquiry(table, current.id); setSelected(null); reload() }} /></span>}
              </div>
            </article>
          )}
        </div>
      )}
    </>
  )
}
