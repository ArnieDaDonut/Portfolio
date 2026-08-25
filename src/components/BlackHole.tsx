import { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;

void main() {
  // Center coordinates (0,0 is now the middle)
  vec2 centered = vUv - 0.5;
  float dist = length(centered);
  
  // Create a hole in the middle and fade out at the edges
  // The event horizon is at dist 0.1, the edge is at 0.5
  float alpha = smoothstep(0.5, 0.2, dist) * smoothstep(0.08, 0.15, dist);
  
  // Swirling math to create animated bands of gas
  float angle = atan(centered.y, centered.x);
  float swirl = sin(angle * 5.0 + uTime * 2.0 - dist * 30.0);
  float swirl2 = sin(angle * 8.0 - uTime * 3.0 - dist * 15.0);
  
  // Combine the waves for a chaotic texture
  float noise = (swirl + swirl2) * 0.5 + 0.5;
  
  // Interstellar white and icy blue accretion disk colors
  vec3 colorA = vec3(0.7, 0.8, 1.0); // Soft icy blue
  vec3 colorB = vec3(1.0, 1.0, 1.0); // Pure white
  
  vec3 finalColor = mix(colorA, colorB, noise);
  
  // Boost brightness near the center event horizon
  float glow = smoothstep(0.25, 0.1, dist);
  finalColor += glow * vec3(1.0, 1.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`

export function BlackHole({ position, onClick, label, ...props }: any) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHover] = useState(false)

  useFrame((state) => {
    // 1. Pass the time variable to the Shader so it swirls!
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    
    // 2. Animate the hover effect
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      const targetScale = hovered ? 1.15 : 1.0
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group position={position} ref={groupRef} {...props}>
      {label && (
        <Html 
          position={[0, 2.5, 0]} 
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
      {/* Invisible hit-box sphere for hovering/clicking so it triggers easily */}
      <mesh 
        onPointerOver={() => {
          setHover(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = 'auto'
        }}
        onClick={onClick}
      >
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* The pitch-black Event Horizon */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="black" />
      </mesh>

      {/* The glowing Accretion Disk powered by our Shader */}
      <mesh rotation={[Math.PI / 2 + 0.2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{ uTime: { value: 0 } }}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false} // Prevents glitchy transparency sorting
        />
      </mesh>
    </group>
  )
}
