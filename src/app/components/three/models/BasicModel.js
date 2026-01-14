'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import { easing } from 'maath';

THREE.Cache.enabled = true;
useGLTF.preload('/bag_v5_for_web-transformed.glb');
useGLTF.preload('/yoga_mat_strap_for_web2.glb');
useGLTF.preload('/bag_v3.5-transformed.glb');
useGLTF.preload('/bag_9_BAT-transformed.glb');

const BasicModel = (props) => {
  const {
    autoRotate = true,
    autoRotateSpeed = 0.5,
    fileData: { nodeName = '', url = '' } = {},
    materialId = '',
    materials: { defaultMaterial = '' } = {},
    onClick = undefined,
    onMeshReady = undefined,
    position = { x: 0, y: 0, z: 0 },
    rotation = 0,
    scale = 1,
  } = props;

  const geometry = useGLTF(url).nodes?.[nodeName]?.geometry || null;
  const meshRef = useRef(undefined);
  const animateRotationRef = useRef(new THREE.Euler());
  const animatePositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const isFocused = useSelection((state) => state.selection.isFocused);
  const getMaterial = useMaterial((state) => state.getMaterial);

  const matId = materialId?.length ? materialId : defaultMaterial;
  const material = getMaterial(matId)?.material;

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.updateWorldMatrix(true, true);
      if (onMeshReady) onMeshReady(meshRef.current);
    }
  }, [onMeshReady]);

  useFrame(({ clock }, delta) => {
    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
    const elapsedTime = clock.elapsedTime;
    const sine = Math.sin(elapsedTime) / 2;

    if (meshRef?.current && nodeName?.length) {
      meshRef.current.updateWorldMatrix();

      if (autoRotate) {
        if (isFocused?.length && isFocused === nodeName) {
          animatePositionRef.current.set(meshRef.current.position.x + sine, meshRef.current.position.y + sine, meshRef.current.position.z + sine);
          animateRotationRef.current.set(0, Math.PI*rotation, 0);
          easing.damp3(meshRef.current.position, animatePositionRef.current, 1, clampedDelta);
          easing.dampE(meshRef.current.rotation, animateRotationRef.current, 1.5, clampedDelta);
        }
        else {
          animatePositionRef.current.set(...meshRef.current.position);
          animateRotationRef.current.set(0, meshRef.current.rotation.y, 0);
          meshRef.current.rotation.y += delta * autoRotateSpeed;
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
          material={material}
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