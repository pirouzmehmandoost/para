'use client';

import { useThree } from '@react-three/fiber';
import { scaleMeshAtBreakpoint, calculatePositions } from '@utils/mesh/meshUtils';
import Model from './Model';

const Group = (data) => {
  const { size } = useThree();
  const {
    autoRotate,
    autoRotateSpeed,
    materials,
    modelUrls,
    isPointerOver,
    position: groupPosition,
    scale,
  } = data;

  let positions = calculatePositions(
    size.width,
    modelUrls.length,
    groupPosition,
  );

  let updateScale =
    modelUrls.length === 1
      ? scale * 0.45
      : scaleMeshAtBreakpoint(size.width) / modelUrls.length;

  return (
    <>
      {modelUrls.map((modelUrl, index) => {
        const key = modelUrl.name;
        const props = {
          ...data,
          autoRotate: autoRotate,
          autoRotateSpeed: autoRotateSpeed,
          isPointerOver,
          materialId:
            modelUrls.length === 1
              ? materials.defaultMaterial
              : Object.values(materials.colorWays)[index],
          modelUrl: modelUrl,
          position: positions[index],
          scale: updateScale,
        };

        return <Model key={key} {...props} />;
      })}
    </>
  );
};

export default Group;
