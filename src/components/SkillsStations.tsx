import { useMemo, useRef, useEffect } from 'react';
import { useFBX, useAnimations, useGLTF, Html, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { getTerrainHeight } from '../utils/terrain';

function AutoScaledModel({ scene, targetHeight = 1.0, position = [0, 0, 0], rotation = [0, 0, 0] }: any) {
    const model = useMemo(() => {
        const cloned = scene.clone(true);
        const box = new THREE.Box3().setFromObject(cloned);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const scaleFactor = targetHeight / (size.y || 1);

        cloned.position.x -= center.x;
        cloned.position.y -= box.min.y;
        cloned.position.z -= center.z;

        const wrapper = new THREE.Group();
        cloned.scale.set(scaleFactor, scaleFactor, scaleFactor);
        cloned.position.multiplyScalar(scaleFactor);
        wrapper.add(cloned);
        return wrapper;
    }, [scene, targetHeight]);

    return <primitive object={model} position={position} rotation={rotation} />;
}

function StationAstronaut({ animType, animPath, animPaths, position, rotation = [0, 0, 0], scale = 2.5 }: any) {
    const fbx = useFBX('/animations/astronaut.fbx');
    const talk1 = useFBX('/animations/Talking.fbx');
    const talk2 = useFBX('/animations/Talking2.fbx');
    const talk3 = useFBX('/animations/Talking3.fbx');
    const talk4 = useFBX('/animations/Talking4.fbx');
    const idle = useFBX('/animations/idle.fbx');
    const typing = useFBX('/animations/Typing.fbx');
    const writing = useFBX('/animations/Writing.fbx');

    const groupRef = useRef<THREE.Group>(null);
    const clone = useMemo(() => SkeletonUtils.clone(fbx), [fbx]);

    const animPathsStr = JSON.stringify(animPaths);
    const clips = useMemo(() => {
        let sourceFbxs: any[] = [];
        const single = animPath || (typeof animPaths === 'string' ? animPaths : null);

        if (animType === 'typing' || single?.includes('Typing')) {
            sourceFbxs = [typing];
        } else if (animType === 'writing' || single?.includes('Writing')) {
            sourceFbxs = [writing];
        } else {
            sourceFbxs = [talk1, talk2, talk3, talk4, idle];
        }

        const extracted: THREE.AnimationClip[] = [];
        sourceFbxs.forEach((animFbx: any, idx: number) => {
            if (animFbx?.animations?.length > 0) {
                const clip = animFbx.animations[0].clone();
                clip.name = `anim_${idx}`;

                clip.tracks.forEach((track: any) => {
                    if (track.name.includes('mixamorigHips.position')) {
                        const values = track.values;
                        const startX = values[0];
                        const startZ = values[2];

                        for (let i = 0; i < values.length; i += 3) {
                            values[i] = startX;
                            values[i + 2] = startZ;
                        }
                    }
                });
                extracted.push(clip);
            }
        });
        return extracted;
    }, [animType, animPath, animPathsStr, talk1, talk2, talk3, talk4, idle, typing, writing]);

    const { actions, mixer } = useAnimations(clips, groupRef);

    useEffect(() => {
        if (mixer) {
            mixer.timeScale = 0.7;
        }
    }, [mixer]);

    useEffect(() => {
        if (!clips.length || !actions) return;

        if (clips.length === 1) {
            const act = actions[clips[0].name];
            if (act) act.reset().fadeIn(0.3).play();
            return;
        }

        let currentClipName = '';

        const playNextRandom = (prevName?: string) => {
            const available = clips.map(c => c.name).filter(name => clips.length === 1 || name !== prevName);
            const nextName = available[Math.floor(Math.random() * available.length)];
            const nextAction = actions[nextName];

            if (nextAction) {
                if (prevName && actions[prevName]) {
                    actions[prevName].fadeOut(0.6);
                }

                nextAction.reset();
                nextAction.setLoop(THREE.LoopOnce, 1);
                nextAction.clampWhenFinished = true;
                nextAction.fadeIn(0.6).play();

                currentClipName = nextName;
            }
        };

        const onFinished = () => playNextRandom(currentClipName);
        mixer.addEventListener('finished', onFinished);

        playNextRandom();

        return () => {
            mixer.removeEventListener('finished', onFinished);
        };
    }, [actions, clips, mixer]);

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <primitive object={clone} />
        </group>
    );
}

