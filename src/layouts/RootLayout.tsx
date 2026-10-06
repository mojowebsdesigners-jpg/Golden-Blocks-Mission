import { Suspense, useEffect, useLayoutEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useLenis } from '@/components/layout/SmoothScroll'
import { ScrollTrigger } from '@/animations/gsap'
import { PageLoader } from '@/components/common/PageLoader'

/** Public site chrome with cinematic page transitions. */
export function RootLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const lenis = useLenis()
  const reduce = useReducedMotion()

  // Jump to top on route change (or to a hash target once the page mounts).
  useLayoutEffect(() => {
    if (location.hash) return
    lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0)
  }, [location.pathname, location.hash, lenis])

  useEffect(() => {
    if (!location.hash) return
    const t = setTimeout(() => {
      const el = document.querySelector(location.hash)
      if (!el) return
      lenis ? lenis.scrollTo(el as HTMLElement, { offset: -80 }) : el.scrollIntoView()
    }, 450)
    return () => clearTimeout(t)
  }, [location.hash, location.pathname, lenis])

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait" onExitComplete={() => ScrollTrigger.refresh()}>
        <motion.main
          id="main"
          key={location.pathname}
          tabIndex={-1}
          className="relative outline-none"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] } }}
        >
          <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  )
}
