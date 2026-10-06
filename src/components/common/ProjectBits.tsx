import { CATEGORY_LABEL, STATUS_LABEL } from '@/data/site'
import type { ProjectStatus } from '@/types'
import { cn } from '@/lib/utils'

export function StatusChip({ status, className }: { status: ProjectStatus; className?: string }) {
  const tone =
    status === 'completed' ? 'border-silver/40 bg-black/75 text-silver-light' :
    status === 'ongoing' ? 'border-gold/60 bg-black/75 text-gold-bright' :
    'border-white/25 bg-black/75 text-silver-light'
  return (
    <span className={cn('theme-dark inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.22em]', tone, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', status === 'ongoing' ? 'animate-pulse bg-gold-bright' : status === 'completed' ? 'bg-silver-light' : 'bg-silver/60')} />
      {STATUS_LABEL[status]}
    </span>
  )
}

export function CategoryLabel({ category }: { category: string }) {
  return <span className="eyebrow text-[0.6rem] text-champagne/80">{CATEGORY_LABEL[category] ?? category}</span>
}

/** Visible marker for sample content that must be replaced by real data. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn('theme-dark inline-flex items-center border border-dashed border-champagne/60 bg-black/60 px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-champagne', className)}
      title="Demonstration content — replace from the admin dashboard"
    >
      Demonstration
    </span>
  )
}
