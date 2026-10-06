import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Building, CreditCard, Loader2, Lock, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/sections/common/PageHero'
import { Button } from '@/components/ui/Button'
import { FormStatus, SelectField, TextArea, TextField } from '@/components/forms/Field'
import { Placeholder } from '@/components/common/Placeholder'
import { useSettings } from '@/components/common/SettingsProvider'
import { useAsync } from '@/hooks/useAsync'
import { getProjects } from '@/services/content'
import { getDonationStatus, startDonation, type DonationInitResponse } from '@/services/donations'
import { DONATION_DESIGNATIONS, SCRIPTURE } from '@/data/site'
import { cn, errorMessage, formatMoney } from '@/lib/utils'
import type { PaymentMethod } from '@/types'

const schema = z
  .object({
    frequency: z.enum(['one_time', 'monthly']),
    currency: z.enum(['KES', 'USD']),
    amount: z.coerce.number({ message: 'Enter an amount' }).positive('Enter an amount greater than zero').max(10_000_000, 'For gifts of this size, please contact us directly'),
    designation: z.string().min(1),
    project_id: z.string().optional(),
    payment_method: z.enum(['mpesa', 'card', 'bank_transfer']),
    donor_name: z.string().trim().min(2, 'Please enter your name').max(120),
    donor_email: z.string().trim().email('Enter a valid email address — we send your confirmation here'),
    donor_phone: z.string().trim().optional(),
    anonymous: z.boolean(),
    message: z.string().max(1000).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.currency === 'KES' && v.amount < 10) ctx.addIssue({ code: 'custom', path: ['amount'], message: 'The minimum gift is KES 10' })
    if (v.currency === 'USD' && v.amount < 1) ctx.addIssue({ code: 'custom', path: ['amount'], message: 'The minimum gift is USD 1' })
    if (v.payment_method === 'mpesa') {
      if (v.currency !== 'KES') ctx.addIssue({ code: 'custom', path: ['currency'], message: 'M-Pesa payments are made in KES' })
      if (v.frequency === 'monthly') ctx.addIssue({ code: 'custom', path: ['frequency'], message: 'Monthly giving is available by card' })
      if (!/^(?:\+?254|0)?(7|1)\d{8}$/.test((v.donor_phone ?? '').replace(/\s/g, '')))
        ctx.addIssue({ code: 'custom', path: ['donor_phone'], message: 'Enter the Safaricom number to receive the M-Pesa prompt, e.g. 0712 345 678' })
    }
    if (v.designation === 'project' && !v.project_id) ctx.addIssue({ code: 'custom', path: ['project_id'], message: 'Choose a project' })
  })
type Values = z.input<typeof schema>

const METHODS: { key: PaymentMethod; label: string; desc: string; icon: LucideIcon }[] = [
  { key: 'mpesa', label: 'M-Pesa', desc: 'Pay instantly with an STK prompt on your phone', icon: Smartphone },
  { key: 'card', label: 'Card', desc: 'Visa or Mastercard via secure Paystack checkout', icon: CreditCard },
  { key: 'bank_transfer', label: 'Bank transfer', desc: 'Transfer directly using our bank details', icon: Building },
]

type Phase =
  | { kind: 'form' }
  | { kind: 'awaiting_mpesa'; init: DonationInitResponse; started: number }
  | { kind: 'redirecting' }
  | { kind: 'bank'; init: DonationInitResponse; amount: number; currency: string }

