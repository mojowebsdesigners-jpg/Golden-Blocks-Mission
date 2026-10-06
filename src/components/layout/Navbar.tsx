import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { PRIMARY_NAV } from '@/data/site'
import { cn } from '@/lib/utils'
import { MenuOverlay } from './MenuOverlay'
import { usePastFirstSection } from '@/hooks/usePastFirstSection'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const visible = usePastFirstSection()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <a href="#main" className="sr-only z-[100] bg-gold px-4 py-2 text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,transform,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
          // Hidden over each page's opening section; revealed from the second section (or when focused by keyboard).
          !visible && !open && '-translate-y-full opacity-0 focus-within:translate-y-0 focus-within:opacity-100',
          // A near-opaque tint instead of a live backdrop blur: blurring the moving page (and the 3D hero)
          // behind a fixed header made the GPU re-blur every frame and stuttered scrolling.
          scrolled ? 'border-b border-white/[0.1] bg-night/[0.94] shadow-[0_1px_0_rgb(255_255_255/0.4)_inset]' : 'border-b border-transparent',
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <Link to="/" aria-label="Golden Blocks Mission — home" className="relative z-10 shrink-0">
            <Logo narrowMarkOnly />
          </Link>

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-6 2xl:gap-7">
              {PRIMARY_NAV.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-2 whitespace-nowrap py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-colors',
                        isActive ? 'text-gold-bright' : 'text-silver-light/80 hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={cn('h-[5px] w-[5px] rotate-45 bg-gold transition-all duration-500', isActive ? 'opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-60')} aria-hidden />
                        {l.label}
                        {isActive && <span className="sr-only">(current page)</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-2 sm:gap-3">
            <Link to="/donate" className={cn('btn-gold !py-[0.7rem] !pl-4 !pr-3 !text-[0.66rem]', pathname.startsWith('/donate') && 'ring-1 ring-gold-bright ring-offset-2 ring-offset-night')}>
              <span>Donate</span>
              <span className="btn-arrow !h-5 !w-5" aria-hidden>
                <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-menu"
              className="group flex h-11 items-center gap-3 border border-white/15 bg-black/55 px-3.5 transition-colors hover:border-gold/60 xl:border-transparent xl:bg-transparent xl:px-2"
            >
              <span className="hidden font-mono text-[0.66rem] uppercase tracking-[0.2em] text-silver-light sm:inline xl:hidden">Menu</span>
              <span className="flex w-6 flex-col items-end gap-[6px]" aria-hidden>
                <span className="h-px w-6 bg-white transition-all duration-500 group-hover:w-4" />
                <span className="h-px w-4 bg-gold-bright transition-all duration-500 group-hover:w-6" />
              </span>
            </button>
          </div>
        </div>
        {/* Keel-style hairline with crosshair marks while the header is transparent */}
        <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 transition-opacity duration-500', scrolled ? 'opacity-0' : 'opacity-100')} aria-hidden>
          <div className="container-x relative">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
          </div>
        </div>
      </header>
      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  )
}
