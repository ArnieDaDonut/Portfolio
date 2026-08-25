import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const PLANETS = [
  { path: '/mars_the_red_planet_free.glb', name: 'About', pos: [-6, 20, 10.4] }, // Bottom left
  { path: '/saturn.glb', name: 'Projects', pos: [-12, 20, 0] }, // Left
  { path: '/venus_fixed.glb', name: 'Experience', pos: [6, 20, 10.4] }, // Bottom right
  { path: '/purple_planet.glb', name: 'Skills', pos: [6, 20, -10.4] }, // Top right
  { path: '/black_hole.glb', name: 'Contact', pos: [12, 20, 0], size: 10, rotate: false }, // Right
]

import { Earth } from './components/Earth'
import { Astronaut } from './components/Astronaut'
import { Planet } from './components/Planet'
import { BlackHole } from './components/BlackHole'

function CameraSnapper({ inSpace, controlsRef }: { inSpace: boolean, controlsRef: any }) {
  useEffect(() => {
    if (inSpace && controlsRef.current) {
      controlsRef.current.object.position.set(0, 22, 25)
      controlsRef.current.target.set(0, 20, 0)
      controlsRef.current.update()
    } else if (!inSpace && controlsRef.current) {
      controlsRef.current.object.position.set(0, 2, 10)
      controlsRef.current.target.set(0, 0, 0)
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

  const handleReturn = () => {
    if (!inSpace || fading) return;
    setFading(true);

    setTimeout(() => {
      setinSpace(false);
      setTakenOff(false);
      setFading(false);
    }, 1500);
  }

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

      {!inSpace && (
        <div className="game-title">
          Arnav's Portfolio
        </div>
      )}

      {!takenOff && !inSpace && (
        <div className="takeoff-text">
          Press Spacebar to Take Off!
        </div>
      )}

      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        <color attach="background" args={['#0f1a30']} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        <Sparkles position={[0, 10, 0]} count={5000} scale={50} size={5} speed={0.4} />

        <Suspense fallback={null}>
          <Environment preset="night" />

          {!inSpace && <Earth position={[0, -1.5, 0]} scale={0.015} />}

          {/* Make sure Astronaut still uses takenOff so he launches immediately! */}
          <Astronaut position={[0, 0.2, 0]} scale={inSpace ? 2 : 1} isTakingOff={takenOff} inSpace={inSpace} />

          {/* Change takenOff to inSpace for the Planets! */}
          {inSpace && (
            <Suspense fallback={null}>

              <group onClick={handleReturn} onPointerOver={() =>
                document.body.style.cursor = 'pointer'} onPointerOut={() =>
                  document.body.style.cursor = 'auto'}>
                <Earth position={[-6, 20, -10.4]} scale={0.015} label="Home" />
              </group>

              {PLANETS.map((planet, i) => (
                planet.name === 'Contact' ? (
                  <BlackHole
                    key={i}
                    position={planet.pos}
                    label={planet.name}
                    onClick={() => { console.log(`Clicked on ${planet.name}`) }}
                  />
                ) : (
                  <Planet
                    key={i}
                    modelPath={planet.path}
                    position={planet.pos}
                    targetSize={planet.size || 3.5}
                    rotate={planet.rotate}
                    scale={0.05}
                    label={planet.name}
                    onClick={() => { console.log(`Clicked on ${planet.name}`) }}
                  />
                )
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
