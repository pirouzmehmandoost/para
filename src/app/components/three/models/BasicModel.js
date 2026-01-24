'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import { materialConfig } from '@configs/materialConfigs';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

useGLTF.preload('/yoga_mat_strap_for_web2.glb');
useGLTF.preload('/bag_v3.5-transformed.glb');
useGLTF.preload('/bag_9_BAT-transformed.glb');

const BasicModel = (props) => {
  const {
    autoRotate = true,
    autoRotateSpeed = 0.5,
    fileData: { nodeName = '', url = '' } = {},
    materials: { defaultMaterialID = '' } = {},
    onClick = undefined,
    onMeshReady = undefined,
    position = { x: 0, y: 0, z: 0 },
    rotation = 0,
    scale = 1,
  } = props;

  const geometry = useGLTF(url).nodes?.[nodeName]?.geometry || null;
  const isFocused = useSelection((state) => state.selection.isFocused);
  const selectedMaterialID = useSelection((state) => state.selection.materialID);
  const materials = useMaterial(state => state.materials);

  const meshRef = useRef(undefined);
  const animateRotationRef = useRef(new THREE.Euler());
  const animatePositionRef = useRef(new THREE.Vector3(0, 0, 0));
  // const defaultPositionRef = useRef(new THREE.Vector3(position.x, position.y, position.z));

  const selectedMaterialRef = useRef(null);
  const defaultMaterialRef = useRef(new THREE.MeshPhysicalMaterial({ ...materialConfig }));
  const blendedMaterialRef = useRef(new THREE.MeshPhysicalMaterial({ ...materialConfig }));

  useLayoutEffect(() => {
    if (meshRef.current) {
      const selectedMatID = selectedMaterialID.length && isFocused?.length && (isFocused === nodeName)
        ? selectedMaterialID
        : defaultMaterialID;

      const selectedMat = materials[selectedMatID]?.material;
      selectedMaterialRef.current = selectedMat

      const defaultMat = materials[defaultMaterialID]?.material;
      defaultMaterialRef.current.copy(defaultMat);
    }
  }, [defaultMaterialID, isFocused, materials, nodeName, selectedMaterialID]);


  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.updateWorldMatrix(true, true);
      blendedMaterialRef.current.copy(defaultMaterialRef.current);

      if (typeof onMeshReady === 'function') onMeshReady(meshRef.current);
    }
  }, [onMeshReady]);

  useFrame(({ clock }, delta) => {
    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
    const elapsedTime = clock.elapsedTime;
    const sine = Math.sin(elapsedTime) / 2;

    if (meshRef?.current && nodeName?.length) {
      meshRef.current.updateWorldMatrix(true, true);

      if (isFocused?.length && isFocused === nodeName) {

        animatePositionRef.current.set(
          meshRef.current.position.x + sine,
          meshRef.current.position.y + sine,
          meshRef.current.position.z + sine
        );
        easing.damp3(meshRef.current.position, animatePositionRef.current, 1, clampedDelta);

        animateRotationRef.current.set(0, Math.PI * rotation, 0);
        if (autoRotate) easing.dampE(meshRef.current.rotation, animateRotationRef.current, 1.5, clampedDelta);
    
        easing.dampC(blendedMaterialRef.current.color, selectedMaterialRef.current.color, 0.3, clampedDelta)
        easing.damp(blendedMaterialRef.current, "reflectivity", selectedMaterialRef.current?.reflectivity ?? 0, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "roughness", selectedMaterialRef.current?.roughness ?? 0, 0.3, clampedDelta);
      }
      else {
        animatePositionRef.current.set(...meshRef.current.position);
        animateRotationRef.current.set(0, meshRef.current.rotation.y, 0);
        if (autoRotate) meshRef.current.rotation.y += delta * autoRotateSpeed;

        easing.dampC(blendedMaterialRef.current.color, defaultMaterialRef.current.color, 0.3, clampedDelta)
        easing.damp(blendedMaterialRef.current, "reflectivity", defaultMaterialRef.current?.reflectivity ?? 0, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "roughness", defaultMaterialRef.current?.roughness ?? 0, 0.3, clampedDelta);
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
          rotation={[0, Math.PI * rotation, 0]}
          scale={scale}
        />
      )}
    </>
  );
};

export default BasicModel;