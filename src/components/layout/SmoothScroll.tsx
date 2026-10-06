import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/animations/gsap'
import { prefersReducedMotion } from '@/lib/device'

const LenisContext = createContext<Lenis | null>(null)
export const useLenis = () => useContext(LenisContext)

/**
 * Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger scrubs stay
 * perfectly in sync. Disabled entirely for users who prefer reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const rafRef = useRef<((t: number) => void) | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    // lerp mode: each frame glides a fixed fraction toward the target, so consecutive wheel
    // notches blend into one continuous motion instead of restarting a fixed-length tween.
    const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true })
    instance.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => instance.raf(time * 1000)
    rafRef.current = raf
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    setLenis(instance)
    return () => {
      gsap.ticker.remove(raf)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
