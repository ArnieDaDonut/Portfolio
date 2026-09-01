import { useState, useMemo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { getTerrainHeight } from '../utils/terrain';
import { useGLTF } from '@react-three/drei';

export function SciFiBar(props: any) {
    const { scene } = useGLTF('/sci-fi.glb');

    return <primitive object={scene.clone()} {...props} />;
}
useGLTF.preload('/sci-fi.glb');

export function TableModel(props: any) {
    const { scene } = useGLTF('/table.glb');
    return <primitive object={scene.clone()} {...props} />;
}
useGLTF.preload('/table.glb');

function CommandHologram({ position, scale = 1, onOpenSection }: { position: [number, number, number], scale?: number, onOpenSection?: () => void }) {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);
    
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.clearRect(0, 0, 512, 512);

        // Holographic Pink Base Color
        const holoColor = '#ec4899';

        // Cyber Grid Background
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 512; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
        }

        // Concentric Tactical Circles
        ctx.strokeStyle = holoColor;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(256, 256, 180, 0, Math.PI * 2); ctx.stroke();

        ctx.setLineDash([15, 20]);
        ctx.beginPath(); ctx.arc(256, 256, 220, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);

        // Decorative Crosshairs
        ctx.beginPath(); ctx.moveTo(256, 20); ctx.lineTo(256, 80); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(256, 492); ctx.lineTo(256, 432); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(20, 256); ctx.lineTo(80, 256); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(492, 256); ctx.lineTo(432, 256); ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
        ctx.beginPath(); ctx.arc(256, 256, 120, 0, Math.PI * 2); ctx.fill();

        // Holographic Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = holoColor;
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ffffff';

        ctx.font = 'bold 42px "Courier New", monospace';
        ctx.fillText('COMMAND', 256, 256 - 25);

        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.fillText('NODE', 256, 256 + 25);

        ctx.font = '16px "Courier New", monospace';
        ctx.fillStyle = holoColor;
        ctx.fillText('STATUS: ACTIVE', 256, 256 + 70);

        // Scanlines cut through
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        for (let y = 0; y < 512; y += 6) {
            ctx.fillRect(0, y, 512, 2);
        }
        ctx.globalCompositeOperation = 'source-over';

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            // Hover up and down slowly
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.15;
            // Constant slow rotation
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
            
            // Pulse effect when hovered
            if (hovered) {
                const scaleTarget = 1.1;
                meshRef.current.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), 0.1);
            } else {
                meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        }
    });

    return (
        <group 
            position={[position[0], 0, position[2]]} 
            scale={scale}
            onClick={(e) => { e.stopPropagation(); if (onOpenSection) onOpenSection(); }}
            onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
        >
            {/* Holographic Projection Base Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
                <torusGeometry args={[1.0, 0.04, 16, 64]} />
                <meshBasicMaterial color="#ec4899" transparent opacity={hovered ? 1.0 : 0.8} />
            </mesh>

            <group ref={meshRef}>
                {texture && (
                    <>
                        {/* 1. Back Hologram Ghost Layer (Chromatic shift left/blue) */}
                        <mesh position={[0, 0, -0.15]} scale={1.05}>
                            <planeGeometry args={[3.5, 3.5]} />
                            <meshBasicMaterial map={texture} transparent color="#00e5ff" opacity={0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
                        </mesh>

                        {/* 2. Main Sharp Hologram Core Layer */}
                        <mesh position={[0, 0, 0]}>
                            <planeGeometry args={[3.5, 3.5]} />
                            <meshBasicMaterial map={texture} transparent opacity={hovered ? 1.0 : 0.9} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
                        </mesh>

                        {/* 3. Front Hologram Fringe Layer (Chromatic shift right/pink) */}
                        <mesh position={[0, 0, 0.15]} scale={0.95}>
                            <planeGeometry args={[3.5, 3.5]} />
                            <meshBasicMaterial map={texture} transparent color="#ec4899" opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
                        </mesh>
                    </>
                )}
            </group>
        </group>
    );
}

