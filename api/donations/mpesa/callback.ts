import { timingSafeEqual } from 'node:crypto'
import { env, handler } from '../../_lib/http.js'
import { stkQuery } from '../../_lib/mpesa.js'
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js'
import { markCompleted, markStatus } from '../../_lib/confirm.js'

interface StkCallback {
  Body?: {
    stkCallback?: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: { Item: { Name: string; Value?: string | number }[] }
    }
  }
}

function secretOk(given: unknown) {
  const expected = env('MPESA_CALLBACK_SECRET')
  if (!expected || typeof given !== 'string') return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * POST /api/donations/mpesa/callback — Daraja result notification.
 * Daraja callbacks are unsigned, so we (1) require a secret in the URL and
 * (2) re-confirm the result server-to-server with the STK Query API before
 * recording a donation as completed. Amount is cross-checked too.
 */
export default handler(async (req, res) => {
  const ack = () => res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
  if (req.method !== 'POST' || !secretOk(req.query.secret)) return res.status(401).json({ ResultCode: 1, ResultDesc: 'Rejected' })

  const cb = (req.body as StkCallback)?.Body?.stkCallback
  if (!cb?.CheckoutRequestID) return ack()

  const sb = supabaseAdmin()
  const { data: donation } = await sb
    .from('donations')
    .select('id, amount, payment_status')
    .eq('checkout_request_id', cb.CheckoutRequestID)
    .maybeSingle()
  if (!donation || donation.payment_status !== 'pending') return ack()

  if (cb.ResultCode === 0) {
    const items = Object.fromEntries((cb.CallbackMetadata?.Item ?? []).map((i) => [i.Name, i.Value]))
    const confirmed = await stkQuery(cb.CheckoutRequestID).catch(() => ({ outcome: 'pending' as const }))
    const amountOk = Number(items.Amount) >= Math.round(Number(donation.amount))
    if (confirmed.outcome === 'completed' && amountOk) {
      await markCompleted(donation.id, String(items.MpesaReceiptNumber ?? ''), cb)
    } else {
      // Keep the receipt; /api/donations/status re-queries Daraja and completes it once confirmed.
      await sb.from('donations').update({ provider_reference: String(items.MpesaReceiptNumber ?? '') || null }).eq('id', donation.id)
      console.warn('[mpesa] callback success not yet confirmed', { id: donation.id, confirmed, amountOk })
    }
  } else {
    await markStatus(donation.id, cb.ResultCode === 1032 ? 'cancelled' : 'failed', cb)
  }
  return ack()
})
