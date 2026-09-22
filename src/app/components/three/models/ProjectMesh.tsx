'use client'

import { memo, useEffect, useLayoutEffect, useRef } from 'react'
import { BufferGeometry, Camera, DoubleSide, Euler, Mesh, MeshPhysicalMaterial, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { easing } from 'maath'
import useMaterial, { defaultMeshPhysicalMaterialConfig } from '@stores/materialStore'
import useSelection from '@stores/selectionStore'
import { eulerDistance, EPSILON_3e3, EPSILON_10e4, wrap } from '@utils/animationUtils'
import carouselConfigs from '@configs/carouselConfigs'

const cameraDistanceZ: number = carouselConfigs.OFFSET_POSITION[2]
const FOCUS_Z_OFFSET = 10

const PositionAnimationModes: Record<string, string> = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED'
}

const RotationAnimationModes: Record<string, string> = {
  IDLE: 'IDLE',
  AUTO: 'AUTO',
  MANUAL: 'MANUAL'
}

function fitToPerspectiveCameraFrustum(
  camera: PerspectiveCamera,
  sizeVector: Vector3,
  scaleVector: Vector3,
  target: Mesh,
  targetScale: number,
  setOnMount: boolean = false,
  frameDelta: number
) {
  const maxBoundingBoxDimension: number = Math.max(sizeVector.x, sizeVector.y)
  const verticalFOVinRadians = (camera.fov * Math.PI) / 180
  const visibleHeight = 2 * Math.tan(verticalFOVinRadians / 2) * cameraDistanceZ
  const visibleWidth = visibleHeight * camera.aspect
  const targetSize = Math.min(visibleHeight, visibleWidth)
  const scaleFactor: number = targetScale * targetSize / (maxBoundingBoxDimension > 0 ? maxBoundingBoxDimension : 1)

  if (setOnMount) {
    scaleVector.set(scaleFactor, scaleFactor, scaleFactor)
    target.scale.set(scaleFactor, scaleFactor, scaleFactor)
    return
  }

  scaleVector.set(scaleFactor, scaleFactor, scaleFactor)

  if (target.scale.distanceTo(scaleVector) > EPSILON_10e4) {
    easing.damp3(target.scale, scaleVector, 0.3, frameDelta)
  }
}

interface Props {
  nodeName: string
  url: string
  defaultMaterialID: string
  materialIDs: string[]
  onClick?: (event: ThreeEvent<MouseEvent>) => void
  onMeshReady?: (arg: Mesh) => void
  rotation: { x: number, y: number, z: number }
  position: { x: number, y: number, z: number }
  rotationSpeed: number
  scale: number
}

