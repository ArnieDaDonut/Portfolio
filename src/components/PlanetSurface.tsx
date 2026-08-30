import { Astronaut } from './Astronaut';
import { InfoPoint } from './InfoPoint';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight } from '../utils/terrain';
import { BlackHole } from './BlackHole';
import { SkillsStations } from './SkillsStations';

interface SurfaceProps {
    planetName: string;
}

const getPlanetPalette = (planetName: string) => {
    switch (planetName) {
        case 'About':
            return {
                low: new THREE.Color('#3e1f19'),
                mid: new THREE.Color('#b84a20'),
                high: new THREE.Color('#e07a5f')
            };

        case 'Projects':
            return {
                low: new THREE.Color('#4a4336'),
                mid: new THREE.Color('#c6a664'),
                high: new THREE.Color('#f4e0a5')
            };

        case 'Experience':
            return {
                low: new THREE.Color('#2a1205'),
                mid: new THREE.Color('#d97706'),
                high: new THREE.Color('#fbbf24')
            };

        case 'Skills':
            return {
                low: new THREE.Color('#1e1b4b'),
                mid: new THREE.Color('#7e22ce'),
                high: new THREE.Color('#d8b4fe')
            };

        case 'Contact':
            return {
                low: new THREE.Color('#030712'),
                mid: new THREE.Color('#0284c7'),
                high: new THREE.Color('#38bdf8')
            };

        default:
            return {
                low: new THREE.Color('#0f172a'),
                mid: new THREE.Color('#475569'),
                high: new THREE.Color('#94a3b8')
            };
    }
};

function GenerativeTerrain({ planetName, config }: { planetName: string, config: any }) {
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(500, 500, 50, 50);
        const pos = geo.attributes.position;
        const colors = new Float32Array(pos.count * 3);

        const palette = getPlanetPalette(planetName);

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = getTerrainHeight(x, y, planetName);
            pos.setZ(i, z);

            const normalizedHeight = Math.max(0, Math.min(1, (z + 4) / 12));

            const noise = (Math.sin(x * 0.1) * Math.cos(y * 0.1)) * 0.12;
            const factor = Math.max(0, Math.min(1, normalizedHeight + noise));

            const c = new THREE.Color();
            if (factor < 0.5) {
                c.lerpColors(palette.low, palette.mid, factor * 2);
            } else {
                c.lerpColors(palette.mid, palette.high, (factor - 0.5) * 2);
            }

            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.computeVertexNormals();
        return geo;
    }, [planetName]);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} geometry={geometry}>
            <meshStandardMaterial vertexColors={true} roughness={0.85} flatShading={true} />
        </mesh>
    );
}

export function PlanetSurface({ planetName, controlsRef }: { planetName: string, controlsRef?: any }) {
    const [showInfo, setShowInfo] = useState(false);
    const isContact = planetName === 'Contact';

    const infoPointPos = useMemo(() => isContact ? new THREE.Vector3(0, 2, -7) : new THREE.Vector3(5, 0, -5), [isContact]);
    const astroRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (astroRef.current) {
            const dist = astroRef.current.position.distanceTo(infoPointPos);
            const isClose = dist < (isContact ? 5.0 : 3.5);
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
            case 'Skills': return { groundColor: '#581c87', skyColor: '#c084fc', fog: '#180b2a' };
            case 'Contact': return { groundColor: '#000000', skyColor: '#38bdf8', fog: '#000000' };
            default: return { groundColor: '#1e293b', skyColor: '#0f172a', fog: '#020617' };
        }
    };

    const config = getPlanetConfig();
    const infoY = isContact ? 2.0 : getTerrainHeight(infoPointPos.x, -infoPointPos.z, planetName) + 1.0;

    const { scene } = useThree();

    useEffect(() => {
        // Save previous background
        const prevBackground = scene.background;
        scene.background = new THREE.Color(config.fog);
        
        if (planetName === 'Skills') {
            scene.fog = null; // Removed fog completely
        } else if (isContact) {
            scene.fog = new THREE.Fog('#000000', 5, 35);
        } else {
            scene.fog = null;
        }
        return () => { 
            scene.fog = null; 
            scene.background = prevBackground;
        };
    }, [planetName, isContact, config.fog, scene]);

    return (
        <group>
            <ambientLight intensity={isContact ? 0.25 : 0.7} />
            <directionalLight
                position={isContact ? [0, 5, -5] : [10, 20, 15]}
                intensity={isContact ? 1.0 : 1.5}
                color={config.skyColor}
            />

            {!isContact ? (
                <GenerativeTerrain planetName={planetName} config={config} />
            ) : (
                <BlackHole position={[0, 1, -12]} scale={3} />
            )}

            {planetName === 'Skills' && <SkillsStations />}

            <InfoPoint position={[infoPointPos.x, infoY, infoPointPos.z]} label={planetName} showInfo={showInfo} />

            <Astronaut astroRef={astroRef} position={[0, 0.2, 0]} scale={2.5} onPlanet={true} planetName={planetName} controlsRef={controlsRef} />
        </group>
    );
}