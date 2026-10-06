import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { listDonations, setDonationStatus } from '@/services/admin'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { DONATION_DESIGNATIONS } from '@/data/site'
import { cn, errorMessage, formatDate, formatMoney } from '@/lib/utils'
import type { Donation, DonationStatus } from '@/types'
import { Badge, EmptyState, PageHeader, SmallButton, downloadCsv, useToast } from './ui'

const TONE: Record<DonationStatus, 'green' | 'gold' | 'red' | 'neutral' | 'silver'> = { completed: 'green', pending: 'gold', pledged: 'silver', failed: 'red', cancelled: 'neutral' }
const METHOD = { mpesa: 'M-Pesa', card: 'Card', bank_transfer: 'Bank' } as const

export default function DonationsAdmin() {
  const [status, setStatus] = useState<DonationStatus | 'all'>('all')
  const [q, setQ] = useState('')
  const { data, loading, error, reload } = useAsync(() => listDonations(status), [status])
  const toast = useToast()
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (data ?? []).filter((d) => !s || [d.donor_name, d.donor_email, d.donor_phone, d.payment_reference, d.provider_reference].some((v) => v?.toLowerCase().includes(s)))
  }, [data, q])

  const confirmBank = async (d: Donation) => {
    if (!window.confirm(`Confirm that ${formatMoney(d.amount, d.currency)} with reference ${d.payment_reference} has been received in the bank account?`)) return
    try {
      await setDonationStatus(d.id, 'completed')
      toast('Bank transfer marked as received')
      reload()
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Donations"
        description="M-Pesa and card donations are marked completed automatically once the provider verifies them. Bank transfers stay “pledged” until you confirm the funds have arrived."
        actions={
          <SmallButton onClick={() => downloadCsv(`donations-${new Date().toISOString().slice(0, 10)}.csv`, rows.map(({ id, created_at, donor_name, donor_email, donor_phone, amount, currency, frequency, designation, payment_method, payment_status, payment_reference, provider_reference, verified_at, anonymous }) => ({ id, created_at, donor_name, donor_email, donor_phone, amount, currency, frequency, designation, payment_method, payment_status, payment_reference, provider_reference, verified_at, anonymous })))} disabled={!rows.length}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </SmallButton>
        }
      />
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {(['all', 'completed', 'pending', 'pledged', 'failed', 'cancelled'] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={cn('shrink-0 border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em]', status === s ? 'border-gold bg-gold text-black' : 'border-white/15 text-silver')}>{s}</button>
          ))}
        </div>
        <label className="relative block md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, reference" className="field !py-2 !pl-9 text-sm" aria-label="Search donations" />
        </label>
      </div>
      {loading ? <PageLoader /> : error ? <ErrorState message={error.message} onRetry={reload} /> : !rows.length ? (
        <EmptyState>No donations to show.</EmptyState>
      ) : (
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-white/10 bg-coal">
              <tr className="field-label">
                <th className="p-3 font-normal">Date</th>
                <th className="p-3 font-normal">Donor</th>
                <th className="p-3 font-normal">Amount</th>
                <th className="p-3 font-normal">Method</th>
                <th className="p-3 font-normal">Designation</th>
                <th className="p-3 font-normal">Reference</th>
                <th className="p-3 font-normal">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((d) => (
                <tr key={d.id} className="align-top hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap p-3 text-xs text-muted">{formatDate(d.created_at, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3">
                    <p className="text-white">{d.donor_name}{d.anonymous && <span className="ml-2"><Badge>Anonymous</Badge></span>}</p>
                    <p className="text-xs text-muted">{d.donor_email}</p>
                    {d.donor_phone && <p className="text-xs text-muted">{d.donor_phone}</p>}
                    {d.message && <p className="mt-1 max-w-xs text-xs italic text-silver/80">“{d.message}”</p>}
                  </td>
                  <td className="whitespace-nowrap p-3 text-white">{formatMoney(d.amount, d.currency)}{d.frequency === 'monthly' && <span className="ml-1 text-xs text-muted">/mo</span>}</td>
                  <td className="p-3 text-silver-light">{METHOD[d.payment_method]}</td>
                  <td className="p-3 text-xs text-silver-light">{DONATION_DESIGNATIONS.find((x) => x.value === d.designation)?.label ?? d.designation}</td>
                  <td className="p-3 font-mono text-xs text-silver-light">{d.payment_reference}{d.provider_reference && <span className="block text-muted">{d.provider_reference}</span>}</td>
                  <td className="p-3"><Badge tone={TONE[d.payment_status]}>{d.payment_status}</Badge></td>
                  <td className="p-3 text-right">
                    {d.payment_method === 'bank_transfer' && d.payment_status === 'pledged' && <SmallButton tone="gold" onClick={() => confirmBank(d)}>Mark received</SmallButton>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
