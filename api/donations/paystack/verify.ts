import { allow, handler, HttpError, requireEnv } from '../../_lib/http.js'
import { PAYSTACK_ENV_VARS, toSubunit, verify } from '../../_lib/paystack.js'
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js'
import { markCompleted, markStatus } from '../../_lib/confirm.js'

/**
 * GET /api/donations/paystack/verify?reference=GBM-… — called by the
 * thank-you page after Paystack redirects back. Verifies with Paystack's API
 * (never trusting the redirect itself) and cross-checks amount and currency.
 */
export default handler(async (req, res) => {
  allow(req, 'GET')
  requireEnv(PAYSTACK_ENV_VARS, 'Card giving')
  const reference = String(req.query.reference ?? '')
  if (!/^GBM-[A-Z0-9]{8}$/.test(reference)) throw new HttpError(400, 'Invalid payment reference.')

  const sb = supabaseAdmin()
  const { data: d } = await sb.from('donations').select('id, amount, currency, payment_status, frequency').eq('payment_reference', reference).maybeSingle()
  if (!d) throw new HttpError(404, 'We could not find this donation.')

  let status = d.payment_status
  if (status === 'pending') {
    const tx = await verify(reference)
    const matches = tx.amount === toSubunit(Number(d.amount)) && tx.currency === d.currency
    if (tx.status === 'success' && matches) {
      await markCompleted(d.id, String(tx.id), tx)
      status = 'completed'
    } else if (tx.status === 'failed' || tx.status === 'abandoned' || tx.status === 'reversed') {
      await markStatus(d.id, tx.status === 'abandoned' ? 'cancelled' : 'failed', tx)
      status = tx.status === 'abandoned' ? 'cancelled' : 'failed'
    } else if (tx.status === 'success' && !matches) {
      console.error('[paystack] amount/currency mismatch', { reference, tx: { amount: tx.amount, currency: tx.currency } })
    }
  }

  return res.status(200).json({ donation_id: d.id, status, amount: Number(d.amount), currency: d.currency, payment_method: 'card', reference, frequency: d.frequency })
})
