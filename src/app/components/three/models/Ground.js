'use client';

import { memo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import useMaterial from '@stores/materialStore';
import groundConfigs from '@configs/groundConfigs';

const { NODE_NAME, POSITION, ROTATION, SCALE, URL } = groundConfigs;

const Ground = (props) => {
  const {
    // onGroundReady = undefined,
    position = [],
    rotation = [],
    scale = [],
  } = props;

  const groundRef = useRef(undefined);
  // const hasPositionedRef = useRef(false);
  const geometry = useGLTF(URL).nodes?.Plane?.geometry ?? null;

  const materials = useMaterial.getState().materials;
  const material = materials[NODE_NAME].material;

  const groundPosition = position?.length ? position : POSITION;
  const groundRotation = rotation?.length ? rotation : ROTATION;
  const groundScale = scale?.length === 3 ? scale : SCALE;

  // useEffect(() => {
  //   if (hasPositionedRef.current) return;

  //   if (groundRef.current) {
  //     if (typeof onGroundReady === 'function') {
  //       onGroundReady(groundRef.current);
  //     }
  //     hasPositionedRef.current = true;
  //   }
  // }, [onGroundReady]);

  return (
    <>
      {geometry && (
        <mesh
          ref={groundRef}
          castShadow={false}
          geometry={geometry}
          material={material}
          position={groundPosition}
          receiveShadow={true}
          rotation={groundRotation}
          scale={groundScale}
        />
      )}
    </>
  );
}

export default memo(Ground);
