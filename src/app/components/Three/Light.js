'use client';

import { useEffect, useRef, useState } from 'react';
import { ColorManagement, Object3D, Vector3 } from 'three';
import { useThree } from '@react-three/fiber';

ColorManagement.enabled = true;

const Light = (props) => {
  const {
    intensity = 7,
    color = 'white',
    lightHelper = false,
    position = [-280, 80, 100],
    target = [-280, 0, -50],
  } = props;
  const { scene } = useThree();
  const lightRef = useRef(undefined);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (lightRef?.current) {
      const targetObject = new Object3D();
      targetObject.position.copy(new Vector3(target[0], target[1], target[2]));
      scene.add(targetObject);
      lightRef.current.target = targetObject;
      setIsReady(true);
    }
  }, [lightRef, target, scene]);

  return (
    <>
      <directionalLight
        ref={lightRef}
        color={color}
        position={position}
        intensity={intensity}
        castShadow={true}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={1000}
        shadow-bias={-0.001}
        shadow-camera-top={1500}
        shadow-camera-bottom={-1500}
        shadow-camera-left={-1500}
        shadow-camera-right={1500}
      />
      {isReady && lightHelper && (
        <directionalLightHelper args={[lightRef.current, 6, 0xff0000]} />
      )}
    </>
  );
};

export default Light;
