import { useGLTF } from '@react-three/drei'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Planet({ modelPath, position, label, onClick, ...props }: any) {
  const { scene } = useGLTF(modelPath)
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHover] = useState(false)

  // Use clone so we don't mutate the original cached scene if reused
  const clonedScene = scene.clone()

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.1
      if (hovered) {
        ref.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1)
      } else {
        ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }
  })

  return (
    <group position={position}>
      <primitive 
        ref={ref} 
        object={clonedScene}
        onPointerOver={() => {
          setHover(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = 'auto'
        }}
        onClick={onClick}
        {...props} 
      />
    </group>
  )
}
