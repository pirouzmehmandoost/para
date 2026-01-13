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
    helper = false,
    position = [0, 110, 0],
    target = null,
    type = 'spotLight',
    useCamera = true,
  } = props;

  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const lightRef = useRef(null);
  const lightPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const lightTargetRef = useRef(new THREE.Object3D({}));
  const lightHelperRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (helper === true) {
      const material = new THREE.MeshBasicMaterial({ color: color });
      material.side = THREE.DoubleSide;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 8), material);
      lightTargetRef.current.add(mesh);
    }

    // for lights with target field, use a prop or calculate a position relative to the scene camera.
    if (useCamera) {
      const position = camera.position
      lightTargetRef.current.position.copy(new THREE.Vector3(position.x, position.y, position.z - 180))
    }
    else {
      if (target.isVector3) lightTargetRef.current.position.copy(target)
      else if (target?.isObject3D && target?.position?.isVector3) lightTargetRef.current.position.copy(target.position)
      else if (Array.isArray(target)) lightTargetRef.current.position.copy(new THREE.Vector3(target[0], target[1], target[2]))
      else lightTargetRef.current.position.copy(new THREE.Vector3(0, 0, 0))
    }

    scene.add(lightTargetRef.current);
    lightTargetRef.current.updateMatrixWorld();

    if (lightRef?.current && lightTargetRef?.current && lightRef?.current.target) lightRef.current.target.copy(lightTargetRef.current);

    setIsReady(true);
  }, [camera, target, scene, useCamera, setIsReady]);

  useFrame(({ clock, camera }, delta) => {
    if (useCamera) {
      let yOffset = 110
      let zOffset = 100
      let x = camera.position.x
      let y = camera.position.y + yOffset
      let z = (camera.position.z - zOffset);
      const clampedDelta = Math.min(delta, 0.08);
      const elapsedTime = clock.elapsedTime
      const newIntensity = intensity * Math.abs(Math.sin(elapsedTime / 6 * intensity) % 1)
      const xMovement = 120 * (Math.sin(elapsedTime * 3) % 1)
      const zMovement = 120 * (Math.cos(elapsedTime * 3) % 1)

      switch (type) {
        case 'pointLight':
          yOffset = 18;
          zOffset = 90;
          x += xMovement;
          y = camera.position.y + yOffset;
          z = (camera.position.z - zOffset) + zMovement;
          break;
        case 'directionalLight':
          yOffset = 20;
          zOffset = 40;
          x += xMovement;
          y = camera.position.y + yOffset
          z = (camera.position.z - zOffset) + zMovement
          break;
        case 'spotLight':
          x += xMovement/10;
          z += zMovement/10;
          lightRef.current.intensity = newIntensity;
          break;
        default:
          break;
      }

      lightPositionRef.current.set(x, y, z);
      easing.damp3(lightRef.current.position, lightPositionRef.current, 0.3, clampedDelta);
      easing.dampE(lightRef.current.rotation, camera.rotation, 0.3, clampedDelta);
      easing.damp3(lightTargetRef.current.position, [camera.position.x, camera.position.y, camera.position.z - 180], 0.3, clampedDelta);
      lightTargetRef.current.updateMatrixWorld();

      if (lightRef?.current && lightTargetRef?.current && lightRef.current?.target) lightRef.current.target.copy(lightTargetRef.current);

      if (helper && lightHelperRef.current) lightHelperRef.current.update();
    }
  })

  return (
    <>
      {type === 'directionalLight' && (
        <>
          <directionalLight
            ref={lightRef}
            angle={0.3}
            castShadow={castShadow}
            color={color}
            intensity={intensity}
            penumbra={1}
            position={position}
            shadow-bias={-0.0004}
            shadow-camera-fov={50}
            shadow-camera-near={1}
            shadow-camera-far={1024}
            shadow-camera-top={1024}
            shadow-camera-bottom={-1024}
            shadow-camera-left={-1024}
            shadow-camera-right={1024}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          {isReady && helper && <directionalLightHelper ref={lightHelperRef} args={[lightRef.current, 5, color]} />}
        </>
      )}
      {type === 'pointLight' && (
        <>
          <pointLight
            ref={lightRef}
            castShadow={castShadow}
            color={color}
            decay={0.4}
            distance={250}
            intensity={intensity * 2.5}
            position={position}
            shadow-bias={-0.0001}
            shadow-camera-fov={50}
            shadow-camera-near={1}
            shadow-camera-far={2048}
            shadow-camera-top={2048}
            shadow-camera-bottom={-2048}
            shadow-camera-left={-2048}
            shadow-camera-right={2048}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
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
            shadow-bias={-0.0001}
            shadow-camera-fov={50}
            shadow-camera-near={1}
            shadow-camera-far={1024}
            shadow-camera-top={1024}
            shadow-camera-bottom={-1024}
            shadow-camera-left={-1024}
            shadow-camera-right={1024}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          {isReady && helper && <spotLightHelper ref={lightHelperRef} args={[lightRef.current, color]} />}
        </>
      )}
    </>
  );
};

