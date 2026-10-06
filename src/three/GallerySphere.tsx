import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export interface SphereItem {
  id: string
  src: string
  aspect: number
}

const TMP = new THREE.Vector3()
const CAM_DIR = new THREE.Vector3()

function Tile({ item, position, onOpen, dragDistance }: {
  item: SphereItem
  position: THREE.Vector3
  onOpen: () => void
  dragDistance: React.MutableRefObject<number>
}) {
  const tex = useLoader(THREE.TextureLoader, item.src)
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const [hover, setHover] = useState(false)
  const { camera } = useThree()
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
  }, [tex])
  const w = item.aspect >= 1 ? 1.5 : 1.5 * item.aspect
  const h = item.aspect >= 1 ? 1.5 / item.aspect : 1.5

  useEffect(() => {
    mesh.current?.lookAt(position.clone().multiplyScalar(2))
  }, [position])

  useFrame((_, dt) => {
    const m = mesh.current
    if (!m || !mat.current) return
    // Dim tiles on the far side of the sphere for depth.
    m.getWorldPosition(TMP)
    camera.getWorldDirection(CAM_DIR)
    const facing = -TMP.normalize().dot(CAM_DIR)
    const light = THREE.MathUtils.clamp(0.18 + (facing + 1) * 0.5, 0.18, 1)
    mat.current.color.setScalar(THREE.MathUtils.lerp(mat.current.color.r, hover ? 1.15 : light, 1 - Math.pow(0.001, dt)))
    const s = THREE.MathUtils.lerp(m.scale.x, hover ? 1.12 : 1, 1 - Math.pow(0.001, dt))
    m.scale.setScalar(s)
  })

  return (
    <mesh
      ref={mesh}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (dragDistance.current < 6) onOpen()
      }}
    >
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial ref={mat} map={tex} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

/** Ethan Vale-inspired sphere of imagery: drag to rotate, click to open. */
export function GallerySphere({ items, onOpen }: { items: SphereItem[]; onOpen: (id: string) => void }) {
  const group = useRef<THREE.Group>(null)
  const { gl, size } = useThree()
  const vel = useRef({ x: 0.0012, y: 0.0006 })
  const drag = useRef<{ x: number; y: number } | null>(null)
  const dragDistance = useRef(0)
  const radius = size.width < 768 ? 3.6 : 4.4

  const positions = useMemo(() => {
    const n = items.length
    const golden = Math.PI * (3 - Math.sqrt(5))
    return items.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      return new THREE.Vector3(Math.cos(th) * r * radius, y * radius * 0.92, Math.sin(th) * r * radius)
    })
  }, [items, radius])

  useEffect(() => {
    const el = gl.domElement
    const down = (e: PointerEvent) => {
      drag.current = { x: e.clientX, y: e.clientY }
      dragDistance.current = 0
    }
    const move = (e: PointerEvent) => {
      if (!drag.current) return
      const dx = e.clientX - drag.current.x
      const dy = e.clientY - drag.current.y
      dragDistance.current += Math.abs(dx) + Math.abs(dy)
      vel.current.y = dx * 0.00028
      vel.current.x = dy * 0.00018
      if (group.current) {
        group.current.rotation.y += dx * 0.0045
        group.current.rotation.x = THREE.MathUtils.clamp(group.current.rotation.x + dy * 0.003, -0.6, 0.6)
      }
      drag.current = { x: e.clientX, y: e.clientY }
    }
    const up = () => (drag.current = null)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl])

  useFrame((_, dt) => {
    const g = group.current
    if (!g || drag.current) return
    g.rotation.y += vel.current.y * 60 * dt
    g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + vel.current.x * 60 * dt, -0.6, 0.6)
    // ease back to a gentle idle spin
    vel.current.y += (0.0012 - vel.current.y) * 0.02
    vel.current.x += (0 - vel.current.x) * 0.05
  })

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <Tile key={it.id} item={it} position={positions[i]} onOpen={() => onOpen(it.id)} dragDistance={dragDistance} />
      ))}
    </group>
  )
}
