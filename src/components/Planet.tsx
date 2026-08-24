import { useGLTF } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Planet({ modelPath, position, label, onClick, targetSize = 3.5, ...props }: any) {
  const { scene } = useGLTF(modelPath)
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHover] = useState(false)

  const { clonedScene, baseScale } = useMemo(() => {
    const cloned = scene.clone()
    const box = new THREE.Box3().setFromObject(cloned)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    const calculatedScale = maxDim > 0 ? targetSize / maxDim : 1.0

    return { clonedScene: cloned, baseScale: calculatedScale }
  }, [scene, targetSize])
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.1
      const hoverScale = hovered ? baseScale * 1.15 : baseScale
      ref.current.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.1)
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
