// 'use client';

// import * as THREE from 'three';
// import { useFrame, useThree } from '@react-three/fiber';
// import { useLayoutEffect, useRef } from 'react'
// import { easing } from 'maath';
// import sceneConfigs from '@configs/sceneConfigs';

// THREE.Cache.enabled = true;
// const {
//   cameraConfigs: {
//     POSITION: [configX, configY, configZ],
//   } = {},
// } = sceneConfigs;

// const SimpleCameraRig = ({
//   focusTarget,
//   fallbackPosition,
//   cameraShake = false
// }) => {
//   const sceneCamera = useThree((s) => s.camera);
//   const lookAtPositionRef = useRef(new THREE.Vector3(sceneCamera.position.x, sceneCamera.position.y, sceneCamera.position.z));
//   const cameraPositionRef = useRef(new THREE.Vector3(sceneCamera.position.x, sceneCamera.position.y, sceneCamera.position.z));
//   const blendedPositionRef = useRef(new THREE.Vector3(sceneCamera.position.x, sceneCamera.position.y, sceneCamera.position.z));
//   // const defaultFallBackPosition = useRef(new THREE.Vector3(configX, configY, configZ))
//   const _scratchBoxRef = useRef(new THREE.Box3());
//   const _scratchCenterRef = useRef(new THREE.Vector3());

//   useLayoutEffect(() => {
//     if (focusTarget && focusTarget?.isObject3D) {
//       focusTarget.updateWorldMatrix(true, true);
//       _scratchBoxRef.current
//         .setFromObject(focusTarget)
//         .getCenter(_scratchCenterRef.current);

//       lookAtPositionRef.current.set(
//         _scratchCenterRef.current.x,
//         _scratchCenterRef.current.y,
//         _scratchCenterRef.current.z + configZ + 10
//       );
//     }
//     else if (fallbackPosition.isObject3D){
//       lookAtPositionRef.current.set(
//         fallbackPosition.x,
//         fallbackPosition.y,
//         fallbackPosition.z + configZ + 10
//       );
//     }
//     blendedPositionRef.current.copy(lookAtPositionRef.current);
//     sceneCamera.updateMatrixWorld();
//   }, [focusTarget, fallbackPosition]);

//   useFrame(({ clock, camera }, delta) => {
//     const clampedDelta = Math.min(delta, 0.08);

//     if (cameraShake) {
//       const elapsedTime = clock.elapsedTime;
//       const xOffset = Math.sin(elapsedTime) * 2.5;
//       const yOffset = Math.cos(elapsedTime) * 5;
//       const zOffset = Math.cos(elapsedTime) * -2;

//       blendedPositionRef.current.set(
//         lookAtPositionRef.current.x + xOffset,
//         lookAtPositionRef.current.y + yOffset,
//         lookAtPositionRef.current.z + zOffset
//       );
//     }
//     cameraPositionRef.current.copy(camera.position)
//     camera.lookAt(cameraPositionRef.current)
//     easing.damp3(camera.position, blendedPositionRef.current, 1, clampedDelta);
//     camera.updateMatrixWorld();
//   });
// };

// export default SimpleCameraRig;



// 'use client';

// import { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { useFrame, useThree } from '@react-three/fiber';
// import { easing } from 'maath';
// import cameraConfigs from '@configs/cameraConfigs';


// /* 
// Potential Strategy: 
// 1- keys of sceneChildrenRef are the name field of each scene child.
// If an object's name and uuid change simultaneously, then it might be best to use uuid keys. 
// My rationale for using name keys is that all uuid's are unique among scene children, whereas names are not, and there may 
// be a case where it's desirable to preserve object keys whilst overwriting values. 


// 2- Each element of targets is an Object3D ref. In BasicScene targets is an array of Meshes but any Object3D is a valid target.
// When useEffect fires, if targets[i] is a scene child then sceneChildrenRef.current[targets[i].name] is defined.
// useEffect fires if scene or scene.children mutate, at which sceneChildrenRef will reference a new object representing
// the latest children referenced in targets. .
// */ 

// const SceneRig = ({
//   focusTarget = null, // optional Object3D to isolate focus on.
//   onSwipe = undefined, // optional callback
//   fallbackPositions = [], // array of Vector3
//   targets = [], // array of Object3D refs.
// }) => {

//   const { MIN_DWELL_SECONDS, MANUAL_OVERRIDE_SECONDS, SWIPE_DELTA_PX, SWIPE_DELTA_TIME_MS, POSITION } = cameraConfigs;
//   const _scratchBoxRef = useRef(new THREE.Box3());
//   const _scratchCenterRef = useRef(new THREE.Vector3());

//   const domElement = useThree((state) => state.gl.domElement);
//   const clock = useThree((state) => state.clock);
//   const scene = useThree((state) => state.scene);

//   const activePointerIdRef = useRef(null);
//   const pointerStartRef = useRef(null);

//   const lastSwitchTimeRef = useRef(0);
//   const manualOverrideTimeRef = useRef(-Infinity); // active while elapsedTime < this value)

