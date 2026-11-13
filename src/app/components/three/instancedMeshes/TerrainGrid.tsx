'use client'

import { memo, useLayoutEffect, useMemo, useRef } from 'react'
import { Box3, BufferGeometry, DataTexture, Euler, Group, InstancedMesh, Matrix4, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, PerspectiveCamera, Side, Texture, Vector2, Vector3 } from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import useMaterial, { defaultMeshStandardMaterialProperties, type MaterialStoreState } from '@/app/stores/materialStore'
import type { Transform3 } from '../../../../types/Transform3'
import { fitToPerspectiveCameraFrustum } from '@utils/animationUtils'
import { setTransformData } from '@utils/validation'
import terrainConfigs from '@configs/terrainConfigs'
import carouselConfigs from '@configs/carouselConfigs'

const { OFFSET_POSITION } = carouselConfigs
const cameraDistanceZ: number = (OFFSET_POSITION as Transform3).z
const maxRetryCount = 50

const {
  TERRAIN_MATERIAL_ID,
  TERRAIN_NODE_NAME,
  TERRAIN_URL,
  TERRAIN_POSITION,
  TERRAIN_ROTATION,
  TERRAIN_SCALE,
  TERRAIN_GRID_COLUMNS,
  TERRAIN_GRID_ROWS,
  TERRAIN_GRID_SPACING
} = terrainConfigs

useGLTF.preload(TERRAIN_URL)

const _dummy = new Object3D()
const _instanceMatrix = new Matrix4()
const _axis = new Vector3(0, 1, 0)

function rotateInstance(instancedMesh: InstancedMesh, instanceId: number, rotationAxis: Vector3, angleAmount: number) {
  instancedMesh.getMatrixAt(instanceId, _instanceMatrix)
  _instanceMatrix.decompose(_dummy.position, _dummy.quaternion, _dummy.scale)
  _dummy.rotateOnAxis(rotationAxis, angleAmount)
  _dummy.updateMatrix()
  instancedMesh.setMatrixAt(instanceId, _dummy.matrix)
  instancedMesh.instanceMatrix.needsUpdate = true
}

function checkNumericValue(value: number, wholeNumber: boolean = true): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return wholeNumber ? Math.max(1, Math.ceil(value)) : value
  }
  return wholeNumber ? 1 : 0
}

interface TerrainMaterialProperties {
  color: string
  flatShading: boolean
  name: string
  side: Side
  metalness: number
  normalMap: DataTexture | Texture
  normalScale: Vector2
  roughness: number
}

