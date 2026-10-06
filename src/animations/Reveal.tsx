import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

/** Fade-and-rise when the element enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = 'div',
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article' | 'span' | 'p' | 'figure' | 'header'
  once?: boolean
}) {
  const reduce = useReducedMotion()
  const Comp = motion[as] as typeof motion.div
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}

const wordVariants: Variants = {
  hidden: { y: '110%' },
  show: (i: number) => ({ y: '0%', transition: { duration: 1.05, ease: EASE, delay: i * 0.045 } }),
}

/**
 * Masked word-by-word reveal for headlines. Each word slides up from behind
 * an overflow mask. Screen readers receive the full string via aria-label.
 */
export function SplitReveal({
  text,
  as = 'h2',
  className,
  wordClassName,
  delay = 0,
  immediate = false,
}: {
  text: string
  as?: ElementType
  className?: string
  wordClassName?: (word: string, index: number) => string | undefined
  delay?: number
  immediate?: boolean
}) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  const offset = Math.round(delay / 0.045)
  const inner = (
    <motion.span
      aria-hidden
      className="inline"
      initial={reduce ? 'show' : 'hidden'}
      {...(immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } })}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span custom={i + offset} variants={wordVariants} className={cn('inline-block will-change-transform', wordClassName?.(w, i))}>
            {w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </motion.span>
  )
  return createElement(as, { className, 'aria-label': text }, inner)
}

const curtain: Variants = {
  hidden: { y: '100%' },
  show: { y: '0%', transition: { duration: 1.4, ease: EASE } },
}
// counter-moves the content so the image stays put while the curtain edge sweeps up over it
const curtainInner: Variants = {
  hidden: { y: '-100%' },
  show: { y: '0%', transition: { duration: 1.4, ease: EASE } },
}
const settle: Variants = {
  hidden: { scale: 1.18 },
  show: { scale: 1, transition: { duration: 1.8, ease: EASE } },
}

/**
 * Image reveal (curtain lifts upward). Animated with transforms only, so it runs on the
 * compositor instead of repainting every frame. The image is decoded ahead of time, when it is
 * still well below the fold, so its first paint does not stall scrolling.
 */
export function ImageReveal({ src, srcSet, alt, className, imgClassName, sizes, priority = false, width, height }: {
  src: string
  srcSet?: string
  alt: string
  className?: string
  imgClassName?: string
  sizes?: string
  priority?: boolean
  width?: number
  height?: number
}) {
  const reduce = useReducedMotion()
  const img = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = img.current
    if (!el || priority) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        el.loading = 'eager'
        el.decode?.().catch(() => {})
      },
      { rootMargin: '150% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [priority])

  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      <motion.div className="h-full w-full overflow-hidden" variants={curtain}>
        <motion.div className="h-full w-full" variants={curtainInner}>
          <motion.img
            ref={img}
            src={src}
            srcSet={srcSet}
            alt={alt}
            sizes={sizes}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={cn('h-full w-full object-cover', imgClassName)}
            variants={settle}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
