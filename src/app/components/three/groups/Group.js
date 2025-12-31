'use client';

import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { calculateXZPositions, scaleMeshAtBreakpoint } from '@utils/mesh/meshUtils';
import Model from '../models/Model';

const Group = (props) => {
  const { size } = useThree();
  const {
    autoRotate = true, 
    autoRotateSpeed = 0.5,
    groundMeshRef,
    groupRef,
    materials = {},
    modelUrls = [],
    onMeshReady = [],
    position,
    scale = 1,
    onClick = () => {},
  } = props;

  const modelScale = modelUrls.length === 1 
    ? scale * 0.4 
    : (scaleMeshAtBreakpoint(size.width)/modelUrls.length);

  const positions = useMemo(() => 
    calculateXZPositions(size.width, modelUrls.length, position)
  , [modelUrls.length, position, size.width]);

  return (
    <group ref={groupRef}>
      {modelUrls.map((modelUrl, index) => (
        <Model
          key={`${modelUrl?.name ?? modelUrl?.url ?? 'model'}_${index}`}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          groundMeshRef={groundMeshRef}
          materialId={materials.defaultMaterial}
          modelUrl={modelUrl}
          onClick={onClick}
          onMeshReady={onMeshReady[index]}
          position={positions[index] ?? position}
          scale={modelScale}
        />
      ))}
    </group>
  );
};

export default React.memo(Group);
