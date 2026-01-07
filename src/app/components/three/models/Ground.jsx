'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import useMaterial from '@stores/materialStore';
import { groundConfig } from '@/lib/configs/globals';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;
useGLTF.preload('/env_ground_3-transformed.glb');

const Ground = (props) => {
  const {
    setGroundMeshRef = undefined,
    position = [],
    rotation = [],
    scale = [],
  } = props;

  const { POSITION, ROTATION, SCALE } = groundConfig;

  const groundRef = useRef(undefined);
  const hasPositioned = useRef(false);

  const { nodes } = useGLTF('/env_ground_3-transformed.glb');
  const geometry = nodes?.Plane?.geometry;

  const getMaterial = useMaterial((state) => state.getMaterial);
  const material = getMaterial('ground')?.material;

  const pos = position?.length? position : POSITION;
  const rot = rotation?.length? rotation : ROTATION;
  const sc = scale?.length? scale : SCALE;

  if (!geometry) return null;

  useEffect(() => { 
    if (hasPositioned.current) return;

    if (groundRef.current && typeof setGroundMeshRef === 'function') {
      setGroundMeshRef(groundRef.current);
      hasPositioned.current = true;
    }
  }, [setGroundMeshRef]);

  return (
    <mesh
      castShadow={true}
      dispose={null}
      geometry={geometry}
      material={material}
      name={"Ground"}
      position={pos}
      receiveShadow={true}
      ref={groundRef}
      rotation={rot}
      scale={sc}
    />
  );
}

export default Ground;