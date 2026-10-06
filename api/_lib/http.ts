import type { VercelRequest, VercelResponse } from '@vercel/node'

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function allow(req: VercelRequest, ...methods: string[]) {
  if (!methods.includes(req.method ?? '')) throw new HttpError(405, 'Method not allowed')
}

/** Wraps a handler with uniform error handling and no-store caching. */
export function handler(fn: (req: VercelRequest, res: VercelResponse) => Promise<unknown>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Cache-Control', 'no-store')
    try {
      await fn(req, res)
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.status).json({ error: err.message })
      console.error('[api]', err)
      return res.status(500).json({ error: 'Something went wrong on our side. Please try again shortly.' })
    }
  }
}

export function env(name: string): string | undefined {
  const v = process.env[name]
  return v && v.trim() ? v.trim() : undefined
}

export function requireEnv(names: string[], feature: string) {
  const missing = names.filter((n) => !env(n))
  if (missing.length) {
    console.warn(`[api] ${feature} disabled — missing env: ${missing.join(', ')}`)
    throw new HttpError(503, `${feature} is not available yet. Please choose another payment method or contact us.`)
  }
}

export function siteUrl(req: VercelRequest) {
  const configured = env('SITE_URL') ?? env('VITE_SITE_URL')
  if (configured) return configured.replace(/\/$/, '')
  const host = req.headers['x-forwarded-host'] ?? req.headers.host
  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'https'
  return `${proto}://${host}`
}

/** Best-effort per-instance rate limit (serverless instances are short-lived). */
const hits = new Map<string, { n: number; t: number }>()
export function rateLimit(req: VercelRequest, key: string, max = 8, windowMs = 60_000) {
  const ip = ((req.headers['x-forwarded-for'] as string) ?? '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
  const id = `${key}:${ip}`
  const now = Date.now()
  const h = hits.get(id)
  if (!h || now - h.t > windowMs) hits.set(id, { n: 1, t: now })
  else if (++h.n > max) throw new HttpError(429, 'Too many requests. Please wait a moment and try again.')
}

/** Raw request body for signature verification, with a JSON fallback. */
export async function rawBody(req: VercelRequest): Promise<string> {
  if (typeof req.body === 'string') return req.body
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8')
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body)
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c)
  return Buffer.concat(chunks).toString('utf8')
}

export function newReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return 'GBM-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}
