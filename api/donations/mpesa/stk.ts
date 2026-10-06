import { allow, env, handler, HttpError, newReference, rateLimit, requireEnv, siteUrl } from '../../_lib/http.js'
import { donationInsert, normaliseMsisdn, parseDonation } from '../../_lib/validation.js'
import { MPESA_ENV_VARS, stkPush } from '../../_lib/mpesa.js'
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js'

/** POST /api/donations/mpesa/stk — records a pending donation and sends an STK prompt. */
export default handler(async (req, res) => {
  allow(req, 'POST')
  rateLimit(req, 'mpesa', 5)
  requireEnv(MPESA_ENV_VARS, 'M-Pesa giving')
  const d = parseDonation(req.body, 'mpesa')
  if (d.currency !== 'KES') throw new HttpError(400, 'M-Pesa payments are made in KES.')
  if (d.frequency !== 'one_time') throw new HttpError(400, 'Monthly giving is available by card.')
  const msisdn = normaliseMsisdn(d.donor_phone)

  const sb = supabaseAdmin()
  const reference = newReference()
  const { data: row, error } = await sb
    .from('donations')
    .insert({ ...donationInsert(d), donor_phone: msisdn, payment_reference: reference, payment_status: 'pending' })
    .select('id, status_token')
    .single()
  if (error || !row) throw error ?? new Error('insert failed')

  try {
    const callbackUrl = `${env('MPESA_CALLBACK_BASE_URL') ?? siteUrl(req)}/api/donations/mpesa/callback?secret=${encodeURIComponent(env('MPESA_CALLBACK_SECRET')!)}`
    const stk = await stkPush({ amount: d.amount, msisdn, reference, callbackUrl })
    await sb.from('donations').update({ checkout_request_id: stk.CheckoutRequestID, merchant_request_id: stk.MerchantRequestID }).eq('id', row.id)
    return res.status(200).json({
      donation_id: row.id,
      status_token: row.status_token,
      status: 'pending',
      reference,
      message: stk.CustomerMessage ?? 'Check your phone and enter your M-Pesa PIN to complete your gift.',
    })
  } catch (err) {
    await sb.from('donations').update({ payment_status: 'failed' }).eq('id', row.id)
    throw err
  }
})
