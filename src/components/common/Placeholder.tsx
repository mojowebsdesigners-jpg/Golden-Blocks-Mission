import { cn } from '@/lib/utils'

/** Clearly identified placeholder for organisation details not yet supplied. */
export function Placeholder({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn('italic text-muted/80', className)} title="Placeholder — update in Admin → Settings">
      [{label} — to be confirmed]
    </span>
  )
}
