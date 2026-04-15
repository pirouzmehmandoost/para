'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import useMaterial, { defaultMeshPhysicalMaterialConfig } from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import { eulerDistance, generalThreshold, largeThreshold, RotationAnimationModes, PositionAnimationModes, wrap } from '@utils/animationUtils';

const Model = (props) => {
  const {
    fileData: { nodeName = '', url = '' } = {},
    materials: { defaultMaterialID = 'matte_black', materialIDs = [], } = {},
    onClick = undefined,
    onMeshReady = undefined,
    rotation: { x: rx = 0, y: ry = 0, z: rz = 0 } = {},
    position: { x: px = 0, y: py = 0, z: pz = 0 } = {},
    rotationSpeed = 0.5,
    scale = 1,
  } = props;

  const { camera } = useThree();
  const geometry = useGLTF(url).nodes?.[nodeName]?.geometry || null;

  const _scratchSizeRef = useRef(new THREE.Vector3());

  const meshRef = useRef(undefined);

  const scaleRef = useRef(new THREE.Vector3(0, 0, 0));

  const defaultRotationRef = useRef(new THREE.Euler(Math.PI * rx, Math.PI * ry, Math.PI * rz)); // original rotation.
  const animateRotationRef = useRef(new THREE.Euler(Math.PI * rx, Math.PI * ry, Math.PI * rz)); // transform rotation
  const rotationModeRef = useRef(null);

  const defaultPositionRef = useRef(new THREE.Vector3(px, py, pz));  // original rotation.
  const animatePositionRef = useRef(new THREE.Vector3(px, py, pz));  // transform rotation.
  const positionModeRef = useRef(null);

  const animateMaterialRef = useRef(new THREE.MeshPhysicalMaterial({ ...defaultMeshPhysicalMaterialConfig }));
  const materialReadyRef = useRef(false);
  const targetMaterialIDRef = useRef(null);
  const targetMaterialRef = useRef(null);

  useEffect(() => { if (meshRef.current && typeof onMeshReady === 'function') onMeshReady(meshRef.current) }, [onMeshReady]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      defaultPositionRef.current.set(px, py, pz)
      meshRef.current.position.copy(defaultPositionRef.current);
    }
  }, [px, py, pz]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.computeBoundingBox();
      meshRef.current.geometry.boundingBox.getSize(_scratchSizeRef.current);
      updateCameraRelativeScale(camera, 0.08, true)
    }
  }, [scale]);

  function updateRotationAnimation(rotationMode, deltaRotation, frameDelta) {
    const didModeChange = rotationMode !== rotationModeRef.current;

    if (didModeChange) {
      animateRotationRef.current.copy(meshRef.current.rotation);
      rotationModeRef.current = rotationMode;
    }

    const refToUpdate = rotationMode === RotationAnimationModes.MODE_IDLE ? defaultRotationRef.current : animateRotationRef.current;
    const smoothTime = rotationMode === RotationAnimationModes.MODE_IDLE ? 1.5 : 1;

    if (rotationMode === RotationAnimationModes.MODE_TURNTABLE) {
      const y = animateRotationRef.current.y + frameDelta * rotationSpeed;
      const wY = wrap(y, 0, (Math.PI * 2));
      animateRotationRef.current.set(defaultRotationRef.current.x, wY, defaultRotationRef.current.z);
    }
    else if (rotationMode === RotationAnimationModes.MODE_MANUAL) {
  
      const { x = 0, y = 0, z = 0 } = deltaRotation;

      animateRotationRef.current.set(
        defaultRotationRef.current.x + x,
        defaultRotationRef.current.y + y,
        defaultRotationRef.current.z + z
      );
    }
    else if (rotationMode === RotationAnimationModes.MODE_IDLE) {
      animateRotationRef.current.set(
        defaultRotationRef.current.x,
        defaultRotationRef.current.y,
        defaultRotationRef.current.z
      );
    }

    if (eulerDistance(meshRef.current.rotation, refToUpdate) > generalThreshold) {
      easing.dampE(meshRef.current.rotation, refToUpdate, smoothTime, frameDelta);
    }

    rotationModeRef.current = rotationMode;
  };

  function updatePositionAnimation(positionMode, xOffset = 0, yOffset = 0, zOffset = 0, delta) {
    if (positionMode !== positionModeRef.current) positionModeRef.current = positionMode;

    if (positionMode === 'ENABLED') {
      animatePositionRef.current.set(
        defaultPositionRef.current.x + xOffset,
        defaultPositionRef.current.y + yOffset,
        defaultPositionRef.current.z + zOffset
      );
    }
    else if (positionMode === 'DISABLED') {
      animatePositionRef.current.set(
        defaultPositionRef.current.x,
        defaultPositionRef.current.y,
        defaultPositionRef.current.z
      );
    }

    if (meshRef.current.position.distanceTo(animatePositionRef.current) > generalThreshold) {
      easing.damp3(meshRef.current.position, animatePositionRef.current, 1.15, delta);
    }
  };

  function updateCameraRelativeScale(camera, delta, setOnMount = false) {
    if (!meshRef.current) return;

    const maxBoundingBoxDimension = Math.max(_scratchSizeRef.current.x, _scratchSizeRef.current.y);
    const verticalFOVinRadians = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(verticalFOVinRadians / 2) * 180;
    const visibleWidth = visibleHeight * camera.aspect;
    const targetSize = Math.min(visibleHeight, visibleWidth);
    const scaleFactor = scale * targetSize / (maxBoundingBoxDimension > 0 ? maxBoundingBoxDimension : 1);

    if (setOnMount) {
      scaleRef.current = new THREE.Vector3(scaleFactor, scaleFactor, scaleFactor);
      meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
      return;
    }

    scaleRef.current.set(scaleFactor, scaleFactor, scaleFactor);

    if (meshRef.current.scale.distanceTo(scaleRef.current) > largeThreshold) {
      easing.damp3(meshRef.current.scale, scaleRef.current, 0.3, delta);
    }
  };

  function easeMaterialProperties(materialToUpdate, delta) {
    if (!materialToUpdate) return;

    if (Math.abs(animateMaterialRef.current.bumpScale - materialToUpdate.bumpScale) > largeThreshold) easing.damp(animateMaterialRef.current, "bumpScale", materialToUpdate.bumpScale, 0.3, delta);

    if (Math.abs(animateMaterialRef.current.clearcoat - materialToUpdate.clearcoat) > largeThreshold) easing.damp(animateMaterialRef.current, "clearcoat", materialToUpdate.clearcoat, 0.3, delta);

    if (Math.abs(animateMaterialRef.current.clearcoatRoughness - materialToUpdate.clearcoatRoughness) > largeThreshold) easing.damp(animateMaterialRef.current, "clearcoatRoughness", materialToUpdate.clearcoatRoughness, 0.3, delta);

    if (!animateMaterialRef.current.color.equals(materialToUpdate.color)) easing.dampC(animateMaterialRef.current.color, materialToUpdate.color, 0.3, delta);

    if (Math.abs(animateMaterialRef.current.dispersion - materialToUpdate.dispersion) > largeThreshold) easing.damp(animateMaterialRef.current, "dispersion", materialToUpdate.dispersion, 0.3, delta);

    if (Math.abs(animateMaterialRef.current.reflectivity - materialToUpdate.reflectivity) > largeThreshold) easing.damp(animateMaterialRef.current, "reflectivity", materialToUpdate.reflectivity, 0.3, delta);

    if (Math.abs(animateMaterialRef.current.roughness - materialToUpdate.roughness) > largeThreshold) easing.damp(animateMaterialRef.current, "roughness", materialToUpdate.roughness, 0.3, delta);

    if (Math.abs(animateMaterialRef.current.thickness - materialToUpdate.thickness) > largeThreshold) easing.damp(animateMaterialRef.current, "thickness", materialToUpdate.thickness, 0.3, delta);

    if (Math.abs(animateMaterialRef.current.transmission - materialToUpdate.transmission) > largeThreshold) easing.damp(animateMaterialRef.current, "transmission", materialToUpdate.transmission, 0.3, delta);
  }

  function updateDeterministicMaterialProperties(materialToUpdate) {
    if (!materialToUpdate) return;

    if (animateMaterialRef.current.side !== materialToUpdate.side) {
      animateMaterialRef.current.side = materialToUpdate?.side ?? THREE.DoubleSide;
      animateMaterialRef.current.needsUpdate = true;
    }

    if (animateMaterialRef.current.transparent !== materialToUpdate.transparent) {
      animateMaterialRef.current.transparent = materialToUpdate.transparent ?? false;
      animateMaterialRef.current.needsUpdate = true;
    }

    // If the two materials have different textures (including one being null and the other non-null), assign and set needsUpdate.
    // NOTE: For now map slots on any material in materialStore are never non-null. Set needsUpdate = true anyway.
    if (animateMaterialRef.current?.bumpMap &&
      animateMaterialRef.current.bumpMap.uuid !== materialToUpdate.bumpMap?.uuid) {
      animateMaterialRef.current.bumpMap = materialToUpdate?.bumpMap;
      animateMaterialRef.current.needsUpdate = true;
    }

    if (animateMaterialRef.current?.map && 
      animateMaterialRef.current.map.uuid !== materialToUpdate.map?.uuid) {
      animateMaterialRef.current.map = materialToUpdate?.map;
      animateMaterialRef.current.needsUpdate = true;
    }

    if (animateMaterialRef.current?.roughnessMap &&
      animateMaterialRef.current.roughnessMap.uuid !== materialToUpdate.roughnessMap?.uuid) {
      animateMaterialRef.current.roughnessMap = materialToUpdate.roughnessMap;
      animateMaterialRef.current.needsUpdate = true;
    }

    if (animateMaterialRef.current?.transmissionMap &&
      animateMaterialRef.current.transmissionMap.uuid !== materialToUpdate.transmissionMap?.uuid) {
      animateMaterialRef.current.transmissionMap = materialToUpdate.transmissionMap;
      animateMaterialRef.current.needsUpdate = true;
    }
  };

  useFrame(({ clock, camera: cam }, delta) => {
    if (!meshRef.current || !nodeName?.length) return;

    const clampedDelta = Math.min(delta, 0.08);
    const elapsedTime = clock.elapsedTime;

    const matState = useMaterial.getState();
    const texturesReady = matState.texturesInitialized?.length > 0;
    const { selection } = useSelection.getState();
    const selectedAndFocused = selection.isFocused?.length > 0 && selection.isFocused === nodeName;

    updateCameraRelativeScale(cam, clampedDelta, false);

    const positionMode = !selectedAndFocused || !selection.sceneData.animatePosition ? PositionAnimationModes.DISABLED : PositionAnimationModes.ENABLED;
    updatePositionAnimation(
      positionMode,
      0,
      Math.abs(Math.cos(elapsedTime) * 2),
      Math.sin(elapsedTime) * 2,
      clampedDelta
    );

    const rotationMode = !selectedAndFocused || !selection.sceneData.animateRotation
      ? RotationAnimationModes.MODE_IDLE
      : (selection.sceneData.defaultRotationAnimationActive ? RotationAnimationModes.MODE_TURNTABLE : RotationAnimationModes.MODE_MANUAL);
    updateRotationAnimation(rotationMode, selection.sceneData.deltaRotation, clampedDelta);

    if (!texturesReady) return;

    const desiredMaterialID = selectedAndFocused && selection.materialID?.length
      ? selection.materialID
      : defaultMaterialID;

    if (!materialReadyRef.current) {
      // One-shot: seed animateMaterialRef from the store's default material
      const variants = matState.getSelectedMaterials(materialIDs);
      const mat = variants[defaultMaterialID];
      if (mat) {
        animateMaterialRef.current.copy(mat);
        animateMaterialRef.current.needsUpdate = true;
        targetMaterialIDRef.current = defaultMaterialID;
        targetMaterialRef.current = mat;
        materialReadyRef.current = true;
      }
      return;
    }

    if (desiredMaterialID !== targetMaterialIDRef.current) {
      const variants = matState.getSelectedMaterials(materialIDs);
      const mat = variants[desiredMaterialID];
      if (mat) {
        targetMaterialIDRef.current = desiredMaterialID;
        targetMaterialRef.current = mat;
      }
    }

    if (selection.sceneData.animateMaterial && targetMaterialRef.current) {
      easeMaterialProperties(targetMaterialRef.current, clampedDelta);
      updateDeterministicMaterialProperties(targetMaterialRef.current);
    }
  });

  return (
    <>
      {geometry && (
        <mesh
          ref={meshRef}
          castShadow={true}
          geometry={geometry}
          material={animateMaterialRef.current}
          name={nodeName}
          onClick={onClick}
          receiveShadow={true}
          rotation={defaultRotationRef.current}
        />
      )}
    </>
  );
};

export default Model;