function StationText({ text, position }: { text: string, position: [number, number, number] }) {
    return (
        <Html position={position} center distanceFactor={18}>
            <div style={{
                fontFamily: '"Press Start 2P", monospace',
                color: '#c084fc',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid #a855f7',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '2rem',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                textShadow: '0 0 8px rgba(168, 85, 247, 0.8)',
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
            }}>
                {text}
            </div>
        </Html>
    );
}

function StationPad({ radius = 4.5, color = '#a855f7' }: { radius?: number, color?: string }) {
    return (
        <group position={[0, 0, 0]}>
            {/* Raised 3D Cyber Deck Base (Deep base embeds into hills, top stays clean) */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[radius, radius * 1.05, 0.6, 32]} />
                <meshStandardMaterial
                    color="#140e2b"
                    roughness={0.25}
                    metalness={0.85}
                    emissive="#0d0820"
                />
            </mesh>

            {/* Glowing Rim Ring */}
            <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius - 0.18, radius, 48]} />
                <meshBasicMaterial color={color} side={THREE.DoubleSide} />
            </mesh>

            {/* Inner Cyber Floor Disc */}
            <mesh position={[0, 0.305, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[radius - 0.18, 48]} />
                <meshStandardMaterial
                    color="#090518"
                    roughness={0.2}
                    metalness={0.9}
                    emissive={color}
                    emissiveIntensity={0.12}
                />
            </mesh>

            {/* Inner Concentric Tech Rings */}
            <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius * 0.5 - 0.06, radius * 0.5, 36]} />
                <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius * 0.22 - 0.04, radius * 0.22, 24]} />
                <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.7} />
            </mesh>

            {/* Side Glow Strip */}
            <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[radius * 1.01, radius * 1.01, 0.08, 32]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </group>
    );
}

function HoloProjector() {
    const holoRef = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (holoRef.current) {
            holoRef.current.rotation.y += delta * 0.9;
            holoRef.current.rotation.x += delta * 0.4;
            holoRef.current.position.y = 1.35 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
        }
    });

    return (
        <group position={[0, 0.3, -0.5]}>
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.35, 0.55, 0.6, 16]} />
                <meshStandardMaterial color="#1e1b4b" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.28, 16]} />
                <meshBasicMaterial color="#38bdf8" />
            </mesh>

            <group ref={holoRef}>
                <mesh>
                    <icosahedronGeometry args={[0.42, 1]} />
                    <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.85} />
                </mesh>
                <mesh>
                    <sphereGeometry args={[0.22, 16, 16]} />
                    <meshBasicMaterial color="#c084fc" wireframe transparent opacity={0.65} />
                </mesh>
                <mesh rotation={[Math.PI / 3, 0, 0]}>
                    <ringGeometry args={[0.55, 0.62, 32]} />
                    <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.7} />
                </mesh>
            </group>
        </group>
    );
}

function TimeManagementHolo() {
    const handRef = useRef<THREE.Mesh>(null);
    useFrame((_, delta) => {
        if (handRef.current) handRef.current.rotation.z -= delta * 1.5;
    });
    return (
        <group position={[0, 2.5, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
                <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.6} />
            </mesh>
            <mesh ref={handRef as any} position={[0, 0, 0.15]}>
                <boxGeometry args={[0.1, 2.0, 0.1]} />
                <meshBasicMaterial color="#fbbf24" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.1]}>
                <boxGeometry args={[0.1, 1.2, 0.1]} />
                <meshBasicMaterial color="#a855f7" />
            </mesh>
        </group>
    );
}