export default AnimatedLight;


// const AnimatedLight = (props) => {
//   const {
//     intensity = 1,
//     castShadow = true,
//     color = 'white',
//     helper = false,
//     position = [-280, 80, 100],
//     target = null,
//     type = 'pointLight',
//     useCamera = true,
//   } = props;
//   const { scene } = useThree();
//   const lightRef = useRef(undefined);
//   const [isReady, setIsReady] = useState(false);
//   const targetRef = useRef(new THREE.Object3D({}));
//   const helperRef = useRef(null);



//   useEffect(() => {
//     if (target && !useCamera) {
//       if (target.isVector3) targetRef.current.position.copy(target)
//       else if (target.isObject3D) targetRef.current.position.copy(target.position)
//       else if (Array.isArray(target)) targetRef.current.position.copy(new THREE.Vector3(target[0], target[1], target[2]))
//       else targetRef.current.position.copy(new THREE.Vector3(0,0,0))

//       scene.add(targetRef.current);
//       lightRef.current.target.copy(targetRef.current);
//     }

//     setIsReady(true);
//   }, [target, scene, useCamera]);

//   useFrame(({ clock, camera }, delta) => {
//     if (useCamera === true) {
//       if (helperRef.current) helperRef.current.update();

//       const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
//       const elapsedTime = clock.elapsedTime
//       const newIntensity = intensity * Math.abs(Math.sin(elapsedTime / 6 * intensity) % 1)
//       const movement = 30 * (Math.sin(elapsedTime * 3) % 1)
//       const movement2 = 30 * (Math.cos(elapsedTime * 3) % 1)

//       if (type !== 'directionalLight') lightRef.current.intensity = newIntensity;

//       const zOffset = type === 'pointLight' ? 90 : 40;
//       const yOffset = type === 'pointLight' ? 18 : 20;

//       easing.damp3(
//         lightRef.current.position,
//         [camera.position.x + 4 * movement, camera.position.y + yOffset, (camera.position.z - zOffset) + (4 * movement2)],
//         0.1,
//         clampedDelta
//       );
//       easing.dampE(lightRef.current.rotation, camera.rotation, 0.1, clampedDelta);
//     }
//   })

//   return (
//     <>
//       {type === 'directionalLight' && (
//         <directionalLight
//           ref={lightRef}
//           angle={0.3}
//           castShadow={castShadow}
//           color={color}
//           intensity={intensity}
//           penumbra={1}
//           position={position}
//           shadow-bias={-0.0004}
//           shadow-camera-near={1}
//           shadow-camera-far={1024}
//           shadow-camera-fov={50}
//           shadow-camera-top={1024}
//           shadow-camera-bottom={-1024}
//           shadow-camera-left={-1024}
//           shadow-camera-right={1024}
//           shadow-mapSize-width={2048}
//           shadow-mapSize-height={2048}
//         />
//       )}
//       {type === 'pointLight' && (
//         <pointLight
//           ref={lightRef}
//           castShadow={castShadow}
//           color={color}
//           decay={0.4}
//           distance={250}
//           intensity={intensity * 2.5}
//           position={position}
//           shadow-bias={-0.0001}
//           shadow-camera-near={1}
//           shadow-camera-far={2048}
//           shadow-camera-top={2048}
//           shadow-camera-bottom={-2048}
//           shadow-camera-left={-2048}
//           shadow-camera-right={2048}
//           shadow-mapSize-width={2048}
//           shadow-mapSize-height={2048}
//         />
//       )}
//       {type === 'spotLight' && (
//         <spotLight
//           ref={lightRef}
//           angle={Math.PI / 9}
//           castShadow={true}
//           color={color}
//           decay={0.1}
//           distance={140}
//           intensity={intensity}
//           penumbra={0.2}
//           position={position}
//           shadow-bias={-0.0004}
//           shadow-camera-near={1}
//           shadow-camera-far={1024}
//           shadow-camera-fov={50}
//           shadow-camera-top={1024}
//           shadow-camera-bottom={-1024}
//           shadow-camera-left={-1024}
//           shadow-camera-right={1024}
//           shadow-mapSize-width={2048}
//           shadow-mapSize-height={2048}
//         />
//       )}
//       {isReady && helper && (
//         <>
//           {type === 'pointLight' && (
//             // eslint-disable-next-line react-hooks/refs
//             <pointLightHelper args={[lightRef.current, 2, 0x00FFFF]} />
//           )}

//           {type === 'directionalLight' && (
//             // eslint-disable-next-line react-hooks/refs
//             <directionalLightHelper args={[lightRef.current, 2, 0xFFFF00]} />
//           )}

//           {type === 'spotLight' && (
//             // eslint-disable-next-line react-hooks/refs
//             <spotLightHelper ref={helperRef} args={[lightRef.current, 0xf5106f]} />
//           )}
//         </>
//       )}
//     </>
//   );
// };

// export default AnimatedLight;