//   const currentCameraPositionRef = useRef(new THREE.Vector3());
//   const nextCameraPositionRef = useRef(new THREE.Vector3());
//   // const cameraTargetRef = useRef(new THREE.Vector3());

//   const cameraStopPositionsRef = useRef([new THREE.Vector3(0, 0, 0)]);
//   const defaultFallbackPositionRef = useRef(new THREE.Vector3(POSITION[0], POSITION[1], POSITION[2]));

//   const targetIndexRef = useRef(0);
//   const sceneChildrenRef = useRef({}); // scene children referenced in targets.

//   useEffect(() => {
//     if (!scene || !scene?.children?.length) {
//       sceneChildrenRef.current = {};
//       return;
//     }

//     const targetSceneChildren = {};
//     scene.traverse((object) => { if (object?.isObject3D) targetSceneChildren[`${object.uuid}`] = object });

//     for (let i = 0; i < targets.length; i++) {
//       if (targets[i]?.uuid?.length) {
//         const targetUUID = targets[i].uuid;
//         const targetName = targets[i].name;
//         const foundTargetInScene = targetSceneChildren[targetUUID] || null;

//         if (foundTargetInScene) {
//           sceneChildrenRef.current[targetUUID] = {
//             target: foundTargetInScene,
//             index: i, 
//             name: targetName,
//           };
//         }
//       }
//     }

//     // Check if focusTarget is not null. 
//     // If SceneRig is implemented to focus on a single target, focusTarget may be non-null and targets may initialize to [].
//     // const isFocusTargetinTargets = focusTarget && focusTarget?.uuid?.length 
//     //   ? targets.some(({ uuid='' }) => uuid?.length && focusTarget.uuid === uuid ) 
//     //   : false;

//     // if (!isFocusTargetinTargets) {
//     //   sceneChildrenRef.current[focusTarget.uuid] = {
//     //     target: focusTarget,
//     //     index: Object.entries(sceneChildrenRef.current)?.length ?? 0,
//     //     name: focusTarget?.name,
//     //   };
//     // }
//   }, [targets, scene, scene.children]);


//   useEffect(() => {
//     if (!domElement) return;

//     const onPointerDown = (e) => {
//       if (!e.isPrimary) return; // ignore secondary touches

//       activePointerIdRef.current = e.pointerId;
//       domElement.setPointerCapture?.(e.pointerId); // capture pointerup even if pointer leaves the canvas
//       pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
//     };

//     const finishPointer = (e) => {
//       if (activePointerIdRef.current !== e.pointerId) return;

//       domElement.releasePointerCapture?.(e.pointerId);
//       activePointerIdRef.current = null;
//       pointerStartRef.current = null;
//     };

//     const onPointerCancel = (e) => finishPointer(e);

//     const onPointerUp = (e) => {
//       const start = pointerStartRef.current;
//       if (!start || activePointerIdRef.current !== e.pointerId) return;

//       const deltaX = e.clientX - start.x;
//       const deltaY = e.clientY - start.y;
//       const deltaTime = Date.now() - start.time;
//       const isSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_DELTA_PX && deltaTime < SWIPE_DELTA_TIME_MS;

//       if (isSwipe) {
//         const count = cameraStopPositionsRef.current.length;

//         if (count > 0) {
//           const step = deltaX > 0 ? 1 : -1;

//           targetIndexRef.current = (targetIndexRef.current + step + count) % count;
//           manualOverrideTimeRef.current = clock.elapsedTime + MANUAL_OVERRIDE_SECONDS;
//           lastSwitchTimeRef.current = clock.elapsedTime;

//           onSwipe?.(e);
//         }
//       } else {
//         manualOverrideTimeRef.current = -Infinity;
//       }

//       finishPointer(e);
//     };

//     domElement.addEventListener('pointerdown', onPointerDown);
//     domElement.addEventListener('pointerup', onPointerUp);
//     domElement.addEventListener('pointercancel', onPointerCancel);
//     domElement.addEventListener('lostpointercapture', onPointerCancel);

//     return () => {
//       domElement.removeEventListener('pointerdown', onPointerDown);
//       domElement.removeEventListener('pointerup', onPointerUp);
//       domElement.removeEventListener('pointercancel', onPointerCancel);
//       domElement.removeEventListener('lostpointercapture', onPointerCancel);
//     };
//   }, [domElement, clock, onSwipe, SWIPE_DELTA_TIME_MS, SWIPE_DELTA_PX, MANUAL_OVERRIDE_SECONDS]);

//   useEffect(() => {
//     const length = Math.max(Object.entries(sceneChildrenRef.current)?.length ?? 0, fallbackPositions?.length ?? 0);
  
//     for (let i = 0; i < length; i++) {
//       if (!cameraStopPositionsRef.current[i]?.isVector3) cameraStopPositionsRef.current[i] = new THREE.Vector3();

//       if (!targets[i] || !targets[i]?.isObject3D) {
//         cameraStopPositionsRef.current[i].copy(fallbackPositions[i]?.isVector3 ? fallbackPositions[i] : defaultFallbackPositionRef.current);
//         continue;
//       }

