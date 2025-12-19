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
  const ref = useRef(null);
  const hasPositioned = useRef(false);
  const { nodes } = useGLTF('/env_ground_3-transformed.glb');
  const getMaterial = useMaterial((state) => state.getMaterial);

  const {
    setGroundMeshRef,
    position,
    rotation,
    scale
  } = props;

  useEffect(() => { 
    if (hasPositioned.current) return;

    if (ref.current && setGroundMeshRef) {
      setGroundMeshRef(ref.current);
      hasPositioned.current = true;
    }
  }, [setGroundMeshRef]);

  const material = getMaterial('ground').material;
  material.side = THREE.DoubleSide;

  return (
    <>
      <mesh
        ref={ref}
        castShadow={true}
        dispose={null}
        geometry={nodes.Plane.geometry}
        material={material}
        position={position? position : groundConfig.position}
        receiveShadow={true}
        rotation={rotation? rotation : groundConfig.rotation}
        scale={scale? scale : groundConfig.scale}
      />
    </>
  );
}

export default Ground;