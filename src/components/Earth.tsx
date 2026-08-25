import { useGLTF, Html } from '@react-three/drei'
import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Earth({ label, ...props }: any) {
  const { scene } = useGLTF('/earth.glb')
  const [hovered, setHover] = useState(false)

  const clonedScene = useMemo(() => scene.clone(), [scene])
  const ref = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group 
      {...props} 
      onPointerOver={() => setHover(true)} 
      onPointerOut={() => setHover(false)}
    >
      {label && (
        <Html 
          position={[0, 160, 0]} 
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
      <primitive ref={ref} object={clonedScene} />
    </group>
  )
}
