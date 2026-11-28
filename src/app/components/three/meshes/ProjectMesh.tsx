'use client'

import { memo, useEffect, useLayoutEffect, useRef } from 'react'
import { BufferGeometry, Camera, DoubleSide, Euler, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { easing } from 'maath'
import type { Transform3 } from '../../../../types/transform3'
import { EPSILON_3e3 } from '@utils/validation'
import { eulerDistance, fitToPerspectiveCameraFrustum, easeMaterialProperties } from '@utils/animationUtils'
import carouselConfigs from '@configs/carouselConfigs'
import { defaultPhysicalMaterialProperties } from '@configs/materialConfigs'
import type { MaterialStoreState } from '@stores/materialStore'
import useMaterial from '@stores/materialStore'
import useSelection from '@stores/selectionStore'

const { OFFSET_POSITION } = carouselConfigs
const cameraDistanceZ: number = (OFFSET_POSITION as Transform3).z
const FOCUS_Z_OFFSET = 20

const POSITION_CONTROL_MODE: Record<string, string> = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED'
}

const ROTATION_CONTROL_MODE: Record<string, string> = {
  IDLE: 'IDLE',
  AUTO: 'AUTO',
  MANUAL: 'MANUAL'
}

const wrap = (value: number, min: number, max: number): number => {
  const range: number = max - min
  return ((((value - min) % range) + range) % range) + min
}

interface ProjectMeshProps {
  defaultMaterialID: string
  materialIDs: string[]
  nodeName: string
  onClick?: (event: ThreeEvent<MouseEvent>) => void
  onMeshReady?: (arg: Mesh) => void
  position: Transform3
  rotation: Transform3
  rotationSpeed: number
  scale: number
  url: string
  slug: string
}

