import { useFBX, useAnimations } from '@react-three/drei'
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getTerrainHeight } from '../utils/terrain';


export function Astronaut({ position = [0, 0, 0], isTakingOff = false, inSpace = false, onPlanet = false, planetName = "", astroRef, controlsRef, ...props }: any) {
  const fbx = useFBX('/animations/astronaut.fbx')

  // Load all animations
  const idleFbx = useFBX('/animations/idle.fbx')
  const walkFbx = useFBX('/animations/walking.fbx')
  const jumpFbx = useFBX('/animations/jump.fbx')
  const runFbx = useFBX('/animations/Running.fbx')
  const leftStrafeFbx = useFBX('/animations/left strafe walking.fbx')
  const rightStrafeFbx = useFBX('/animations/right strafe walking.fbx')
  const leftTurnFbx = useFBX('/animations/left turn 90.fbx')
  const rightTurnFbx = useFBX('/animations/right turn 90.fbx')
  const floatingFbx = useFBX('/animations/Floating.fbx')
  const swimmingFbx = useFBX('/animations/Swimming.fbx')

  const internalRef = useRef<THREE.Group>(null)
  const ref = astroRef || internalRef
  const keys = useRef<{ [key: string]: boolean }>({})
  const currentAction = useRef<string>('Idle')
  const isJumping = useRef(false)

  // Extract and name animations, and convert them to 'In Place'
  const anims = useMemo(() => {
    const clips: THREE.AnimationClip[] = []
    const addAnim = (clipFbx: any, name: string) => {
      if (clipFbx && clipFbx.animations && clipFbx.animations.length > 0) {
        const anim = clipFbx.animations[0].clone()
        anim.name = name

        // Fix: Strip root motion (X and Z movement) to make the animation seamlessly loop "In Place"
        anim.tracks.forEach((track: any) => {
          if (track.name.includes('mixamorigHips.position')) {
            const values = track.values;
            const startX = values[0];
            const startZ = values[2];
            for (let i = 0; i < values.length; i += 3) {
              values[i] = startX;     // Lock X position to start
              values[i + 2] = startZ;   // Lock Z position to start
            }
          }
        })

        clips.push(anim)
      }
    }

    addAnim(idleFbx, "Idle")
    addAnim(walkFbx, "Walk")
    addAnim(jumpFbx, "Jump")
    addAnim(leftStrafeFbx, "StrafeLeft")
    addAnim(rightStrafeFbx, "StrafeRight")
    addAnim(leftTurnFbx, "TurnLeft")
    addAnim(rightTurnFbx, "TurnRight")
    addAnim(floatingFbx, "Floating")
    addAnim(swimmingFbx, "Swimming")
    addAnim(runFbx, "Running")


    return clips;
  }, [idleFbx, walkFbx, jumpFbx, leftStrafeFbx, rightStrafeFbx, leftTurnFbx, rightTurnFbx, floatingFbx, swimmingFbx, runFbx])

  const { actions } = useAnimations(anims, ref)

  // Setup keyboard listeners
  useEffect(() => {
    if (!onPlanet) return;
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; keys.current[e.key.toLowerCase()] = true; }
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; keys.current[e.key.toLowerCase()] = false; }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onPlanet])

  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(position[0], inSpace ? 0.2 : -10, position[2])
    }
  }, [])

  const playAnim = (name: string) => {
    if (currentAction.current !== name && actions[name]) {
      actions[currentAction.current]?.fadeOut(0.2)
      actions[name]?.reset().fadeIn(0.2).play()
      currentAction.current = name
    }
  }

  useFrame((state, delta) => {
    if (!ref.current) return;

    if (onPlanet) {
      const isRunning = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
      const moveSpeed = (isRunning ? 16 : 8) * delta;
      const turnSpeed = 3 * delta;

      let isMoving = false;
      let nextAnim = 'Idle';

      // Jump Logic (only on solid planets)
      if (planetName !== 'Contact' && keys.current['Space'] && !isJumping.current) {
        isJumping.current = true;
        playAnim('Jump');
        setTimeout(() => { isJumping.current = false; }, 1000); // Reset jump after 1s
      }

      if (!isJumping.current) {
        let dx = 0;
        let dz = 0;
        let dy = 0;

        if (keys.current['KeyW'] || keys.current['ArrowUp'] || keys.current['w']) dz -= 1;
        if (keys.current['KeyS'] || keys.current['ArrowDown'] || keys.current['s']) dz += 1;
        if (keys.current['KeyA'] || keys.current['ArrowLeft'] || keys.current['a']) dx -= 1;
        if (keys.current['KeyD'] || keys.current['ArrowRight'] || keys.current['d']) dx += 1;

        if (planetName === 'Contact') {
          nextAnim = 'Floating';

          if (keys.current['Space']) dy += 1;
          if (keys.current['ShiftLeft'] || keys.current['ShiftRight'] || keys.current['KeyE']) dy -= 1;

          if (dx !== 0 || dz !== 0 || dy !== 0) {
            isMoving = true;
            nextAnim = 'Swimming';

            const forward = new THREE.Vector3();
            state.camera.getWorldDirection(forward);
            forward.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

            const up = new THREE.Vector3(0, 1, 0);

            const moveDir = new THREE.Vector3()
              .addScaledVector(right, dx)
              .addScaledVector(forward, -dz)
              .addScaledVector(up, dy)
              .normalize();

            const targetAngle = Math.atan2(moveDir.x, moveDir.z);
            const targetRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, targetAngle, 0));
            ref.current.quaternion.slerp(targetRotation, 8 * delta);

            ref.current.position.add(moveDir.multiplyScalar(moveSpeed));
          }

          ref.current.position.y += Math.sin(state.clock.elapsedTime * 1.5) * 0.003;
        } else {

          if (dx !== 0 || dz !== 0) {
            isMoving = true;
            nextAnim = isRunning ? 'Running' : 'Walk';

            const forward = new THREE.Vector3();
            state.camera.getWorldDirection(forward);
            forward.y = 0;
            forward.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

            const moveDir = new THREE.Vector3()
              .addScaledVector(right, dx)
              .addScaledVector(forward, -dz)
              .normalize();

            const targetAngle = Math.atan2(moveDir.x, moveDir.z);
            const targetRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, targetAngle, 0));
            ref.current.quaternion.slerp(targetRotation, 10 * delta);

            ref.current.position.add(moveDir.multiplyScalar(moveSpeed));
            const terrainY = getTerrainHeight(ref.current.position.x, -ref.current.position.z, planetName);

            ref.current.position.y = terrainY + 0.2;
          }
        }

        playAnim(nextAnim);
      }

      // CAMERA FOLLOW LOGIC (360° Orbit & Follow)
      if (controlsRef?.current?.target) {
        const controls = controlsRef.current;
        const targetX = ref.current.position.x;
        const targetY = ref.current.position.y + 2;
        const targetZ = ref.current.position.z;

        const diffX = targetX - controls.target.x;
        const diffY = targetY - controls.target.y;
        const diffZ = targetZ - controls.target.z;

        controls.target.set(targetX, targetY, targetZ);
        state.camera.position.x += diffX;
        state.camera.position.y += diffY;
        state.camera.position.z += diffZ;

        if (planetName && planetName !== 'Contact') {
          const camTerrainY = getTerrainHeight(state.camera.position.x, -state.camera.position.z, planetName);
          if (state.camera.position.y < camTerrainY + 0.8) {
            state.camera.position.y = camTerrainY + 0.8;
          }
        }

        controls.update();
      }

    } else if (inSpace) {
      ref.current.position.lerp(new THREE.Vector3(position[0], 20, position[2]), 0.15);

      const time = state.clock.elapsedTime;

      ref.current.position.y += Math.sin(time * 3) * 0.005;
      ref.current.rotation.z = Math.sin(time * 1.5) * 0.1;
      ref.current.rotation.x = Math.cos(time * 1.2) * 0.05;

      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, delta * 2);

      playAnim('Idle');
    } else {
      // HOMEPAGE LOGIC
      const targetY = isTakingOff ? 20 : position[1]
      const speed = isTakingOff ? 0.5 : 2
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, delta * speed)
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, position[0], delta * 10)
      ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, position[2], delta * 10)

      if (!isTakingOff) {
        const time = state.clock.elapsedTime
        ref.current.position.y += Math.sin(time * 3) * 0.005
        ref.current.rotation.z = Math.sin(time * 1.5) * 0.1
        ref.current.rotation.x = Math.cos(time * 1.2) * 0.05
      } else {
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, 0, delta * 2)
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0, delta * 2)
        ref.current.rotation.y += delta * 5
      }
    }
  })

  return (
    <group ref={ref} {...props}>
      <primitive object={fbx} />
      {(isTakingOff && !inSpace) && (
        <group>
          <FireTrail position={[0.14, -0.16, 0.05]} active={isTakingOff} />
          <FireTrail position={[-0.14, -0.16, 0.05]} active={isTakingOff} />
        </group>
      )}
    </group>
  )
}

function FireTrail({ position, active }: { position: [number, number, number], active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 6;
    if (active) {
      const flicker = 1.0 + Math.sin(state.clock.elapsedTime * 45) * 0.25;
      ref.current.scale.set(flicker * 1.4, flicker * 2.8, flicker * 1.4);
    } else {
      ref.current.scale.set(0.01, 0.01, 0.01);
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.09, 0.38, 12]} />
        <meshStandardMaterial emissive="#ff4500" color="#f97316" transparent opacity={active ? 0.95 : 0} />
      </mesh>
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.24, 10]} />
        <meshStandardMaterial emissive="#ffea00" color="#facc15" transparent opacity={active ? 0.98 : 0} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.08, 8]} />
        <meshStandardMaterial emissive="#00d2ff" color="#38bdf8" transparent opacity={active ? 0.9 : 0} />
      </mesh>
    </group>
  );
}