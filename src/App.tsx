import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const PLANETS = [
  { path: '/mars_the_red_planet_free.glb', name: 'About', pos: [-14, 20, 4] },
  { path: '/saturn.glb', name: 'Projects', pos: [-7, 20, -6] },
  { path: '/venus_fixed.glb', name: 'Experience', pos: [0, 20, -12] },
  { path: '/purple_planet.glb', name: 'Skills', pos: [7, 20, -6] },
  { path: '/planet_of_phoenix.glb', name: 'Contact', pos: [14, 20, 4] },
]

import { Earth } from './components/Earth'
import { Astronaut } from './components/Astronaut'
import { Planet } from './components/Planet'

function CameraSnapper({ inSpace, controlsRef }: { inSpace: boolean, controlsRef: any }) {
  useEffect(() => {
    if (inSpace && controlsRef.current) {
      controlsRef.current.object.position.set(0, 22, 10)
      controlsRef.current.target.set(0, 20, 0)
      controlsRef.current.update()
    }
  }, [inSpace])
  return null
}


export default function App() {
  const [takenOff, setTakenOff] = useState(false)
  const [fading, setFading] = useState(false)
  const [inSpace, setinSpace] = useState(false)
  const controlsRef = useRef<any>(null)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code == 'Space' && !takenOff && !fading) {
        setTakenOff(true)
        setFading(true)
        setTimeout(() => {
          setinSpace(true)
          setFading(false)
        }, 1500)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)

  }, [takenOff, fading])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>

      {/* Black Screen Overlay */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'black',
          opacity: fading ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        <color attach="background" args={['#050511']} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        <Sparkles count={7000} scale={50} size={5} speed={0.4} />

        <Suspense fallback={null}>
          <Environment preset="night" />

          <Earth position={[0, -1.5, 0]} scale={0.015} />

          {/* Make sure Astronaut still uses takenOff so he launches immediately! */}
          <Astronaut position={[0, 0.2, 0]} scale={1} isTakingOff={takenOff} inSpace={inSpace} />

          {/* Change takenOff to inSpace for the Planets! */}
          {inSpace && (
            <Suspense fallback={null}>
              {PLANETS.map((planet, i) => (
                <Planet key={i} modelPath={planet.path} position={planet.pos} scale={0.05} onClick={() => { console.log(`Clicked on ${planet.name}`) }} />
              ))}
            </Suspense>
          )}
        </Suspense>

        <CameraSnapper inSpace={inSpace} controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          enablePan={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  )
}
