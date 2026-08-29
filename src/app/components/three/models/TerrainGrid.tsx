'use client'

import { memo, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import useMaterial from '@stores/materialStore'

const dummy = new THREE.Object3D();
const instanceMatrix = new THREE.Matrix4();
const axis = new THREE.Vector3(0,1,0)


function rotateInstance(instancedMesh: THREE.InstancedMesh, instanceId: number, rotationAxis: THREE.Vector3, angleAmount: number) {
  instancedMesh.getMatrixAt(instanceId, instanceMatrix);
  instanceMatrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
  dummy.rotateOnAxis(rotationAxis, angleAmount);
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(instanceId, dummy.matrix);
  instancedMesh.instanceMatrix.needsUpdate = true;
}

function checkCellValue(value: number): number {
  return typeof value === 'number' ? Math.max(1, Math.ceil(value)) : 1
};

function checkGridSize(r: number, c: number, arr: number[]): number {
  const rows = checkCellValue(r)
  const columns = checkCellValue(c)

  if (!arr.length) {
    arr.push(rows)
    arr.push(columns)
  }
  else {
    if (arr[0] !== rows) arr[0] = rows
    if (arr[1] !== columns) arr[1] = columns
  }
  return rows * columns
}

interface TerrainProps {
  materialID: string
  nodeName: string
  url: string
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
  gridRows: number
  gridColumns: number
  gridSpacing: number
}
const TerrainGrid = (props: TerrainProps) => {
  const {
    materialID,
    nodeName,
    url,
    position,
    rotation,
    scale,
    gridRows,
    gridColumns,
    gridSpacing,
  } = props

  // const _scratchPositionRef = useRef(new THREE.Vector3())
  // const _scratchQuaternionRef = useRef(new THREE.Quaternion())
  // const _scratchScaleRef = useRef(new THREE.Vector3())
  const _scratchSizeRef = useRef(new THREE.Vector3())
  const _scratchCenterRef = useRef(new THREE.Vector3())
  const instancedMeshRef = useRef(undefined)
  const instanceRef = useRef(new THREE.Object3D())
  const gridRef = useRef([1, 1])
  const totalInstancesRef = useRef(1)

  const { nodes } = useGLTF(url)
  const mesh = nodes?.[nodeName] as THREE.Mesh | null
  const geometry = mesh?.geometry as THREE.BufferGeometry | null

  const material = useMaterial.getState().materials[materialID].material

  const totalInstances = useMemo(() => checkCellValue(gridRows) * checkCellValue(gridColumns), [gridRows, gridColumns])

  useLayoutEffect(() => {
    const total = checkGridSize(gridRows, gridColumns, gridRef.current)
    if (totalInstancesRef.current !== total) totalInstancesRef.current = total
  }, [gridRows, gridColumns])

  useLayoutEffect(() => {
    if (!instancedMeshRef.current) return

    let instanceIndex = 0
    instancedMeshRef.current.geometry.computeBoundingBox()

    const box = instancedMeshRef.current.geometry.boundingBox
    box.getSize(_scratchSizeRef.current)
    box.getCenter(_scratchCenterRef.current)

    const instanceSizeX = _scratchSizeRef.current.x
    const instanceSizeZ = _scratchSizeRef.current.z
    const rows = gridRef.current[0]
    const columns = gridRef.current[1]
    const gridSizeX = rows * instanceSizeX
    const gridSizeZ = columns * instanceSizeZ
    const gridCenterX = (((-1 * gridSizeX) + instanceSizeX) / 2)
    const gridCenterZ = (((-1 * gridSizeZ) + instanceSizeZ) / 2)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = (r * instanceSizeX * gridSpacing) + gridCenterX
        const y = 0
        const z = (c * instanceSizeZ * gridSpacing) + gridCenterZ

        instanceRef.current.position.set(x, y, z)
        instanceRef.current.updateMatrix()
        instancedMeshRef.current.setMatrixAt(instanceIndex, instanceRef.current.matrix)
        rotateInstance(instancedMeshRef.current, instanceIndex, axis, 0)
        instanceIndex++
      }
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  }, [gridSpacing])

  return (
    <group
      rotation={rotation}
      position={position}
      scale={scale}
    >
      {geometry && (
        <instancedMesh
          ref={instancedMeshRef}
          args={[geometry, material, totalInstances]}
          // material={material}
          castShadow={true}
          receiveShadow={true}
        />
      )}
    </group>
  )
}

export default memo(TerrainGrid)