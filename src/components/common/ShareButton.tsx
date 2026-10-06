import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Native share sheet where available, otherwise copies the link. */
export function ShareButton({ title, text, url, label = 'Share', className }: { title: string; text?: string; url?: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const href = url ?? window.location.href
    try {
      if (navigator.share) return await navigator.share({ title, text, url: href })
      await navigator.clipboard.writeText(href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // The reader closed the share sheet, or the clipboard was blocked.
    }
  }

  return (
    <button type="button" onClick={share} className={cn('btn-dark', className)}>
      <span>{copied ? 'Link copied' : label}</span>
      <span className="btn-arrow" aria-hidden>
        {copied ? <Check className="h-3 w-3" strokeWidth={1.75} /> : <Share2 className="h-3 w-3" strokeWidth={1.75} />}
      </span>
    </button>
  )
}
