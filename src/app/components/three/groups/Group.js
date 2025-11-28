'use client';

import { useThree } from '@react-three/fiber';
import { calculateXZPositions, scaleMeshAtBreakpoint } from '@utils/mesh/meshUtils';
import Model from '../models/Model';

const Group = (data) => {
  const { size } = useThree();
  const {
    autoRotate, 
    autoRotateSpeed,
    materials,
    modelUrls,
    groundMeshRef,
    groupRef,
    onMeshReady,
    position: groupPosition,
    scale,
    ...rest
  } = data;

  const positions = calculateXZPositions(size.width, modelUrls.length, groupPosition);
  const modelScale = modelUrls.length === 1 ? scale * 0.45 : (scaleMeshAtBreakpoint(size.width)/modelUrls.length);
  
  return (
    <group ref={groupRef} {...rest}>
      {
        modelUrls.map((modelUrl, index) => (
          <Model
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            onMeshReady={onMeshReady[index]}
            key={modelUrl.name}
            groundMeshRef={groundMeshRef}
            materialId={ modelUrls.length === 1 ? materials.defaultMaterial : Object.values(materials.colorWays)[index] }
            modelUrl={modelUrl}
            position={positions[index]}
            scale={modelScale}
          />
        ))
      }
    </group>
  );
};

export default Group;
