import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

export function formatDate(value: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', opts)
}

export function formatMoney(amount: number, currency = 'KES') {
  try {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.') {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return fallback
}

/** Use the 960px variant for bundled gallery images; leave uploaded (storage) URLs untouched. */
export function thumbOf(url: string | null | undefined, fallback = '/images/gallery/architecture-modernist-sanctuary.webp') {
  const u = url || fallback
  return u.startsWith('/images/gallery/') && u.endsWith('.webp') && !u.endsWith('-sm.webp') ? u.replace(/\.webp$/, '-sm.webp') : u
}
