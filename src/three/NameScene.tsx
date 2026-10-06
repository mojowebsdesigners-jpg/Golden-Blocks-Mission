import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import fontJson from './gbm-letters.typeface.json'
import { StudioEnvironment } from './StudioEnvironment'
import { createGold, createSilver, getGlowTexture } from './materials'

/**
 * Bruno Simon-style name: chunky extruded letters that drop from the sky one
 * by one, bounce onto the floor, cast shadows and can be knocked about by
 * the pointer (or a tap) before springing back home. A tiny hand-rolled
 * physics step keeps this light — no physics engine required.
 */

interface Letter {
  geom: THREE.BufferGeometry
  material: THREE.Material
  home: THREE.Vector3
  size: number
  delay: number
  p: THREE.Vector3
  v: THREE.Vector3
  tilt: THREE.Vector2 // rotation about x / z
  tv: THREE.Vector2
  yaw: number
  yv: number
}

const GRAVITY = 26
const font = new FontLoader().parse(fontJson as never)

function layout(narrow: boolean) {
  return narrow
    ? [
        { text: 'GOLDEN', size: 1, mat: 'gold' as const },
        { text: 'BLOCKS', size: 1, mat: 'goldWarm' as const },
        { text: 'MISSION', size: 0.62, mat: 'silver' as const },
      ]
    : [
        { text: 'GOLDEN BLOCKS', size: 1, mat: 'gold' as const },
        { text: 'MISSION', size: 0.6, mat: 'silver' as const },
      ]
}

