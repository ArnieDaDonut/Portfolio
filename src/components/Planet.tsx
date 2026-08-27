import { useGLTF, Html } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Planet({ modelPath, position, label, onClick, targetSize = 3.5, rotate = true, ...props }: any) {
  const { scene } = useGLTF(modelPath) as any
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
  useFrame((_state, delta) => {
    if (ref.current) {
      if (rotate) {
        ref.current.rotation.y += delta * 0.1
      }

      const hoverScale = hovered ? baseScale * 1.15 : baseScale
      ref.current.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.1)
    }
  })

  return (
    <group position={position}>
      {label && (
        <Html
          position={[0, targetSize / 2 + 1, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div
            style={{
              fontFamily: '"Press Start 2P", monospace',
              opacity: hovered ? 1 : 0.6,
              textShadow: '0px 0px 8px rgba(0,0,0,0.8)',
              color: 'white',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
              transition: 'all 0.2s'
            }}
          >
            {label}
          </div>
        </Html>
      )}
      <mesh onPointerOver={() => {
        setHover(true)
        document.body.style.cursor = 'pointer'
      }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = 'auto'
        }}
        onClick={onClick}>
        <sphereGeometry args={[targetSize / 2 * 1.2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <primitive
        ref={ref}
        object={clonedScene}
        {...props}
      />
    </group>
  )
}
