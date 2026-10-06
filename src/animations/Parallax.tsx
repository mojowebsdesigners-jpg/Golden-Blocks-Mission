import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/animations/gsap'
import { prefersReducedMotion } from '@/lib/device'
import { cn } from '@/lib/utils'

/** Scroll-scrubbed vertical drift for the child; the wrapper clips it. */
export function Parallax({ children, amount = 12, className, innerClassName }: {
  children: ReactNode
  amount?: number
  className?: string
  innerClassName?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion() || !wrap.current || !inner.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner.current,
        { yPercent: -amount / 2 },
        { yPercent: amount / 2, ease: 'none', scrollTrigger: { trigger: wrap.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    })
    return () => ctx.revert()
  }, [amount])
  return (
    <div ref={wrap} className={cn('relative overflow-hidden', className)}>
      <div ref={inner} className={cn('absolute inset-x-0 -inset-y-[8%]', innerClassName)}>
        {children}
      </div>
    </div>
  )
}
