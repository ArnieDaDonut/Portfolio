import { Astronaut } from './Astronaut';
import { InfoPoint } from './InfoPoint';
import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SurfaceProps {
    planetName: string;
}

export function PlanetSurface({ planetName }: SurfaceProps) {
    const [showInfo, setShowInfo] = useState(false);
    const infoPointPos = new THREE.Vector3(5, 0.5, -5);
    const astroRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (astroRef.current) {
            const dist = astroRef.current.position.distanceTo(infoPointPos);
            const isClose = dist < 3.5;
            if (isClose !== showInfo) {
                setShowInfo(isClose);
            }
        }
    });

    const getPlanetConfig = () => {
        switch (planetName) {
            case 'About': return { groundColor: '#962d00', skyColor: '#ff7744', fog: '#3b1204' };
            case 'Projects': return { groundColor: '#a88d40', skyColor: '#f4e0a5', fog: '#2a220e' };
            case 'Experience': return { groundColor: '#b86600', skyColor: '#ffbe53', fog: '#422402' };
            case 'Skills': return { groundColor: '#581c87', skyColor: '#c084fc', fog: '#2e1065' };
            case 'Contact': return { groundColor: '#0f172a', skyColor: '#38bdf8', fog: '#020617' };
            default: return { groundColor: '#1e293b', skyColor: '#0f172a', fog: '#020617' };
        }
    };

    const config = getPlanetConfig();

    return (
        <group>
            <color attach="background" args={[config.fog]} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 20, 15]} intensity={1.5} color={config.skyColor} />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={config.groundColor} roughness={0.9} />
            </mesh>

            <InfoPoint position={[infoPointPos.x, infoPointPos.y, infoPointPos.z]} label={planetName} showInfo={showInfo} />

            <Astronaut astroRef={astroRef} position={[0, 0.2, 0]} scale={2.5} onPlanet={true} />
        </group>
    );
}