export default function Donate() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { settings } = useSettings()
  const { data: projects } = useAsync(getProjects, [])
  const [phase, setPhase] = useState<Phase>({ kind: 'form' })
  const [error, setError] = useState<string | null>(null)
  const formTop = useRef<HTMLDivElement>(null)

  const presetProject = params.get('project')
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      frequency: 'one_time',
      currency: 'KES',
      designation: presetProject ? 'project' : 'general',
      project_id: presetProject ?? '',
      payment_method: 'mpesa',
      anonymous: false,
    },
  })
  const [method, frequency, currency, designation, amount] = useWatch({ control, name: ['payment_method', 'frequency', 'currency', 'designation', 'amount'] })
  const realProjects = useMemo(() => (projects ?? []).filter((p) => p.status !== 'completed'), [projects])

  // Keep the form coherent as the method changes.
  useEffect(() => {
    if (method === 'mpesa') {
      setValue('currency', 'KES')
      setValue('frequency', 'one_time')
    }
  }, [method, setValue])

  // Poll M-Pesa status (server-verified via Daraja callback) for up to 2 minutes.
  useEffect(() => {
    if (phase.kind !== 'awaiting_mpesa') return
    let alive = true
    const tick = async () => {
      if (!alive) return
      try {
        const s = await getDonationStatus(phase.init.donation_id, phase.init.status_token)
        if (!alive) return
        if (s.status === 'completed') {
          navigate(`/donate/thank-you?id=${phase.init.donation_id}&token=${phase.init.status_token}`)
          return
        }
        if (s.status === 'failed' || s.status === 'cancelled') {
          setError(s.status === 'cancelled' ? 'The M-Pesa request was cancelled. You can try again whenever you are ready.' : 'The M-Pesa payment did not go through. Please try again.')
          setPhase({ kind: 'form' })
          return
        }
      } catch {
        /* transient — keep polling */
      }
      if (Date.now() - phase.started > 120_000) {
        setError('We have not received confirmation from M-Pesa yet. If you completed the payment, you will receive a confirmation email once it is verified.')
        setPhase({ kind: 'form' })
        return
      }
      setTimeout(tick, 3000)
    }
    const t = setTimeout(tick, 4000)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [phase, navigate])

  const onSubmit = async (raw: Values) => {
    setError(null)
    const v = schema.parse(raw)
    try {
      const init = await startDonation({
        amount: v.amount,
        currency: v.currency,
        frequency: v.frequency,
        designation: v.designation,
        project_id: v.designation === 'project' ? v.project_id || null : null,
        payment_method: v.payment_method,
        donor_name: v.donor_name,
        donor_email: v.donor_email,
        donor_phone: v.donor_phone || undefined,
        anonymous: v.anonymous,
        message: v.message || undefined,
      })
      if (v.payment_method === 'mpesa') setPhase({ kind: 'awaiting_mpesa', init, started: Date.now() })
      else if (v.payment_method === 'card' && init.authorization_url) {
        setPhase({ kind: 'redirecting' })
        window.location.assign(init.authorization_url)
      } else if (v.payment_method === 'bank_transfer') setPhase({ kind: 'bank', init, amount: v.amount, currency: v.currency })
      formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <>
      <Seo title="Donate" path="/donate" description="Give securely by M-Pesa, card or bank transfer to support church construction, renovation, evangelism and community outreach." />
      <PageHero
        eyebrow="Donate"
        title="Bring your gold to the Father."
        goldFrom={3}
        image="/images/gallery/interiors-light-beam.webp"
        compact
        lede="We need your financial support as much as your prayers."
      />

      <section className="bg-night py-20 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <aside className="order-2 min-w-0 lg:order-none lg:col-span-4">
            <div className="space-y-10 lg:sticky lg:top-28">
              <div>
                <p className="eyebrow mb-4 text-champagne">Why give</p>
                <p className="lede">Where the need is greatest, or where you choose.</p>
              </div>
              <figure className="border-l border-gold/50 pl-5">
                <blockquote className="font-serif text-lg italic text-silver-light">“{SCRIPTURE.corinthians.text}”</blockquote>
                <figcaption className="eyebrow mt-3 text-champagne/80">{SCRIPTURE.corinthians.ref}</figcaption>
              </figure>
              <ul className="space-y-4 border-t border-white/10 pt-8 text-sm text-muted">
                <li className="flex gap-3"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Card payments are processed by Paystack on a secure hosted page. We never see or store your card details.</li>
                <li className="flex gap-3"><Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> M-Pesa payments are confirmed directly by Safaricom before we record them as received.</li>
                <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> You receive confirmation only once your payment has been verified.</li>
              </ul>
            </div>
          </aside>

          <div ref={formTop} className="min-w-0 scroll-mt-28 lg:col-span-7 lg:col-start-6">
            <AnimatePresence mode="wait">
              {phase.kind === 'awaiting_mpesa' && (
                <motion.div key="mpesa" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-gold/30 bg-coal p-10 text-center" role="status" aria-live="polite">
                  <Smartphone className="mx-auto h-10 w-10 text-gold-bright" strokeWidth={1.2} />
                  <h2 className="display-sm mt-6">Check your phone</h2>
                  <p className="mx-auto mt-4 max-w-md text-muted">{phase.init.message ?? 'We have sent an M-Pesa prompt to your phone. Enter your M-Pesa PIN to complete your gift.'}</p>
                  <p className="eyebrow mt-8 flex items-center justify-center gap-3 text-champagne"><Loader2 className="h-4 w-4 animate-spin" /> Waiting for confirmation from M-Pesa</p>
                  <button onClick={() => setPhase({ kind: 'form' })} className="mt-8 text-sm text-muted underline underline-offset-4 hover:text-white">Cancel and go back</button>
                </motion.div>
              )}

              {phase.kind === 'redirecting' && (
                <motion.div key="redir" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-white/10 bg-coal p-10 text-center" role="status">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold-bright" />
                  <p className="mt-6 text-silver-light">Taking you to secure checkout…</p>
                </motion.div>
              )}

              {phase.kind === 'bank' && (
                <motion.div key="bank" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="border border-gold/30 bg-coal p-8 md:p-10">
                  <p className="eyebrow text-champagne">Pledge recorded — awaiting your transfer</p>
                  <h2 className="display-sm mt-4">Thank you. Please complete your bank transfer.</h2>
                  <p className="mt-4 text-muted">
                    Transfer <strong className="text-white">{formatMoney(phase.amount, phase.currency)}</strong> using the details below and quote your reference so we can match your gift. Your donation will be marked as received once our team verifies it.
                  </p>
                  <dl className="mt-8 divide-y divide-white/10 border-y border-white/10 text-sm">
                    {[
                      ['Reference', <span className="font-mono text-gold-bright">{phase.init.reference}</span>],
                      ['Bank', settings.bank?.bank_name || <Placeholder label="Bank name" />],
                      ['Account name', settings.bank?.account_name || <Placeholder label="Account name" />],
                      ['Account number', settings.bank?.account_number || <Placeholder label="Account number" />],
                      ['Branch', settings.bank?.branch || <Placeholder label="Branch" />],
                      ['SWIFT', settings.bank?.swift || <Placeholder label="SWIFT code" />],
                    ].map(([k, v], i) => (
                      <div key={i} className="flex items-center justify-between gap-4 py-3.5"><dt className="text-muted">{k}</dt><dd className="text-right text-white">{v}</dd></div>
                    ))}
                  </dl>
                  {frequency === 'monthly' && <p className="mt-6 text-sm text-muted">For monthly giving by bank, please set up a standing order with your bank using the same reference.</p>}
                  <Button variant="dark" className="mt-8" onClick={() => setPhase({ kind: 'form' })}>Make another gift</Button>
                </motion.div>
              )}

              {phase.kind === 'form' && (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit(onSubmit)} noValidate className="border border-white/10 bg-coal p-6 md:p-10" aria-label="Donation form">
                  {/* Frequency */}
                  <fieldset>
                    <legend className="field-label mb-3">Frequency</legend>
                    <div className="grid grid-cols-2 border border-white/15">
                      {(['one_time', 'monthly'] as const).map((f) => (
                        <label key={f} className={cn('cursor-pointer py-3.5 text-center font-mono text-[0.68rem] uppercase tracking-[0.2em] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-gold', frequency === f ? 'bg-gold text-black' : 'text-silver-light/80 hover:text-white', method === 'mpesa' && f === 'monthly' && 'cursor-not-allowed opacity-40')}>
                          <input type="radio" value={f} className="sr-only" disabled={method === 'mpesa' && f === 'monthly'} {...register('frequency')} />
                          {f === 'one_time' ? 'One-time' : 'Monthly'}
                        </label>
                      ))}
                    </div>
                    {method === 'mpesa' && <p className="mt-2 text-xs text-muted">Monthly giving is available by card. M-Pesa gifts are one-time.</p>}
                    {errors.frequency && <p className="mt-2 text-xs text-[#b4412f]">{errors.frequency.message}</p>}
                  </fieldset>

                  {/* Amount */}
                  <div className="mt-8">
                    <label htmlFor="amount" className="field-label">Gift amount <span className="text-gold">*</span></label>
                    <div className="mt-3 flex border border-white/15 focus-within:border-gold">
                      <select aria-label="Currency" className="border-r border-white/15 bg-transparent px-4 font-mono text-sm text-white outline-none disabled:opacity-60" disabled={method === 'mpesa'} {...register('currency')}>
                        <option value="KES" className="bg-coal">KES</option>
                        <option value="USD" className="bg-coal">USD</option>
                      </select>
                      <input id="amount" type="number" inputMode="decimal" min={1} step="any" placeholder="Enter amount" aria-invalid={!!errors.amount} className="min-w-0 flex-1 bg-transparent px-4 py-4 font-serif text-3xl text-white outline-none placeholder:text-white/20" {...register('amount')} />
                    </div>
                    {errors.amount && <p role="alert" className="mt-2 text-xs text-[#b4412f]">{errors.amount.message}</p>}
                    {errors.currency && <p role="alert" className="mt-2 text-xs text-[#b4412f]">{errors.currency.message}</p>}
                  </div>

                  {/* Designation */}
                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <SelectField label="Direct my gift to" options={DONATION_DESIGNATIONS.map((d) => ({ value: d.value, label: d.label }))} {...register('designation')} wrapClassName={designation === 'project' ? '' : 'sm:col-span-2'} />
                    {designation === 'project' && (
                      <SelectField
                        label="Project"
                        placeholder={realProjects.length ? 'Select a project' : 'No open projects yet'}
                        options={realProjects.map((p) => ({ value: p.id, label: p.is_demo ? `${p.title} (demonstration)` : p.title }))}
                        error={errors.project_id?.message}
                        {...register('project_id')}
                      />
                    )}
                  </div>

                  {/* Method */}
                  <fieldset className="mt-10">
                    <legend className="field-label mb-3">Payment method</legend>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {METHODS.map((m) => (
                        <label key={m.key} className={cn('relative cursor-pointer border p-4 transition-all has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-gold', method === m.key ? 'border-gold bg-gold/[0.07]' : 'border-white/15 hover:border-white/35')}>
                          <input type="radio" value={m.key} className="sr-only" {...register('payment_method')} />
                          <m.icon className={cn('h-5 w-5', method === m.key ? 'text-gold-bright' : 'text-silver')} strokeWidth={1.4} />
                          <span className="mt-3 block font-serif text-lg text-white">{m.label}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-muted">{m.desc}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Donor */}
                  <div className="mt-10 grid gap-6 sm:grid-cols-2">
                    <TextField label="Full name" required autoComplete="name" error={errors.donor_name?.message} {...register('donor_name')} />
                    <TextField label="Email" type="email" required autoComplete="email" error={errors.donor_email?.message} {...register('donor_email')} />
                    <TextField
                      label={method === 'mpesa' ? 'M-Pesa phone number' : 'Phone'}
                      type="tel"
                      required={method === 'mpesa'}
                      autoComplete="tel"
                      placeholder={method === 'mpesa' ? '0712 345 678' : 'Optional'}
                      error={errors.donor_phone?.message}
                      wrapClassName="sm:col-span-2"
                      {...register('donor_phone')}
                    />
                    <TextArea label="Message or prayer request" hint="Optional" rows={3} wrapClassName="sm:col-span-2" {...register('message')} />
                    <label className="flex items-center gap-3 text-sm text-silver-light sm:col-span-2">
                      <input type="checkbox" className="h-4 w-4 accent-[#e0a713]" {...register('anonymous')} />
                      Keep my gift anonymous in any public acknowledgement
                    </label>
                  </div>

                  <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted">
                      {amount && Number(amount) > 0 ? <>You are giving <strong className="text-white">{formatMoney(Number(amount), currency)}</strong>{frequency === 'monthly' ? ' every month' : ''}.</> : 'Enter an amount to continue.'}
                    </p>
                    <Button type="submit" loading={isSubmitting}>
                      {method === 'mpesa' ? 'Send M-Pesa prompt' : method === 'card' ? 'Continue to secure checkout' : 'Get bank details'}
                    </Button>
                  </div>
                  {error && <div className="mt-6"><FormStatus state="error" success="" error={error} /></div>}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  )
}
