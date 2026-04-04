'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import useMaterial, { defaultMeshPhysicalMaterialConfig } from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import { eulerDistance, epsilon, wrap } from '@utils/animationUtils';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

useGLTF.preload('/yoga_mat_strap.glb');
useGLTF.preload('/textured_bag.glb');
useGLTF.preload('/sang.glb');

const Model = (props) => {
  const {
    animateMaterial = true,
    animatePosition = false,
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
  const shouldAnimateRotation = useSelection((state) => state.selection.sceneData.animateRotation);
  const defaultRotationAnimationActive = useSelection((state) => state.selection.sceneData.defaultRotationAnimationActive);
  const rotationOffset = useSelection((state) => state.selection.sceneData.deltaRotation);

  const selectedMaterialID = useSelection((state) => state.selection.materialID);
  const materials = useMaterial((state) => state.materials);

  const _scratchBoxRef = useRef(new THREE.Box3());
  const _scratchCenterRef = useRef(new THREE.Vector3());
  const _scratchSizeRef = useRef(new THREE.Vector3());
  const meshRef = useRef(undefined);

  const scaleRef = useRef(new THREE.Vector3(1, 1, 1));

  const defaultRotationRef = useRef(new THREE.Euler(Math.PI * rx, Math.PI * ry, Math.PI * rz));
  const animateRotationRef = useRef(new THREE.Euler(Math.PI * rx, Math.PI * ry, Math.PI * rz));

  const defaultPositionRef = useRef(new THREE.Vector3(px, py, pz));
  const animatePositionRef = useRef(new THREE.Vector3(0, 0, 0));

  const selectedMaterialRef = useRef(null);
  const defaultMaterialRef = useRef(null);
  const animateMaterialRef = useRef(new THREE.MeshPhysicalMaterial({ ...defaultMeshPhysicalMaterialConfig }));

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

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.updateWorldMatrix(true, true);
      animateMaterialRef.current.copy(defaultMaterialRef.current);
      if (typeof onMeshReady === 'function') onMeshReady(meshRef.current);
    }
  }, [onMeshReady]);

  useEffect(() => {
    if (!meshRef.current) return;

    meshRef.current.updateWorldMatrix(true, true);
    meshRef.current.geometry.computeBoundingBox();
    meshRef.current.geometry.boundingBox.getSize(_scratchSizeRef.current);
    _scratchBoxRef.current.setFromObject(meshRef.current).getCenter(_scratchCenterRef.current);

    const maxBoundingBoxDimension = Math.max(_scratchSizeRef.current.x, _scratchSizeRef.current.y);
    const verticalFOVinRadians = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(verticalFOVinRadians / 2) * 180;
    const visibleWidth = visibleHeight * camera.aspect;

    const targetSize = Math.min(visibleHeight, visibleWidth);
    const scaleFactor = scale * targetSize / maxBoundingBoxDimension;

    scaleRef.current = new THREE.Vector3(scaleFactor, scaleFactor, scaleFactor);
  }, [scale]);

  useFrame(({ clock, camera: cam }, delta) => {
    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame. Clamp keeps frames consecutive between brower tab navigation.
    const elapsedTime = clock.elapsedTime;
    const sine = Math.sin(elapsedTime);
    const cos = Math.cos(elapsedTime);

    if (meshRef?.current && nodeName?.length) {
      meshRef.current.updateWorldMatrix(true, true);
      const selectedAndFocused = isFocused?.length && isFocused === nodeName;
      const materialToUpdate = selectedAndFocused ? selectedMaterialRef.current : defaultMaterialRef.current;

      const maxBBDimension = Math.max(_scratchSizeRef.current.x, _scratchSizeRef.current.y);
      const verticalFOVinRadians = (cam.fov * Math.PI) / 180;
      const height = 2 * Math.tan(verticalFOVinRadians / 2) * 180;
      const width = height * cam.aspect;
      const targetSize = Math.min(height, width);
      const scaleFactor = scale * targetSize / maxBBDimension;

      scaleRef.current.set(scaleFactor, scaleFactor, scaleFactor);
      easing.damp3(meshRef.current.scale, scaleRef.current, 0.3, clampedDelta);

      if (selectedAndFocused && animatePosition) {
        const xOffset = -1 * (sine * 0.5);
        const yOffset = (cos * 1.5);
        const zOffset = sine;

        animatePositionRef.current.set(
          defaultPositionRef.current.x + xOffset,
          defaultPositionRef.current.y + yOffset,
          defaultPositionRef.current.z + zOffset
        );
        easing.damp3(meshRef.current.position, animatePositionRef.current, 1.15, clampedDelta);
      }

      if (selectedAndFocused && shouldAnimateRotation) {
        if (defaultRotationAnimationActive) {  
          const y = animateRotationRef.current.y + clampedDelta * rotationSpeed
          const wY = wrap(y, 0, 2 * Math.PI);

          animateRotationRef.current.set(
            defaultRotationRef.current.x,
            wY,
            defaultRotationRef.current.z,
          );
        }
        else {
          const ox = rotationOffset?.x ?? 0;
          const oy = rotationOffset?.y ?? 0;
          const oz = rotationOffset?.z ?? 0;

          animateRotationRef.current.set(
            defaultRotationRef.current.x + ox, //+ ((0.015 * sine) % 1),
            defaultRotationRef.current.y + oy, // + ((0.025 * sine) % 1),
            defaultRotationRef.current.z + oz, // + ((0.015 * cos) % 1),
          );
        }

        if (eulerDistance(meshRef.current.rotation, animateRotationRef.current) > epsilon) {
          easing.dampE(meshRef.current.rotation, animateRotationRef.current, 1, clampedDelta);
        }
      }
      else {
        animateRotationRef.current.set(defaultRotationRef.current.x, defaultRotationRef.current.y, defaultRotationRef.current.z);

        if (eulerDistance(meshRef.current.rotation, defaultRotationRef.current) > epsilon) {
          easing.dampE(meshRef.current.rotation, defaultRotationRef.current, 1.5, clampedDelta);
        }
      }

      if (animateMaterial) {
        easing.damp(animateMaterialRef.current, "bumpScale", materialToUpdate?.bumpScale ?? 1, 0.3, clampedDelta);
        easing.dampC(animateMaterialRef.current.color, materialToUpdate?.color ?? 'red', 0.3, clampedDelta);
        easing.damp(animateMaterialRef.current, "dispersion", materialToUpdate?.dispersion ?? 0, 0.3, clampedDelta);
        easing.damp(animateMaterialRef.current, "ior", materialToUpdate?.ior ?? 1.5, 0.3, clampedDelta);
        easing.damp2(animateMaterialRef.current.normalScale, materialToUpdate?.normalScale ?? [1, 1], 0.3, clampedDelta);
        easing.damp(animateMaterialRef.current, "reflectivity", materialToUpdate?.reflectivity ?? 0.5, 0.3, clampedDelta);
        easing.damp(animateMaterialRef.current, "roughness", materialToUpdate?.roughness ?? 0, 0.3, clampedDelta);
        easing.damp(animateMaterialRef.current, "thickness", materialToUpdate?.thickness ?? 0, 0.3, clampedDelta);
        easing.damp(animateMaterialRef.current, "transmission", materialToUpdate?.transmission ?? 0, 0.3, clampedDelta);

        animateMaterialRef.current.side = materialToUpdate?.side ?? THREE.DoubleSide;
        animateMaterialRef.current.transparent = materialToUpdate?.transparent ?? false;

        animateMaterialRef.current.bumpMap = materialToUpdate?.bumpMap;
        animateMaterialRef.current.map = materialToUpdate?.map;
        animateMaterialRef.current.normalMap = materialToUpdate?.normalMap;
        animateMaterialRef.current.roughnessMap = materialToUpdate?.roughnessMap;
        animateMaterialRef.current.transmissionMap = materialToUpdate?.transmissionMap;
      }
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
          position={defaultPositionRef.current}
          receiveShadow={true}
          rotation={defaultRotationRef.current}
          scale={scaleRef.current}
        />
      )}
    </>
  );
};

export default Model;