import { allow, handler, newReference, rateLimit } from '../_lib/http.js'
import { donationInsert, parseDonation } from '../_lib/validation.js'
import { supabaseAdmin } from '../_lib/supabaseAdmin.js'

/**
 * POST /api/donations/bank — records a bank-transfer PLEDGE with a unique
 * reference. It is not a payment: an administrator marks it completed only
 * after the funds are seen in the bank account.
 */
export default handler(async (req, res) => {
  allow(req, 'POST')
  rateLimit(req, 'bank', 6)
  const d = parseDonation(req.body, 'bank_transfer')
  const reference = newReference()
  const { data: row, error } = await supabaseAdmin()
    .from('donations')
    .insert({ ...donationInsert(d), payment_reference: reference, payment_status: 'pledged' })
    .select('id, status_token')
    .single()
  if (error || !row) throw error ?? new Error('insert failed')
  return res.status(200).json({ donation_id: row.id, status_token: row.status_token, status: 'pledged', reference })
})