function AdaptabilityHolo() {
    const groupRef = useRef<THREE.Group>(null);
    const coreRef1 = useRef<THREE.Mesh>(null);
    const coreRef2 = useRef<THREE.Mesh>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const ring3Ref = useRef<THREE.Mesh>(null);
    const orbitGroupRef = useRef<THREE.Group>(null);
    const nodesRef = useRef<THREE.Mesh[]>([]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;

        // Dynamic Continuous Color Morphing (Chameleon Effect)
        const hue = (t * 0.15) % 1.0;
        const colorPrimary = new THREE.Color().setHSL(hue, 0.95, 0.6);
        const colorSecondary = new THREE.Color().setHSL((hue + 0.33) % 1.0, 0.95, 0.55);
        const colorTertiary = new THREE.Color().setHSL((hue + 0.66) % 1.0, 0.95, 0.65);

        // Core 1: Morphing / Breathing Icosahedron Shell
        if (coreRef1.current) {
            const scale = 1.0 + Math.sin(t * 2.5) * 0.25;
            coreRef1.current.scale.set(scale, scale, scale);
            coreRef1.current.rotation.x = t * 0.9;
            coreRef1.current.rotation.y = t * 1.3;
            coreRef1.current.rotation.z = Math.sin(t * 1.5) * 0.5;
            (coreRef1.current.material as THREE.MeshBasicMaterial).color = colorPrimary;
        }

        // Core 2: Counter-Rotating Inner Octahedron
        if (coreRef2.current) {
            const scale2 = 0.7 + Math.cos(t * 3.0) * 0.2;
            coreRef2.current.scale.set(scale2, scale2, scale2);
            coreRef2.current.rotation.x = -t * 1.2;
            coreRef2.current.rotation.y = -t * 0.8;
            (coreRef2.current.material as THREE.MeshBasicMaterial).color = colorSecondary;
        }

        // Gyroscopic Adaptive Quantum Rings
        if (ring1Ref.current) {
            ring1Ref.current.rotation.x = t * 1.1;
            ring1Ref.current.rotation.y = t * 0.5;
            (ring1Ref.current.material as THREE.MeshBasicMaterial).color = colorPrimary;
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.y = -t * 1.4;
            ring2Ref.current.rotation.z = t * 0.7;
            (ring2Ref.current.material as THREE.MeshBasicMaterial).color = colorSecondary;
        }
        if (ring3Ref.current) {
            ring3Ref.current.rotation.x = Math.sin(t * 1.8) * Math.PI;
            ring3Ref.current.rotation.z = -t * 1.0;
            (ring3Ref.current.material as THREE.MeshBasicMaterial).color = colorTertiary;
        }

        // Orbiting Adaptable Nodes (Changing Radius & Wave Oscillations)
        if (orbitGroupRef.current) {
            orbitGroupRef.current.rotation.y = t * 0.8;
        }

        nodesRef.current.forEach((node, i) => {
            if (node) {
                const angle = (i / 6) * Math.PI * 2 + t * 0.5;
                const radius = 1.8 + Math.sin(t * 2.0 + i) * 0.4;
                const height = Math.cos(t * 2.5 + i * 1.5) * 0.6;
                node.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
                node.rotation.x = t * 2 + i;
                node.rotation.y = t * 3 + i;
                (node.material as THREE.MeshBasicMaterial).color = (i % 2 === 0) ? colorPrimary : colorSecondary;
            }
        });

        // Hologram Base Floating & Pulsing
        if (groupRef.current) {
            groupRef.current.position.y = 2.4 + Math.sin(t * 1.8) * 0.15;
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Hologram Projector Pedestal */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[1.6, 1.9, 0.25, 24]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[1.3, 1.3, 0.08, 24]} />
                <meshBasicMaterial color="#a855f7" />
            </mesh>

            {/* Upward Holographic Emitter Light Cone */}
            <mesh position={[0, 1.25, 0]}>
                <cylinderGeometry args={[1.4, 0.5, 2.2, 16, 1, true]} />
                <meshBasicMaterial color="#c084fc" wireframe transparent opacity={0.12} side={THREE.DoubleSide} />
            </mesh>

            {/* Main Shapeshifting Hologram Floating Group */}
            <group ref={groupRef} position={[0, 2.4, 0]}>
                {/* Outer Morphing Shell (Icosahedron) */}
                <mesh ref={coreRef1}>
                    <icosahedronGeometry args={[1.1, 0]} />
                    <meshBasicMaterial wireframe transparent opacity={0.75} />
                </mesh>

                {/* Inner Morphing Core (Octahedron) */}
                <mesh ref={coreRef2}>
                    <octahedronGeometry args={[0.7, 0]} />
                    <meshBasicMaterial wireframe transparent opacity={0.9} />
                </mesh>

                {/* Center Glowing Energy Orb */}
                <mesh>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Gyroscopic Adaptive Quantum Rings */}
                <mesh ref={ring1Ref}>
                    <torusGeometry args={[1.5, 0.035, 16, 64]} />
                    <meshBasicMaterial transparent opacity={0.85} />
                </mesh>
                <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
                    <torusGeometry args={[1.7, 0.03, 16, 64]} />
                    <meshBasicMaterial transparent opacity={0.75} />
                </mesh>
                <mesh ref={ring3Ref} rotation={[0, Math.PI / 4, Math.PI / 3]}>
                    <torusGeometry args={[1.9, 0.025, 16, 64]} />
                    <meshBasicMaterial transparent opacity={0.65} />
                </mesh>

                {/* Orbiting Quantum Data Nodes */}
                <group ref={orbitGroupRef}>
                    {[...Array(6)].map((_, i) => (
                        <mesh
                            key={i}
                            ref={(el) => { if (el) nodesRef.current[i] = el; }}
                        >
                            <dodecahedronGeometry args={[0.16, 0]} />
                            <meshBasicMaterial wireframe />
                        </mesh>
                    ))}
                </group>
            </group>
        </group>
    );
}

