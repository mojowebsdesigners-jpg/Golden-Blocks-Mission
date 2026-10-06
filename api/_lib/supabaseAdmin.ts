import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, requireEnv } from './http.js'

let client: SupabaseClient | null = null

/**
 * Service-role client. SERVER ONLY — bypasses RLS, so it is used exclusively
 * for writing donation records and payment status from trusted code paths.
 */
export function supabaseAdmin(): SupabaseClient {
  if (client) return client
  requireEnv(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'], 'Online giving')
  client = createClient(env('SUPABASE_URL')!, env('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

export interface DonationRow {
  id: string
  donor_name: string | null
  donor_email: string | null
  donor_phone: string | null
  amount: number
  currency: string
  frequency: 'one_time' | 'monthly'
  designation: string
  payment_method: 'mpesa' | 'card' | 'bank_transfer'
  payment_reference: string | null
  provider_reference: string | null
  checkout_request_id: string | null
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'pledged'
  status_token: string
  confirmation_sent_at: string | null
  created_at: string
}
