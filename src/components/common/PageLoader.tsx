import { LogoMark } from './Logo'

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid min-h-[70vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <LogoMark className="h-10 w-10 animate-pulse" />
        <span className="eyebrow text-champagne/70">{label}…</span>
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="border border-[#d0705f]/30 bg-[#d0705f]/5 p-6 text-sm text-silver-light" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-gold-bright underline-offset-4 hover:underline">
          Try again
        </button>
      )}
    </div>
  )
}
