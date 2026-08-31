import { Astronaut } from './Astronaut';
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
        const geo = new THREE.PlaneGeometry(650, 650, 130, 130);
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

import { Sparkles } from '@react-three/drei';

const worldRingShader = {
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

        void main() {
            vec2 p = vUv - 0.5;
            float dist = length(p) * 2.0;

            float alpha = smoothstep(0.15, 0.35, dist) * smoothstep(1.0, 0.45, dist);
            if (alpha < 0.005) discard;

            float angle = atan(p.y, p.x);

            float swirl = sin(angle * 6.0 + uTime * 1.5 - dist * 10.0);
            float swirl2 = sin(angle * 12.0 - uTime * 1.0 + dist * 5.0);
            float noise = (swirl * 0.6 + swirl2 * 0.4) * 0.5 + 0.5;

            float innerGlow = smoothstep(0.40, 0.18, dist) * 2.2;

            vec3 colWhite = vec3(1.0, 1.0, 0.98);
            vec3 colYellow = vec3(1.0, 0.88, 0.30);
            vec3 colOrange = vec3(1.0, 0.48, 0.05);
            vec3 colCrimson = vec3(0.72, 0.14, 0.02);

            float heat = alpha * (0.8 + noise * 0.4) + innerGlow;
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
};

function HugeWorldAccretionRing() {
    const ringMatRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (ringMatRef.current)
            ringMatRef.current.uniforms.uTime.value = t;
    });

    return (
        <group position={[0, -1.0, 0]}>
            {/* Giant Expanded 360° Accretion Ring encircling the entire horizon */}
            <mesh rotation={[-Math.PI / 2 + 0.08, 0, 0]}>
                <ringGeometry args={[8, 300, 128]} />
                <shaderMaterial
                    ref={ringMatRef}
                    vertexShader={worldRingShader.vertexShader}
                    fragmentShader={worldRingShader.fragmentShader}
                    uniforms={{ uTime: { value: 0 } }}
                    transparent={true}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
}

function FloatingContactSign() {
    const ringLeftRef = useRef<THREE.Mesh>(null);
    const ringRightRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (ringLeftRef.current) ringLeftRef.current.rotation.z += delta * 0.8;
        if (ringRightRef.current) ringRightRef.current.rotation.z -= delta * 0.8;
    });

    const signTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Dark Radial Cyber Background
        const grad = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 80,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        grad.addColorStop(0, 'rgba(10, 25, 45, 0.98)');
        grad.addColorStop(1, 'rgba(2, 4, 12, 0.99)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cyber Grid Lines
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
        ctx.lineWidth = 2;
        const gridSize = 40;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Cyan Glowing Border
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 8;
        ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

        // Cyber Corner Brackets
        ctx.font = 'bold 50px "Press Start 2P", monospace, sans-serif';
        ctx.fillStyle = '#00e5ff';
        ctx.fillText('⌜', 35, 75);
        ctx.fillText('⌝', canvas.width - 85, 75);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('⌞', 35, canvas.height - 40);
        ctx.fillText('⌟', canvas.width - 85, canvas.height - 40);

        // Multi-Layered Glowing CONTACT Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 160px "Press Start 2P", monospace, sans-serif';

        // Outer Cyan Bloom
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 80;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('CONTACT', canvas.width / 2, canvas.height / 2 + 5);

        // Inner Cyan Bloom
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 40;
        ctx.fillText('CONTACT', canvas.width / 2, canvas.height / 2 + 5);

        // Crisp White Core
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('CONTACT', canvas.width / 2, canvas.height / 2 + 5);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, []);

    return (
        <group position={[0, 78, -135]} scale={1.35} rotation={[0.26, 0, 0]}>
            {/* Main Obsidian Backing Slabs */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[48, 14, 1.6]} />
                <meshStandardMaterial color="#030816" roughness={0.15} metalness={0.95} />
            </mesh>

            {/* Glowing Deep Cyan Frame */}
            <mesh position={[0, 0, 0.08]}>
                <boxGeometry args={[48.8, 14.8, 1.2]} />
                <meshStandardMaterial color="#0c4a6e" emissive="#0284c7" emissiveIntensity={0.8} />
            </mesh>

            {/* Top & Bottom High-Luminance Laser Rails */}
            <mesh position={[0, 7.2, 0.8]}>
                <boxGeometry args={[49.4, 0.4, 0.6]} />
                <meshBasicMaterial color="#00e5ff" />
            </mesh>
            <mesh position={[0, -7.2, 0.8]}>
                <boxGeometry args={[49.4, 0.4, 0.6]} />
                <meshBasicMaterial color="#38bdf8" />
            </mesh>

            {/* Angled Cyber Wing Pylons (Left & Right) */}
            <group position={[-25.5, 0, 0]} rotation={[0, 0.25, 0]}>
                <mesh>
                    <boxGeometry args={[3.2, 16, 2.0]} />
                    <meshStandardMaterial color="#071830" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0, 1.1]}>
                    <boxGeometry args={[0.3, 14, 0.2]} />
                    <meshBasicMaterial color="#00e5ff" />
                </mesh>
                <mesh ref={ringLeftRef} position={[-2.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <torusGeometry args={[2.4, 0.12, 16, 32]} />
                    <meshBasicMaterial color="#00e5ff" />
                </mesh>
            </group>

            <group position={[25.5, 0, 0]} rotation={[0, -0.25, 0]}>
                <mesh>
                    <boxGeometry args={[3.2, 16, 2.0]} />
                    <meshStandardMaterial color="#071830" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0, 1.1]}>
                    <boxGeometry args={[0.3, 14, 0.2]} />
                    <meshBasicMaterial color="#38bdf8" />
                </mesh>
                <mesh ref={ringRightRef} position={[2.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} >
                    <torusGeometry args={[2.4, 0.12, 16, 32]} />
                    <meshBasicMaterial color="#38bdf8" />
                </mesh>
            </group>

            {/* Bottom Plasma Ion Thrusters */}
            <mesh position={[-16, -8.2, 0]}>
                <cylinderGeometry args={[1.4, 1.8, 2.2, 16]} />
                <meshStandardMaterial color="#0c2d48" metalness={0.9} />
            </mesh>
            <mesh position={[-16, -9.4, 0]}>
                <sphereGeometry args={[1.1, 16, 16]} />
                <meshBasicMaterial color="#00e5ff" />
            </mesh>

            <mesh position={[16, -8.2, 0]}>
                <cylinderGeometry args={[1.4, 1.8, 2.2, 16]} />
                <meshStandardMaterial color="#0c2d48" metalness={0.9} />
            </mesh>
            <mesh position={[16, -9.4, 0]}>
                <sphereGeometry args={[1.1, 16, 16]} />
                <meshBasicMaterial color="#38bdf8" />
            </mesh>

            {/* Pure 3D WebGL Screen Surface */}
            {signTexture && (
                <mesh position={[0, 0, 0.85]}>
                    <planeGeometry args={[46, 12.5]} />
                    <meshBasicMaterial map={signTexture} transparent />
                </mesh>
            )}
        </group>
    );
}

