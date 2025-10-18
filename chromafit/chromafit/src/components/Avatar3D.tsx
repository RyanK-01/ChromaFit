'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { SMPLParams } from '@/types'

interface Avatar3DProps {
  smplParams?: SMPLParams | null
  className?: string
  showTryOn?: boolean
  tryOnTexture?: string
}

function AvatarMesh({ smplParams, showTryOn, tryOnTexture }: { 
  smplParams?: SMPLParams | null
  showTryOn?: boolean
  tryOnTexture?: string 
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create a basic humanoid geometry (simplified)
  const geometry = useMemo(() => {
    const geo = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8)
    return geo
  }, [])

  // Create material
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#fdbcb4', // Skin tone
      roughness: 0.8,
      metalness: 0.1,
    })
    return mat
  }, [])

  // Apply SMPL-like transformations
  useFrame(() => {
    if (meshRef.current && smplParams) {
      // Apply basic shape transformations based on SMPL params
      const shapeInfluence = smplParams.shape.reduce((sum, val) => sum + val, 0) / 10
      const scaleX = 1 + shapeInfluence * 0.1
      const scaleY = 1 + shapeInfluence * 0.05
      const scaleZ = 1 + shapeInfluence * 0.1
      
      meshRef.current.scale.set(scaleX, scaleY, scaleZ)
      
      // Apply basic pose transformations
      const poseInfluence = smplParams.pose.slice(0, 3) // First 3 values for body rotation
      const rotationY = poseInfluence[1] * 0.1
      meshRef.current.rotation.y = rotationY
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} position={[0, 0, 0]} />
  )
}

export function Avatar3D({ smplParams, className = '', showTryOn = false, tryOnTexture }: Avatar3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Avatar Mesh */}
        <AvatarMesh smplParams={smplParams} showTryOn={showTryOn} tryOnTexture={tryOnTexture} />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          minDistance={2}
          maxDistance={5}
        />

        {/* Environment for better lighting */}
        <Environment preset="sunset" />
      </Canvas>
    </div>
  )
}
