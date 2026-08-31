import { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// --- Relativistic Fiery Accretion Shader ---
const accretionShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uSpeed;

    void main() {
      vec2 p = vUv - 0.5;
      float dist = length(p) * 2.0;
      
      // Thick, soft radial gradient for seamless blending
      float alpha = smoothstep(0.28, 0.42, dist) * smoothstep(1.0, 0.45, dist);
      
      float angle = atan(p.y, p.x);
      
      // Dynamic relativistic plasma bands
      float swirl = sin(angle * 5.0 + uTime * uSpeed - dist * 12.0);
      float swirl2 = sin(angle * 9.0 - uTime * (uSpeed * 0.7) + dist * 6.0);
      float noise = (swirl * 0.6 + swirl2 * 0.4) * 0.5 + 0.5;
      
      // Luminous golden photon glow near inner event horizon
      float innerGlow = smoothstep(0.48, 0.32, dist) * 2.2;
      
      // Interstellar Palette: White Core -> Golden Yellow -> Blazing Orange -> Crimson
      vec3 colWhite = vec3(1.0, 1.0, 0.98);
      vec3 colYellow = vec3(1.0, 0.88, 0.30);
      vec3 colOrange = vec3(1.0, 0.48, 0.05);
      vec3 colCrimson = vec3(0.72, 0.14, 0.02);
      
      float heat = alpha * (0.85 + noise * 0.4) + innerGlow;
      
      vec3 color;
      if (heat > 1.35) {
        color = mix(colYellow, colWhite, clamp((heat - 1.35) / 0.75, 0.0, 1.0));
      } else if (heat > 0.55) {
        color = mix(colOrange, colYellow, (heat - 0.55) / 0.8);
      } else {
        color = mix(colCrimson, colOrange, clamp(heat / 0.55, 0.0, 1.0));
      }
      
      gl_FragColor = vec4(color, alpha * 0.95);
    }
  `
}

export function BlackHole({ position = [0, 0, 0], scale = 1, label, onClick, ...props }: any) {
  const diskMatRef = useRef<THREE.ShaderMaterial>(null)
  const vertHaloMatRef = useRef<THREE.ShaderMaterial>(null)
  const vertHaloRef = useRef<THREE.Mesh>(null)
  const photonRingRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHover] = useState(false)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (diskMatRef.current) diskMatRef.current.uniforms.uTime.value = t
    if (vertHaloMatRef.current) vertHaloMatRef.current.uniforms.uTime.value = t

    // Gravitational lensing bends light towards the observer from ANY angle
    if (vertHaloRef.current) {
      vertHaloRef.current.quaternion.copy(state.camera.quaternion)
    }
    if (photonRingRef.current) {
      photonRingRef.current.quaternion.copy(state.camera.quaternion)
    }

    if (groupRef.current) {
      const targetScale = hovered ? scale * 1.12 : scale
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group position={position} scale={scale} ref={groupRef} {...props}>
      {label && (
        <Html position={[0, 4.6, 0]} center zIndexRange={[100, 0]}>
          <div
            style={{
              fontFamily: '"Press Start 2P", monospace',
              opacity: hovered ? 1 : 0.85,
              textShadow: '0px 0px 10px #f59e0b, 0px 0px 25px #ef4444',
              color: '#ffffff',
              fontSize: '1rem',
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

      {/* Hit-box */}
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
        <sphereGeometry args={[4.8, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 1. Pitch-Black Event Horizon Core */}
      <mesh>
        <sphereGeometry args={[1.75, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. Inner Golden Photon Ring (Always facing the observer) */}
      <mesh ref={photonRingRef}>
        <ringGeometry args={[1.76, 1.90, 64]} />
        <meshBasicMaterial
          color="#fffae5"
          side={THREE.DoubleSide}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Gravitational Lensing Halo (Always wraps around the black hole towards the camera from ALL angles) */}
      <mesh ref={vertHaloRef}>
        <ringGeometry args={[1.78, 5.0, 64]} />
        <shaderMaterial
          ref={vertHaloMatRef}
          vertexShader={accretionShader.vertexShader}
          fragmentShader={accretionShader.fragmentShader}
          uniforms={{ uTime: { value: 0 }, uSpeed: { value: 1.6 } }}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Horizontal 3D Accretion Disk (Cutting horizontally across in 3D space) */}
      <mesh rotation={[Math.PI / 2 + 0.15, 0, 0]}>
        <ringGeometry args={[1.78, 6.8, 64]} />
        <shaderMaterial
          ref={diskMatRef}
          vertexShader={accretionShader.vertexShader}
          fragmentShader={accretionShader.fragmentShader}
          uniforms={{ uTime: { value: 0 }, uSpeed: { value: 2.0 } }}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}


