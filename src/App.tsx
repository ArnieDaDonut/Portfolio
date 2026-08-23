import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sparkles, Environment } from '@react-three/drei'

import { Earth } from './components/Earth'
import { Astronaut } from './components/Astronaut'
import { Planet } from './components/Planet'


const PLANETS = [
  { path: '/mars_the_red_planet_free.glb', name: 'About', pos: [-15, 5, 5] },
  { path: '/saturn.glb', name: 'Projects', pos: [-8, 12, -10] },
  { path: '/venus_fixed.glb', name: 'Experience', pos: [0, 15, -20] },
  { path: '/purple_planet.glb', name: 'Skills', pos: [8, 12, -10] },
  { path: '/planet_of_phoenix.glb', name: 'Contact', pos: [15, 5, 5] },
]

export default function App() {
  const [takenOff, setTakenOff] = useState(false)
  return (
    <>
      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        <color attach="background" args={['#050511']} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        <Sparkles count={1000} scale={10} size={2} speed={0.4} />

        <Suspense fallback={null}>
          <Environment preset="night" />

          {!takenOff && (<>
            <Earth position={[0, -1.5, 0]} scale={0.015} />
            <Astronaut position={[0, 0.2, 0]} scale={1} />
          </>
          )}

          {takenOff && PLANETS.map((planet, i) => (
            <Planet key={i} modelPath={planet.path} position={planet.pos} scale={0.05} onClick={() => { console.log(`Clicked on ${planet.name}`) }}
            />
          ))}


        </Suspense>

        {/* OrbitControls and Camera animations removed so you can build your own! */}
      </Canvas>
      {!takenOff && (<div className="ui-overlay">
        <button
          className='takeoff-btn'
          onClick={() => setTakenOff(true)}
        >
          Take Off!
        </button>
      </div>)}
    </>
  )
}
