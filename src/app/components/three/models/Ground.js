'use client';

import { memo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import useMaterial from '@stores/materialStore';
import groundConfigs from '@configs/groundConfigs';

const {
  groundProps: {
    nodeName: NODE_NAME,
    position: POSITION,
    rotation: ROTATION,
    materialID: MATERIAL_ID,
    scale: SCALE,
    url: URL
  },
} = groundConfigs;

const Ground = (props) => {
  const {
    position = [],
    rotation = [],
    scale = [],
    materialID = '',
    nodeName = '',
    url = '',
  } = props;

  const groundRef = useRef(undefined);
  // const materialRef = useRef(new THREE.MeshStandardMaterial({ ...defaultMeshStandardMaterialConfig }));
  // const hasTextureMapsRef = useRef(false);

  const groundPosition = position?.length ? position : POSITION;
  const groundRotation = rotation?.length ? rotation : ROTATION;
  const groundScale = scale?.length === 3 ? scale : SCALE;
  const groundMaterialID = materialID?.length ? materialID : MATERIAL_ID
  const fileURL = url.length ? url : URL; 
  const node = nodeName?.length? nodeName : NODE_NAME;

  const geometry = useGLTF(fileURL).nodes?.[`${node}`]?.geometry ?? null;
  const material = useMaterial.getState().materials[groundMaterialID].material;
  // const texturesReady = useMaterial((state) => state.texturesInitialized);

  // useLayoutEffect(() => {
  //   const materialHasTextureMaps = useMaterial.getState().materials[groundMaterialID]?.textures || null;
  //   if (!!materialHasTextureMaps) {
  //     hasTextureMapsRef.current = true;
  //   }
  // }, [groundMaterialID]);

  // useLayoutEffect(() => {
  //   if (hasTextureMapsRef.current === true && texturesReady?.length > 0) {
  //     const readyMaterial = useMaterial.getState().materials[groundMaterialID].material;
  //     materialRef.current.copy(readyMaterial);
  //     materialRef.current.needsUpdate = true;
  //   }
  // }, [texturesReady, groundMaterialID])

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