export function PlanetSurface({ planetName, controlsRef }: { planetName: string, controlsRef?: any }) {
    const isContact = planetName === 'Contact';
    const astroRef = useRef<THREE.Group>(null);

    const getPlanetConfig = () => {
        switch (planetName) {
            case 'About': return { groundColor: '#962d00', skyColor: '#ff7744', fog: '#3b1204' };
            case 'Projects': return { groundColor: '#a88d40', skyColor: '#f4e0a5', fog: '#2a220e' };
            case 'Experience': return { groundColor: '#b86600', skyColor: '#ffbe53', fog: '#422402' };
            case 'Skills': return { groundColor: '#581c87', skyColor: '#c084fc', fog: '#180b2a' };
            case 'Contact': return { groundColor: '#000000', skyColor: '#ffffff', fog: '#000000' };
            default: return { groundColor: '#1e293b', skyColor: '#0f172a', fog: '#020617' };
        }
    };

    const config = getPlanetConfig();
    const { scene } = useThree();

    useEffect(() => {
        const prevBackground = scene.background;
        scene.background = new THREE.Color(isContact ? '#000000' : '#0a1128');
        scene.fog = null;
        return () => {
            scene.fog = null;
            scene.background = prevBackground;
        };
    }, [planetName, isContact, config.fog, scene]);

    return (
        <group>
            <ambientLight intensity={isContact ? 0.3 : 0.7} />
            <directionalLight
                position={isContact ? [5, 15, 10] : [10, 20, 15]}
                intensity={isContact ? 1.0 : 1.5}
                color={isContact ? '#ffffff' : config.skyColor}
            />

            {!isContact ? (
                <GenerativeTerrain planetName={planetName} config={config} />
            ) : (
                <group position={[0, 0, 0]}>
                    {/* Expanded Horizon Accretion Ring */}
                    <HugeWorldAccretionRing />

                    {/* High-Altitude Floating Contact Sign */}
                    <FloatingContactSign />
                </group>
            )}

            {planetName === 'Skills' && <SkillsStations />}

            <Astronaut astroRef={astroRef} position={[0, 0.2, 0]} scale={2.5} onPlanet={true} planetName={planetName} controlsRef={controlsRef} />
        </group>
    );
}