function QuickLearningHolo() {
    const atomRef = useRef<THREE.Group>(null);
    useFrame((_, delta) => {
        if (atomRef.current) {
            atomRef.current.rotation.y += delta;
            atomRef.current.rotation.x += delta * 0.5;
        }
    });
    return (
        <group position={[0, 1.8, 0]} ref={atomRef}>
            <mesh>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshBasicMaterial color="#fbbf24" />
            </mesh>
            <mesh rotation={[Math.PI / 4, 0, 0]}>
                <torusGeometry args={[1.2, 0.05, 16, 100]} />
                <meshBasicMaterial color="#00e5ff" />
            </mesh>
            <mesh rotation={[-Math.PI / 4, 0, 0]}>
                <torusGeometry args={[1.2, 0.05, 16, 100]} />
                <meshBasicMaterial color="#a855f7" />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, Math.PI / 4]}>
                <torusGeometry args={[1.2, 0.05, 16, 100]} />
                <meshBasicMaterial color="#38bdf8" />
            </mesh>
        </group>
    );
}

function CommsTower({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
    const dishRef = useRef<THREE.Group>(null);
    useFrame((_, delta) => {
        if (dishRef.current) {
            dishRef.current.rotation.y += delta * 0.4;
        }
    });

    return (
        <group position={position} scale={scale}>
            <mesh position={[0, 4.5, 0]}>
                <cylinderGeometry args={[0.2, 0.7, 9, 6]} />
                <meshStandardMaterial color="#1e1b4b" metalness={0.9} roughness={0.3} wireframe />
            </mesh>
            <mesh position={[0, 4.5, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 9, 6]} />
                <meshStandardMaterial color="#0f172a" metalness={0.95} />
            </mesh>
            <mesh position={[0, 3.5, 0]}>
                <cylinderGeometry args={[1.1, 1.1, 0.15, 8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 7.5, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 0.15, 8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <group ref={dishRef} position={[0, 8.3, 0]}>
                <mesh rotation={[Math.PI / 4, 0, 0]}>
                    <sphereGeometry args={[1.0, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0.4, 0.4]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.7, 6]} />
                    <meshBasicMaterial color="#38bdf8" />
                </mesh>
            </group>
            <mesh position={[0, 9.6, 0]}>
                <sphereGeometry args={[0.2, 12, 12]} />
                <meshStandardMaterial color="#ef4444" metalness={0.9} emissive="#ef4444" emissiveIntensity={1} />
            </mesh>
        </group>
    );
}

function TechCrate({ position, rotation = [0, 0, 0], scale = 1, color = '#38bdf8' }: any) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[0.82, 0.1, 0.82]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </group>
    );
}

