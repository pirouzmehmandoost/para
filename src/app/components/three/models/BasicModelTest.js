'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import useMaterial, { defaultMeshPhysicalMaterialConfig } from '@stores/materialStore';
import useSelection from '@stores/selectionStore';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

useGLTF.preload('/yoga_mat_strap.glb');
useGLTF.preload('/textured_bag.glb');
useGLTF.preload('/sang.glb');

const BasicModelTest = (props) => {
  const {
    animateMaterial = true,
    animatePosition = false,
    animateRotation = true,
    rotationSpeed = 0.5,
    fileData: { nodeName = '', url = '' } = {},
    materials: { defaultMaterialID = '' } = {},
    onClick = undefined,
    onMeshReady = undefined,
    position = { x: 0, y: 0, z: 0 },
    rotation = 0,
    scale = 1,
  } = props;

  const { camera } = useThree();
  const geometry = useGLTF(url).nodes?.[nodeName]?.geometry || null;

  const isFocused = useSelection((state) => state.selection.isFocused);
  const selectedMaterialID = useSelection((state) => state.selection.materialID);
  const materials = useMaterial((state) => state.materials);

  const _scratchBoxRef = useRef(new THREE.Box3());
  const _scratchCenterRef = useRef(new THREE.Vector3());
  const _scratchSizeRef = useRef(new THREE.Vector3());
  const meshRef = useRef(undefined);
  const animateRotationRef = useRef(new THREE.Euler());
  const animatePositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const scaleRef = useRef(new THREE.Vector3(1, 1, 1));
  const defaultPositionRef = useRef(new THREE.Vector3(position.x, position.y, position.z));
  const selectedMaterialRef = useRef(null);
  const defaultMaterialRef = useRef(null);
  const blendedMaterialRef = useRef(new THREE.MeshPhysicalMaterial({ ...defaultMeshPhysicalMaterialConfig }));

  const initialRotation = useMemo(() => { return [0, Math.PI * rotation, 0] }, [rotation]);
  
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
      blendedMaterialRef.current.copy(defaultMaterialRef.current);
      if (typeof onMeshReady === 'function') onMeshReady(meshRef.current);
    }
  }, [onMeshReady]);

  useEffect(() => {
    if (!meshRef.current) return;
    // const worldScale = new THREE.Vector3();
    // meshRef.current.getWorldScale(worldScale);
    // console.log("Local Scale:", meshRef.current.scale.x);
    // console.log("World Scale:", worldScale.x);

    meshRef.current.updateWorldMatrix(true, true);
    meshRef.current.geometry.computeBoundingBox();
    meshRef.current.geometry.boundingBox.getSize(_scratchSizeRef.current);
    _scratchBoxRef.current.setFromObject(meshRef.current).getCenter(_scratchCenterRef.current);

    const maxBoundingBoxDimension = Math.max(_scratchSizeRef.current.x, _scratchSizeRef.current.y);
    const verticalFOVinRadians = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(verticalFOVinRadians / 2) * 180;
    const visibleWidth = visibleHeight * camera.aspect;

    const targetSize =  Math.min(visibleHeight, visibleWidth);
    const scaleFactor = scale * targetSize / maxBoundingBoxDimension;
    scaleRef.current = new THREE.Vector3(scaleFactor, scaleFactor, scaleFactor);
  }, [scale]);

  useFrame(({ clock, camera: cam}, delta) => {
    // Clamp to keep frames consecutive between browser tab navigation.
    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame.
    const elapsedTime = clock.elapsedTime;
    const sine = Math.sin(elapsedTime);
    const cos = Math.cos(elapsedTime);

    if (meshRef?.current && nodeName?.length) {
      meshRef.current.updateWorldMatrix(true, true);
      const selectedAndFocused = isFocused?.length && isFocused === nodeName;

      const maxBBDimension = Math.max(_scratchSizeRef.current.x, _scratchSizeRef.current.y);
      const verticalFOVinRadians = (cam.fov * Math.PI) / 180;
      const height = 2 * Math.tan(verticalFOVinRadians / 2) * 180;
      const width = height * cam.aspect;
      const targetSize =  Math.min(height, width);
      const scaleFactor = scale * targetSize / maxBBDimension;

      scaleRef.current.set(scaleFactor, scaleFactor, scaleFactor);
      easing.damp3(meshRef.current.scale, scaleRef.current, 0.3, clampedDelta);

      if (selectedAndFocused) {
        if (animatePosition) {
          animatePositionRef.current.set(defaultPositionRef.current.x, defaultPositionRef.current.y, defaultPositionRef.current.z);
          easing.damp3(meshRef.current.position, animatePositionRef.current, 1.15, clampedDelta);
        }

        if (animateRotation) {
          animateRotationRef.current.set(0, meshRef.current.rotation.y, 0);
          meshRef.current.rotation.y += delta * rotationSpeed;
        }

        if (animateMaterial) {
          easing.damp(blendedMaterialRef.current, "bumpScale", selectedMaterialRef.current?.bumpScale ?? 1, 0.3, clampedDelta);
          easing.dampC(blendedMaterialRef.current.color, selectedMaterialRef.current?.color ?? 'red', 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "dispersion", selectedMaterialRef.current?.dispersion ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "ior", selectedMaterialRef.current?.ior ?? 1.5, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "iridescence", selectedMaterialRef.current?.iridescence ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "iridescenceIOR", selectedMaterialRef.current?.iridescenceIOR ?? 1.3, 0.3, clampedDelta);
          easing.damp2(blendedMaterialRef.current.normalScale, selectedMaterialRef.current?.normalScale ?? [1, 1], 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "opacity", selectedMaterialRef.current?.opacity ?? 1, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "reflectivity", selectedMaterialRef.current?.reflectivity ?? 0.5, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "roughness", selectedMaterialRef.current?.roughness ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "thickness", selectedMaterialRef.current?.thickness ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "transmission", selectedMaterialRef.current?.transmission ?? 0, 0.3, clampedDelta);

          blendedMaterialRef.current.side = selectedMaterialRef.current?.side ?? THREE.DoubleSide;
          blendedMaterialRef.current.transparent = selectedMaterialRef.current?.tranparent ?? false;

          blendedMaterialRef.current.bumpMap = selectedMaterialRef.current?.bumpMap;
          blendedMaterialRef.current.map = selectedMaterialRef.current?.map;
          blendedMaterialRef.current.normalMap = selectedMaterialRef.current?.normalMap;
          blendedMaterialRef.current.roughnessMap = selectedMaterialRef.current?.roughnessMap;
          blendedMaterialRef.current.transmissionMap = selectedMaterialRef.current?.transmissionMap;
        }
      }
      else {

        if (animatePosition) {
          animatePositionRef.current.set(
            defaultPositionRef.current.x - sine * 0.5,
            defaultPositionRef.current.y + cos * 1.5,
            defaultPositionRef.current.z + sine
          );
          easing.damp3(meshRef.current.position, animatePositionRef.current, 1.15, clampedDelta);
        }

        if (animateRotation) {
          animateRotationRef.current.set(
            (0.015 * sine) % 1,
            (Math.PI * rotation) + ((0.025 * sine) % 1),
            (0.015 * cos) % 1
          );
          easing.dampE(meshRef.current.rotation, animateRotationRef.current, 1.5, clampedDelta);
        }

        if (animateMaterial) {
          easing.damp(blendedMaterialRef.current, "bumpScale", defaultMaterialRef.current?.bumpScale ?? 1, 0.3, clampedDelta);
          easing.dampC(blendedMaterialRef.current.color, defaultMaterialRef.current?.color ?? 'red', 0.3, clampedDelta)
          easing.damp(blendedMaterialRef.current, "dispersion", defaultMaterialRef.current?.dispersion ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "ior", defaultMaterialRef.current?.ior ?? 1.5, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "iridescence", defaultMaterialRef.current?.iridescence ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "iridescenceIOR", defaultMaterialRef.current?.iridescenceIOR ?? 1.3, 0.3, clampedDelta);
          easing.damp2(blendedMaterialRef.current.normalScale, defaultMaterialRef.current?.normalScale ?? [1, 1], 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "opacity", defaultMaterialRef.current?.opacity ?? 1, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "reflectivity", defaultMaterialRef.current?.reflectivity ?? 0.5, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "roughness", defaultMaterialRef.current?.roughness ?? 0.5, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "thickness", defaultMaterialRef.current?.thickness ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "transmission", defaultMaterialRef.current?.transmission ?? 0, 0.3, clampedDelta);

          blendedMaterialRef.current.side = defaultMaterialRef.current?.side ?? THREE.DoubleSide;
          blendedMaterialRef.current.tranparent = defaultMaterialRef.current?.tranparent ?? false;

          blendedMaterialRef.current.bumpMap = defaultMaterialRef.current?.bumpMap;
          blendedMaterialRef.current.map = defaultMaterialRef.current?.map;
          blendedMaterialRef.current.normalMap = defaultMaterialRef.current?.normalMap;
          blendedMaterialRef.current.roughnessMap = defaultMaterialRef.current?.roughnessMap;
          blendedMaterialRef.current.transmissionMap = defaultMaterialRef.current?.transmissionMap;
        }
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
          material={blendedMaterialRef.current}
          name={nodeName}
          onClick={onClick}
          position={position}
          receiveShadow={true}
          rotation={initialRotation}
          scale={scaleRef.current}
        />
      )}
    </>
  );
};

export default BasicModelTest;