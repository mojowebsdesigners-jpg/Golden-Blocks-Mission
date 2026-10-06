import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * True once the reader has scrolled past the current page's first section
 * (its opening hero). Pinned sections are measured by their pin spacer, and
 * pages whose only section is very long fall back to one viewport height.
 */
export function usePastFirstSection() {
  const { pathname } = useLocation()
  const [past, setPast] = useState(false)

  useEffect(() => {
    let raf = 0
    const check = () => {
      const section = document.querySelector('#main section')
      if (!section) return setPast(window.scrollY > window.innerHeight * 0.85)
      const host = (section.closest('.pin-spacer') as HTMLElement | null) ?? section
      const rect = host.getBoundingClientRect()
      const veryTall = host === section && rect.height > window.innerHeight * 1.6
      setPast(veryTall ? window.scrollY > window.innerHeight * 0.85 : rect.bottom < 80)
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(check)
    }
    setPast(false)
    // Re-check after the page transition swaps the content in.
    const timers = [60, 700, 1500].map((ms) => window.setTimeout(check, ms))
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [pathname])

  return past
}