function LightBeacon({ position, color = '#a855f7' }: { position: [number, number, number], color?: string }) {
    return (
        <group position={position} scale={4}>
            {/* Tall Main Pillar */}
            <mesh position={[0, 1.8, 0]}>
                <cylinderGeometry args={[0.15, 0.25, 3.6, 12]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Base */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.4, 0.5, 0.3, 16]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Glowing Core / Bulb */}
            <mesh position={[0, 3.8, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 0.6, 12]} />
                <meshBasicMaterial color={color} />
            </mesh>
            {/* Top Cap */}
            <mesh position={[0, 4.2, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            {/* Floating Tech Rings */}
            <mesh position={[0, 3.8, 0]} rotation={[0.2, 0, 0]}>
                <torusGeometry args={[0.3, 0.02, 8, 24]} />
                <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[0, 3.6, 0]} rotation={[-0.2, 0, 0]}>
                <torusGeometry args={[0.4, 0.02, 8, 24]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </group>
    );
}

function EnergyDome() {
    return (
        <group position={[0, 0, -25]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.15} />
            </mesh>
        </group>
    );
}

function MountainsRing() {
    const mountains = useMemo(() => {
        const arr = [];
        const numMountains = 120;
        const radiusX = 220;
        const radiusZ = 220;
        const centerZ = -110;

        for (let i = 0; i < numMountains; i++) {
            const angle = (i / numMountains) * Math.PI * 2;
            const x = Math.cos(angle) * radiusX;
            const z = Math.sin(angle) * radiusZ + centerZ;

            const rx = x + (Math.random() - 0.5) * 25;
            const rz = z + (Math.random() - 0.5) * 25;
            const y = getTerrainHeight(rx, -rz, 'Skills') - 2;

            const sY = 35 + Math.random() * 40;
            const sXZ = 24 + Math.random() * 20;

            const rotY = Math.random() * Math.PI * 2;
            const rotX = (Math.random() - 0.5) * 0.3;
            const rotZ = (Math.random() - 0.5) * 0.3;

            arr.push({ x: rx, y, z: rz, sY, sXZ, rotX, rotY, rotZ });
        }

        return arr;
    }, []);

    const mtnGeo = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
    const mtnMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#581c87", roughness: 1.0, metalness: 0.1, flatShading: true }), []);

    return (
        <group>
            {mountains.map((m, i) => (
                <mesh key={i} position={[m.x, m.y, m.z]} rotation={[m.rotX, m.rotY, m.rotZ]} scale={[m.sXZ, m.sY, m.sXZ]} geometry={mtnGeo} material={mtnMat} />
            ))}
        </group>
    );
}

function Path() {
    const pathStones = useMemo(() => {
        const points = [
            new THREE.Vector3(0, 0, -2),
            new THREE.Vector3(-10, 0, -15),
            new THREE.Vector3(-25, 0, -35),
            new THREE.Vector3(-10, 0, -50),
            new THREE.Vector3(10, 0, -65),
            new THREE.Vector3(35, 0, -80),
            new THREE.Vector3(20, 0, -95),
            new THREE.Vector3(0, 0, -110),
            new THREE.Vector3(-20, 0, -130),
            new THREE.Vector3(-20, 0, -160),
            new THREE.Vector3(0, 0, -165),
            new THREE.Vector3(25, 0, -170),
            new THREE.Vector3(10, 0, -185),
            new THREE.Vector3(-5, 0, -200),
            new THREE.Vector3(-15, 0, -215),
            new THREE.Vector3(25, 0, -230),
            new THREE.Vector3(0, 0, -245),
        ];

        const curve = new THREE.CatmullRomCurve3(points);
        const segments = 260;
        const stones = [];

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const pt = curve.getPoint(t);
            const tangent = curve.getTangent(t);

            const x = pt.x;
            const z = pt.z;
            const y = getTerrainHeight(x, -z, 'Skills') + 0.22;

            const rotY = Math.atan2(tangent.x, tangent.z);

            const tNext = Math.min(1, t + 0.01);
            const ptNext = curve.getPoint(tNext);
            const yNext = getTerrainHeight(ptNext.x, -ptNext.z, 'Skills');
            const dist = Math.hypot(ptNext.x - x, ptNext.z - z);
            const rotX = Math.atan2(y - yNext, dist);

            stones.push({ x, y, z, rotY, rotX });
        }
        return stones;
    }, []);

    const pathGeo = useMemo(() => new THREE.BoxGeometry(3.0, 0.2, 1.2), []);
    const pathMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d8b4fe", emissive: "#a855f7", emissiveIntensity: 0.6, transparent: true, opacity: 0.8 }), []);

    return (
        <group>
            {pathStones.map((s, i) => (
                <mesh key={i} position={[s.x, s.y, s.z]} rotation={[s.rotX, s.rotY, 0]} geometry={pathGeo} material={pathMat} />
            ))}
        </group>
    );
}

