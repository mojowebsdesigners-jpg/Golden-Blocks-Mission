import { allow, env, handler, HttpError } from '../_lib/http.js'
import { supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { MPESA_ENV_VARS, stkQuery } from '../_lib/mpesa.js'
import { markCompleted, markStatus } from '../_lib/confirm.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/donations/status?id=…&token=… — a donor checks ONLY their own
 * donation (the random status token is required). If an M-Pesa payment is
 * still pending, we reconcile with Daraja in case the callback was missed.
 */
export default handler(async (req, res) => {
  allow(req, 'GET')
  const id = String(req.query.id ?? '')
  const token = String(req.query.token ?? '')
  if (!UUID.test(id) || !UUID.test(token)) throw new HttpError(400, 'Invalid request.')

  const sb = supabaseAdmin()
  const select = 'id, amount, currency, payment_method, payment_status, payment_reference, provider_reference, checkout_request_id, frequency, created_at'
  let { data: d } = await sb.from('donations').select(select).eq('id', id).eq('status_token', token).maybeSingle()
  if (!d) throw new HttpError(404, 'Donation not found.')

  const age = Date.now() - new Date(d.created_at).getTime()
  if (d.payment_method === 'mpesa' && d.payment_status === 'pending' && d.checkout_request_id && age > 15_000 && MPESA_ENV_VARS.every((v) => env(v))) {
    const q = await stkQuery(d.checkout_request_id).catch(() => null)
    if (q?.outcome === 'completed') await markCompleted(d.id, d.provider_reference, { source: 'stk_query', ...q })
    else if (q?.outcome === 'cancelled' || q?.outcome === 'failed') await markStatus(d.id, q.outcome, { source: 'stk_query', ...q })
    if (q && q.outcome !== 'pending') ({ data: d } = await sb.from('donations').select(select).eq('id', id).single())
  }

  return res.status(200).json({
    status: d!.payment_status,
    amount: Number(d!.amount),
    currency: d!.currency,
    payment_method: d!.payment_method,
    reference: d!.payment_reference,
    frequency: d!.frequency,
  })
})
