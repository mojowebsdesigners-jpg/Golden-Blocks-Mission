import { env, handler } from './_lib/http.js'
import { MPESA_ENV_VARS } from './_lib/mpesa.js'
import { PAYSTACK_ENV_VARS } from './_lib/paystack.js'

/** GET /api/health — which integrations are configured (booleans only, no values). */
export default handler(async (_req, res) => {
  const has = (names: string[]) => names.every((n) => Boolean(env(n)))
  res.status(200).json({
    ok: true,
    supabase: has(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']),
    mpesa: has(MPESA_ENV_VARS),
    mpesa_env: env('MPESA_ENV') === 'production' ? 'production' : 'sandbox',
    paystack: has(PAYSTACK_ENV_VARS),
    email: has(['RESEND_API_KEY', 'EMAIL_FROM']),
  })
})
