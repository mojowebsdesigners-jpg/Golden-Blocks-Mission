import { Environment, Lightformer } from '@react-three/drei'

/**
 * Procedural studio lighting baked into a cube map at runtime — no HDR
 * download. Warm key panels give gold its champagne highlights, a cool rim
 * strip keeps silver crisp, and ring formers echo the hero's halo.
 */
export function StudioEnvironment({ resolution = 256 }: { resolution?: number }) {
  return (
    <Environment resolution={resolution} frames={1} background={false}>
      <color attach="background" args={['#241c12']} />
      <Lightformer form="rect" intensity={1.1} color="#f1d9a6" position={[-9, 2, 5]} scale={[4, 8, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.1} color="#f1d9a6" position={[9, 2, 5]} scale={[4, 8, 1]} target={[0, 0, 0]} />
      {/* front fills (behind the camera) so faces toward the viewer reflect warm light */}
      <Lightformer form="rect" intensity={2.1} color="#f3dcae" position={[0, 3.5, 9]} scale={[14, 5, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.55} color="#c9c3b8" position={[0, -2, 9]} scale={[14, 3, 1]} target={[0, 0, 0]} />
      {/* warm key */}
      <Lightformer form="rect" intensity={3.2} color="#ffe2a8" position={[4, 4, 3]} scale={[6, 3, 1]} target={[0, 0, 0]} />
      {/* soft top fill */}
      <Lightformer form="rect" intensity={1.4} color="#fff4de" position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
      {/* cool rim for silver */}
      <Lightformer form="rect" intensity={2.4} color="#dfe8ff" position={[-6, 2, -2]} scale={[1.2, 8, 1]} target={[0, 0, 0]} />
      {/* halo ring reflection */}
      <Lightformer form="ring" intensity={2.6} color="#f7deA0" position={[2, 3, -6]} scale={3} target={[0, 0, 0]} />
      {/* low bounce */}
      <Lightformer form="rect" intensity={0.6} color="#a07a3a" position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[10, 4, 1]} />
    </Environment>
  )
}
