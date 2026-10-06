import { supabaseAdmin, type DonationRow } from './supabaseAdmin.js'
import { env } from './http.js'

/**
 * Marks a donation verified exactly once (idempotent) and sends the donor a
 * confirmation email. Only called after the payment provider has confirmed
 * the payment server-to-server.
 */
export async function markCompleted(id: string, providerReference: string | null, payload: unknown) {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('donations')
    .update({ payment_status: 'completed', provider_reference: providerReference, provider_payload: payload, verified_at: new Date().toISOString() })
    .eq('id', id)
    .neq('payment_status', 'completed')
    .select('*')
    .maybeSingle()
  if (error) throw error
  if (data) await sendConfirmation(data as DonationRow)
}

export async function markStatus(id: string, status: 'failed' | 'cancelled', payload: unknown) {
  await supabaseAdmin().from('donations').update({ payment_status: status, provider_payload: payload }).eq('id', id).eq('payment_status', 'pending')
}

async function sendConfirmation(d: DonationRow) {
  const key = env('RESEND_API_KEY')
  const from = env('EMAIL_FROM')
  if (!key || !from || !d.donor_email || d.confirmation_sent_at) return
  const amount = new Intl.NumberFormat('en-KE', { style: 'currency', currency: d.currency }).format(d.amount)
  const name = (d.donor_name ?? 'friend').split(' ')[0]
  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:auto;padding:32px;color:#1a1a1a">
      <p style="font-family:monospace;letter-spacing:.2em;font-size:11px;color:#9c7a26">GOLDEN BLOCKS MISSION</p>
      <h1 style="font-weight:400;font-size:28px">Thank you, ${escapeHtml(name)}.</h1>
      <p style="font-size:16px;line-height:1.6">We have received and verified your gift of <strong>${amount}</strong>${d.frequency === 'monthly' ? ' (monthly)' : ''}.
      Every gift is a block in a house of worship and the ministry it shelters.</p>
      <table style="font-family:Arial,sans-serif;font-size:13px;color:#555;margin:24px 0">
        <tr><td style="padding:4px 16px 4px 0">Reference</td><td>${escapeHtml(d.payment_reference ?? '')}</td></tr>
        ${d.provider_reference ? `<tr><td style="padding:4px 16px 4px 0">Transaction</td><td>${escapeHtml(d.provider_reference)}</td></tr>` : ''}
        <tr><td style="padding:4px 16px 4px 0">Method</td><td>${d.payment_method === 'mpesa' ? 'M-Pesa' : d.payment_method === 'card' ? 'Card' : 'Bank transfer'}</td></tr>
      </table>
      <p style="font-style:italic;color:#555">“Bring your gold to the Father, so that together we may build places of worship that bring no shame to His name.”</p>
    </div>`
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [d.donor_email], subject: 'Thank you for your gift to Golden Blocks Mission', html }),
  })
  if (res.ok) await supabaseAdmin().from('donations').update({ confirmation_sent_at: new Date().toISOString() }).eq('id', d.id)
  else console.warn('[email] confirmation failed', await res.text().catch(() => ''))
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
