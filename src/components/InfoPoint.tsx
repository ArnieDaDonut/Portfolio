import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface InfoPointProps {
    position: [number, number, number]
    label: string
    showInfo: boolean
}

export function InfoPoint({ position, label, showInfo }: InfoPointProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2
            meshRef.current.rotation.y += 0.02
        }
    })

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color="#00d2ff" emissive="#00d2ff" emissiveIntensity={2} wireframe />
            </mesh>

            {showInfo && (
                <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        border: '2px solid #00d2ff',
                        padding: '20px',
                        borderRadius: '10px',
                        color: 'white',
                        fontFamily: '"Press Start 2P"',
                        width: '300px',
                        textAlign: 'center',
                        boxShadow: '0 0 20px #00d2ff'
                    }}>
                        <h2 style={{ fontSize: '12px', marginBottom: '15px' }}>{label} Data</h2>
                        <p style={{ fontSize: '8px', lineHeight: '1.5' }}>
                            Welcome to the {label} sector. You have discovered the data node!
                        </p>
                    </div>
                </Html>
            )
            }
        </group >
    )
}