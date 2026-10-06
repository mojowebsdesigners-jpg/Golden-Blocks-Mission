import { createHmac, timingSafeEqual } from 'node:crypto'
import { env, HttpError } from './http.js'

/** Paystack (cards; supports KES and USD for Kenyan businesses). https://paystack.com/docs/api */
const API = 'https://api.paystack.co'
export const PAYSTACK_ENV_VARS = ['PAYSTACK_SECRET_KEY']

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env('PAYSTACK_SECRET_KEY')}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  const data = (await res.json().catch(() => ({}))) as { status?: boolean; message?: string; data?: T }
  if (!res.ok || !data.status) {
    console.warn('[paystack]', path, data.message)
    throw new HttpError(502, 'Card payments are temporarily unavailable. Please try again shortly or use M-Pesa.')
  }
  return data.data as T
}

/** Amounts are sent in the currency's subunit (cents). */
export const toSubunit = (amount: number) => Math.round(amount * 100)

/** Finds or creates a monthly plan for a given amount + currency. */
export async function monthlyPlan(amount: number, currency: string) {
  const sub = toSubunit(amount)
  const name = `GBM Monthly ${currency} ${amount.toFixed(2)}`
  const existing = await call<{ plan_code: string; name: string; amount: number; currency: string; interval: string }[]>(
    `/plan?perPage=100&interval=monthly&amount=${sub}`,
  )
  const match = existing.find((p) => p.name === name && p.currency === currency)
  if (match) return match.plan_code
  const created = await call<{ plan_code: string }>('/plan', {
    method: 'POST',
    body: JSON.stringify({ name, interval: 'monthly', amount: sub, currency, description: 'Monthly gift to Golden Blocks Mission' }),
  })
  return created.plan_code
}

export function initialize(body: {
  email: string
  amount: number
  currency: string
  reference: string
  callback_url: string
  plan?: string
  metadata: Record<string, unknown>
}) {
  return call<{ authorization_url: string; access_code: string; reference: string }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({ ...body, amount: toSubunit(body.amount), channels: ['card'] }),
  })
}

export interface PaystackTx {
  id: number
  status: 'success' | 'failed' | 'abandoned' | 'ongoing' | 'pending' | 'reversed' | 'queued'
  reference: string
  amount: number
  currency: string
  paid_at: string | null
  customer: { email: string }
  plan?: unknown
  plan_object?: { plan_code?: string }
  metadata?: Record<string, unknown> | string | null
}

export function verify(reference: string) {
  return call<PaystackTx>(`/transaction/verify/${encodeURIComponent(reference)}`)
}

/** Webhook authenticity: HMAC-SHA512 of the raw body with the secret key. */
export function validSignature(raw: string, signature: string | undefined) {
  if (!signature) return false
  const expected = createHmac('sha512', env('PAYSTACK_SECRET_KEY')!).update(raw).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}