const ProjectMesh = (props: Props) => {
  const {
    nodeName = '',
    url = '',
    defaultMaterialID = 'matte_black',
    materialIDs = ['matte_black'],
    onClick = undefined,
    onMeshReady = undefined,
    rotation: { x: rx = 0, y: ry = 0, z: rz = 0 } = {},
    position: { x: px = 0, y: py = 0, z: pz = 0 } = {},
    rotationSpeed = 0.5,
    scale = 1,
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

  const animateMaterialRef = useRef<MeshPhysicalMaterial>(new MeshPhysicalMaterial({ ...defaultMeshPhysicalMaterialConfig }))
  const targetMaterialRef = useRef<MeshPhysicalMaterial | null>(null)

  const materialReadyRef = useRef<boolean>(false)

  useEffect(() => {
    if (meshRef.current && typeof onMeshReady === 'function' && geometry) onMeshReady(meshRef.current)
  }, [onMeshReady, geometry])


  useEffect(() => {
    const material = animateMaterialRef.current
    return () => material.dispose()
  }, [])

  useLayoutEffect(() => {
    if (nodeName) {
      const tryFillUUID = () => {
        const { focusedName, focusedUUID } = useSelection.getState()
        if (focusedName === nodeName && focusedUUID === null && meshRef.current) {
          useSelection.getState().setFocusedUUID(meshRef.current.uuid)
        }
      }

      tryFillUUID()
      return useSelection.subscribe(tryFillUUID)
    }
  }, [nodeName])

  useLayoutEffect(() => {
    if (geometry && meshRef.current) {
      defaultPositionRef.current.set(px, py, pz)
      meshRef.current.position.copy(defaultPositionRef.current)
    }
  }, [px, py, pz, geometry])

  useLayoutEffect(() => {
    if (meshRef.current && geometry) {
      meshRef.current.geometry.computeBoundingBox()
      meshRef.current.geometry.boundingBox.getSize(_scratchSizeRef.current)
      // updateCameraRelativeScale(camera as PerspectiveCamera, true, 0.08)
      if (camera instanceof PerspectiveCamera) fitToPerspectiveCameraFrustum(camera, _scratchSizeRef.current, scaleRef.current, meshRef.current, scale, true, 0.08)
    }
  }, [camera, scale, geometry])

  function updateRotationAnimation(
    rotationMode: string,
    deltaRotation: { x: number, y: number, z: number },
    frameDelta: number
  ) {
    const hasRotationModeChanged: boolean = rotationMode !== rotationModeRef.current
    if (hasRotationModeChanged) {
      animateRotationRef.current.copy(meshRef.current.rotation)
      rotationModeRef.current = rotationMode
    }

    const refToUpdate: Euler = rotationMode === RotationAnimationModes.IDLE ? defaultRotationRef.current : animateRotationRef.current
    const smoothTime: number = rotationMode === RotationAnimationModes.IDLE ? 1.5 : 1

    if (rotationMode === RotationAnimationModes.AUTO) {
      const y: number = animateRotationRef.current.y + frameDelta * rotationSpeed
      const wY: number = wrap(y, 0, (Math.PI * 2))
      animateRotationRef.current.set(defaultRotationRef.current.x, wY, defaultRotationRef.current.z)
    }
    else if (rotationMode === RotationAnimationModes.MANUAL) {
      const { x = 0, y = 0, z = 0 } = deltaRotation
      animateRotationRef.current.set(defaultRotationRef.current.x + x, defaultRotationRef.current.y + y, defaultRotationRef.current.z + z)
    }
    else if (rotationMode === RotationAnimationModes.IDLE) animateRotationRef.current.set(defaultRotationRef.current.x, defaultRotationRef.current.y, defaultRotationRef.current.z)

    if (eulerDistance(meshRef.current.rotation, refToUpdate) > EPSILON_3e3) easing.dampE(meshRef.current.rotation, refToUpdate, smoothTime, frameDelta)

    rotationModeRef.current = rotationMode
  };

  function updatePositionAnimation(positionMode: string, xOffset = 0, yOffset = 0, zOffset = 0, frameDelta: number) {
    if (positionMode !== positionModeRef.current) positionModeRef.current = positionMode

    if (positionMode === PositionAnimationModes.ENABLED) {
      animatePositionRef.current.set(defaultPositionRef.current.x + xOffset, defaultPositionRef.current.y + yOffset, defaultPositionRef.current.z + zOffset)
    }
    else if (positionMode === PositionAnimationModes.DISABLED) {
      animatePositionRef.current.set(defaultPositionRef.current.x, defaultPositionRef.current.y, defaultPositionRef.current.z)
    }

    if (meshRef.current.position.distanceTo(animatePositionRef.current) > EPSILON_3e3) easing.damp3(meshRef.current.position, animatePositionRef.current, 1, frameDelta)
  };

  // function _updateCameraRelativeScale(camera: PerspectiveCamera, setOnMount: boolean = false, frameDelta: number,) {
  //   if (meshRef.current) {
  //     const maxBoundingBoxDimension: number = Math.max(_scratchSizeRef.current.x, _scratchSizeRef.current.y)
  //     const verticalFOVinRadians = (camera.fov * Math.PI) / 180
  //     const visibleHeight = 2 * Math.tan(verticalFOVinRadians / 2) * cameraDistanceZ
  //     const visibleWidth = visibleHeight * camera.aspect
  //     const targetSize = Math.min(visibleHeight, visibleWidth)
  //     const scaleFactor = scale * targetSize / (maxBoundingBoxDimension > 0 ? maxBoundingBoxDimension : 1)

  //     if (setOnMount) {
  //       scaleRef.current = new Vector3(scaleFactor, scaleFactor, scaleFactor)
  //       meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor)
  //       return
  //     }

  //     scaleRef.current.set(scaleFactor, scaleFactor, scaleFactor)

  //     if (meshRef.current.scale.distanceTo(scaleRef.current) > EPSILON_10e4) {
  //       easing.damp3(meshRef.current.scale, scaleRef.current, 0.3, frameDelta)
  //     }
  //   }
  // };

  function easeMaterialProperties(materialToUpdate: MeshPhysicalMaterial, frameDelta: number) {
    if (materialToUpdate) {
      if (Math.abs(animateMaterialRef.current.bumpScale - materialToUpdate.bumpScale) > EPSILON_10e4) easing.damp(animateMaterialRef.current, "bumpScale", materialToUpdate.bumpScale, 0.3, frameDelta)

      if (Math.abs(animateMaterialRef.current.clearcoat - materialToUpdate.clearcoat) > EPSILON_10e4) easing.damp(animateMaterialRef.current, "clearcoat", materialToUpdate.clearcoat, 0.3, frameDelta)

      if (Math.abs(animateMaterialRef.current.clearcoatRoughness - materialToUpdate.clearcoatRoughness) > EPSILON_10e4) easing.damp(animateMaterialRef.current, "clearcoatRoughness", materialToUpdate.clearcoatRoughness, 0.3, frameDelta)

      if (!animateMaterialRef.current.color.equals(materialToUpdate.color)) easing.dampC(animateMaterialRef.current.color, materialToUpdate.color, 0.3, frameDelta)

      if (Math.abs(animateMaterialRef.current.ior - materialToUpdate.ior) > EPSILON_10e4) easing.damp(animateMaterialRef.current, "ior", materialToUpdate.ior, 0.3, frameDelta)

      if (Math.abs(animateMaterialRef.current.roughness - materialToUpdate.roughness) > EPSILON_10e4) easing.damp(animateMaterialRef.current, "roughness", materialToUpdate.roughness, 0.3, frameDelta)
    }
  }

  function updateMaterialCacheParameters(materialToUpdate: MeshPhysicalMaterial) {
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
  };

  useFrame(({ camera: cam }, delta) => {
    if (meshRef.current && nodeName?.length) {

      const clampedDelta: number = Math.min(delta, 0.08)
      const materialStore = useMaterial.getState()
      const texturesReady: boolean = materialStore.texturesInitialized?.length > 0
      const { focusedUUID, autoRotationActive, focusedMaterialID, deltaRotation } = useSelection.getState()
      const selectedAndFocused: boolean = focusedUUID !== null && focusedUUID === meshRef.current?.uuid
      const shouldAnimateMaterial: boolean = materialIDs.length > 1
      const positionMode: string = selectedAndFocused ? PositionAnimationModes.ENABLED : PositionAnimationModes.DISABLED
      const rotationMode: string = !selectedAndFocused ? RotationAnimationModes.IDLE : autoRotationActive ? RotationAnimationModes.AUTO : RotationAnimationModes.MANUAL
      const selectedMaterialID: string = selectedAndFocused && focusedMaterialID?.length ? focusedMaterialID : defaultMaterialID

      // if (cam instanceof PerspectiveCamera) updateCameraRelativeScale(cam, false, clampedDelta)
      if (cam instanceof PerspectiveCamera) fitToPerspectiveCameraFrustum(cam, _scratchSizeRef.current, scaleRef.current, meshRef.current, scale, false, clampedDelta)

      updatePositionAnimation(positionMode, 0, 0, FOCUS_Z_OFFSET, clampedDelta)
      updateRotationAnimation(rotationMode, deltaRotation, clampedDelta)

      if (!texturesReady) return

      // one-shot
      if (!materialReadyRef.current) {
        const variants = materialStore.getSelectedMaterials(materialIDs)
        const defaultMaterial = variants[defaultMaterialID]

        if (defaultMaterial) {
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
        const targetMaterial = variants[selectedMaterialID]

        if (targetMaterial) {
          targetMaterialIDRef.current = selectedMaterialID
          targetMaterialRef.current = targetMaterial
        }
      }

      if (shouldAnimateMaterial && targetMaterialRef.current) {
        easeMaterialProperties(targetMaterialRef.current, clampedDelta)
        updateMaterialCacheParameters(targetMaterialRef.current)
      }
    }
  })

  return (
    geometry && nodeName && (
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        geometry={geometry}
        material={animateMaterialRef.current}
        name={nodeName}
        onClick={onClick}
        rotation={[rx, ry,rz]}
        // rotation={defaultRotationRef.current}
      />
    )
  )
}

export default memo(ProjectMesh)