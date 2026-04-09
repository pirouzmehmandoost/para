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
    rotationSpeed = 0.5,
    fileData: { nodeName = '', url = '' } = {},
    materials: { defaultMaterialID = '' } = {},
    onClick = undefined,
    onMeshReady = undefined,
    rotation: { x: rx = 0, y: ry = 0, z: rz = 0 } = {},
    position: { x: px = 0, y: py = 0, z: pz = 0 } = {},
    scale = 1,
  } = props;

  const { camera } = useThree();
  const geometry = useGLTF(url).nodes?.[nodeName]?.geometry || null;

  const isFocused = useSelection((state) => state.selection.isFocused);
  const turntableRotationAnimation = useSelection((state) => state.selection.sceneData.defaultRotationAnimationActive);
  const rotationOffset = useSelection((state) => state.selection.sceneData.deltaRotation);
  const shouldAnimateRotation = useSelection((state) => state.selection.sceneData.animateRotation);
  const shouldAnimatePosition = useSelection((state) => state.selection.sceneData.animatePosition);
  const shouldAnimateMaterial = useSelection((state) => state.selection.sceneData.animateMaterial);
  const selectedMaterialID = useSelection((state) => state.selection.materialID);

  const materials = useMaterial((state) => state.materials);

  const _scratchSizeRef = useRef(new THREE.Vector3());

  const meshRef = useRef(undefined);

  const scaleRef = useRef(new THREE.Vector3(0, 0, 0));

  const defaultRotationRef = useRef(new THREE.Euler(Math.PI * rx, Math.PI * ry, Math.PI * rz));
  const animateRotationRef = useRef(new THREE.Euler(Math.PI * rx, Math.PI * ry, Math.PI * rz));
  const rotationModeRef = useRef(null);

  const defaultPositionRef = useRef(new THREE.Vector3(px, py, pz));
  const animatePositionRef = useRef(new THREE.Vector3(px, py, pz));
  const positionModeRef = useRef(null);

  const selectedMaterialRef = useRef(null);
  const defaultMaterialRef = useRef(null);
  const animateMaterialRef = useRef(new THREE.MeshPhysicalMaterial({ ...defaultMeshPhysicalMaterialConfig }));

  function computeRotationAnimation(rotationMode, delta) {
    const didModeChange = rotationMode !== rotationModeRef.current;

    if (didModeChange) {
      animateRotationRef.current.copy(meshRef.current.rotation);
      rotationModeRef.current = rotationMode;
    }

    const refToUpdate = rotationMode === RotationAnimationModes.MODE_IDLE ? defaultRotationRef.current : animateRotationRef.current;
    const smoothTime = rotationMode === RotationAnimationModes.MODE_IDLE ? 1.5 : 1;

    if (rotationMode === RotationAnimationModes.MODE_TURNTABLE) {
      const y = animateRotationRef.current.y + delta * rotationSpeed;
      const wY = wrap(y, 0, (Math.PI * 2));
      animateRotationRef.current.set(defaultRotationRef.current.x, wY, defaultRotationRef.current.z);
    }
    else if (rotationMode === RotationAnimationModes.MODE_MANUAL) {
      const ox = rotationOffset?.x ?? 0;
      const oy = rotationOffset?.y ?? 0;
      const oz = rotationOffset?.z ?? 0;

      animateRotationRef.current.set(
        defaultRotationRef.current.x + ox,
        defaultRotationRef.current.y + oy,
        defaultRotationRef.current.z + oz
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
      easing.dampE(meshRef.current.rotation, refToUpdate, smoothTime, delta);
    }

    rotationModeRef.current = rotationMode;
  };

  function computePositionAnimation(positionMode, xOffset = 0, yOffset = 0, zOffset = 0, delta) {
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

  function computeMeshScale(camera, delta, setOnMount = false) {
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
    if (!shouldAnimateMaterial || !materialToUpdate) return;

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
    if (!shouldAnimateMaterial || !materialToUpdate) return;

    if (animateMaterialRef.current.side !== materialToUpdate.side) {
      animateMaterialRef.current.side = materialToUpdate?.side ?? THREE.DoubleSide;
      animateMaterialRef.current.needsUpdate = true;
    }

    if (animateMaterialRef.current.transparent !== materialToUpdate.transparent) {
      animateMaterialRef.current.transparent = materialToUpdate.transparent ?? false;
      animateMaterialRef.current.needsUpdate = true;
    }

    if (animateMaterialRef.current?.bumpMap &&
      animateMaterialRef.current.bumpMap.uuid !== materialToUpdate.bumpMap?.uuid) {
      animateMaterialRef.current.bumpMap = materialToUpdate?.bumpMap;
    }

    if ((animateMaterialRef.current?.map && materialToUpdate?.map) &&
      animateMaterialRef.current.map.uuid !== materialToUpdate.map.uuid) {
      animateMaterialRef.current.map = materialToUpdate.map;
    }

    if ((animateMaterialRef.current?.roughnessMap && materialToUpdate?.roughnessMap) &&
      animateMaterialRef.current.roughnessMap.uuid !== materialToUpdate.roughnessMap.uuid) {
      animateMaterialRef.current.roughnessMap = materialToUpdate.roughnessMap;
    }

    if ((animateMaterialRef.current?.transmissionMap && materialToUpdate?.transmissionMap) &&
      animateMaterialRef.current.transmissionMap.uuid !== materialToUpdate.transmissionMap.uuid) {
      animateMaterialRef.current.transmissionMap = materialToUpdate.transmissionMap;
    }
  };

  useEffect(() => {
    if (meshRef.current) {
      animateMaterialRef.current.copy(defaultMaterialRef.current);
      if (typeof onMeshReady === 'function') onMeshReady(meshRef.current);
    }
  }, [onMeshReady]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      const selectedAndFocused = isFocused?.length && (isFocused === nodeName);
      const selectedMatID = selectedMaterialID?.length && selectedAndFocused ? selectedMaterialID : defaultMaterialID;
      const selectedMat = materials[selectedMatID]?.material;
      selectedMaterialRef.current = selectedMat;
      const defaultMat = materials[defaultMaterialID]?.material;
      defaultMaterialRef.current = defaultMat;
    }
  }, [defaultMaterialID, isFocused, materials, nodeName, selectedMaterialID]);

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
      computeMeshScale(camera, 0.08, true)
    }
  }, [scale]);

  useFrame(({ clock, camera: cam }, delta) => {
    const clampedDelta = Math.min(delta, 0.08);
    const elapsedTime = clock.elapsedTime;
    const positionOffsetY =  Math.abs(Math.cos(elapsedTime) * 2);
    const positionOffsetZ =  Math.sin(elapsedTime) * 2;

    if (!meshRef.current || !nodeName?.length) return;

    const selectedAndFocused = isFocused?.length && isFocused === nodeName;
    const positionMode = !selectedAndFocused || !shouldAnimatePosition
      ? PositionAnimationModes.DISABLED
      : PositionAnimationModes.ENABLED;
    const rotationMode = !selectedAndFocused || !shouldAnimateRotation
      ? RotationAnimationModes.MODE_IDLE
      : (turntableRotationAnimation ? RotationAnimationModes.MODE_TURNTABLE : RotationAnimationModes.MODE_MANUAL);
    const materialToUpdate = selectedAndFocused ? selectedMaterialRef.current : defaultMaterialRef.current;

    computeMeshScale(cam, clampedDelta, false);
    computePositionAnimation(positionMode, 0, positionOffsetY, positionOffsetZ, clampedDelta);
    computeRotationAnimation(rotationMode, clampedDelta);
    easeMaterialProperties(materialToUpdate, clampedDelta);
    updateDeterministicMaterialProperties(materialToUpdate);
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