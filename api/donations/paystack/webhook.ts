import { handler, rawBody, requireEnv } from '../../_lib/http.js'
import { PAYSTACK_ENV_VARS, toSubunit, validSignature, verify } from '../../_lib/paystack.js'
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js'
import { markCompleted } from '../../_lib/confirm.js'

/**
 * POST /api/donations/paystack/webhook — Paystack events.
 * Signature-verified (HMAC-SHA512), then re-verified via the API.
 * Handles first payments and monthly subscription renewals.
 */
export default handler(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  requireEnv(PAYSTACK_ENV_VARS, 'Card giving')
  const raw = await rawBody(req)
  if (!validSignature(raw, req.headers['x-paystack-signature'] as string | undefined)) return res.status(401).end()

  const event = JSON.parse(raw) as { event: string; data: { reference: string } }
  if (event.event !== 'charge.success') return res.status(200).end()

  const tx = await verify(event.data.reference)
  if (tx.status !== 'success') return res.status(200).end()

  const sb = supabaseAdmin()
  const { data: existing } = await sb.from('donations').select('id, amount, currency, payment_status').eq('payment_reference', tx.reference).maybeSingle()

  if (existing) {
    if (existing.payment_status !== 'completed' && tx.amount === toSubunit(Number(existing.amount)) && tx.currency === existing.currency) {
      await markCompleted(existing.id, String(tx.id), tx)
    }
    return res.status(200).end()
  }

  // A renewal charge on a monthly plan arrives with a new Paystack reference.
  if (tx.plan || tx.plan_object?.plan_code) {
    const { data: original } = await sb
      .from('donations')
      .select('donor_name, donor_phone, anonymous, designation, project_id')
      .eq('donor_email', tx.customer.email.toLowerCase())
      .eq('frequency', 'monthly')
      .eq('payment_method', 'card')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    const { data: row } = await sb
      .from('donations')
      .insert({
        ...(original ?? {}),
        donor_email: tx.customer.email.toLowerCase(),
        amount: tx.amount / 100,
        currency: tx.currency,
        frequency: 'monthly',
        designation: original?.designation ?? 'general',
        payment_method: 'card',
        payment_reference: tx.reference,
        payment_status: 'pending',
      })
      .select('id')
      .single()
    if (row) await markCompleted(row.id, String(tx.id), tx)
  }
  return res.status(200).end()
})
