import type { SiteSettings } from '@/types'

const PATHS: Record<string, string> = {
  facebook: 'M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v9h4v-9h3l1-4h-4V9c0-.6.4-1 1-1z',
  instagram: 'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a4 4 0 100 8 4 4 0 000-8zm5.5-1.5a1 1 0 100 2 1 1 0 000-2z',
  youtube: 'M22 8.2a3 3 0 00-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 002 8.2 31 31 0 001.6 12 31 31 0 002 15.8a3 3 0 002.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 002.1-2.1 31 31 0 00.4-3.8 31 31 0 00-.4-3.8zM10 15V9l5.2 3L10 15z',
  x: 'M17.7 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L1.8 3h6.4l4.4 5.9L17.7 3zm-1.1 16.2h1.7L7.5 4.7H5.7l10.9 14.5z',
  tiktok: 'M16.5 3c.4 2.2 1.8 3.7 4 4v3.2c-1.5 0-2.9-.4-4-1.1v6.4a5.6 5.6 0 11-5.6-5.6c.3 0 .6 0 .9.1v3.3a2.4 2.4 0 10 1.7 2.2V3h3z',
  linkedin: 'M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9.5h4V21H3V9.5zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5z',
}
const LABELS: Record<string, string> = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', x: 'X (Twitter)', tiktok: 'TikTok', linkedin: 'LinkedIn' }

export function SocialIcons({ socials, className }: { socials: SiteSettings['socials']; className?: string }) {
  const entries = Object.entries(socials || {}).filter(([k, v]) => v && PATHS[k])
  if (!entries.length) return <p className="text-sm italic text-muted/80">[Social media links — to be confirmed]</p>
  return (
    <ul className={className ?? 'flex gap-3'}>
      {entries.map(([k, v]) => (
        <li key={k}>
          <a href={v} target="_blank" rel="noopener noreferrer" aria-label={LABELS[k]} className="grid h-10 w-10 place-items-center border border-white/15 text-silver transition-colors hover:border-gold hover:text-gold-bright">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d={PATHS[k]} /></svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