function buildLetters(narrow: boolean, reduced: boolean) {
  // Slightly below full metalness so the key light warms the faces (pure metal mirrors the dark room).
  const tune = <T extends THREE.MeshPhysicalMaterial>(m: T, metal: number, rough: number) => Object.assign(m, { metalness: metal, roughness: rough })
  const mats = {
    gold: tune(createGold('champagne'), 0.82, 0.26),
    goldWarm: tune(createGold('warm'), 0.82, 0.28),
    silver: tune(createSilver('polished'), 0.8, 0.22),
  }
  const lines = layout(narrow)
  const res = (font.data as { resolution: number }).resolution
  const glyphs = (font.data as { glyphs: Record<string, { ha: number }> }).glyphs
  const letters: Letter[] = []
  let z = 0
  const zs: number[] = []
  lines.forEach((line, li) => {
    if (li > 0) z += lines[li - 1].size * 1.3 + line.size * 0.9
    zs.push(z)
  })
  const zCenter = z / 2
  let order = 0
  let maxWidth = 0
  lines.forEach((line, li) => {
    const scale = line.size / res
    const chars = [...line.text]
    const advances = chars.map((c) => (glyphs[c]?.ha ?? 0) * scale + line.size * 0.06)
    const width = advances.reduce((a, b) => a + b, 0)
    maxWidth = Math.max(maxWidth, width)
    let cursor = -width / 2
    chars.forEach((c, ci) => {
      if (c !== ' ') {
        const depth = line.size * 0.42
        const g = new TextGeometry(c, {
          font,
          size: line.size,
          depth,
          curveSegments: 6,
          bevelEnabled: true,
          bevelThickness: line.size * 0.035,
          bevelSize: line.size * 0.028,
          bevelSegments: 3,
        })
        g.computeBoundingBox()
        const bb = g.boundingBox!
        const cx = (bb.min.x + bb.max.x) / 2
        g.translate(-cx, -bb.min.y, -depth / 2)
        g.computeVertexNormals()
        const home = new THREE.Vector3(cursor + cx, 0, zs[li] - zCenter)
        letters.push({
          geom: g,
          material: mats[line.mat],
          home,
          size: line.size,
          delay: reduced ? 0 : 0.35 + order * 0.085,
          p: reduced ? home.clone() : new THREE.Vector3(home.x + (Math.random() - 0.5) * 0.6, 7 + Math.random() * 3, home.z + (Math.random() - 0.5) * 0.6),
          v: new THREE.Vector3(),
          tilt: reduced ? new THREE.Vector2() : new THREE.Vector2((Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2),
          tv: new THREE.Vector2(),
          yaw: reduced ? 0 : (Math.random() - 0.5) * 0.8,
          yv: 0,
        })
        order++
      }
      cursor += advances[ci]
    })
  })
  return { letters, maxWidth, zExtent: z + 1 }
}

function LetterMesh({ l, onKick }: { l: Letter; onKick: (l: Letter) => void }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const m = ref.current
    if (!m) return
    m.position.copy(l.p)
    m.rotation.set(l.tilt.x, l.yaw, l.tilt.y)
  })
  return (
    <mesh
      ref={ref}
      geometry={l.geom}
      material={l.material}
      castShadow
      position={l.p}
      onPointerDown={(e) => {
        e.stopPropagation()
        onKick(l)
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    />
  )
}

export function NameScene({ lowPower, reduced }: { lowPower: boolean; reduced: boolean }) {
  const { size, camera, gl, raycaster } = useThree()
  const narrow = size.width / size.height < 0.9
  const { letters, maxWidth, zExtent } = useMemo(() => buildLetters(narrow, reduced), [narrow, reduced])
  const clock = useRef(0)
  const pointer = useRef({ active: false, ndc: new THREE.Vector2(), floor: new THREE.Vector3(), prev: new THREE.Vector3(), speed: 0 })
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const look = useMemo(() => new THREE.Vector3(0, 0.45, 0), [])

  useEffect(() => () => letters.forEach((l) => l.geom.dispose()), [letters])

  // Track the pointer only while it is over the canvas (touch: while pressed).
  useEffect(() => {
    const el = gl.domElement
    const set = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      pointer.current.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') pointer.current.active = true
      set(e)
    }
    const down = (e: PointerEvent) => {
      pointer.current.active = true
      set(e)
    }
    const off = (e: PointerEvent) => {
      if (e.type === 'pointerleave' || e.pointerType !== 'mouse') pointer.current.active = false
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerup', off)
    el.addEventListener('pointercancel', off)
    el.addEventListener('pointerleave', off)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointerup', off)
      el.removeEventListener('pointercancel', off)
      el.removeEventListener('pointerleave', off)
    }
  }, [gl])

  const kick = (l: Letter) => {
    if (l.p.y > 0.05) return
    l.v.y = 7 + Math.random() * 3
    l.v.x += (Math.random() - 0.5) * 2
    l.tv.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14)
    l.yv = (Math.random() - 0.5) * 10
  }

  useFrame((state, rawDt) => {
    const frameDt = Math.min(rawDt, 0.1)
    clock.current += frameDt
    const t = clock.current
    const dt = frameDt

    // Fit the whole name in view, from a raised Bruno-style angle.
    const aspect = size.width / size.height
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180
    // On tall phone screens the near edges of the letters render wider (perspective), so leave more room.
    const halfW = maxWidth / 2 / (narrow ? 0.7 : 0.82)
    const distW = halfW / (Math.tan(fov / 2) * aspect)
    const elev = 0.86
    const distH = ((zExtent * Math.sin(elev) + 1.3) / 2 / 0.62) / Math.tan(fov / 2)
    const dist = Math.max(distW, distH, 7)
    const px = state.pointer.x * 0.35
    const target = new THREE.Vector3(px, Math.sin(elev) * dist + 0.45, Math.cos(elev) * dist)
    camera.position.lerp(target, reduced ? 1 : 1 - Math.pow(0.02, dt))
    camera.lookAt(look)

    // Pointer → point on the floor
    const ptr = pointer.current
    raycaster.setFromCamera(ptr.ndc, camera)
    ptr.prev.copy(ptr.floor)
    raycaster.ray.intersectPlane(plane, ptr.floor)
    ptr.speed = THREE.MathUtils.lerp(ptr.speed, ptr.prev.distanceTo(ptr.floor) / Math.max(dt, 1e-3), 0.3)

    let remaining = frameDt
    while (remaining > 1e-4) {
      const h = Math.min(remaining, 1 / 60)
      remaining -= h
      step(h, t)
    }
  })

  const step = (dt: number, t: number) => {
    const ptr = pointer.current
    for (const l of letters) {
      if (t < l.delay) continue
      const grounded = l.p.y <= 0.001

      // gravity + floor bounce
      l.v.y -= GRAVITY * dt
      // horizontal spring home (Bruno's letters settle back into the name)
      const k = grounded ? 5 : 1.2
      l.v.x += ((l.home.x - l.p.x) * k - l.v.x * 3.2) * dt
      l.v.z += ((l.home.z - l.p.z) * k - l.v.z * 3.2) * dt

      // pointer push
      if (ptr.active) {
        const dx = l.p.x - ptr.floor.x
        const dz = l.p.z - ptr.floor.z
        const d = Math.hypot(dx, dz) || 1e-3
        const R = 0.95 * l.size
        if (d < R) {
          const f = (R - d) / R
          const nx = dx / d
          const nz = dz / d
          const power = 34 + Math.min(ptr.speed, 30) * 1.6
          l.v.x += nx * f * power * dt
          l.v.z += nz * f * power * dt
          if (grounded) l.v.y += f * 9 * dt * 10 * 0.2
          l.tv.x += nz * f * 18 * dt * 3
          l.tv.y -= nx * f * 18 * dt * 3
          l.yv += (Math.random() - 0.5) * f * 6 * dt * 10
        }
      }

      l.p.addScaledVector(l.v, dt)
      if (l.p.y < 0) {
        l.p.y = 0
        if (l.v.y < -1.8) {
          // landing impact: bounce, lose some sliding speed, wobble
          l.v.y = -l.v.y * 0.34
          l.v.x *= 0.8
          l.v.z *= 0.8
          l.tv.x += (Math.random() - 0.5) * 3
          l.tv.y += (Math.random() - 0.5) * 3
        } else l.v.y = 0
      }

      // tilt and yaw spring back upright
      l.tv.x += (-l.tilt.x * 38 - l.tv.x * 6) * dt
      l.tv.y += (-l.tilt.y * 38 - l.tv.y * 6) * dt
      l.tilt.addScaledVector(l.tv, dt)
      l.yv += (-l.yaw * 14 - l.yv * 4.5) * dt
      l.yaw += l.yv * dt
    }
  }

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[-3.5, 5.5, 8]}
        intensity={2.1}
        color="#fff1d6"
        castShadow={!lowPower}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#d9e2ff" />
      <StudioEnvironment resolution={lowPower ? 128 : 256} />

      {letters.map((l, i) => (
        <LetterMesh key={i} l={l} onKick={kick} />
      ))}

      {/* floor: shadow catcher + warm pool of light */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial transparent opacity={0.7} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <planeGeometry args={[maxWidth * 2.2, maxWidth * 1.6]} />
        <meshBasicMaterial map={getGlowTexture()} color="#d8b25a" transparent opacity={0.42} depthWrite={false} toneMapped={false} />
      </mesh>
      {lowPower && <ContactShadows position={[0, 0.001, 0]} scale={maxWidth * 1.6} blur={2.2} opacity={0.7} far={3} resolution={512} />}
    </>
  )
}
