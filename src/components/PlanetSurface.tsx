import { Astronaut } from './Astronaut';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight } from '../utils/terrain';
import { BlackHole } from './BlackHole';
import { SkillsStations } from './SkillsStations';
import { ExperienceBasecamp } from './ExperienceBasecamp';

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
            {/* Giant Expanded 360° Accretion Ring encircling the entire horizon (raycast disabled so it never blocks clicks) */}
            <mesh rotation={[-Math.PI / 2 + 0.08, 0, 0]} raycast={() => null}>
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


// --- Authentic Official Vector Logos ---
const CONTACT_LINKS = [
    {
        name: 'GITHUB',
        accent: '#a855f7',
        bg: '#0f0a1e',
        url: 'https://github.com/ArnieDaDonut',
        paths: [
            {
                color: '#ffffff',
                d: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z'
            }
        ]
    },
    {
        name: 'LINKEDIN',
        accent: '#38bdf8',
        bg: '#031428',
        url: 'https://www.linkedin.com/in/arnav-mandewalker-ba487a340/',
        paths: [
            {
                color: '#0a66c2',
                d: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'
            }
        ]
    },
    {
        name: 'EMAIL',
        accent: '#ea4335',
        bg: '#241402',
        url: 'mailto:arnav.mandewalker@gmail.com',
        paths: [
            { color: '#4285F4', d: 'M2.25 5.25v13.5A2.25 2.25 0 0 0 4.5 21H6.75V9.75L2.25 5.25Z' }, // Google Blue
            { color: '#34A853', d: 'M21.75 5.25v13.5A2.25 2.25 0 0 1 19.5 21H17.25V9.75L21.75 5.25Z' }, // Google Green
            { color: '#FBBC04', d: 'M17.25 9.75V3H19.5c1.24 0 2.25 1.01 2.25 2.25L17.25 9.75Z' }, // Google Yellow
            { color: '#C5221F', d: 'M6.75 9.75L2.25 5.25C2.25 4.01 3.26 3 4.5 3H6.75V9.75Z' }, // Google Dark Red
            { color: '#EA4335', d: 'M6.75 9.75L12 15L17.25 9.75V3L12 8.25L6.75 3V9.75Z' } // Google Bright Red
        ]
    },
    {
        name: 'DISCORD',
        accent: '#818cf8',
        bg: '#0c0f2e',
        url: 'https://discord.com/users/arniee420',
        paths: [
            {
                color: '#5865F2',
                d: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z'
            }
        ]
    },
    {
        name: 'INSTAGRAM',
        accent: '#e1306c',
        bg: '#1a0515',
        url: 'https://www.instagram.com/arnav.mannn/',
        customRender: (ctx: CanvasRenderingContext2D, size: number) => {
            const r = 480;
            const x = size / 2 - r / 2;
            const y = size / 2 - r / 2;
            const w = r;
            const h = r;
            const radius = 110;

            // 1. Instagram Multi-Stop Gradient Background
            const grad = ctx.createLinearGradient(x, y + h, x + w, y);
            grad.addColorStop(0.0, '#ffd600');
            grad.addColorStop(0.25, '#ff7a00');
            grad.addColorStop(0.5, '#ff0069');
            grad.addColorStop(0.75, '#d300c5');
            grad.addColorStop(1.0, '#7638fa');

            ctx.save();
            ctx.shadowColor = '#e1306c';
            ctx.shadowBlur = 45;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
            ctx.fill();

            // Bottom-Left Yellow Radial Glow
            const radGrad = ctx.createRadialGradient(x + 50, y + h - 50, 30, x + 50, y + h - 50, 400);
            radGrad.addColorStop(0, 'rgba(255, 214, 0, 0.95)');
            radGrad.addColorStop(0.4, 'rgba(255, 122, 0, 0.5)');
            radGrad.addColorStop(1, 'rgba(255, 0, 105, 0)');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
            ctx.fill();
            ctx.restore();

            // 2. White Camera Glyph
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 32;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Outer camera rounded squircle
            const camPad = 72;
            ctx.beginPath();
            ctx.roundRect(x + camPad, y + camPad, w - camPad * 2, h - camPad * 2, 70);
            ctx.stroke();

            // Center lens circle
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 74, 0, Math.PI * 2);
            ctx.stroke();

            // Top-right flash dot
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(size / 2 + 102, size / 2 - 102, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
];

function ContactLogoNode({ item, index, total }: { item: typeof CONTACT_LINKS[0]; index: number; total: number }) {
    const [hovered, setHover] = useState(false);
    const meshRef = useRef<THREE.Group>(null);

    // 360° Grand Circular Perimeter around the Astronaut (Radius: 80)
    const angle = (index / total) * Math.PI * 2;
    const radius = 80;
    const posX = Math.sin(angle) * radius;
    const posZ = Math.cos(angle) * radius;
    const baseY = 24;

    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.clearRect(0, 0, 1024, 1024);

        if ((item as any).customRender) {
            (item as any).customRender(ctx, 1024);
        } else if (item.paths) {
            // 1. Cyan RGB Chromatic Aberration Glow (Shifted Left)
            ctx.save();
            ctx.translate(512 - 368, 512 - 360);
            ctx.scale(30, 30);
            item.paths.forEach((p) => {
                const path2D = new Path2D(p.d);
                ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = 30;
                ctx.fill(path2D);
            });
            ctx.restore();

            // 2. Magenta/Accent Aberration Glow (Shifted Right)
            ctx.save();
            ctx.translate(512 - 352, 512 - 360);
            ctx.scale(30, 30);
            item.paths.forEach((p) => {
                const path2D = new Path2D(p.d);
                ctx.fillStyle = 'rgba(255, 0, 128, 0.3)';
                ctx.shadowColor = item.accent;
                ctx.shadowBlur = 30;
                ctx.fill(path2D);
            });
            ctx.restore();

            // 3. Bright Multi-Color Luminous Core
            ctx.save();
            ctx.translate(512 - 360, 512 - 360);
            ctx.scale(30, 30);
            item.paths.forEach((p) => {
                const path2D = new Path2D(p.d);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 45;
                ctx.fill(path2D);
            });
            ctx.restore();
        }

        // 4. Laser Scanlines Cut Directly Through the Logo
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        for (let y = 0; y < 1024; y += 12) {
            ctx.fillRect(0, y, 1024, 4);
        }
        ctx.globalCompositeOperation = 'source-over';

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, [item]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 1.5 + index * 1.5) * 1.5;
            const targetScale = hovered ? 1.15 : 1.0;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
        }
    });

    const handleOpenLink = (e: any) => {
        e.stopPropagation();
        if (item.url.startsWith('mailto:')) {
            window.location.href = item.url;
        } else {
            // Safe DOM anchor click that bypasses Chrome/Safari canvas popup blockers on Vercel
            const link = document.createElement('a');
            link.href = item.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <group position={[posX, baseY, posZ]} rotation={[0, angle + Math.PI, 0]}>
            <group ref={meshRef}>
                {/* Dedicated Interactive Hitbox Plane */}
                <mesh
                    onClick={handleOpenLink}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        setHover(true);
                        document.body.style.cursor = 'pointer';
                    }}
                    onPointerOut={() => {
                        setHover(false);
                        document.body.style.cursor = 'auto';
                    }}
                >
                    <planeGeometry args={[68, 68]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>

                {/* 1. Back Hologram Ghost Glow Layer */}
                {texture && (
                    <mesh position={[0, 0, -0.4]} scale={1.03} raycast={() => null}>
                        <planeGeometry args={[64, 64]} />
                        <meshBasicMaterial
                            map={texture}
                            transparent
                            color="#00e5ff"
                            opacity={hovered ? 0.6 : 0.35}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </mesh>
                )}

                {/* 2. Main Sharp Hologram Core Layer */}
                {texture && (
                    <mesh position={[0, 0, 0]} scale={1.0} raycast={() => null}>
                        <planeGeometry args={[64, 64]} />
                        <meshBasicMaterial
                            map={texture}
                            transparent
                            opacity={hovered ? 1.0 : 0.88}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </mesh>
                )}

                {/* 3. Front Hologram Fringe Layer */}
                {texture && (
                    <mesh position={[0, 0, 0.4]} scale={0.98} raycast={() => null}>
                        <planeGeometry args={[64, 64]} />
                        <meshBasicMaterial
                            map={texture}
                            transparent
                            color={item.accent}
                            opacity={hovered ? 0.45 : 0.25}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </mesh>
                )}
            </group>
        </group>
    );
}

function ContactLogosRing() {
    return (
        <group position={[0, 0, 0]}>
            {CONTACT_LINKS.map((item, idx) => (
                <ContactLogoNode key={item.name} item={item} index={idx} total={CONTACT_LINKS.length} />
            ))}
        </group>
    );
}

export function PlanetSurface({ planetName, controlsRef, onOpenExperience }: { planetName: string, controlsRef?: any, onOpenExperience?: (sectionId: string) => void }) {
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
        scene.background = new THREE.Color(isContact ? '#000000' : '#0a1128');
        scene.fog = null;
        return () => {
            scene.fog = null;
            scene.background = new THREE.Color('#0a1128');
        };
    }, [planetName, isContact, scene]);

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

                    {/* Ring of Huge Interactive Contact Logos */}
                    <ContactLogosRing />
                </group>
            )}

            {planetName === 'Skills' && <SkillsStations />}
            {planetName === 'Experience' && <ExperienceBasecamp onOpenSection={onOpenExperience} />}

            <Astronaut astroRef={astroRef} position={[0, 0.2, 0]} scale={2.5} onPlanet={true} planetName={planetName} controlsRef={controlsRef} />
        </group>
    );
}