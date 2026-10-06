import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, type CanvasProps } from '@react-three/fiber'
import * as THREE from 'three'
import { hasWebGL, isLowPowerDevice } from '@/lib/device'
import { cn } from '@/lib/utils'

class GLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn('[3D] scene disabled:', err)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * Performance-aware R3F canvas:
 *  - mounts only when the section approaches the viewport,
 *  - stops rendering (frameloop "never") while offscreen,
 *  - caps DPR on low-power devices,
 *  - renders `fallback` if WebGL is unavailable or the scene throws.
 */
export function SceneCanvas({
  children,
  fallback,
  className,
  camera,
  shadows = false,
  ...rest
}: {
  children: ReactNode
  fallback: ReactNode
  className?: string
  camera?: CanvasProps['camera']
  shadows?: boolean
} & Omit<CanvasProps, 'children' | 'camera'>) {
  const host = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [supported] = useState(() => hasWebGL())
  const lowPower = isLowPowerDevice()

  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
        if (entry.isIntersecting) setMounted(true)
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={host} className={cn('absolute inset-0', className)}>
      {!supported ? (
        fallback
      ) : (
        mounted && (
          <GLBoundary fallback={fallback}>
            <Suspense fallback={null}>
              <Canvas
                frameloop={visible ? 'always' : 'never'}
                dpr={lowPower ? [1, 1.25] : [1, 1.75]}
                shadows={shadows && !lowPower}
                camera={camera}
                gl={{ antialias: !lowPower, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
                // Don't re-measure the canvas on every scroll event: that forces a layout read each
                // frame while GSAP/Lenis are writing, and if a parent is CSS-transformed the measured
                // size changes and the renderer reallocates its buffers (a ~300 ms hitch). Pointer
                // events use offsetX/Y relative to the canvas, so scroll offsets aren't needed.
                resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
                {...rest}
              >
                {children}
              </Canvas>
            </Suspense>
          </GLBoundary>
        )
      )}
    </div>
  )
}
