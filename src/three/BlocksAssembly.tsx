import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { RoundedBoxGeometry } from 'three-stdlib'
import * as THREE from 'three'
import { StudioEnvironment } from './StudioEnvironment'
import { createGold, createSilver, getGlowTexture } from './materials'

type MatKey = 'silver' | 'champagne' | 'warm' | 'bright' | 'polished'
interface Target {
  pos: THREE.Vector3
  quat: THREE.Quaternion
  scale: THREE.Vector3
  mat: MatKey
}

const U = 0.74 // course module (block length + joint)
const H = 0.36 // course height
const ROWS = 6
const NW = 5 // blocks across the gable ends
const NL = 9 // blocks along the nave
const W = NW * U
const L = NL * U

const Y_AXIS = new THREE.Vector3(0, 1, 0)
const Z_AXIS = new THREE.Vector3(0, 0, 1)

/** Procedurally lays out a modern church, course by course. */
function buildChurch(): { targets: Target[]; keystone: Target } {
  const t: Target[] = []
  const add = (x: number, y: number, z: number, sx: number, sy: number, sz: number, mat: MatKey, rotY = 0, rotZ = 0) => {
    const q = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, rotY)
    if (rotZ) q.multiply(new THREE.Quaternion().setFromAxisAngle(Z_AXIS, rotZ))
    t.push({ pos: new THREE.Vector3(x, y, z), quat: q, scale: new THREE.Vector3(sx, sy, sz), mat })
  }
  const block = [U - 0.05, H - 0.04, 0.34] as const
  let keystone: Target | null = null

  for (let r = 0; r < ROWS; r++) {
    const y = H / 2 + r * H
    const off = r % 2 ? U / 2 : 0
    const mat: MatKey = r < 3 ? 'silver' : 'champagne'
    // side walls (long axis along z), with clerestory window openings
    for (let i = 0; i < NL; i++) {
      const z = -L / 2 + U / 2 + i * U + off - (r % 2 ? U / 4 : 0)
      if (z > L / 2 - 0.2) continue
      const isWindow = (r === 2 || r === 3) && i % 2 === 1 && i > 0 && i < NL - 1
      if (isWindow) continue
      for (const s of [-1, 1]) add(s * (W / 2), y, z, block[0], block[1], block[2], mat, Math.PI / 2)
    }
    // gable walls (long axis along x), front has a door
    for (let i = 0; i < NW; i++) {
      const x = -W / 2 + U / 2 + i * U + (r % 2 ? -U / 4 : 0) + off / 2
      if (x > W / 2 - 0.2) continue
      for (const s of [-1, 1]) {
        const isDoor = s === 1 && r < 3 && Math.abs(x) < U * 0.6
        if (isDoor) continue
        if (!keystone && s === 1 && r === 0 && x < 0 && Math.abs(x) < U * 1.6) {
          keystone = { pos: new THREE.Vector3(x, y, s * (L / 2)), quat: new THREE.Quaternion(), scale: new THREE.Vector3(...block), mat: 'bright' }
          continue
        }
        add(x, y, s * (L / 2), block[0], block[1], block[2], mat)
      }
    }
  }

  const wallTop = ROWS * H
  // gable infill triangles
  for (let k = 0; k < 4; k++) {
    const half = W / 2 - (k + 1) * 0.46
    const n = Math.max(1, Math.round((half * 2) / U))
    for (let i = 0; i < n; i++) {
      const x = -half + (half * 2) * ((i + 0.5) / n)
      for (const s of [-1, 1]) add(x, wallTop + H / 2 + k * H, s * (L / 2), (half * 2) / n - 0.05, H - 0.04, 0.34, 'champagne')
    }
  }
  // pitched roof: courses of tilted blocks on both slopes
  const dx = 0.6
  const dy = 0.42
  const angle = Math.atan2(dy, dx)
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < NL + 1; i++) {
      const z = -L / 2 - 0.2 + i * ((L + 0.4) / NL)
      for (const s of [-1, 1]) {
        add(s * (W / 2 + 0.22 - j * dx), wallTop + 0.12 + j * dy, z, 0.72, 0.12, (L + 0.4) / NL - 0.04, 'warm', 0, -s * angle)
      }
    }
  }
  // ridge
  for (let i = 0; i < NL + 1; i++) {
    const z = -L / 2 - 0.2 + i * ((L + 0.4) / NL)
    add(0, wallTop + 0.12 + 4 * dy - 0.06, z, 0.3, 0.16, (L + 0.4) / NL - 0.04, 'bright')
  }

  // bell tower at the front-left corner
  const tx = W / 2 + 0.62
  const tz = L / 2 - 0.55
  const TS = 0.5
  for (let r = 0; r < 14; r++) {
    for (const [ox, oz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const open = r >= 10 && r <= 11 && oz === 1 && ox === -1 // belfry opening
      if (open) continue
      add(tx + (ox * TS) / 2, H / 2 + r * H, tz + (oz * TS) / 2, TS - 0.04, H - 0.04, TS - 0.04, r < 10 ? 'polished' : 'champagne')
    }
  }
  const towerTop = 14 * H
  add(tx, towerTop + 0.12, tz, 1.08, 0.2, 1.08, 'warm')
  add(tx, towerTop + 0.38, tz, 0.72, 0.3, 0.72, 'champagne')
  add(tx, towerTop + 0.68, tz, 0.42, 0.3, 0.42, 'warm')
  // cross
  const cy = towerTop + 0.83
  for (let k = 0; k < 4; k++) add(tx, cy + 0.12 + k * 0.2, tz, 0.12, 0.18, 0.12, 'bright')
  add(tx - 0.17, cy + 0.62, tz, 0.2, 0.12, 0.12, 'bright')
  add(tx + 0.17, cy + 0.62, tz, 0.2, 0.12, 0.12, 'bright')

  return { targets: t, keystone: keystone! }
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

let fadeTex: THREE.Texture | null = null
function floorFade() {
  if (fadeTex) return fadeTex
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grd.addColorStop(0, '#ffffff')
  grd.addColorStop(0.45, '#bbbbbb')
  grd.addColorStop(1, '#000000')
  g.fillStyle = grd
  g.fillRect(0, 0, 256, 256)
  fadeTex = new THREE.CanvasTexture(c)
  return fadeTex
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

interface Anim {
  from: THREE.Vector3
  fromQ: THREE.Quaternion
  delay: number
  bob: number
}

function AssemblyMesh({ items, anims, material, progress }: {
  items: Target[]
  anims: Anim[]
  material: THREE.Material
  progress: MutableRefObject<number>
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const geom = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.08), [])
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion() }), [])

  useLayoutEffect(() => {
    ref.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  }, [])

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const P = progress.current
    const time = state.clock.elapsedTime
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      const a = anims[i]
      const lt = clamp01((P - a.delay) / 0.22)
      const e = easeOut(lt)
      tmp.p.lerpVectors(a.from, it.pos, e)
      tmp.p.y += Math.sin(lt * Math.PI) * 0.9 + (1 - e) * Math.sin(time * 0.6 + a.bob) * 0.25
      tmp.q.slerpQuaternions(a.fromQ, it.quat, e)
      tmp.m.compose(tmp.p, tmp.q, it.scale)
      mesh.setMatrixAt(i, tmp.m)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={ref} args={[geom, material, items.length]} castShadow frustumCulled={false} />
}

