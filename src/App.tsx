import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { PlanetSurface } from './components/PlanetSurface';
import { PlanetUI } from './components/PlanetUI';

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

function CameraSnapper({ inSpace, activePlanet, controlsRef }: { inSpace: boolean, activePlanet: string | null, controlsRef: any }) {
  useEffect(() => {
    if (activePlanet && controlsRef.current) {
      controlsRef.current.object.position.set(0, 8, 16)
      controlsRef.current.target.set(0, 2, 0)
      controlsRef.current.update()
    } else if (inSpace && controlsRef.current) {
      controlsRef.current.object.position.set(0, 22, 25)
      controlsRef.current.target.set(0, 20, 0)
      controlsRef.current.update()
    } else if (!inSpace && controlsRef.current) {
      controlsRef.current.object.position.set(0, 2, 10)
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }, [inSpace, activePlanet])
  return null
}


export default function App() {
  const [takenOff, setTakenOff] = useState(false)
  const [fading, setFading] = useState(false)
  const [inSpace, setinSpace] = useState(false)
  const [activePlanet, setActivePlanet] = useState<string | null>(null)
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

  const handlePlanetClick = (planetName: string) => {
    if (fading) return
    setFading(true)
    setTimeout(() => {
      setActivePlanet(planetName)
      setFading(false)
    }, 1500)
  }

  const handleReturnFromSurface = () => {
    if (fading) return
    setFading(true)
    setTimeout(() => {
      setActivePlanet(null)
      setFading(false)
    }, 1500)
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

      {activePlanet && (
        <PlanetUI planetName={activePlanet} onReturn={handleReturnFromSurface} />
      )}

      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        <color attach="background" args={[activePlanet === 'Contact' ? '#000000' : '#0f1a30']} />

        <ambientLight intensity={activePlanet === 'Contact' ? 0.2 : 0.5} />
        {activePlanet !== 'Contact' && <directionalLight position={[10, 10, 5]} intensity={1.5} />}

        {activePlanet !== 'Contact' && (
          <Stars radius={100} depth={50} count={10000} factor={4} saturation={0} fade speed={1} />
        )}
        <Suspense fallback={null}>
          {activePlanet !== 'Contact' && <Environment preset="night" />}

          {!inSpace && <Earth position={[0, -1.5, 0]} scale={0.015} />}

          {!activePlanet && (
            < Astronaut position={[0, 0.2, 0]} scale={inSpace ? 2 : 1} isTakingOff={takenOff} inSpace={inSpace} />
          )}
          {/* Change takenOff to inSpace for the Planets! */}
          {inSpace && !activePlanet && (
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
                    onClick={() => handlePlanetClick(planet.name)}
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
                    onClick={() => handlePlanetClick(planet.name)}
                  />
                )
              ))}
            </Suspense>
          )}

          {/* Planetary Surface View */}
          {activePlanet && <PlanetSurface planetName={activePlanet} controlsRef={controlsRef} />}
        </Suspense>

        <CameraSnapper inSpace={inSpace} activePlanet={activePlanet} controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          mouseButtons={{
            LEFT: activePlanet ? undefined : THREE.MOUSE.ROTATE,
            RIGHT: THREE.MOUSE.ROTATE
          }}
        />
      </Canvas>
    </div>
  )
}
