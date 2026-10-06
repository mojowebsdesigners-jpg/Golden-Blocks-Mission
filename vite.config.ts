import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Local emulation of Vercel serverless functions. In production Vercel serves
 * everything in /api directly; during `vite dev` this middleware resolves
 * /api/foo/bar to api/foo/bar.ts and invokes its default export with a
 * request/response shaped like @vercel/node's.
 */
function vercelApiDev(): Plugin {
  let server: ViteDevServer
  return {
    name: 'vercel-api-dev',
    configureServer(s) {
      server = s
      s.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        const url = new URL(req.url, 'http://localhost')
        const file = path.join(process.cwd(), url.pathname + '.ts')
        if (!fs.existsSync(file) || url.pathname.includes('/_lib/')) {
          res.statusCode = 404
          res.setHeader('content-type', 'application/json')
          return res.end(JSON.stringify({ error: 'Not found' }))
        }
        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(c as Buffer)
        const raw = Buffer.concat(chunks).toString('utf8')
        let body: unknown = raw
        if ((req.headers['content-type'] || '').includes('application/json') && raw) {
          try { body = JSON.parse(raw) } catch { body = raw }
        }
        const vreq = Object.assign(req, {
          query: Object.fromEntries(url.searchParams),
          body,
          cookies: {},
        })
        const vres = Object.assign(res, {
          status(code: number) { res.statusCode = code; return vres },
          json(data: unknown) {
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify(data))
            return vres
          },
          send(data: unknown) { res.end(typeof data === 'string' ? data : JSON.stringify(data)); return vres },
        })
        try {
          const mod = await server.ssrLoadModule(file)
          await mod.default(vreq, vres)
        } catch (err) {
          console.error('[api]', err)
          if (!res.headersSent) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Internal error' })) }
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Expose server-side secrets to the dev API middleware only (never to the client bundle).
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) if (!(k in process.env)) process.env[k] = v

  return {
    plugins: [react(), tailwindcss(), vercelApiDev()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              // React + scheduler first, so they are never captured by the 3D chunk (R3F shares scheduler).
              if (/[\/]node_modules[\/](react|react-dom|scheduler|react-router|react-router-dom)[\/]/.test(id)) return 'react'
              if (/three|@react-three|three-stdlib|troika|meshline|camera-controls|maath/.test(id)) return 'three'
              if (/gsap|lenis/.test(id)) return 'motion-gsap'
              if (/framer-motion|motion-dom|motion-utils/.test(id)) return 'framer'
              if (/@supabase/.test(id)) return 'supabase'
            }
          },
        },
      },
    },
  }
})
