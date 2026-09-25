'use client'

import { memo, useLayoutEffect, useMemo, useRef } from 'react'
import { Box3, BufferGeometry, Euler, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three'
import { useGLTF } from '@react-three/drei'
import useMaterial from '@stores/materialStore'
import type { EulerValue } from '@/types/EulerValue'

const _dummy = new Object3D()
const _instanceMatrix = new Matrix4()
const _axis = new Vector3(0, 1, 0)

interface Position extends EulerValue {}
interface Scale extends EulerValue {}

function rotateInstance(instancedMesh: InstancedMesh, instanceId: number, rotationAxis: Vector3, angleAmount: number) {
  instancedMesh.getMatrixAt(instanceId, _instanceMatrix)
  _instanceMatrix.decompose(_dummy.position, _dummy.quaternion, _dummy.scale)
  _dummy.rotateOnAxis(rotationAxis, angleAmount)
  _dummy.updateMatrix()
  instancedMesh.setMatrixAt(instanceId, _dummy.matrix)
  instancedMesh.instanceMatrix.needsUpdate = true
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

interface TerrainGridProps {
  materialID?: string
  nodeName?: string,
  url?: string
  position?: [x: number, y: number, z: number] | Position | Euler
  rotation?: [x: number, y: number, z: number] | EulerValue | Vector3
  scale?: [x: number, y: number, z: number] | Scale | Vector3
  gridColumns?: number,
  gridRows?: number,
  gridSpacing?: [row: number, column: number],
}

const TerrainGrid = ({
  materialID = 'terrain',
  nodeName = 'terrain_2_low_poly',
  url = 'https://5aihfmsahakbuihc.public.blob.vercel-storage.com/meshes/terrain_2.glb',
  position = [0, 0, -80],
  rotation = [Math.PI / 2.5, 0, 0],
  scale = [0.55, 0.55, 0.55],
  gridColumns = 3,
  gridRows = 3,
  gridSpacing = [1, 0.989],
}: TerrainGridProps) => {
  const _scratchSizeRef = useRef<Vector3>(new Vector3())
  const _scratchCenterRef = useRef<Vector3>(new Vector3())
  const instancedMeshRef = useRef<InstancedMesh>(null)
  const instanceRef = useRef<Object3D>(new Object3D())
  const gridRef = useRef<number[]>([1, 1])
  const totalInstancesRef = useRef<number>(1)
  const groupRef = useRef<Group>(null)

  const rotationRef = useRef<Euler>(new Euler(rotation[0], rotation[1], rotation[2]))
  const positionRef = useRef<Vector3>(new Vector3(position[0], position[1], position[2]))
  const scaleRef = useRef<Vector3>(new Vector3(scale[0], scale[1], scale[2]))

  const { nodes } = useGLTF(url)
  const mesh = nodes?.[nodeName] as Mesh | null
  const geometry = mesh?.geometry as BufferGeometry | null

  const material: MeshStandardMaterial = useMaterial.getState().materials[materialID].material

  const totalInstances = useMemo((): number => checkCellValue(gridRows) * checkCellValue(gridColumns), [gridRows, gridColumns])

  useLayoutEffect(() => {
    useGLTF.preload(url)
  }, [url])

  useLayoutEffect(() => {
    const totalInstances: number = checkGridSize(gridRows, gridColumns, gridRef.current)
    if (totalInstancesRef.current !== totalInstances) totalInstancesRef.current = totalInstances
  }, [gridRows, gridColumns])

  useLayoutEffect(() => {
    positionRef.current.set(position[0], position[1], position[2])
    rotationRef.current.set(rotation[0], rotation[1], rotation[2])
    scaleRef.current.set(scale[0], scale[1], scale[2])

    if (groupRef.current) {
      groupRef.current.position.set(positionRef.current.x, positionRef.current.y, positionRef.current.z)
      groupRef.current.rotation.set(rotationRef.current.x, rotationRef.current.y, rotationRef.current.z)
      groupRef.current.scale.set(scaleRef.current.x, scaleRef.current.y, scaleRef.current.z)
    }
  }, [position, rotation, scale])

  useLayoutEffect(() => {
    if (instancedMeshRef.current !== null) {
      let instanceIndex: number = 0
      instancedMeshRef.current.geometry.computeBoundingBox()

      const box: Box3 = instancedMeshRef.current.geometry.boundingBox
      box.getSize(_scratchSizeRef.current)
      box.getCenter(_scratchCenterRef.current)

      const instanceSizeX: number = _scratchSizeRef.current.x
      const instanceSizeZ: number = _scratchSizeRef.current.z
      const rows: number = gridRef.current[0]
      const columns: number = gridRef.current[1]
      const gridSizeX: number = rows * instanceSizeX
      const gridSizeZ: number = columns * instanceSizeZ
      const gridCenterX: number = (((-1 * gridSizeX) + instanceSizeX) / 2)
      const gridCenterZ: number = (((-1 * gridSizeZ) + instanceSizeZ) / 2)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          const x: number = (r * instanceSizeX * gridSpacing[0]) + gridCenterX
          const y: number = 0
          const z: number = (c * instanceSizeZ * gridSpacing[1]) + gridCenterZ

          instanceRef.current.position.set(x, y, z)
          instanceRef.current.updateMatrix()
          instancedMeshRef.current.setMatrixAt(instanceIndex, instanceRef.current.matrix)
          rotateInstance(instancedMeshRef.current, instanceIndex, _axis, 0)
          instanceIndex++
        }
      }
      instancedMeshRef.current.instanceMatrix.needsUpdate = true
    }
  }, [gridSpacing])

  return (
    <>
      {geometry && nodeName && (
        <group ref={groupRef}>
          <instancedMesh
            ref={instancedMeshRef}
            args={[geometry, material, totalInstances]}
            castShadow
            receiveShadow
          />
        </group>
      )}
    </>
  )
}

export default memo(TerrainGrid)