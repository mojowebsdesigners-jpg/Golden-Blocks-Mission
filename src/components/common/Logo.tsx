import { cn } from '@/lib/utils'

/**
 * Brand mark: the four golden blocks (the gaps between them form a cross) with the gold orbit ring.
 * Generated from the approved logo by logos/hd/src/reference.mjs → public/images/brand/gbm-mark.svg.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/images/brand/gbm-mark.svg"
      alt=""
      aria-hidden="true"
      width={656}
      height={570}
      decoding="async"
      draggable={false}
      className={cn('h-9 w-auto object-contain', className)}
    />
  )
}

/** Mark + wordmark, laid out like the approved logo: name on one line, the field and the church beneath. */
/** `narrowMarkOnly`: below 430px show just the mark (used in the header so Donate and Menu keep their room). */
export function Logo({ className, compact = false, narrowMarkOnly = false }: { className?: string; compact?: boolean; narrowMarkOnly?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <LogoMark className="h-10" />
      {!compact && (
        <span className={cn('flex-col leading-none', narrowMarkOnly ? 'hidden min-[430px]:flex' : 'flex')}>
          <span className="font-sans text-[0.95rem] font-extrabold uppercase tracking-[0.04em] text-white">Golden Blocks Mission</span>
          <span className="mt-1.5 font-sans text-[0.5rem] font-semibold uppercase tracking-[0.28em] text-silver-light/80">North East Kenya Field</span>
          <span className="mt-1 font-sans text-[0.46rem] font-semibold uppercase tracking-[0.24em] text-silver-light/65">Seventh-day Adventist Church</span>
        </span>
      )}
    </span>
  )
}