function Keystone({ target, progress }: { target: Target; progress: MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null)
  // Brushed rather than mirror-polished: a large flat face then gathers broad warm light instead of a dark reflection.
  const mat = useMemo(() => {
    const m = createGold('bright')
    m.roughness = 0.38
    m.envMapIntensity = 2
    return m
  }, [])
  const geom = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.07), [])
  const start = useMemo(() => new THREE.Vector3(0.2, 3.5, 1.6), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const spin = useMemo(() => new THREE.Euler(), [])
  useFrame((state) => {
    const m = ref.current
    if (!m) return
    const P = progress.current
    const t = state.clock.elapsedTime
    const k = easeInOut(clamp01((P - 0.06) / 0.16))
    m.position.lerpVectors(start, target.pos, k)
    m.position.y += Math.sin(t * 0.8) * 0.06 * (1 - k)
    const s = THREE.MathUtils.lerp(1.6, 1, k)
    m.scale.set(target.scale.x * s * 1.15, target.scale.y * s * 1.15, target.scale.z * s * 1.6)
    spin.set(0.35 * (1 - k), t * 0.45 * (1 - k) + k * 0, 0.12 * (1 - k))
    q.setFromEuler(spin)
    m.quaternion.slerpQuaternions(q, target.quat, k)
  })
  return <mesh ref={ref} geometry={geom} material={mat} castShadow />
}