const ProjectMesh = (props: ProjectMeshProps) => {
  const {
    defaultMaterialID = 'matte_black',
    materialIDs = ['matte_black'],
    nodeName = '',
    onClick = undefined,
    onMeshReady = undefined,
    position: { x: px = 0, y: py = 0, z: pz = 0 },
    rotation: { x: rx = 0, y: ry = 0, z: rz = 0 },
    rotationSpeed = 0.5,
    scale = 1,
    url = '',
    slug = '',
  } = props

  const _scratchSizeRef = useRef<Vector3>(new Vector3(0, 0, 0))

  const camera: Camera | OrthographicCamera | PerspectiveCamera = useThree((state) => state.camera)
  const { nodes } = useGLTF(url)
  const mesh = nodes?.[nodeName] as Mesh | null
  const geometry = mesh?.geometry as BufferGeometry | null

  const meshRef = useRef<Mesh | null>(null)

  const positionModeRef = useRef<string | null>(null)
  const rotationModeRef = useRef<string | null>(null)
  const targetMaterialIDRef = useRef<string | null>(null)

  const scaleRef = useRef<Vector3>(new Vector3(0, 0, 0))
  const animatePositionRef = useRef<Vector3>(new Vector3(px, py, pz))
  const defaultPositionRef = useRef<Vector3>(new Vector3(px, py, pz))

  const animateRotationRef = useRef<Euler>(new Euler(rx, ry, rz))
  const defaultRotationRef = useRef<Euler>(new Euler(rx, ry, rz))

  const animateMaterialRef = useRef<MeshPhysicalMaterial>(new MeshPhysicalMaterial({ ...defaultPhysicalMaterialProperties }))
  const targetMaterialRef = useRef<MeshPhysicalMaterial | null>(null)

  const materialReadyRef = useRef<boolean>(false)

  useEffect(() => {
    if (meshRef.current &&
      typeof onMeshReady === 'function' &&
      geometry
    ) onMeshReady(meshRef.current)
  }, [geometry, onMeshReady])

  useEffect(() => {
    const material: MeshPhysicalMaterial = animateMaterialRef.current
    if (meshRef.current) meshRef.current.material = animateMaterialRef.current
    return () => material.dispose()
  }, [])

  useLayoutEffect(() => {
    if (geometry && meshRef.current) meshRef.current.userData.slug = slug
  }, [geometry, slug])

  useLayoutEffect(() => {
    if (geometry && meshRef.current) {
      defaultPositionRef.current.set(px, py, pz)
      meshRef.current.position.copy(defaultPositionRef.current)
    }
  }, [geometry, px, py, pz])

  useLayoutEffect(() => {
    if (meshRef.current && geometry) {
      if (meshRef.current?.geometry && meshRef.current.geometry.boundingBox) {
        meshRef.current.geometry.computeBoundingBox()
        meshRef.current.geometry.boundingBox.getSize(_scratchSizeRef.current)
        if (camera instanceof PerspectiveCamera) {
          fitToPerspectiveCameraFrustum(
            camera,
            _scratchSizeRef.current,
            scaleRef.current,
            meshRef.current,
            scale,
            true,
            0.08,
            cameraDistanceZ
          )
        }
      }
    }
  }, [camera, geometry, scale])

  function updateRotationAnimation(
    rotationMode: string,
    deltaRotation: Transform3,
    frameDelta: number
  ): void {
    if (!meshRef.current) return

    const hasRotationModeChanged: boolean = rotationMode !== rotationModeRef.current

    if (hasRotationModeChanged) {
      animateRotationRef.current.copy(meshRef.current.rotation)
      rotationModeRef.current = rotationMode
    }

    const target: Euler = rotationMode === ROTATION_CONTROL_MODE.IDLE ? defaultRotationRef.current : animateRotationRef.current
    const smoothTime: number = rotationMode === ROTATION_CONTROL_MODE.IDLE ? 1.5 : 1

    switch (rotationMode) {
      case ROTATION_CONTROL_MODE.AUTO: {
        const y: number = animateRotationRef.current.y + frameDelta * rotationSpeed
        const wY: number = wrap(y, 0, (Math.PI * 2))
        animateRotationRef.current.set(defaultRotationRef.current.x, wY, defaultRotationRef.current.z)
        break
      }
      case ROTATION_CONTROL_MODE.MANUAL: {
        const { x = 0, y = 0, z = 0 } = deltaRotation
        animateRotationRef.current.set(defaultRotationRef.current.x + x, defaultRotationRef.current.y + y, defaultRotationRef.current.z + z)
        break
      }
      case ROTATION_CONTROL_MODE.IDLE:
      default:
        animateRotationRef.current.set(defaultRotationRef.current.x, defaultRotationRef.current.y, defaultRotationRef.current.z)
    }

    if (eulerDistance(meshRef.current.rotation, target) > EPSILON_3e3) {
      easing.dampE(meshRef.current.rotation, target, smoothTime, frameDelta)
    }

    rotationModeRef.current = rotationMode
  }

  function updatePositionAnimation(
    positionMode: string,
    xOffset: number = 0,
    yOffset: number = 0,
    zOffset: number = 0,
    frameDelta: number
  ): void {
    if (!meshRef.current) return

    if (positionMode !== positionModeRef.current) positionModeRef.current = positionMode

    switch (positionMode) {
      case POSITION_CONTROL_MODE.ENABLED:
        animatePositionRef.current.set(
          defaultPositionRef.current.x + xOffset,
          defaultPositionRef.current.y + yOffset,
          defaultPositionRef.current.z + zOffset
        )
        break
      case POSITION_CONTROL_MODE.DISABLED:
        animatePositionRef.current.set(
          defaultPositionRef.current.x,
          defaultPositionRef.current.y,
          defaultPositionRef.current.z
        )
      default:
    }

    if (meshRef.current.position.distanceTo(animatePositionRef.current) > EPSILON_3e3) {
      easing.damp3(meshRef.current.position, animatePositionRef.current, 1.15, frameDelta)
    }
  }

  function updateMaterialCacheParameters(materialToUpdate: MeshPhysicalMaterial): void {
    if (materialToUpdate) {
      if (animateMaterialRef.current.side !== materialToUpdate.side) {
        animateMaterialRef.current.side = materialToUpdate.side ?? DoubleSide
        animateMaterialRef.current.needsUpdate = true
      }
      // NOTE: Currently these 3 texture map slots never non-null for any material in materialStore, needsUpdate is set to true regardless.
      // If the two materials have different textures then assign and set needsUpdate.
      if (
        animateMaterialRef.current?.bumpMap &&
        animateMaterialRef.current.bumpMap.uuid !== materialToUpdate.bumpMap?.uuid
      ) {
        animateMaterialRef.current.bumpMap = materialToUpdate?.bumpMap
        animateMaterialRef.current.needsUpdate = true
      }
      if (
        animateMaterialRef.current?.map &&
        animateMaterialRef.current.map.uuid !== materialToUpdate.map?.uuid
      ) {
        animateMaterialRef.current.map = materialToUpdate?.map
        animateMaterialRef.current.needsUpdate = true
      }
      if (
        animateMaterialRef.current?.roughnessMap &&
        animateMaterialRef.current.roughnessMap.uuid !== materialToUpdate.roughnessMap?.uuid
      ) {
        animateMaterialRef.current.roughnessMap = materialToUpdate.roughnessMap
        animateMaterialRef.current.needsUpdate = true
      }
    }
  }

  useFrame(({ camera: cam }, delta) => {
    if (!meshRef.current || !nodeName?.length) return

    const clampedDelta: number = Math.min(delta, 0.08)
    const materialStore: MaterialStoreState = useMaterial.getState()
    const texturesReady: boolean = materialStore.texturesInitialized?.length > 0
    const { focusedSlug, autoRotationActive, focusedMaterialID, deltaRotation } = useSelection.getState()
    const selectedAndFocused: boolean = focusedSlug !== null && focusedSlug === slug
    const selectedMaterialID: string = selectedAndFocused && focusedMaterialID?.length ? focusedMaterialID : defaultMaterialID
    const shouldAnimateMaterial: boolean = materialIDs.length > 1
    const positionMode: string = selectedAndFocused ? POSITION_CONTROL_MODE.ENABLED : POSITION_CONTROL_MODE.DISABLED
    const rotationMode: string = !selectedAndFocused ? ROTATION_CONTROL_MODE.IDLE : autoRotationActive ? ROTATION_CONTROL_MODE.AUTO : ROTATION_CONTROL_MODE.MANUAL

    if (cam instanceof PerspectiveCamera) {
      fitToPerspectiveCameraFrustum(
        cam,
        _scratchSizeRef.current,
        scaleRef.current,
        meshRef.current,
        scale,
        false,
        clampedDelta,
        cameraDistanceZ
      )
    }

    updatePositionAnimation(positionMode, 0, 0, FOCUS_Z_OFFSET, clampedDelta)
    updateRotationAnimation(rotationMode, deltaRotation, clampedDelta)

    if (!texturesReady) return
    // one-shot
    if (!materialReadyRef.current) {
      const variants = materialStore.getSelectedMaterials(materialIDs)
      const defaultMaterial: MeshPhysicalMaterial | MeshStandardMaterial | null = variants[defaultMaterialID]

      if (defaultMaterial !== null && defaultMaterial instanceof MeshPhysicalMaterial) {
        animateMaterialRef.current.copy(defaultMaterial)
        animateMaterialRef.current.needsUpdate = true
        targetMaterialIDRef.current = defaultMaterialID
        targetMaterialRef.current = defaultMaterial
        materialReadyRef.current = true
      }
      return
    }

    if (selectedMaterialID !== targetMaterialIDRef.current) {
      const variants = materialStore.getSelectedMaterials(materialIDs)
      const targetMaterial: MeshPhysicalMaterial | MeshStandardMaterial | null = variants[selectedMaterialID]

      if (targetMaterial !== null && targetMaterial instanceof MeshPhysicalMaterial) {
        targetMaterialIDRef.current = selectedMaterialID
        targetMaterialRef.current = targetMaterial
      }
    }
    if (shouldAnimateMaterial && targetMaterialRef.current) {
      easeMaterialProperties(animateMaterialRef.current, targetMaterialRef.current, clampedDelta)
      updateMaterialCacheParameters(targetMaterialRef.current)
    }
  })

  return (
    geometry && nodeName && (
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        geometry={geometry}
        name={nodeName}
        onClick={onClick}
      // rotation={[rx, ry, rz]}
      />
    )
  )
}

export default memo(ProjectMesh)