// --- ALL EXPERIENCES DATA ---
export const EXPERIENCES = [
    {
        id: 'astraq',
        company: 'ASTRAQ',
        role: 'Software Engineer Intern',
        period: 'July 2026 - Present',
        badge: 'SWE INTERN',
        color: '#38bdf8',
        section: 'Technical',
        summary: 'Developing the full-stack "AstraResearch" web platform with modern cloud architecture.',
        bullets: [
            'Architected and implemented responsive full-stack features using React, TypeScript, and Node.js.',
            'Collaborated on backend database schemas with PostgreSQL and containerized services with Docker.',
            'Integrated cloud services and deployment pipelines on AWS.'
        ],
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS']
    },
    {
        id: 'genouk',
        company: 'Genouk',
        role: 'Founder & Lead Developer',
        period: 'June 2026',
        badge: 'AI EXTENSION',
        color: '#a855f7',
        section: 'Technical',
        summary: 'AI-powered VS Code extension enhancing developer productivity (100+ active users).',
        bullets: [
            'Built intelligent prompt reviews, automated codebase architectural tours, and cross-chat memory.',
            'Engineered a React frontend with a Node.js backend and a custom Model Context Protocol (MCP) server for Linear integration.',
            'Grew active adoption to over 100+ developers.'
        ],
        skills: ['React', 'Node.js', 'VS Code API', 'MCP Server', 'TypeScript', 'Linear API']
    },
    {
        id: 'langlua',
        company: 'LangLua',
        role: 'Founder & Developer',
        period: 'May 2026',
        badge: 'BROWSER EXT',
        color: '#34d399',
        section: 'Technical',
        summary: 'Chrome extension turning everyday browsing into passive contextual language learning.',
        bullets: [
            'Engineered real-time in-browser translation algorithms across diverse web pages.',
            'Implemented interactive vocabulary features and seamless DOM manipulation without page lag.',
            'Independently designed, tested, and published the tool end-to-end.'
        ],
        skills: ['JavaScript', 'HTML5', 'CSS3', 'Chrome APIs', 'DOM Manipulation', 'UI/UX']
    },
    {
        id: 'cisv',
        company: 'CISV Waterloo',
        role: 'Web Developer & Digital Lead',
        period: 'April 2023 - June 2023',
        badge: 'WEB DEV',
        color: '#f59e0b',
        section: 'Technical',
        summary: 'Built and deployed a fully revamped, mobile-responsive website from the ground up.',
        bullets: [
            'Delivered a modern digital presence meeting all organizational executive requirements.',
            'Implemented clean frontend components using HTML, TypeScript, and Java.'
        ],
        skills: ['HTML5', 'TypeScript', 'Java', 'Web Design', 'UI/UX']
    },
    {
        id: 'robotics',
        company: 'CHCI Robotics Club',
        role: 'Hardware & Engineering Member',
        period: 'December 2025 - Present',
        badge: 'HARDWARE',
        color: '#ef4444',
        section: 'Technical',
        summary: 'Collaborating with a team of 15+ students to design and assemble mechanical engineering systems.',
        bullets: [
            'Applied workshop safety protocols, mechanical assembly skills, and hardware tool organization.',
            'Troubleshot circuit boards, mechanical linkages, and hardware systems.'
        ],
        skills: ['Hardware', 'Mechanical Assembly', 'Prototyping', 'Teamwork']
    },
    {
        id: 'radioroom',
        company: 'Radio Room Executive',
        role: 'Operations & Broadcast Lead',
        period: 'October 2024 - Present',
        badge: 'OPERATIONS',
        color: '#fbbf24',
        section: 'Leadership',
        summary: 'Coordinating daily announcements and live operations serving 1,000+ students.',
        bullets: [
            'Delivered uninterrupted daily live service to a community of 1,000+ students with 0 missed broadcasts.',
            'Managed communications hardware, broadcast schedules, and strict document organization.'
        ],
        skills: ['Live Comms', 'Operations', 'Audio Hardware', 'Leadership']
    },
    {
        id: 'sac',
        company: 'Student Activity Council',
        role: 'Event Coordinator',
        period: 'May 2024 - Present',
        badge: 'LEADERSHIP',
        color: '#ec4899',
        section: 'Leadership',
        summary: 'Planning and delivering major school-wide events for 500+ attendees.',
        bullets: [
            'Organized engaging school-wide events for crowds of 500+ students with consistent positive feedback.',
            'Managed cross-functional student organizer logistics under strict timelines.'
        ],
        skills: ['Event Planning', 'Logistics', 'Public Speaking', 'Leadership']
    },
    {
        id: 'volunteering',
        company: 'Food4Kids & Medieval Faire',
        role: 'Community Volunteer',
        period: '2024 - 2025',
        badge: 'COMMUNITY',
        color: '#10b981',
        section: 'Community',
        summary: 'Supporting local families and large-scale cultural events with logistics and operations.',
        bullets: [
            'Assembled food packages with 0 distribution errors under weekly schedules for families in need.',
            'Supported smooth operations and attendee assistance at high-attendance community festivals.'
        ],
        skills: ['Logistics', 'Community Support', 'Event Operations']
    }
];

