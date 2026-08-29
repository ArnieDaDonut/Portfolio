import { useMemo, useRef, useEffect } from 'react';
import { useFBX, useAnimations, useGLTF, Html } from '@react-three/drei';
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
    }, [animType, animPath, animPaths, talk1, talk2, talk3, talk4, idle, typing, writing]);

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
                nextAction.reset();
                nextAction.setLoop(THREE.LoopOnce, 1);
                nextAction.clampWhenFinished = true;

                if (prevName && actions[prevName]) {
                    actions[prevName].crossFadeTo(nextAction, 0.6, true);
                }

                nextAction.play();
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

export function SkillsStations() {
    const deskGltf = useGLTF('/desk.glb');
    const chairGltf = useGLTF('/chair.glb');
    const computerGltf = useGLTF('/computer.glb');
    const paperGltf = useGLTF('/paper.glb');

    const teamPos = { x: -16, z: -12 };
    const teamY = getTerrainHeight(teamPos.x, -teamPos.z, 'Skills') + 0.2;

    const codePos = { x: 16, z: -14 };
    const codeY = getTerrainHeight(codePos.x, -codePos.z, 'Skills') + 0.2;

    const writePos = { x: 0, z: -24 };
    const writeY = getTerrainHeight(writePos.x, -writePos.z, 'Skills') + 0.2;

    const talkPool = [
        '/animations/Talking.fbx',
        '/animations/Talking2.fbx',
        '/animations/Talking3.fbx',
        '/animations/Talking4.fbx',
        '/animations/idle.fbx'
    ];

    return (
        <group>
            <group position={[teamPos.x, teamY, teamPos.z]}>
                <StationText text="Teamwork & Collaboration" position={[0, 7.0, 0]} />

                <StationAstronaut
                    animPaths={talkPool}
                    position={[2.5, 0, -0.5]}
                    rotation={[0, -Math.PI / 2.5, 0]}
                />

                <StationAstronaut
                    animPaths={talkPool}
                    position={[-1.2, 0, -2]}
                    rotation={[0, Math.PI / 3, 0]}
                />

                <StationAstronaut
                    animPaths={talkPool}
                    position={[0, 0, 1.2]}
                    rotation={[0, Math.PI, 0]}
                />
            </group>

            <group position={[codePos.x, codeY, codePos.z]} rotation={[0, -Math.PI / 6, 0]}>
                <StationText text="Programmer" position={[0, 7.0, 0]} />

                <AutoScaledModel scene={deskGltf.scene} targetHeight={2.0} position={[0, 0, 0.5]} rotation={[0, Math.PI / 2, 0]} />
                <AutoScaledModel scene={chairGltf.scene} targetHeight={3.4} position={[0, 0, -1.6]} rotation={[0, 0, 0]} />
                <AutoScaledModel scene={computerGltf.scene} targetHeight={1.1} position={[0, 2.0, 1.1]} rotation={[0, Math.PI, 0]} />

                <StationAstronaut
                    animPaths="/animations/Typing.fbx"
                    position={[0, 0.1, -1]}
                    rotation={[0, 0, 0]}
                />
            </group>

            <group position={[writePos.x, writeY, writePos.z]} rotation={[0, 0, 0]}>
                <StationText text="Problem-Solving" position={[0, 7.0, 0]} />

                <AutoScaledModel scene={deskGltf.scene} targetHeight={2.0} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
                <AutoScaledModel scene={chairGltf.scene} targetHeight={3.6} position={[0, 0, -1.2]} rotation={[0, 0, 0]} />
                <AutoScaledModel scene={paperGltf.scene} targetHeight={0.2} position={[0.4, 2.0, 0.4]} />

                <StationAstronaut
                    animPaths="/animations/Writing.fbx"
                    position={[0, 0.1, -1.2]}
                    rotation={[0, 0, 0]}
                />
            </group>
        </group>
    );
}