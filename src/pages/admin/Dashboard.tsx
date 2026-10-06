import { Link } from 'react-router-dom'
import { ArrowRight, CircleAlert, CircleCheck } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getDashboardStats } from '@/services/admin'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { formatMoney } from '@/lib/utils'
import { PageHeader, Panel } from './ui'
import { useAdmin } from './AdminApp'

interface Health { supabase: boolean; mpesa: boolean; mpesa_env: string; paystack: boolean; email: boolean }

export default function Dashboard() {
  const { profile, isAdmin } = useAdmin()
  const stats = useAsync(getDashboardStats, [])
  const health = useAsync<Health | null>(() => fetch('/api/health').then((r) => (r.ok ? r.json() : null)).catch(() => null), [])

  if (stats.loading) return <PageLoader />
  if (stats.error) return <ErrorState message={stats.error.message} onRetry={stats.reload} />
  const s = stats.data!

  const tiles = [
    { label: 'Projects', value: s.projects, sub: `${s.projects_published} published`, to: '/admin/projects' },
    { label: 'Gallery images', value: s.gallery, sub: 'Manage imagery', to: '/admin/gallery' },
    { label: 'New messages', value: s.messages_new, sub: 'Contact form', to: '/admin/messages' },
    { label: 'New partnership enquiries', value: s.enquiries_new, sub: 'Get involved form', to: '/admin/enquiries' },
  ]

  return (
    <>
      <PageHeader title={`Welcome${profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}`} description="An overview of the website’s content, enquiries and verified giving." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="group border border-white/10 bg-coal p-6 transition-colors hover:border-gold/50">
            <p className="field-label">{t.label}</p>
            <p className="mt-4 font-serif text-5xl text-white">{t.value}</p>
            <p className="mt-2 flex items-center justify-between text-xs text-muted">{t.sub} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></p>
          </Link>
        ))}
      </div>

      {isAdmin && s.donations && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel title="Verified giving (all time)" className="lg:col-span-2">
            {Object.keys(s.donations.totals).length === 0 ? (
              <p className="text-sm text-muted">No verified donations yet.</p>
            ) : (
              <div className="flex flex-wrap gap-10">
                {Object.entries(s.donations.totals).map(([cur, total]) => (
                  <div key={cur}>
                    <p className="text-gold-metal font-serif text-4xl">{formatMoney(Number(total), cur)}</p>
                    <p className="field-label mt-2">{cur}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-6 text-xs text-muted">Totals include only payments confirmed by M-Pesa / Paystack, or bank transfers you have marked as received.</p>
          </Panel>
          <Panel title="Donations">
            <p className="text-sm text-silver-light"><span className="font-serif text-3xl text-white">{s.donations.completed_count}</span> verified</p>
            <p className="mt-2 text-sm text-silver-light"><span className="font-serif text-3xl text-white">{s.donations.pending_count}</span> pending / pledged</p>
            <Link to="/admin/donations" className="eyebrow mt-6 inline-flex items-center gap-2 text-gold-bright">View donations <ArrowRight className="h-3 w-3" /></Link>
          </Panel>
        </div>
      )}

      {isAdmin && (
        <Panel title="Integrations" className="mt-6">
          {health.loading ? (
            <p className="text-sm text-muted">Checking…</p>
          ) : !health.data ? (
            <p className="text-sm text-muted">Serverless API not reachable from this environment.</p>
          ) : (
            <ul className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Server database access', health.data.supabase],
                [`M-Pesa (${health.data.mpesa_env})`, health.data.mpesa],
                ['Card payments (Paystack)', health.data.paystack],
                ['Confirmation emails', health.data.email],
              ].map(([label, ok]) => (
                <li key={String(label)} className="flex items-center gap-2 text-silver-light">
                  {ok ? <CircleCheck className="h-4 w-4 text-emerald-400" /> : <CircleAlert className="h-4 w-4 text-amber-400" />}
                  {label} <span className="text-xs text-muted">{ok ? 'configured' : 'not configured'}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </>
  )
}
