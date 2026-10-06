import { Link, type LinkProps } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'gold' | 'dark'

function Inner({ children, arrow = true, loading }: { children: ReactNode; arrow?: boolean; loading?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        arrow && (
          <span className="btn-arrow" aria-hidden>
            <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
          </span>
        )
      )}
    </>
  )
}

export function ButtonLink({ variant = 'gold', arrow = true, className, children, ...rest }: LinkProps & { variant?: Variant; arrow?: boolean }) {
  return (
    <Link className={cn(variant === 'gold' ? 'btn-gold' : 'btn-dark', className)} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  )
}

export function Button({ variant = 'gold', arrow = true, loading = false, className, children, disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; arrow?: boolean; loading?: boolean }) {
  return (
    <button
      className={cn(variant === 'gold' ? 'btn-gold' : 'btn-dark', 'disabled:cursor-not-allowed disabled:opacity-60', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Inner arrow={arrow} loading={loading}>{children}</Inner>
    </button>
  )
}
