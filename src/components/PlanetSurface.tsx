import { Astronaut } from './Astronaut';
import { InfoPoint } from './InfoPoint';
import { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight } from '../utils/terrain';

interface SurfaceProps {
    planetName: string;
}

function GenerativeTerrain({ planetName, config }: { planetName: string, config: any }) {
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(500, 500, 128, 128);
        const pos = geo.attributes.position;

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = getTerrainHeight(x, y, planetName);
            pos.setZ(i, z);
        }
        geo.computeVertexNormals();
        return geo;
    }, [planetName]);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} geometry={geometry}>
            <meshStandardMaterial color={config.groundColor} roughness={0.9} flatShading={true} />
        </mesh>
    );
}

export function PlanetSurface({ planetName, controlsRef }: { planetName: string, controlsRef?: any }) {
    const [showInfo, setShowInfo] = useState(false);
    const infoPointPos = new THREE.Vector3(5, 0, -5);
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
            case 'Skills': return { groundColor: '#581c87', skyColor: '#c084fc', fog: '#020617' };
            case 'Contact': return { groundColor: '#0f172a', skyColor: '#38bdf8', fog: '#020617' };
            default: return { groundColor: '#1e293b', skyColor: '#0f172a', fog: '#020617' };
        }
    };

    const config = getPlanetConfig();

    const infoY = getTerrainHeight(infoPointPos.x, -infoPointPos.z, planetName) + 1.0;

    return (
        <group>
            <color attach="background" args={[config.fog]} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 20, 15]} intensity={1.5} color={config.skyColor} />

            <GenerativeTerrain planetName={planetName} config={config} />

            <InfoPoint position={[infoPointPos.x, infoY, infoPointPos.z]} label={planetName} showInfo={showInfo} />

            <Astronaut astroRef={astroRef} position={[0, 0.2, 0]} scale={2.5} onPlanet={true} planetName={planetName} controlsRef={controlsRef} />
        </group>
    );
}