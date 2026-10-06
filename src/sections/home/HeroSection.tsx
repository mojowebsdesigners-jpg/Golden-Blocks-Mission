import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PixelDissolve } from '@/animations/PixelDissolve'
import { gsap } from '@/animations/gsap'
import { SceneCanvas } from '@/three/SceneCanvas'
import { NameScene } from '@/three/NameScene'
import { isLowPowerDevice, prefersReducedMotion } from '@/lib/device'

function StaticName() {
  return (
    <div className="absolute inset-0 grid place-items-center px-6 text-center">
      <p aria-hidden className="font-sans font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">
        <span className="text-gold-metal block text-[clamp(3rem,11vw,10rem)]">Golden Blocks</span>
        <span className="text-silver-metal mt-3 block text-[clamp(1.8rem,6vw,5.5rem)]">Mission</span>
      </p>
    </div>
  )
}

/** Homepage opening: nothing but the name, Bruno Simon-style. */
export function HeroSection() {
  const exit = useRef(0)
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [lowPower] = useState(isLowPowerDevice)
  const [reduced] = useState(prefersReducedMotion)

  useEffect(() => {
    const onScroll = () => (exit.current = window.scrollY / window.innerHeight)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // As the reader leaves, the scene drifts up, eases back and dims, so the next section
  // rises over it instead of cutting in. Transform/opacity only: stays on the compositor.
  useEffect(() => {
    if (reduced || !section.current || !stage.current) return
    const ctx = gsap.context(() => {
      gsap.to(stage.current, {
        yPercent: 18,
        scale: 0.94,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    })
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={section} id="calling" aria-label="Golden Blocks Mission" className="theme-dark relative h-[100svh] min-h-[560px] overflow-hidden bg-night">
      <h1 className="sr-only">Golden Blocks Mission</h1>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,#4a4536_0%,#34373c_42%,#26282c_82%)]" aria-hidden />
      <div ref={stage} className="absolute inset-0 origin-[50%_35%] will-change-transform">
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
          <SceneCanvas className="touch-pan-y" fallback={<StaticName />} camera={{ position: [0, 9, 12], fov: 35 }} shadows>
            <NameScene lowPower={lowPower} reduced={reduced} />
          </SceneCanvas>
        </motion.div>
      </div>
      {!reduced && <PixelDissolve progress={exit} from={0.3} to={0.95} cell={18} color="#d7d9dc" />}
    </section>
  )
}
