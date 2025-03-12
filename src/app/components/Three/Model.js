'use client';

import { useRef } from 'react';
import { Vector3, Cache } from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import useMaterial from '@/stores/materialStore';
import { Select } from '@react-three/postprocessing';

Cache.enabled = true;

const Model = ({ onHover, ...props }) => {
  const meshRef = useRef(undefined);
  const getMaterial = useMaterial((state) => state.getMaterial);
  const {
    autoRotate = true,
    isPointerOver = '',
    materialId,
    modelUrl: { name = '', url = '' } = {},
    position = new Vector3(0, -25, 0),
    scale,
  } = props;
  let mesh = useGLTF(url).nodes[`${name}`];

  // console.log('meshRef.current', meshRef.current);

  const meshProps = {
    name,
    geometry: mesh.geometry,
    material: getMaterial(materialId).material,
    position,
    scale,
  };

  useFrame((state, delta) => {
    if (meshRef?.current && autoRotate) {
      meshRef.current.rotation.y += delta / 2;
    }
  });

  return (
    <>
      {mesh && (
        <Select enabled={isPointerOver === name}>
          <mesh
            onClick={(e) => onHover(meshRef)}
            ref={meshRef}
            castShadow={true}
            recieveShadow={true}
            {...meshProps}
          />
        </Select>
      )}
    </>
  );
};

export default Model;
