import { z } from 'zod'
import { HttpError } from './http.js'

/** Server-side re-validation of every donation request (never trust the client). */
export const donationRequest = z
  .object({
    amount: z.coerce.number().positive().max(10_000_000),
    currency: z.enum(['KES', 'USD']),
    frequency: z.enum(['one_time', 'monthly']).default('one_time'),
    designation: z.string().trim().min(1).max(40).default('general'),
    project_id: z.string().uuid().nullish(),
    payment_method: z.enum(['mpesa', 'card', 'bank_transfer']),
    donor_name: z.string().trim().min(2).max(120),
    donor_email: z.string().trim().email().max(160),
    donor_phone: z.string().trim().max(24).optional(),
    anonymous: z.boolean().default(false),
    message: z.string().trim().max(1000).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.currency === 'KES' && v.amount < 10) ctx.addIssue({ code: 'custom', message: 'The minimum gift is KES 10' })
    if (v.currency === 'USD' && v.amount < 1) ctx.addIssue({ code: 'custom', message: 'The minimum gift is USD 1' })
  })

export type DonationRequest = z.infer<typeof donationRequest>

export function parseDonation(body: unknown, method: DonationRequest['payment_method']): DonationRequest {
  const r = donationRequest.safeParse(body)
  if (!r.success) throw new HttpError(400, r.error.issues[0]?.message ?? 'Please check your donation details.')
  if (r.data.payment_method !== method) throw new HttpError(400, 'Payment method mismatch.')
  return r.data
}

/** Normalises Kenyan mobile numbers to 2547XXXXXXXX / 2541XXXXXXXX. */
export function normaliseMsisdn(input?: string) {
  const digits = (input ?? '').replace(/\D/g, '')
  let n = digits
  if (n.startsWith('0')) n = '254' + n.slice(1)
  else if (n.length === 9 && /^[71]/.test(n)) n = '254' + n
  if (!/^254(7|1)\d{8}$/.test(n)) throw new HttpError(400, 'Enter a valid Safaricom number, e.g. 0712 345 678.')
  return n
}

/** Donation fields shared by all payment methods. */
export function donationInsert(d: DonationRequest) {
  return {
    donor_name: d.donor_name,
    donor_email: d.donor_email.toLowerCase(),
    donor_phone: d.donor_phone || null,
    anonymous: d.anonymous,
    amount: d.amount,
    currency: d.currency,
    frequency: d.frequency,
    designation: d.designation,
    project_id: d.designation === 'project' ? d.project_id ?? null : null,
    payment_method: d.payment_method,
    message: d.message || null,
  }
}
