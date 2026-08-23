import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Astronaut(props: any) {
  const { scene } = useGLTF('/astronaut.glb')
  const ref = useRef<THREE.Group>(null)

  return <primitive ref={ref} object={scene} {...props} />
}
