'use client';

import { useThree } from '@react-three/fiber';
import { scaleMeshAtBreakpoint, calculatePositions } from '@utils/mesh/meshUtils';
import Model from '../models/Model';

const Group = (data) => {
  const { size } = useThree();
  const {
    materials,
    modelUrls,
    position: groupPosition,
    scale,
  } = data;

  const positions = calculatePositions(size.width, modelUrls.length, groupPosition);
  const modelScale = modelUrls.length === 1 
    ? scale * 0.45 
    : scaleMeshAtBreakpoint(size.width) / modelUrls.length;

  return (
    <>
      {modelUrls.map((modelUrl, index) => (
        <Model
          key={modelUrl.name}
          {...data}
          materialId={
            modelUrls.length === 1
              ? materials.defaultMaterial
              : Object.values(materials.colorWays)[index]
          }
          modelUrl={modelUrl}
          position={positions[index]}
          scale={modelScale}
        />
      ))}
    </>
    );
    //   {modelUrls.map((modelUrl, index) => {
    //     const key = modelUrl.name;
    //     const props = {
    //       ...data,
    //       autoRotate: autoRotate,
    //       autoRotateSpeed: autoRotateSpeed,
    //       isPointerOver,
    //       materialId: modelUrls.length === 1 ? materials.defaultMaterial : Object.values(materials.colorWays)[index],
    //       modelUrl: modelUrl,
    //       position: positions[index],
    //       scale: modelScale,
    //     };

    //     return <Model key={key} {...props} />;
    //   })}
    // </>

};

export default Group;
