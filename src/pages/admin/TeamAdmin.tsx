import { useState, type FormEvent } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { listTeam, setRole } from '@/services/admin'
import { PageLoader } from '@/components/common/PageLoader'
import { SelectField, TextField } from '@/components/forms/Field'
import { errorMessage, formatDate } from '@/lib/utils'
import type { Profile } from '@/types'
import { Badge, PageHeader, Panel, SmallButton, useToast } from './ui'
import { useAdmin } from './AdminApp'

export default function TeamAdmin() {
  const { profile: me } = useAdmin()
  const { data, loading, reload } = useAsync(listTeam, [])
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [role, setRoleValue] = useState<Profile['role']>('editor')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await setRole(email.trim(), role)
      toast(`${email} is now ${role === 'user' ? 'a regular user' : `an ${role}`}`)
      setEmail('')
      reload()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Team" description="Administrators manage everything, including donations and settings. Editors manage projects, gallery and enquiries." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Panel title="Staff accounts">
          {loading ? <PageLoader /> : (
            <ul className="divide-y divide-white/10">
              {(data ?? []).map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-white">{p.full_name || p.email}</p>
                    <p className="text-xs text-muted">{p.email} · since {formatDate(p.created_at, { month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={p.role === 'admin' ? 'gold' : 'silver'}>{p.role}</Badge>
                    {p.id !== me.id && p.email && (
                      <SmallButton onClick={async () => { try { await setRole(p.email!, 'user'); toast('Access removed'); reload() } catch (e) { toast(errorMessage(e), 'error') } }}>Remove access</SmallButton>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Grant access">
          <form onSubmit={submit} className="space-y-4">
            <p className="text-xs leading-relaxed text-muted">The person must first create an account (Supabase Auth → invite user, or sign-up). Then enter their email here.</p>
            <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <SelectField label="Role" value={role} onChange={(e) => setRoleValue(e.target.value as Profile['role'])} options={[{ value: 'editor', label: 'Editor' }, { value: 'admin', label: 'Administrator' }]} />
            <SmallButton type="submit" tone="gold" loading={busy}>Grant role</SmallButton>
          </form>
        </Panel>
      </div>
    </>
  )
}
