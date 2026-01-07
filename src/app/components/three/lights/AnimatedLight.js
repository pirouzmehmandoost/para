'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { easing } from 'maath';

THREE.ColorManagement.enabled = true;

const AnimatedLight = (props) => {
  const {
    intensity = 1,
    castShadow = true,
    color = 'white',
    lightHelper = false,
    position = [-280, 80, 100],
    target=null,
    useCamera = true
  } = props;
  const { scene } = useThree();
  const lightRef = useRef(undefined);
  const lightRef2 = useRef(undefined);

  const [isReady, setIsReady] = useState(false);
  const targetRef = useRef(new THREE.Object3D({}));
  // const lightColor = new THREE.Color('green')
  // const blendColor = new THREE.Color('red')

  useEffect(() => {
    if (target && !useCamera) {
      if (target.isVector3) {
        targetRef.current.position.copy(target)
      } 
      else if (typeof target?.updateMatriWorld === 'function') {
        targetRef.current.position.copy(target.position);
      } 
      else {
        targetRef.current.position.copy(new THREE.Vector3(target[0], target[1], target[2]));
      }
      
      scene.add(targetRef.current);
      lightRef.current.target.copy(targetRef.current);
      lightRef2.current.target.copy(targetRef2.current)
    }

    setIsReady(true);
  }, [target, scene]);

  useFrame(({clock, camera }, delta) => {
    if (useCamera === true) {
      const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
      // const elapsedTime = clock.elapsedTime
      // const newIntensity = 1 + intensity * Math.abs(Math.sin(elapsedTime/2) % 1)
      // const percentage = Math.sin(elapsedTime/2) % 1
      // const r = Math.abs(Math.min(0, percentage))
      // const b = Math.max(0, percentage)
      // lightRef.current.intensity = newIntensity;
      easing.damp3(
        lightRef.current.position,
        [camera.position.x, camera.position.y + 20, camera.position.z - 100],
        0.1,
        clampedDelta
      );
      easing.dampE(lightRef.current.rotation, camera.rotation, 0.1, clampedDelta);
      // blendColor.setRGB(r, Math.min(pointer.x/pointer.y, 1), b)
      // easing.dampC(lightRef.current.color, blendColor, percentage, clampedDelta)
    }
  })

  return (
    <>
      <pointLight
        ref={lightRef}
        color={color}
        position={position}
        distance={225}
        decay={0.35}
        intensity={intensity}
        castShadow={castShadow}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={500}
        shadow-bias={-0.001}
        shadow-camera-top={1500}
        shadow-camera-bottom={-1500}
        shadow-camera-left={-1500}
        shadow-camera-right={1500}
      />


      {isReady && lightHelper && (
        <pointLightHelper args={[lightRef.current, 1, 0x00FFFF]} />
      )}
    </>
  );
};

export default AnimatedLight;
