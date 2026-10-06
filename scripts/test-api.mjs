// Unit checks for the server-side payment helpers (no network: fetch is mocked).
//   node scripts/test-api.mjs
import { createServer } from 'vite'
import { createHmac } from 'node:crypto'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const load = (p) => vite.ssrLoadModule(p)
let failures = 0
const ok = (cond, label) => {
  console.log(`${cond ? '✔' : '✘'} ${label}`)
  if (!cond) failures++
}
const throws = (fn) => { try { fn(); return false } catch { return true } }

const v = await load('/api/_lib/validation.ts')
ok(v.normaliseMsisdn('0712 345 678') === '254712345678', 'msisdn: 07… → 2547…')
ok(v.normaliseMsisdn('+254 110 123456') === '254110123456', 'msisdn: +2541… accepted')
ok(v.normaliseMsisdn('712345678') === '254712345678', 'msisdn: 9-digit local accepted')
ok(throws(() => v.normaliseMsisdn('0812345678')), 'msisdn: non-Safaricom prefix rejected')
ok(throws(() => v.normaliseMsisdn('')), 'msisdn: empty rejected')

const good = { amount: 500, currency: 'KES', payment_method: 'mpesa', donor_name: 'Jane Doe', donor_email: 'jane@example.org', donor_phone: '0712345678' }
ok(v.parseDonation(good, 'mpesa').amount === 500, 'donation: valid request parses')
ok(throws(() => v.parseDonation({ ...good, amount: 5 }, 'mpesa')), 'donation: below KES minimum rejected')
ok(throws(() => v.parseDonation({ ...good, amount: -10 }, 'mpesa')), 'donation: negative rejected')
ok(throws(() => v.parseDonation({ ...good, donor_email: 'nope' }, 'mpesa')), 'donation: bad email rejected')
ok(throws(() => v.parseDonation(good, 'card')), 'donation: method mismatch rejected')
ok(v.donationInsert(v.parseDonation({ ...good, designation: 'general', project_id: '00000000-0000-4000-8000-000000000000' }, 'mpesa')).project_id === null, 'donation: project_id ignored unless designation is "project"')

const http = await load('/api/_lib/http.ts')
const refs = new Set(Array.from({ length: 500 }, () => http.newReference()))
ok([...refs].every((r) => /^GBM-[A-Z0-9]{8}$/.test(r)) && refs.size === 500, 'references: format GBM-XXXXXXXX and unique across 500')

process.env.PAYSTACK_SECRET_KEY = 'sk_test_unit'
const ps = await load('/api/_lib/paystack.ts')
const body = JSON.stringify({ event: 'charge.success', data: { reference: 'GBM-ABCDEFGH' } })
const sig = createHmac('sha512', 'sk_test_unit').update(body).digest('hex')
ok(ps.validSignature(body, sig), 'paystack: valid webhook signature accepted')
ok(!ps.validSignature(body, sig.replace(/.$/, '0')), 'paystack: tampered signature rejected')
ok(!ps.validSignature(body + ' ', sig), 'paystack: tampered body rejected')
ok(!ps.validSignature(body, undefined), 'paystack: missing signature rejected')
ok(ps.toSubunit(1500.5) === 150050, 'paystack: amount converted to subunits')

// Daraja STK query outcome mapping with mocked fetch
Object.assign(process.env, { MPESA_CONSUMER_KEY: 'k', MPESA_CONSUMER_SECRET: 's', MPESA_SHORTCODE: '174379', MPESA_PASSKEY: 'p' })
const mp = await load('/api/_lib/mpesa.ts')
const realFetch = globalThis.fetch
const mock = (queryResponse) => {
  globalThis.fetch = async (url) => {
    if (String(url).includes('/oauth/')) return new Response(JSON.stringify({ access_token: 't', expires_in: '3599' }))
    return new Response(JSON.stringify(queryResponse))
  }
}
mock({ ResultCode: '0', ResultDesc: 'The service request is processed successfully.' })
ok((await mp.stkQuery('ws_CO_1')).outcome === 'completed', 'daraja: ResultCode 0 → completed')
mock({ ResultCode: '1032', ResultDesc: 'Request cancelled by user' })
ok((await mp.stkQuery('ws_CO_1')).outcome === 'cancelled', 'daraja: 1032 → cancelled')
mock({ ResultCode: '1', ResultDesc: 'Insufficient balance' })
ok((await mp.stkQuery('ws_CO_1')).outcome === 'failed', 'daraja: other codes → failed')
mock({ errorCode: '500.001.1001', errorMessage: 'The transaction is being processed' })
ok((await mp.stkQuery('ws_CO_1')).outcome === 'pending', 'daraja: still processing → pending (never completed)')
mock({ ResponseCode: '1', errorMessage: 'Bad Request - Invalid PhoneNumber' })
let rejected = false
try { await mp.stkPush({ amount: 100, msisdn: '254712345678', reference: 'GBM-TEST', callbackUrl: 'https://x/cb' }) } catch { rejected = true }
ok(rejected, 'daraja: rejected STK push surfaces an error (no pending record left as success)')
globalThis.fetch = realFetch

await vite.close()
console.log(failures ? `\n${failures} check(s) failed` : '\nAll API helper checks passed')
process.exit(failures ? 1 : 0)