export const SECTIONS = [
    {
        id: 'Technical',
        color: '#38bdf8',
        position: [0, 16],
        vibe: 'cyber',
        experiences: EXPERIENCES.filter(e => e.section === 'Technical')
    },
    {
        id: 'Leadership',
        color: '#ec4899',
        position: [-20, -5],
        vibe: 'command',
        experiences: EXPERIENCES.filter(e => e.section === 'Leadership')
    },
    {
        id: 'Community',
        color: '#10b981',
        position: [20, -5],
        vibe: 'botanical',
        experiences: EXPERIENCES.filter(e => e.section === 'Community')
    }
];

function Station({ section, onOpenSection }: { section: typeof SECTIONS[0], onOpenSection?: (id: string) => void }) {
    // Calculate precise terrain height so the station sits perfectly
    const y = useMemo(() => getTerrainHeight(section.position[0], -section.position[1], 'Experience'), [section]);

    return (
        <group position={[section.position[0], y, section.position[1]]}>

            {/* The Sci-Fi Bar / Table Models */}
            <group position={[0, 1.8, 0]}>
                {section.id === 'Technical' && (
                    <SciFiBar position={[0, 0, 0]} scale={4} rotation={[0, Math.PI / 2, 0]} />
                )}
                {section.id === 'Leadership' && (
                    <group position={[0, -1.8, 0]}>
                        <TableModel position={[0, 0, 0]} scale={2.5} />
                        <CommandHologram 
                            position={[0, 3.2, 0]} 
                            scale={1.5} 
                            onOpenSection={() => onOpenSection && onOpenSection(section.id)} 
                        />
                    </group>
                )}

                {/* Interactive PC Terminal (Scaled up 2x) */}
                {section.id !== 'Leadership' && (
                    <group position={[0, -1.8, 3]} scale={2}>
                        {/* Desk Base */}
                        <mesh position={[0, 0.5, 0]}>
                            <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
                            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
                        </mesh>
                        {/* Desk Top */}
                        <mesh position={[0, 1, 0]}>
                            <boxGeometry args={[3, 0.1, 1.5]} />
                            <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
                        </mesh>
                        {/* PC Monitor Base */}
                        <mesh position={[0, 1.2, -0.4]}>
                            <boxGeometry args={[0.1, 0.3, 0.1]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                        {/* PC Screen */}
                        <mesh
                            position={[0, 1.5, -0.3]}
                            rotation={[-0.1, 0, 0]}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenSection) onOpenSection(section.id);
                            }}
                            onPointerOver={() => document.body.style.cursor = 'pointer'}
                            onPointerOut={() => document.body.style.cursor = 'auto'}
                        >
                            <boxGeometry args={[1.8, 1, 0.05]} />
                            <meshStandardMaterial color="#000" metalness={0.9} roughness={0.1} emissive={section.color} emissiveIntensity={0.8} />
                        </mesh>
                    </group>
                )}
            </group>

            {/* Local Ambient Light */}
            <pointLight position={[0, 4, 2]} intensity={2} color={section.color} distance={20} />
            <ambientLight intensity={0.5} />
        </group>
    );
}

export function ExperienceBasecamp({ onOpenSection }: { onOpenSection?: (id: string) => void }) {
    return (
        <group>
            {SECTIONS.map(s => (
                <Station key={s.id} section={s} onOpenSection={onOpenSection} />
            ))}
        </group>
    );
}

