'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import useMaterial from '@stores/materialStore';
import { groundConfig } from '@/lib/configs/globals';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

const Ground = ({setGroundMeshRef}) => {
  const ref = useRef(null);
  const { nodes } = useGLTF('/env_ground_3-transformed.glb');
  const getMaterial = useMaterial((state) => state.getMaterial);

  useEffect(() => { if (ref.current && setGroundMeshRef) setGroundMeshRef(ref.current); }, [setGroundMeshRef]);

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
        position={groundConfig.position}
        receiveShadow={true}
        rotation={[groundConfig.rotation, 0, 0]}
        scale={groundConfig.scale}
      />
    </>
  );
}

useGLTF.preload('/env_ground_3-transformed.glb');

export default Ground;