function Rig({ progress }: { progress: MutableRefObject<number> }) {
  const { camera, size, pointer } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  const narrow = size.width / size.height < 0.9
  useFrame((_, dt) => {
    const P = progress.current
    const intro = 1 - easeInOut(clamp01((P - 0.04) / 0.22))
    const ang = -0.75 + P * 1.25 + pointer.x * 0.06
    const radius = THREE.MathUtils.lerp(narrow ? 17 + P * 1.5 : 12 + P * 2.8, narrow ? 7.5 : 5.2, intro)
    const height = THREE.MathUtils.lerp(3.0 + P * 1.4, 2.1, intro)
    const k = 1 - Math.pow(0.002, dt)
    camera.position.x += (Math.sin(ang) * radius - camera.position.x) * k
    camera.position.z += (Math.cos(ang) * radius - camera.position.z) * k
    camera.position.y += (height + pointer.y * 0.2 - camera.position.y) * k
    look.set(THREE.MathUtils.lerp(narrow ? 0.4 : -1.1, 0.2, intro), THREE.MathUtils.lerp(1.15 + P * 0.95, 1.9, intro), THREE.MathUtils.lerp(0, 1.6, intro))
    camera.lookAt(look)
  })
  return null
}

function CrownGlow({ x, y, z, progress }: { x: number; y: number; z: number; progress: MutableRefObject<number> }) {
  const ref = useRef<THREE.SpriteMaterial>(null)
  useFrame(() => {
    if (ref.current) ref.current.opacity = clamp01((progress.current - 0.88) / 0.1) * 0.9
  })
  return (
    <sprite position={[x, y, z - 0.05]} scale={3}>
      <spriteMaterial ref={ref} map={getGlowTexture()} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  )
}

export function BlocksAssembly({ progress, lowPower }: { progress: MutableRefObject<number>; lowPower: boolean }) {
  const { targets, keystone } = useMemo(buildChurch, [])
  const materials = useMemo<Record<MatKey, THREE.Material>>(
    () => ({ silver: createSilver('brushed'), polished: createSilver('polished'), champagne: createGold('champagne'), warm: createGold('warm'), bright: createGold('bright') }),
    [],
  )
  const groups = useMemo(() => {
    const rnd = seeded(11)
    const maxY = Math.max(...targets.map((t) => t.pos.y))
    const byMat = new Map<MatKey, { items: Target[]; anims: Anim[] }>()
    for (const t of targets) {
      const r = 8.5 + rnd() * 8
      const th = rnd() * Math.PI * 2
      const from = new THREE.Vector3(Math.cos(th) * r, -1.5 + rnd() * 9, Math.sin(th) * r * 0.8 - 2)
      const fromQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6))
      const delay = 0.2 + 0.62 * (0.82 * (t.pos.y / maxY) + 0.18 * rnd())
      const g = byMat.get(t.mat) ?? { items: [], anims: [] }
      g.items.push(t)
      g.anims.push({ from, fromQ, delay, bob: rnd() * 10 })
      byMat.set(t.mat, g)
    }
    return [...byMat.entries()]
  }, [targets])

  const cross = targets.filter((t) => t.mat === 'bright').reduce((a, b) => (b.pos.y > a.pos.y ? b : a))

  return (
    <>
      <fog attach="fog" args={['#0e0d0b', 14, 34]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[6, 9, 6]} intensity={1.5} color="#ffe6b8" castShadow={!lowPower} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-7, 4, -5]} intensity={0.6} color="#dfe6ff" />
      <StudioEnvironment resolution={lowPower ? 128 : 256} />
      <group position={[0, -1.6, 0]}>
        {groups.map(([key, g]) => (
          <AssemblyMesh key={key} items={g.items} anims={g.anims} material={materials[key]} progress={progress} />
        ))}
        <Keystone target={keystone} progress={progress} />
        <CrownGlow x={cross.pos.x} y={cross.pos.y} z={cross.pos.z} progress={progress} />
        {!lowPower && <ContactShadows position={[0, 0, 0]} scale={22} blur={2.6} opacity={0.65} far={8} resolution={512} color="#000000" />}
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
          <circleGeometry args={[16, 64]} />
          <meshStandardMaterial color="#141210" metalness={0.25} roughness={0.8} transparent alphaMap={floorFade()} depthWrite={false} />
        </mesh>
      </group>
      <Rig progress={progress} />
    </>
  )
}
