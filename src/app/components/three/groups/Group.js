'use client';

// import React, { useMemo } from 'react';
import React from 'react';
// import { useThree } from '@react-three/fiber';
// import { scaleMeshAtBreakpoint } from '@utils/scaleUrils';
// import { calculateXZPositions } from '@utils/positionUtils';

import Model from '../models/Model';

const Group = (props) => {
  // const { size } = useThree();
  const {
    autoRotate = true,
    autoRotateSpeed = 0.5,
    groundMeshRef = null,
    materials: { defaultMaterial = '' } = {},
    fileData = {},
    onMeshReady = () => { },
    position = null,
    scale = 1,
    onClick = () => { },
  } = props;

  // const modelScale = scale * 0.5 * scaleMeshAtBreakpoint(size.width);

  // const newPosition = useMemo(() => 
  //   calculateXZPositions(size.width, 1, position)
  // , [position, size.width]);

  //   const modelScale = modelUrls.length === 1 
  //   ? scale * 0.4 
  //   : (scaleMeshAtBreakpoint(size.width)/modelUrls.length);

  // const positions = useMemo(() => 
  //   calculateXZPositions(size.width, modelUrls.length, position)
  // , [modelUrls.length, position, size.width]);

  return (
    <group>
      <Model
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        groundMeshRef={groundMeshRef}
        materialId={defaultMaterial}
        fileData={fileData}
        onClick={onClick}
        onMeshReady={onMeshReady}
        position={position}
        scale={scale}
      />
    </group>
  );
};

export default React.memo(Group);
