import { allow, handler, newReference, rateLimit, requireEnv, siteUrl } from '../../_lib/http.js'
import { donationInsert, parseDonation } from '../../_lib/validation.js'
import { initialize, monthlyPlan, PAYSTACK_ENV_VARS } from '../../_lib/paystack.js'
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js'

/** POST /api/donations/paystack/initialize — creates a pending donation and a hosted checkout session. */
export default handler(async (req, res) => {
  allow(req, 'POST')
  rateLimit(req, 'paystack', 6)
  requireEnv(PAYSTACK_ENV_VARS, 'Card giving')
  const d = parseDonation(req.body, 'card')

  const sb = supabaseAdmin()
  const reference = newReference()
  const { data: row, error } = await sb
    .from('donations')
    .insert({ ...donationInsert(d), payment_reference: reference, payment_status: 'pending' })
    .select('id, status_token')
    .single()
  if (error || !row) throw error ?? new Error('insert failed')

  try {
    const plan = d.frequency === 'monthly' ? await monthlyPlan(d.amount, d.currency) : undefined
    const session = await initialize({
      email: d.donor_email,
      amount: d.amount,
      currency: d.currency,
      reference,
      plan,
      callback_url: `${siteUrl(req)}/donate/thank-you`,
      metadata: { donation_id: row.id, designation: d.designation, frequency: d.frequency, cancel_action: `${siteUrl(req)}/donate` },
    })
    return res.status(200).json({ donation_id: row.id, status_token: row.status_token, status: 'pending', reference, authorization_url: session.authorization_url })
  } catch (err) {
    await sb.from('donations').update({ payment_status: 'failed' }).eq('id', row.id)
    throw err
  }
})