export function SkillsStations() {
    const deskGltf = useGLTF('/desk.glb');
    const chairGltf = useGLTF('/chair.glb');
    const computerGltf = useGLTF('/computer.glb');
    const paperGltf = useGLTF('/paper.glb');
    const robotGltf = useGLTF('/Robot.glb');

    const teamPos = { x: -25, z: -35 };
    const teamY = getTerrainHeight(teamPos.x, -teamPos.z, 'Skills') + 1.5;

    const codePos = { x: 35, z: -80 };
    const codeY = getTerrainHeight(codePos.x, -codePos.z, 'Skills') + 0.45;

    const writePos = { x: -20, z: -130 };
    const writeY = getTerrainHeight(writePos.x, -writePos.z, 'Skills') + 0.35;

    const timePos = { x: 25, z: -170 };
    const timeY = getTerrainHeight(timePos.x, -timePos.z, 'Skills') + 0.35;

    const learnPos = { x: -15, z: -215 };
    const learnY = getTerrainHeight(learnPos.x, -learnPos.z, 'Skills') + 0.35;

    const towerPos = { x: 0, z: -245 };
    const towerY = getTerrainHeight(towerPos.x, -towerPos.z, 'Skills') + 0.2;

    const adaptPos = { x: -20, z: -160 };
    const adaptY = getTerrainHeight(adaptPos.x, -adaptPos.z, 'Skills') + 1.2;

    const robotPos = { x: 25, z: -230 };
    const robotY = getTerrainHeight(robotPos.x, -robotPos.z, 'Skills') + 0.35;

    const talkPool = [
        '/animations/Talking.fbx',
        '/animations/Talking2.fbx',
        '/animations/Talking3.fbx',
        '/animations/Talking4.fbx',
        '/animations/idle.fbx'
    ];

    return (
        <group>
            <MountainsRing />
            {/* Floating Bioluminescent Alien Particles */}
            <Sparkles count={100} position={[0, 10, -120]} scale={[150, 30, 260]} size={7} speed={0.4} color="#d8b4fe" />
            <Sparkles count={60} position={[0, 10, -120]} scale={[120, 20, 200]} size={5} speed={0.6} color="#38bdf8" />



            {/* Outpost Communications Antenna Tower (Central Hub) */}
            <CommsTower position={[towerPos.x, towerY, towerPos.z]} scale={1.5} />

            {/* Pathway Beacons Linking the Stations */}

            <Path />

            <LightBeacon position={[10, getTerrainHeight(10, 10, 'Skills') + 0.1, -10]} color="#a855f7" />
            <LightBeacon position={[-10, getTerrainHeight(-10, 20, 'Skills') + 0.1, -20]} color="#00e5ff" />

            <LightBeacon position={[-10, getTerrainHeight(-10, 50, 'Skills') + 0.1, -50]} color="#fbbf24" />
            <LightBeacon position={[10, getTerrainHeight(10, 65, 'Skills') + 0.1, -65]} color="#a855f7" />

            <LightBeacon position={[20, getTerrainHeight(20, 95, 'Skills') + 0.1, -95]} color="#00e5ff" />
            <LightBeacon position={[0, getTerrainHeight(0, 110, 'Skills') + 0.1, -110]} color="#fbbf24" />

            <LightBeacon position={[0, getTerrainHeight(0, 145, 'Skills') + 0.1, -145]} color="#a855f7" />
            <LightBeacon position={[15, getTerrainHeight(15, 155, 'Skills') + 0.1, -155]} color="#00e5ff" />

            <LightBeacon position={[10, getTerrainHeight(10, 185, 'Skills') + 0.1, -185]} color="#fbbf24" />
            <LightBeacon position={[-5, getTerrainHeight(-5, 200, 'Skills') + 0.1, -200]} color="#a855f7" />

            <LightBeacon position={[-5, getTerrainHeight(-5, 230, 'Skills') + 0.1, -230]} color="#00e5ff" />

            {/* Teamwork Station */}
            <group position={[teamPos.x, teamY, teamPos.z]}>
                <StationPad radius={4.8} color="#a855f7" />
                <HoloProjector />

                <StationText text="Teamwork & Collaboration" position={[0, 7.0, 0]} />

                <StationAstronaut
                    animPaths={talkPool}
                    position={[2.5, 0.3, -0.5]}
                    rotation={[0, -Math.PI / 2.5, 0]}
                />
                <StationAstronaut
                    animPaths={talkPool}
                    position={[-1.2, 0.3, -2]}
                    rotation={[0, Math.PI / 3, 0]}
                />
                <StationAstronaut
                    animPaths={talkPool}
                    position={[0, 0.3, 1.2]}
                    rotation={[0, Math.PI, 0]}
                />
            </group>

            {/* Programmer Station */}
            <group position={[codePos.x, codeY, codePos.z]} rotation={[0, -Math.PI / 6, 0]}>
                <StationPad radius={4.4} color="#00e5ff" />

                {/* Tech Crates Stack */}
                <TechCrate position={[2.5, 0.3, 0]} rotation={[0, 0.3, 0]} scale={1.2} color="#00e5ff" />
                <TechCrate position={[2.6, 1.2, 0]} rotation={[0, -0.2, 0]} scale={0.9} color="#00e5ff" />
                <TechCrate position={[2.7, 0.3, -1.1]} rotation={[0, 0.7, 0]} scale={1.0} color="#38bdf8" />

                <StationText text="Programming" position={[0, 7.0, 0]} />

                <AutoScaledModel scene={deskGltf.scene} targetHeight={2.0} position={[0, 0.3, 0.5]} rotation={[0, Math.PI / 2, 0]} />
                <AutoScaledModel scene={chairGltf.scene} targetHeight={3.4} position={[0, 0.3, -1.6]} rotation={[0, 0, 0]} />
                <AutoScaledModel scene={computerGltf.scene} targetHeight={1.1} position={[0, 2.3, 1.1]} rotation={[0, Math.PI, 0]} />

                <StationAstronaut
                    animPaths="/animations/Typing.fbx"
                    position={[0, 0.4, -1]}
                    rotation={[0, 0, 0]}
                />
            </group>

            {/* Problem-Solving Station */}
            <group position={[writePos.x, writeY, writePos.z]} rotation={[0, 0, 0]}>
                <StationPad radius={4.4} color="#fbbf24" />

                {/* Tech Crates Stack */}
                <TechCrate position={[-2.4, 0.3, 0.2]} rotation={[0, -0.4, 0]} scale={1.1} color="#fbbf24" />
                <TechCrate position={[-2.5, 1.1, 0.2]} rotation={[0, 0.2, 0]} scale={0.85} color="#fbbf24" />

                <StationText text="Problem-Solving" position={[0, 7.0, 0]} />

                <AutoScaledModel scene={deskGltf.scene} targetHeight={2.0} position={[0, 0.3, 0]} rotation={[0, Math.PI / 2, 0]} />
                <AutoScaledModel scene={chairGltf.scene} targetHeight={3.6} position={[0, 0.3, -1.2]} rotation={[0, 0, 0]} />
                <AutoScaledModel scene={paperGltf.scene} targetHeight={0.2} position={[0.4, 2.3, 0.4]} />

                <StationAstronaut
                    animPaths="/animations/Writing.fbx"
                    position={[0, 0.4, -1.2]}
                    rotation={[0, 0, 0]}
                />
            </group>

            {/* Time Management Station */}
            <group position={[timePos.x, timeY, timePos.z]} rotation={[0, -Math.PI / 4, 0]}>
                <StationPad radius={4.4} color="#00e5ff" />
                <TimeManagementHolo />

                <StationText text="Time Management" position={[0, 7.0, 0]} />

                {/* Tech Crates Stack */}
                <TechCrate position={[2.4, 0.3, 0.5]} rotation={[0, 0.4, 0]} scale={1.1} color="#00e5ff" />
                <TechCrate position={[2.5, 1.1, 0.4]} rotation={[0, -0.2, 0]} scale={0.9} color="#38bdf8" />

                <AutoScaledModel scene={chairGltf.scene} targetHeight={3.6} position={[1.8, 0.3, -1.8]} rotation={[0, -Math.PI / 3, 0]} />
                <StationAstronaut
                    animPaths="/animations/Typing.fbx"
                    position={[1.8, 0.4, -1.8]}
                    rotation={[0, -Math.PI / 3, 0]}
                />
            </group>

            {/* Quick Learning Station */}
            <group position={[learnPos.x, learnY, learnPos.z]} rotation={[0, Math.PI / 6, 0]}>
                <StationPad radius={4.4} color="#fbbf24" />
                <QuickLearningHolo />

                <StationText text="Quick Learning" position={[0, 7.0, 0]} />

                {/* Tech Crates Stack */}
                <TechCrate position={[-2.4, 0.3, 1.2]} rotation={[0, -0.8, 0]} scale={1.1} color="#fbbf24" />

                <AutoScaledModel scene={chairGltf.scene} targetHeight={3.6} position={[-2.0, 0.3, -1.8]} rotation={[0, Math.PI / 4, 0]} />
                <StationAstronaut
                    animPaths="/animations/Writing.fbx"
                    position={[-2.0, 0.4, -1.8]}
                    rotation={[0, Math.PI / 4, 0]}
                />
            </group>

            <group position={[adaptPos.x, adaptY, adaptPos.z]} rotation={[0, -Math.PI / 4, 0]}>
                <StationPad radius={4.0} color="#d8b4fe" />
                <StationText text="Adaptability" position={[0, 6.0, 0]} />

                <AdaptabilityHolo />

                <StationAstronaut
                    animPaths={talkPool}
                    position={[0, 0.3, -2]}
                    rotation={[0, 0, 0]}
                />
            </group>

            <group position={[robotPos.x, robotY, robotPos.z]} rotation={[0, -Math.PI / 5, 0]}>
                <StationPad radius={4.5} color="#00e5ff" />
                <StationText text="Robotics & Hardware" position={[0, 6.5, 0]} />

                <TechCrate position={[-2.5, 0.3, 0]} rotation={[0, 0.5, 0]} scale={1.2} color="#fbbf24" />

                <AutoScaledModel scene={robotGltf.scene} targetHeight={2.5} position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]} />

                <AutoScaledModel scene={chairGltf.scene} targetHeight={3.6} position={[0, 0.3, -2.5]} rotation={[0, 0, 0]} />
                <StationAstronaut
                    animPaths="/animations/Writing.fbx"
                    position={[0, 0.4, -2.5]}
                    rotation={[0, 0, 0]}
                />
            </group>
        </group>
    );
}