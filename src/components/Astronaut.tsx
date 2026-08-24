import { useGLTF } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Astronaut({ position = [0, 0, 0], isTakingOff = false, inSpace = false, ...props }: any) {
  const { scene } = useGLTF('/astronaut.glb')
  const ref = useRef<THREE.Group>(null)

  useEffect(() => {
    // We set the initial drop position here so it only happens ONCE when the component loads.
    if (ref.current) {
      ref.current.position.set(position[0], -10, position[2])
    }
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      const targetY = isTakingOff ? 20 : position[1]
      const speed = isTakingOff ? 0.5 : 2
      ref.current.position.y = THREE.MathUtils.lerp(
        ref.current.position.y,
        targetY,
        delta * speed //Speed of drop
      )

      if (!isTakingOff || inSpace) {
        const time = state.clock.elapsedTime
        ref.current.position.y += Math.sin(time * 3) * 0.005
        ref.current.rotation.z = Math.sin(time * 1.5) * 0.1
        ref.current.rotation.x = Math.cos(time * 1.2) * 0.05
      } else {
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, 0, delta * 2)
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0, delta * 2)
        ref.current.rotation.y += delta * 5
      }
    }
  })

  return (
    <group ref={ref} {...props}>
      <primitive object={scene} />
      {(isTakingOff && !inSpace) && (
        <group>
          <FireTrail position={[0.14, -0.16, 0.05]} active={isTakingOff} />
          <FireTrail position={[-0.14, -0.16, 0.05]} active={isTakingOff} />
        </group>
      )}
    </group>
  )
}

function FireTrail({ position, active }: { position: [number, number, number], active: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 6;

    // Intense flickering rocket plume animation
    if (active) {
      const flicker = 1.0 + Math.sin(state.clock.elapsedTime * 45) * 0.25;
      ref.current.scale.set(flicker * 1.4, flicker * 2.8, flicker * 1.4);
    } else {
      ref.current.scale.set(0.01, 0.01, 0.01);
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Outer orange flame cone */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.09, 0.38, 12]} />
        <meshStandardMaterial emissive="#ff4500" color="#f97316" transparent opacity={active ? 0.95 : 0} />
      </mesh>

      {/* Inner yellow hot core */}
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.24, 10]} />
        <meshStandardMaterial emissive="#ffea00" color="#facc15" transparent opacity={active ? 0.98 : 0} />
      </mesh>

      {/* Small blue base flame for realism */}
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.08, 8]} />
        <meshStandardMaterial emissive="#00d2ff" color="#38bdf8" transparent opacity={active ? 0.9 : 0} />
      </mesh>
    </group>
  );
}