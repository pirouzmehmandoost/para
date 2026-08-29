'use client'

import { memo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import useMaterial from '@stores/materialStore'
import groundConfigs from '@configs/groundConfigs'
import * as THREE from 'three'

const {
  groundProps: {
    nodeName: NODE_NAME,
    position: POSITION,
    rotation: ROTATION,
    materialID: MATERIAL_ID,
    scale: SCALE,
    url: URL,
  },
} = groundConfigs

interface GroundProps {
  materialID: string
  nodeName: string
  url: string
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
}

const Ground = ({ materialID, nodeName, url, position, rotation, scale }: GroundProps) => {

  const groundRef = useRef(undefined)
  const groundPosition = position?.isVector3 ? position : POSITION
  const groundRotation = rotation?.isEuler ? rotation : ROTATION
  const groundScale = scale?.isVector3 ? scale : SCALE
  const groundMaterialID = materialID?.length ? materialID : MATERIAL_ID
  const fileURL = url.length ? url : URL
  const node = nodeName?.length ? nodeName : NODE_NAME
  // const geometry = useGLTF(fileURL).nodes?.[`${node}`]?.geometry ?? null;
  const { nodes } = useGLTF(fileURL)
  const mesh = nodes?.[node] as THREE.Mesh | null
  const geometry = mesh?.geometry as THREE.BufferGeometry | null
  const material = useMaterial.getState().materials[groundMaterialID].material

  return (
    <>
      {geometry && (
        <mesh
          ref={groundRef}
          castShadow={false}
          geometry={geometry}
          material={material}
          position={groundPosition}
          receiveShadow={true}
          rotation={groundRotation}
          scale={groundScale}
        />
      )}
    </>
  )
}

export default memo(Ground)
