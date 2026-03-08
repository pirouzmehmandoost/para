'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import useMaterial from '@stores/materialStore';
import { groundConfig } from '@/lib/configs/groundConfig';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

const { POSITION, ROTATION, SCALE } = groundConfig;
const URL = '/env_ground_3-transformed.glb';
const NODE_NAME = 'ground';

useGLTF.preload(URL);

const Ground = (props) => {
  const {
    onGroundReady = undefined,
    position = [],
    rotation = [],
    scale = [],
  } = props;

  const groundRef = useRef(undefined);
  const hasPositionedRef = useRef(false);
  const geometry = useGLTF(URL).nodes?.Plane?.geometry ?? null;
  const materials = useMaterial.getState().materials;
  const material = materials[NODE_NAME].material;
  const groundPosition = position?.length ? position : POSITION;
  const groundRotation = rotation?.length ? rotation : ROTATION;
  const groundScale = scale?.length === 3 ? scale : SCALE;

  useEffect(() => {
    if (hasPositionedRef.current) return;

    if (groundRef.current) {
      groundRef.current?.updateMatrixWorld(true, true);

      if (typeof onGroundReady === 'function') {
        onGroundReady(groundRef.current);
      }
      hasPositionedRef.current = true;
    }
  }, [onGroundReady]);

  return (
    <>
      {geometry && (
        <mesh
          ref={groundRef}
          castShadow={false}
          geometry={geometry}
          material={material}
          name={"Ground"}
          position={groundPosition}
          receiveShadow={true}
          rotation={groundRotation}
          scale={groundScale}
        />
      )}
    </>
  );
}

export default Ground;