//       const key = targets[i]?.uuid;
//       const exists = sceneChildrenRef.current[key]?.target?.uuid;
//       if (exists?.length && typeof targets[i]['updateWorldMatrix'] === 'function') sceneChildrenRef.current[key].target.updateWorldMatrix(true, false);

//       if (sceneChildrenRef.current[key].target?.isMesh) {
//         _scratchBoxRef.current.setFromObject(sceneChildrenRef.current[key].target).getCenter(_scratchCenterRef.current);
//         cameraStopPositionsRef.current[i].copy(_scratchCenterRef.current);
//       }
//       else {
//         cameraStopPositionsRef.current[i].copy(sceneChildrenRef.current[key].target.position);
//       }

//     }

//     cameraStopPositionsRef.current.length = length || 1;

//     if (length === 0) {
//       if (!cameraStopPositionsRef.current[0]?.isVector3) cameraStopPositionsRef.current[0] = new THREE.Vector3();
//       cameraStopPositionsRef.current[0].copy(defaultFallbackPositionRef.current);
//     }

//     if (targetIndexRef.current < 0 || targetIndexRef.current >= cameraStopPositionsRef.current.length) targetIndexRef.current = 0;
//   }, [targets, fallbackPositions]);

//   useFrame(({ camera, clock }, delta) => {
//     const elapsedTime = clock.elapsedTime;
//     const xOffset = Math.sin(elapsedTime);
//     const yOffset = -2 * xOffset;
//     const zOffset = POSITION[2] + xOffset;
//     const clampedDelta = Math.min(delta, 0.08);

//     if (targetIndexRef.current >= cameraStopPositionsRef.current.length || targetIndexRef.current < 0) targetIndexRef.current = 0;
//     if (cameraStopPositionsRef.current.length === 0) return;

//     let nextPosition = cameraStopPositionsRef.current[0];
//     const focusedIndex = focusTarget !== null ? (sceneChildrenRef.current[focusTarget]?.index ?? -1) : -1;
//     const isManualOverrideActive = elapsedTime < manualOverrideTimeRef.current;

//     if (focusedIndex >= 0 && cameraStopPositionsRef.current[focusedIndex]) {
//       targetIndexRef.current = focusedIndex;
//     }
//     else if (isManualOverrideActive && cameraStopPositionsRef.current[targetIndexRef.current]) {
//       targetIndexRef.current = targetIndexRef.current; //no-op for 15 seconds? I dont know what to do in this case. 
//     }
//     else {
//       currentCameraPositionRef.current.copy(cameraStopPositionsRef.current[targetIndexRef.current]); // I don't know if this line is necessary. 
//       let currentIndex = targetIndexRef.current;
//       let nextIndex = currentIndex >= cameraStopPositionsRef.current.length - 1 ? 0 : currentIndex + 1;
//       const canSwitch = (elapsedTime - lastSwitchTimeRef.current) > MIN_DWELL_SECONDS;

//       if (canSwitch) {
//         lastSwitchTimeRef.current = elapsedTime;
//         targetIndexRef.current = nextIndex;
//       }
//     }

//     const nextTargetUUID = targets[targetIndexRef.current]?.uuid;
//     const targetInScene = sceneChildrenRef.current[nextTargetUUID]?.target || null;
//     const correspondingUUID = targetInScene?.uuid;
//     const isTargetInScene = 
//       (targetInScene && nextTargetUUID?.length && correspondingUUID?.length) && (nextTargetUUID === correspondingUUID); 

//     if (isTargetInScene && targetInScene.isObject3D) {
//       camera.updateMatrixWorld();
//       if (targetInScene['updateWorldMatrix'] === 'function') sceneChildrenRef.current[nextTargetUUID].target.updateWorldMatrix(true, false);

//       if (targetInScene?.isMesh || targetInScene?.isGroup) {
//         _scratchBoxRef.current.setFromObject(targetInScene).getCenter(_scratchCenterRef.current);
//         nextPosition = _scratchCenterRef.current;
//       }
//       else if (targetInScene?.position) { // targetInScene is a Light.
//         nextPosition = targetInScene.position;
//       }
//     }
//     else {
//       nextPosition = cameraStopPositionsRef.current[targetIndexRef.current];
//     }

//     currentCameraPositionRef.current.copy(camera.position);
//     camera.lookAt(currentCameraPositionRef.current);
//     nextCameraPositionRef.current.set(nextPosition.x + xOffset, nextPosition.y + yOffset, nextPosition.z + zOffset);
//     // cameraTargetRef.current.set(currentCameraPositionRef.current.x, currentCameraPositionRef.current.y, currentCameraPositionRef.current.z-1);
//     // camera.lookAt(cameraTargetRef.current);
//     easing.damp3(camera.position, nextCameraPositionRef.current, 1, clampedDelta);
//     // camera.updateMatrixWorld();
//   });
// };

// export default SceneRig;