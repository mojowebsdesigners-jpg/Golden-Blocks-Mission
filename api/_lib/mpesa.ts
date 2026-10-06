import { env, HttpError } from './http.js'

/**
 * Safaricom Daraja (M-Pesa Express / STK Push).
 * Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
 */
const BASE = () => (env('MPESA_ENV') === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke')

export const MPESA_ENV_VARS = ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_SHORTCODE', 'MPESA_PASSKEY', 'MPESA_CALLBACK_SECRET']

let cached: { token: string; exp: number } | null = null
async function accessToken() {
  if (cached && cached.exp > Date.now() + 30_000) return cached.token
  const auth = Buffer.from(`${env('MPESA_CONSUMER_KEY')}:${env('MPESA_CONSUMER_SECRET')}`).toString('base64')
  const res = await fetch(`${BASE()}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${auth}` } })
  if (!res.ok) throw new HttpError(502, 'M-Pesa is temporarily unavailable. Please try again shortly.')
  const data = (await res.json()) as { access_token: string; expires_in: string }
  cached = { token: data.access_token, exp: Date.now() + Number(data.expires_in) * 1000 }
  return cached.token
}

function timestamp() {
  // Daraja expects EAT (UTC+3) in YYYYMMDDHHmmss
  const d = new Date(Date.now() + 3 * 3600_000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`
}

function password(ts: string) {
  return Buffer.from(`${env('MPESA_SHORTCODE')}${env('MPESA_PASSKEY')}${ts}`).toString('base64')
}

export async function stkPush(opts: { amount: number; msisdn: string; reference: string; callbackUrl: string }) {
  const ts = timestamp()
  const shortcode = env('MPESA_SHORTCODE')!
  const till = env('MPESA_TILL_NUMBER') // for Buy Goods, PartyB is the till; BusinessShortCode is the store number
  const res = await fetch(`${BASE()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password(ts),
      Timestamp: ts,
      TransactionType: env('MPESA_TRANSACTION_TYPE') ?? 'CustomerPayBillOnline',
      Amount: Math.round(opts.amount),
      PartyA: opts.msisdn,
      PartyB: till ?? shortcode,
      PhoneNumber: opts.msisdn,
      CallBackURL: opts.callbackUrl,
      AccountReference: opts.reference.slice(0, 12),
      TransactionDesc: 'Donation',
    }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    ResponseCode?: string
    CheckoutRequestID?: string
    MerchantRequestID?: string
    CustomerMessage?: string
    errorMessage?: string
  }
  if (!res.ok || data.ResponseCode !== '0' || !data.CheckoutRequestID) {
    console.warn('[mpesa] stk push rejected', data)
    throw new HttpError(502, data.errorMessage ? `M-Pesa: ${data.errorMessage}` : 'M-Pesa could not send the payment prompt. Please check the number and try again.')
  }
  return data as Required<Pick<typeof data, 'CheckoutRequestID' | 'MerchantRequestID'>> & typeof data
}

export type StkQueryOutcome = 'completed' | 'cancelled' | 'failed' | 'pending'

/** Server-to-server confirmation of an STK transaction's final result. */
export async function stkQuery(checkoutRequestId: string): Promise<{ outcome: StkQueryOutcome; resultCode?: string; desc?: string }> {
  const ts = timestamp()
  const res = await fetch(`${BASE()}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ BusinessShortCode: env('MPESA_SHORTCODE'), Password: password(ts), Timestamp: ts, CheckoutRequestID: checkoutRequestId }),
  })
  const data = (await res.json().catch(() => ({}))) as { ResultCode?: string; ResultDesc?: string; errorCode?: string; errorMessage?: string }
  // While the customer is still being prompted Daraja returns an error such as 500.001.1001.
  if (data.errorCode || data.ResultCode === undefined) return { outcome: 'pending', desc: data.errorMessage }
  const code = String(data.ResultCode)
  if (code === '0') return { outcome: 'completed', resultCode: code, desc: data.ResultDesc }
  if (code === '1032') return { outcome: 'cancelled', resultCode: code, desc: data.ResultDesc }
  return { outcome: 'failed', resultCode: code, desc: data.ResultDesc }
}