interface TerrainGridProps {
  materialID?: string
  node?: string,
  url?: string
  position?: [x: number, y: number, z: number] | Transform3 | Vector3
  rotation?: [x: number, y: number, z: number] | Transform3 | Euler
  scale?: [x: number, y: number, z: number] | Transform3 | Vector3
  columns?: number,
  rows?: number,
  spacing?: [row: number, column: number],
}
const TerrainGrid = ({
  materialID = undefined,
  node = undefined,
  url = undefined,
  position = undefined,
  rotation = undefined,
  scale = undefined,
  columns = undefined,
  rows = undefined,
  spacing = undefined,
}: TerrainGridProps) => {
  const _scratchSizeRef = useRef<Vector3>(new Vector3())
  const _scratchCenterRef = useRef<Vector3>(new Vector3())
  const _scratchGroupSizeRef = useRef<Vector3>(new Vector3())

  const instancedMeshRef = useRef<InstancedMesh>(null)
  const instanceRef = useRef<Object3D>(new Object3D())
  const groupRef = useRef<Group>(null)

  const retryCountRef = useRef<number>(0)

  const rotationRef = useRef<Euler>(new Euler(TERRAIN_ROTATION.x, TERRAIN_ROTATION.y, TERRAIN_ROTATION.z))
  const positionRef = useRef<Vector3>(new Vector3(TERRAIN_POSITION.x, TERRAIN_POSITION.y, TERRAIN_POSITION.z))
  const scaleRef = useRef<Vector3>(new Vector3(TERRAIN_SCALE.x, TERRAIN_SCALE.y, TERRAIN_SCALE.z))
  const materialRef = useRef<MeshStandardMaterial>(new MeshStandardMaterial({ ...defaultMeshStandardMaterialProperties as TerrainMaterialProperties }))
  const materialReadyRef = useRef<boolean>(false)

  const dummyMaterial = useMemo((): MeshStandardMaterial => new MeshStandardMaterial({ ...defaultMeshStandardMaterialProperties as TerrainMaterialProperties }), [])

  const glbUrl = useMemo((): string => (!!url && typeof url === 'string' && url.length > 0) ? url : TERRAIN_URL, [url])
  const nodeName = useMemo((): string => (!!node && typeof node === 'string' && node.length > 0) ? node : TERRAIN_NODE_NAME, [node])
  const matID = useMemo((): string => !!materialID && typeof materialID === 'string' && materialID.length > 0 ? materialID : TERRAIN_MATERIAL_ID, [materialID])

  const { nodes } = useGLTF(glbUrl)

  const mesh = useMemo((): Mesh | null => nodes?.[nodeName] as Mesh | null, [nodes, nodeName])
  const geometry = useMemo((): BufferGeometry | null => mesh?.geometry as BufferGeometry | null, [mesh])
  const gridRows = useMemo((): number => typeof rows === 'number' ? checkNumericValue(rows) : checkNumericValue(TERRAIN_GRID_ROWS), [rows])
  const gridColumns = useMemo((): number => typeof columns === 'number' ? checkNumericValue(columns) : checkNumericValue(TERRAIN_GRID_COLUMNS), [columns])
  const totalInstances = useMemo((): number => gridRows * gridColumns, [gridRows, gridColumns])
  const gridSpacing = useMemo((): [row: number, column: number] => typeof spacing === 'object' && spacing.length === 2
    ? [checkNumericValue(spacing[0], false), checkNumericValue(spacing[1], false)]
    : [checkNumericValue(TERRAIN_GRID_SPACING[0], false), checkNumericValue(TERRAIN_GRID_SPACING[1], false)]
    , [spacing])

  useLayoutEffect(() => {
    const material: MeshStandardMaterial = materialRef.current
    return () => material.dispose()
  }, [])

  useLayoutEffect(() => {
    if (!!url && typeof url === 'string' && url.length > 0) useGLTF.preload(url)
  }, [url])

  useLayoutEffect(() => {
    if (groupRef.current !== null) {
      if (!!position) setTransformData(positionRef.current, position)
      if (!!rotation) setTransformData(rotationRef.current, rotation)
      if (!!scale) setTransformData(scaleRef.current, scale)

      groupRef.current.position.set(positionRef.current.x, positionRef.current.y, positionRef.current.z)
      groupRef.current.rotation.set(rotationRef.current.x, rotationRef.current.y, rotationRef.current.z)
      groupRef.current.scale.set(scaleRef.current.x, scaleRef.current.y, scaleRef.current.z)
    }
  }, [position, rotation, scale])

  useLayoutEffect(() => {
    if (instancedMeshRef.current !== null && instancedMeshRef.current?.geometry && geometry) {
      let instanceIndex: number = 0
      instancedMeshRef.current.geometry.computeBoundingBox()

      const box: Box3 | null = instancedMeshRef.current.geometry.boundingBox

      if (box instanceof Box3) {
        box.getSize(_scratchSizeRef.current)
        box.getCenter(_scratchCenterRef.current)
      }

      const instanceSizeX: number = _scratchSizeRef.current.x
      const instanceSizeZ: number = _scratchSizeRef.current.z
      const gridSizeX: number = gridRows * instanceSizeX
      const gridSizeZ: number = gridColumns * instanceSizeZ
      const gridCenterX: number = (((-1 * gridSizeX) + instanceSizeX) / 2)
      const gridCenterZ: number = (((-1 * gridSizeZ) + instanceSizeZ) / 2)

      for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
          const x: number = (i * instanceSizeX * gridSpacing[0]) + gridCenterX
          const y: number = 0
          const z: number = (j * instanceSizeZ * gridSpacing[1]) + gridCenterZ

          instanceRef.current.position.set(x, y, z)
          instanceRef.current.updateMatrix()
          instancedMeshRef.current.setMatrixAt(instanceIndex, instanceRef.current.matrix)
          rotateInstance(instancedMeshRef.current, instanceIndex, _axis, 0)
          instanceIndex++
        }
      }

      instancedMeshRef.current.instanceMatrix.needsUpdate = true

      const spanX: number = instanceSizeX * ((gridRows - 1) * gridSpacing[0] + 1)
      const spanY: number = _scratchSizeRef.current.y
      const spanZ: number = instanceSizeZ * ((gridColumns - 1) * gridSpacing[1] + 1)
      const cosX: number = Math.abs(Math.cos(rotationRef.current.x))
      const sinX: number = Math.abs(Math.sin(rotationRef.current.x))

      _scratchGroupSizeRef.current.set(
        spanX,
        (spanY * cosX) + (spanZ * sinX),
        (spanY * sinX) + (spanZ * cosX),
      )
    }
  }, [geometry, gridRows, gridColumns, gridSpacing])

  useFrame(({ camera: cam }, delta) => {
    if (geometry && groupRef.current && nodeName?.length) {
      const clampedDelta: number = Math.min(delta, 0.08)
      const materialStore: MaterialStoreState = useMaterial.getState()
      const texturesReady: boolean = materialStore.texturesInitialized?.length > 0

      if (cam instanceof PerspectiveCamera) {
        fitToPerspectiveCameraFrustum(
          cam,
          _scratchGroupSizeRef.current,
          scaleRef.current,
          groupRef.current,
          8.5,
          false,
          clampedDelta,
          cameraDistanceZ,
          0.3,
        )
      }

      // one-shot
      if (texturesReady && materialReadyRef.current === false && retryCountRef.current < maxRetryCount) {
        const storeMaterial: Record<string, MeshPhysicalMaterial | MeshStandardMaterial> = materialStore.getSelectedMaterials([matID])
        const readyMaterial: MeshPhysicalMaterial | MeshStandardMaterial | null = storeMaterial[matID] ?? null

        if (!readyMaterial) retryCountRef.current++

        if (!!readyMaterial && readyMaterial instanceof MeshStandardMaterial && readyMaterial?.isMeshStandardMaterial) {
          materialRef.current.copy(readyMaterial)
          materialRef.current.needsUpdate = true
          materialReadyRef.current = true
          if (instancedMeshRef.current !== null) instancedMeshRef.current.material = materialRef.current
        }
      }
    }
  })

  return (
    <>
      {geometry && nodeName && (
        <group ref={groupRef}>
          <instancedMesh
            ref={instancedMeshRef}
            args={[geometry, dummyMaterial, totalInstances]}
            castShadow
            receiveShadow
          />
        </group>
      )}
    </>
  )
}

export default memo(TerrainGrid)