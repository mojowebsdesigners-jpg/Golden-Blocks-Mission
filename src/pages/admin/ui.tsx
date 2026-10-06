import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ImagePlus, Loader2, Trash2, XCircle } from 'lucide-react'
import { uploadImage, type MediaFolder } from '@/services/admin'
import { cn, errorMessage } from '@/lib/utils'

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-serif text-3xl text-white md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <section className={cn('border border-white/10 bg-coal p-5 md:p-6', className)}>
      {title && <h2 className="field-label mb-5 text-champagne">{title}</h2>}
      {children}
    </section>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'gold' | 'green' | 'red' | 'silver' }) {
  const tones = {
    neutral: 'border-white/15 text-silver',
    gold: 'border-gold/40 bg-gold/10 text-gold-bright',
    green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    red: 'border-red-400/30 bg-red-400/10 text-red-300',
    silver: 'border-silver/30 bg-white/5 text-silver-light',
  }
  return <span className={cn('inline-flex items-center border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.16em]', tones[tone])}>{children}</span>
}

export function SmallButton({ children, onClick, tone = 'default', type = 'button', disabled, loading, className, title }: {
  children: ReactNode
  onClick?: () => void
  tone?: 'default' | 'gold' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={cn(
        'inline-flex items-center gap-2 border px-3 py-2 font-mono text-[0.64rem] uppercase tracking-[0.16em] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'gold' && 'border-gold bg-gold text-black hover:bg-gold-bright',
        tone === 'danger' && 'border-red-400/40 text-red-300 hover:bg-red-400/10',
        tone === 'default' && 'border-white/15 text-silver-light hover:border-white/40 hover:text-white',
        className,
      )}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  )
}

/** Two-step delete to prevent accidental data loss. */
export function ConfirmDelete({ onConfirm, label = 'Delete' }: { onConfirm: () => Promise<void> | void; label?: string }) {
  const [armed, setArmed] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!armed)
    return (
      <SmallButton tone="danger" onClick={() => setArmed(true)} title={label || "Delete"}>
        <Trash2 className="h-3.5 w-3.5" /> {label}
      </SmallButton>
    )
  return (
    <span className="inline-flex gap-1">
      <SmallButton
        tone="danger"
        loading={busy}
        onClick={async () => {
          setBusy(true)
          try {
            await onConfirm()
          } finally {
            setBusy(false)
            setArmed(false)
          }
        }}
      >
        Confirm
      </SmallButton>
      <SmallButton onClick={() => setArmed(false)}>Cancel</SmallButton>
    </span>
  )
}

export function ImageUpload({ folder, onUploaded, label = 'Upload image', multiple = false }: {
  folder: MediaFolder
  onUploaded: (r: { url: string; width: number; height: number; name: string }) => Promise<void> | void
  label?: string
  multiple?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const toast = useToast()
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    for (const [i, f] of Array.from(files).entries()) {
      setBusy(`Uploading ${i + 1} of ${files.length}…`)
      try {
        const r = await uploadImage(f, folder)
        await onUploaded({ ...r, name: f.name })
      } catch (e) {
        toast(errorMessage(e, 'Upload failed'), 'error')
      }
    }
    setBusy(null)
    if (input.current) input.current.value = ''
  }
  return (
    <>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={multiple} className="sr-only" onChange={(e) => onFiles(e.target.files)} aria-label={label} />
      <SmallButton onClick={() => input.current?.click()} loading={!!busy}>
        <ImagePlus className="h-3.5 w-3.5" /> {busy ?? label}
      </SmallButton>
    </>
  )
}

// ── Toasts ─────────────────────────────────────────────────────────────
type Toast = { id: number; msg: string; kind: 'success' | 'error' }
const ToastCtx = createContext<(msg: string, kind?: Toast['kind']) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((msg: string, kind: Toast['kind'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[90] flex w-[min(92vw,380px)] flex-col gap-2" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn('flex items-start gap-3 border bg-[#141414] p-4 text-sm shadow-xl', t.kind === 'success' ? 'border-gold/40 text-champagne' : 'border-red-400/40 text-red-200')}>
              {t.kind === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="border border-dashed border-white/15 p-10 text-center text-sm text-muted">{children}</div>
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const cols = Object.keys(rows[0])
  const esc = (v: unknown) => {
    const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
    // Prevent CSV formula injection when opened in spreadsheet software.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
    return `"${safe.replace(/"/g, '""')}"`
  }
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
