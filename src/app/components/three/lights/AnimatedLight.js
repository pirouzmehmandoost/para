'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { easing } from 'maath';

THREE.ColorManagement.enabled = true;

/* Example usage: 
  <AnimatedLight
    castShadow
    intensity={3.75}
    type='directionalLight'
    color='#FFF6E8'
  /> 
*/

const AnimatedLight = (props) => {
  const {
    intensity = 1,
    castShadow = true,
    color = 'white',
    helper = false,
    position = [0, 110, 0],
    type = 'spotLight',
  } = props;

  const { scene } = useThree();
  const camera = useThree((state) => state.camera);
  const lightRef = useRef(null);
  const lightPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const lightTargetRef = useRef(new THREE.Object3D({}));
  const lightTargetPositionRef = useRef(new THREE.Vector3(0, 0, 0))
  const lightHelperRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const material = useRef(new THREE.MeshBasicMaterial({ color: "red" }));

  useLayoutEffect(() => {
    if (helper === true) {
      material.current.side = THREE.DoubleSide;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 8), material.current);
      lightTargetRef.current.add(mesh);
    }

    lightTargetRef.current.position.copy(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z - 180))
    lightTargetPositionRef.current.copy(lightTargetRef.current.position.x, lightTargetRef.current.position.y, lightTargetRef.current.position.z)

    scene.add(lightTargetRef.current);
    lightTargetRef.current.updateMatrixWorld(true, true);

    if (lightRef?.current && lightTargetRef?.current && lightRef?.current.target) lightRef.current.target.copy(lightTargetRef.current);

    setIsReady(true);
  }, [helper]);

  useFrame(({ clock, camera }, delta) => {
    let yOffset = 110
    let zOffset = 100
    let x = camera.position.x
    let y = camera.position.y + yOffset
    let z = (camera.position.z - zOffset);
    const clampedDelta = Math.min(delta, 0.08);
    const elapsedTime = clock.elapsedTime
    const newIntensity = intensity * Math.abs(Math.sin(elapsedTime / 4 * intensity) % 1)
    const xMovement = 10 * (Math.sin(elapsedTime * 2) % 1)
    const zMovement = 10 * (Math.cos(elapsedTime * 2) % 1)

    switch (type) {
      case 'pointLight':
        yOffset = 10;
        zOffset = 70;
        x += xMovement;
        y = (camera.position.y + yOffset) + zMovement;
        z = (camera.position.z - zOffset);
        lightRef.current.intensity = 1 + 2 * newIntensity;
        break;
      case 'directionalLight':
        zOffset = 180;
        x += xMovement / 2;
        z = (camera.position.z - zOffset) + zMovement / 2;
        lightRef.current.intensity = intensity + newIntensity / 2;
        break;
      case 'spotLight':
        x += xMovement;
        z += zMovement;
        lightRef.current.intensity = newIntensity;
        break;
      default:
        break;
    }

    lightPositionRef.current.set(x, y, z);
    lightTargetPositionRef.current.set(camera.position.x, camera.position.y, camera.position.z - 180);

    easing.damp3(lightRef.current.position, lightPositionRef.current, 0.1, clampedDelta);
    // easing.dampE(lightRef.current.rotation, camera.rotation, 0.1, clampedDelta);
    easing.damp3(lightTargetRef.current.position, lightTargetPositionRef.current, 0.1, clampedDelta);

    if (typeof lightTargetRef?.current?.updateMatrixWorld === 'function') lightTargetRef.current.updateMatrixWorld(true, true);

    if (lightRef?.current && lightTargetRef?.current && lightRef.current?.target) lightRef.current.target.copy(lightTargetRef.current);

    if (helper && lightHelperRef.current) lightHelperRef.current.update();
  })

  return (
    <>
      {type === 'directionalLight' && (
        <>
          <directionalLight
            ref={lightRef}
            castShadow={castShadow}
            color={color}
            intensity={intensity}
            position={position}
            shadow-bias={-0.004}
            shadow-camera-fov={50}
            shadow-camera-near={1}
            shadow-camera-far={4096}
            shadow-camera-top={4096}
            shadow-camera-bottom={-4096}
            shadow-camera-left={-4096}
            shadow-camera-right={4096}
            shadow-mapSize={4096}
          />
          {isReady && helper && <directionalLightHelper ref={lightHelperRef} args={[lightRef.current, 1, color]} />}
        </>
      )}
      {type === 'pointLight' && (
        <>
          <pointLight
            ref={lightRef}
            castShadow={castShadow}
            color={color}
            decay={0.25}
            distance={210}
            intensity={intensity * 2}
            position={position}
            shadow-bias={-0.001}
            shadow-camera-near={1}
            shadow-camera-far={2048}
            shadow-camera-top={2048}
            shadow-camera-bottom={-2048}
            shadow-camera-left={-2048}
            shadow-camera-right={2048}
            shadow-mapSize={2048}
          />
          {isReady && helper && <pointLightHelper ref={lightHelperRef} args={[lightRef.current, 5, color]} />}
        </>
      )}
      {type === 'spotLight' && (
        <>
          <spotLight
            ref={lightRef}
            angle={Math.PI / 4}
            castShadow={castShadow}
            color={color}
            decay={0.01}
            distance={250}
            intensity={intensity}
            penumbra={0.5}
            position={position}
            shadow-bias={-0.001}
            shadow-camera-near={1}
            shadow-camera-far={2048}
            shadow-camera-top={2048}
            shadow-camera-bottom={-2048}
            shadow-camera-left={-2048}
            shadow-camera-right={2048}
            shadow-mapSize={2048}
          />
          {isReady && helper && <spotLightHelper ref={lightHelperRef} args={[lightRef.current, color]} />}
        </>
      )}
    </>
  );
};

export default AnimatedLight;