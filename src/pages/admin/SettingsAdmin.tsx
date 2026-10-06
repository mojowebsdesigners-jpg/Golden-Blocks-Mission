import { useEffect, useState, type ChangeEvent } from 'react'
import { X } from 'lucide-react'
import { useSettings } from '@/components/common/SettingsProvider'
import { saveSettings } from '@/services/admin'
import { TextArea, TextField } from '@/components/forms/Field'
import { Button } from '@/components/ui/Button'
import { errorMessage } from '@/lib/utils'
import type { SiteSettings } from '@/types'
import { ImageUpload, PageHeader, Panel, useToast } from './ui'

const SOCIALS = ['facebook', 'instagram', 'youtube', 'x', 'tiktok', 'linkedin'] as const

export default function SettingsAdmin() {
  const { settings, reload } = useSettings()
  const toast = useToast()
  const [s, setS] = useState<SiteSettings>(settings)
  const [busy, setBusy] = useState(false)
  useEffect(() => setS(settings), [settings])

  const set = (k: keyof SiteSettings) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value || null })
  const setNested = <K extends 'bank' | 'mpesa_paybill' | 'socials'>(k: K, field: string) => (e: ChangeEvent<HTMLInputElement>) =>
    setS({ ...s, [k]: { ...((s[k] as Record<string, string>) ?? {}), [field]: e.target.value } })

  const save = async () => {
    setBusy(true)
    try {
      const socials = Object.fromEntries(Object.entries(s.socials ?? {}).filter(([, v]) => v && /^https?:\/\//.test(v)))
      await saveSettings({ ...s, socials })
      reload()
      toast('Settings saved — the website now shows these details')
    } catch (e) {
      toast(errorMessage(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Organisation details shown across the website. Empty fields display as clearly marked placeholders." actions={<Button onClick={save} loading={busy}>Save settings</Button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Contact information">
          <div className="grid gap-5">
            <TextField label="Email address" type="email" value={s.email ?? ''} onChange={set('email')} />
            <TextField label="Phone number" value={s.phone ?? ''} onChange={set('phone')} />
            <TextArea label="Physical address" rows={3} value={s.address ?? ''} onChange={set('address')} />
            <TextField label="Office hours" placeholder="e.g. Mon–Thu, 9:00–17:00" value={s.office_hours ?? ''} onChange={set('office_hours')} />
          </div>
        </Panel>
        <Panel title="Social media (full URLs)">
          <div className="grid gap-5 sm:grid-cols-2">
            {SOCIALS.map((k) => (
              <TextField key={k} label={k === 'x' ? 'X (Twitter)' : k[0].toUpperCase() + k.slice(1)} type="url" placeholder="https://" value={s.socials?.[k] ?? ''} onChange={setNested('socials', k)} />
            ))}
          </div>
        </Panel>
        <Panel title="Bank transfer details (shown to donors who choose bank transfer)">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Bank name" value={s.bank?.bank_name ?? ''} onChange={setNested('bank', 'bank_name')} />
            <TextField label="Account name" value={s.bank?.account_name ?? ''} onChange={setNested('bank', 'account_name')} />
            <TextField label="Account number" value={s.bank?.account_number ?? ''} onChange={setNested('bank', 'account_number')} />
            <TextField label="Branch" value={s.bank?.branch ?? ''} onChange={setNested('bank', 'branch')} />
            <TextField label="SWIFT code" value={s.bank?.swift ?? ''} onChange={setNested('bank', 'swift')} />
          </div>
        </Panel>
        <Panel title="M-Pesa Paybill (for display only)">
          <p className="mb-5 text-xs text-muted">Online M-Pesa payments use the Daraja credentials configured on the server. These fields are for printed / manual giving instructions.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Paybill number" value={s.mpesa_paybill?.paybill ?? ''} onChange={setNested('mpesa_paybill', 'paybill')} />
            <TextField label="Account" value={s.mpesa_paybill?.account ?? ''} onChange={setNested('mpesa_paybill', 'account')} />
          </div>
        </Panel>
        <Panel title="Seventh-day Adventist Church partnership" className="xl:col-span-2">
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div>
              <div className="relative grid aspect-square place-items-center border border-white/10 bg-night p-4">
                {s.sda_logo_url ? (
                  <>
                    <img src={s.sda_logo_url} alt="SDA logo" className="max-h-full object-contain" />
                    <button onClick={() => setS({ ...s, sda_logo_url: null })} className="absolute right-2 top-2 grid h-7 w-7 place-items-center bg-black/70 text-white" aria-label="Remove logo"><X className="h-4 w-4" /></button>
                  </>
                ) : (
                  <span className="text-center text-xs text-muted">No logo uploaded — a typographic treatment is shown instead.</span>
                )}
              </div>
              <div className="mt-3"><ImageUpload folder="brand" label="Upload official logo" onUploaded={(r) => setS({ ...s, sda_logo_url: r.url })} /></div>
              <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">Upload the official logo only after usage permission has been confirmed with the relevant Church office.</p>
            </div>
            <TextArea label="Partnership statement" rows={6} hint="Leave empty to use the default respectful statement." value={s.partnership_statement ?? ''} onChange={set('partnership_statement')} />
          </div>
        </Panel>
      </div>
    </>
  )
}
