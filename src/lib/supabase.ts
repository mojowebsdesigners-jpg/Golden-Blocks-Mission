import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when the public Supabase credentials are present. */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Browser client. Uses ONLY the public anon key — every read/write is
 * enforced by Row Level Security in the database. The service-role key
 * lives exclusively in the serverless functions under /api.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

export class BackendNotConfiguredError extends Error {
  constructor() {
    super('The website backend is not connected yet. Please try again later or contact us directly.')
    this.name = 'BackendNotConfiguredError'
  }
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new BackendNotConfiguredError()
  return supabase
}

export const MEDIA_BUCKET = 'media'
