// 'use client';

// import * as THREE from 'three';
// import { useFrame, useThree } from '@react-three/fiber';
// import { useLayoutEffect, useRef } from 'react'
// import { easing } from 'maath';
// import cameraConfigs from '@configs/cameraConfigs';

// THREE.Cache.enabled = true;
// const { INITIAL_CAMERA_POSITION, OFFSET_CAMERA_POSITION } = cameraConfigs;

// const SimpleCameraRig = ({
//   target,
//   fallbackTarget,
//   cameraShake = false
// }) => {
//   const sceneCamera = useThree((state) => state.camera);
//   const lookAtPositionRef = useRef(new THREE.Vector3());
//   const cameraPositionRef = useRef(new THREE.Vector3(OFFSET_CAMERA_POSITION[0], OFFSET_CAMERA_POSITION[1], OFFSET_CAMERA_POSITION[2]));
//   const defaultFallbackPositionRef = useRef(new THREE.Vector3(OFFSET_CAMERA_POSITION[0], OFFSET_CAMERA_POSITION[1], OFFSET_CAMERA_POSITION[2]));
//   const _scratchBoxRef = useRef(new THREE.Box3());
//   const _scratchCenterRef = useRef(new THREE.Vector3());

//   useLayoutEffect(() => {
//     sceneCamera.lookAt(INITIAL_CAMERA_POSITION[0], INITIAL_CAMERA_POSITION[1], -1 * INITIAL_CAMERA_POSITION[2]);
//   }, [sceneCamera]);

//   useLayoutEffect(() => {
//     if (target && target?.isObject3D) {
//       target.updateWorldMatrix(true, false);
//       _scratchBoxRef.current.setFromObject(target).getCenter(_scratchCenterRef.current);
//       lookAtPositionRef.current.copy(_scratchCenterRef.current);
//     }
//     else if (fallbackTarget) {
//       if (fallbackTarget?.isVector3) lookAtPositionRef.current.copy(fallbackTarget);

//       if (fallbackTarget?.isObject3D) {
//         fallbackTarget.updateWorldMatrix(true, false);
//         _scratchBoxRef.current.setFromObject(fallbackTarget).getCenter(_scratchCenterRef.current);
//         lookAtPositionRef.current.copy(_scratchCenterRef.current);
//       }
//     }
//     else {
//       lookAtPositionRef.current.copy(defaultFallbackPositionRef.current);
//     }
//   }, [target, fallbackTarget]);

//   useFrame(({ clock, camera }, delta) => {
//     const clampedDelta = Math.min(delta, 0.08);

//     if (cameraShake) {
//       const elapsedTime = clock.elapsedTime;
//       const sin = Math.sin(elapsedTime);
//       const cos = Math.cos(elapsedTime);

//       const xOffset = lookAtPositionRef.current.x + 10 * Math.sin((cos + sin) / Math.PI)
//       const yOffset = lookAtPositionRef.current.y - 10 * Math.sin((cos - sin) / Math.PI)
//       const zOffset = OFFSET_CAMERA_POSITION[2] + lookAtPositionRef.current.z + (0.2 * (yOffset + xOffset));

//       cameraPositionRef.current.set(xOffset, yOffset, zOffset);
//       easing.damp3(camera.position, cameraPositionRef.current, 1, clampedDelta);
//       camera.lookAt(lookAtPositionRef.current);
//     }
//   });
// };

// export default SimpleCameraRig;