// 'use client';

// import { useEffect, useLayoutEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { useFrame, useThree } from '@react-three/fiber';
// import { easing } from 'maath';
// import cameraConfigs from '@configs/cameraConfigs';
// import useSelection from '@stores/selectionStore';
// // import { EPSILON_10e4 } from '@/lib/utils/animationUtils';
// import { getAABBCenterFast } from '@/lib/utils/positionUtils';

// // SceneRigV2.js is a revision to SceneRig.js. It contains an update the effect in on 78-152 in SceneRig.js.
// // Currently the app uses SceneRigV3.js. SceneRig.js and SceneRigV2.js are preserved for documentation and reference during development.
// const SceneRigV2 = ({
//   onSwipe = undefined,
//   targets = [],
// }) => {

//   const {
//     MIN_DWELL_SECONDS,
//     MANUAL_OVERRIDE_SECONDS,
//     SWIPE_DELTA_PX, SWIPE_DELTA_TIME_MS,
//     INITIAL_CAMERA_POSITION,
//     OFFSET_CAMERA_POSITION,
//   } = cameraConfigs;
//   const _scratchBoxRef = useRef(new THREE.Box3());
//   const _scratchCenterRef = useRef(new THREE.Vector3());

//   const domElement = useThree((state) => state.gl.domElement);
//   const clock = useThree((state) => state.clock);
//   const scene = useThree((state) => state.scene);
//   const cam = useThree((state) => state.camera);

//   const activePointerIdRef = useRef(null);
//   const pointerStartRef = useRef(null);

//   const lastSwitchTimeRef = useRef(0);
//   const manualOverrideTimeRef = useRef(-Infinity); // active while elapsedTime < this value)

//   const nextCameraPositionRef = useRef(new THREE.Vector3());
//   const cameraStopPositionsRef = useRef([new THREE.Vector3(0, 0, 0)]);
//   const defaultFallbackPositionRef = useRef(new THREE.Vector3(OFFSET_CAMERA_POSITION[0], OFFSET_CAMERA_POSITION[1], OFFSET_CAMERA_POSITION[2]));

//   const targetIndexRef = useRef(0);
//   const prevTargetIndexRef = useRef(-1);
//   const targetsInSceneRef = useRef({});
//   const targetsNotInSceneRef = useRef({});
//   const nameToUUIDRef = useRef({});

//   useLayoutEffect(() => {
//     cam.lookAt(INITIAL_CAMERA_POSITION[0], INITIAL_CAMERA_POSITION[1], -1 * INITIAL_CAMERA_POSITION[2]);
//   }, [INITIAL_CAMERA_POSITION, cam]);

//   useEffect(() => {
//     const targetsInScene = {};
//     const nameToUUID = {};
//     targetsInSceneRef.current = {};
//     targetsNotInSceneRef.current = {};

//     scene.traverse((object) => { if (object.isObject3D) targetsInScene[`${object.uuid}`] = object });

//     for (let i = 0; i < targets.length; i++) {
//       if (targets[i]?.uuid?.length) {
//         const targetUUID = targets[i].uuid;
//         const foundTargetInScene = targetsInScene[targetUUID] || null;
//         if (foundTargetInScene) {
//           targetsInSceneRef.current[targetUUID] = { target: foundTargetInScene, index: i, targetUUID, parentUUID: foundTargetInScene?.parent?.uuid || '' };
//           if (foundTargetInScene.name?.length) nameToUUID[foundTargetInScene.name] = targetUUID;
//         }
//         else {
//           targetsNotInSceneRef.current[targetUUID] = { target: targets[i], index: i, targetUUID, parentUUID: targets[i]?.parent?.uuid || '' };
//         }
//       }
//     }

//     nameToUUIDRef.current = nameToUUID;
//   }, [targets, scene]);

//   useEffect(() => {
//     const addedEventHandlers = [];
//     const removedEventHandlers = [];

//     const handleRemoved = (event) => {
//       const uuid = event.target.uuid
//       const entry = targetsInSceneRef.current[uuid];

//       if (!entry) return;

//       const staleTargetIndex = entry.index;

//       if (!scene.getObjectByProperty('uuid', uuid)) {
//         targetsNotInSceneRef.current[uuid] = entry;
//         delete targetsInSceneRef.current[uuid];
//         if (cameraStopPositionsRef.current[staleTargetIndex]) cameraStopPositionsRef.current.splice(staleTargetIndex, 1);

//         if (cameraStopPositionsRef.current.length === 0 || targetIndexRef.current >= cameraStopPositionsRef.current.length) {
//           prevTargetIndexRef.current = -1;
//           targetIndexRef.current = 0;
//         }
//         else {
//           prevTargetIndexRef.current = staleTargetIndex;
//           targetIndexRef.current += 1;
//         }

//         for (const key in targetsInSceneRef.current) {
//           const item = targetsInSceneRef.current[key];
//           if (item.index > staleTargetIndex) item.index -= 1;
//         }
//         for (const key in targetsNotInSceneRef.current) {
//           const item = targetsNotInSceneRef.current[key];
//           if (item.index > staleTargetIndex) item.index -= 1;
//         }

//         const parent = scene.getObjectByProperty('uuid', entry.parentUUID);
//         if (!parent || (!!targets && !targets.find(t => t.uuid === uuid))) delete targetsNotInSceneRef.current[uuid]
//         else {
//           targetsNotInSceneRef.current[uuid].parentUUID = parent.uuid;
//           targetsNotInSceneRef.current[uuid].index = Object.keys(targetsInSceneRef.current).length;
//           entry.target.addEventListener('added', handleAdded);
//           addedEventHandlers.push({ target: entry.target, handleAdded })
//         }

//         if (entry.target?.name?.length && nameToUUIDRef.current[entry.target.name]) delete nameToUUIDRef.current[entry.target.name];
//       }

//       entry.target.removeEventListener('removed', handleRemoved);
//     };

//     const handleAdded = (event) => {
//       const uuid = event.target.uuid;
//       const entry = targetsNotInSceneRef.current[uuid];

//       if (!entry) return;

//       const pendingTargetIndex = entry.index;
//       const parentUUID = entry.target.parent?.uuid;
//       const isParentInScene = parentUUID ? scene?.getObjectByProperty('uuid', parentUUID)?.isObject3D : null;
//       if (!isParentInScene) return;

//       targetsInSceneRef.current[uuid] = entry;
//       if (targetsNotInSceneRef.current[uuid]) delete targetsNotInSceneRef.current[uuid];

//       entry.target.addEventListener('removed', handleRemoved);
//       removedEventHandlers.push({ target: entry.target, handleRemoved });

//       const newStopPosition = getAABBCenterFast(entry.target, _scratchCenterRef.current);
//       if (newStopPosition) {
//         if (cameraStopPositionsRef.current[pendingTargetIndex]?.isVector3) cameraStopPositionsRef.current[pendingTargetIndex].copy(newStopPosition);
//         else {
//           while (cameraStopPositionsRef.current.length <= pendingTargetIndex) {
//             cameraStopPositionsRef.current.push(new THREE.Vector3().copy(defaultFallbackPositionRef.current));
//           }
//           cameraStopPositionsRef.current[pendingTargetIndex].copy(newStopPosition);
//         }
//       }

//       if (entry.target.name?.length) nameToUUIDRef.current[entry.target?.name] = uuid;
//       entry.target.removeEventListener('added', handleAdded);

//       const target = targetsInSceneRef.current[uuid].target;
//       target.addEventListener('removed', handleRemoved);
//       removedEventHandlers.push({ target, handleRemoved });


//       for (const uuid in targetsNotInSceneRef.current) {
//         const target = targetsNotInSceneRef.current[uuid].target;
//         target.addEventListener('added', handleAdded);
//         addedEventHandlers.push({ target, handleAdded });
//       }
//     };

//     return () => {
//       addedEventHandlers.forEach(h => h.target.removeEventListener('added', h.handleAdded));
//       removedEventHandlers.forEach(h => h.target.removeEventListener('removed', h.handleRemoved));
//     };
//   }, [targets, scene]);

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
//     const length = Object.entries(targetsInSceneRef.current)?.length ?? 0;

//     for (let i = 0; i < length; i++) {
//       if (!cameraStopPositionsRef.current[i]?.isVector3) cameraStopPositionsRef.current[i] = new THREE.Vector3();

//       if (!targets[i] || !targets[i]?.isObject3D) {
//         cameraStopPositionsRef.current[i].copy(defaultFallbackPositionRef.current);
//         continue;
//       }

//       const key = targets[i]?.uuid;
//       const exists = targetsInSceneRef.current[key]?.target?.uuid ?? 0;
//       if (exists) {
//         const target = targetsInSceneRef.current[key].target;

//         if (typeof target['updateWorldMatrix'] === 'function') target.updateWorldMatrix(true, false);
//         _scratchBoxRef.current.setFromObject(target).getCenter(_scratchCenterRef.current);
//         cameraStopPositionsRef.current[i].copy(_scratchCenterRef.current);
//       }
//     }

//     cameraStopPositionsRef.current.length = length || 1;

//     if (length === 0) {
//       if (!cameraStopPositionsRef.current[0]?.isVector3) cameraStopPositionsRef.current[0] = new THREE.Vector3();
//       cameraStopPositionsRef.current[0].copy(defaultFallbackPositionRef.current);
//     }

//     if (targetIndexRef.current < 0 || targetIndexRef.current >= cameraStopPositionsRef.current.length) targetIndexRef.current = 0;
//   }, [targets]);

//   useFrame(({ camera, clock }, delta) => {
//     const clampedDelta = Math.min(delta, 0.08);
//     const elapsedTime = clock.elapsedTime;
//     const xOffset = Math.sin(elapsedTime);
//     const yOffset = -2 * xOffset;
//     const zOffset = OFFSET_CAMERA_POSITION[2] + xOffset;
//     const isFocused = useSelection.getState().selection.isFocused;

//     if (targetIndexRef.current >= cameraStopPositionsRef.current.length || targetIndexRef.current < 0) targetIndexRef.current = 0;
//     if (cameraStopPositionsRef.current.length === 0) return;

//     let nextPosition = cameraStopPositionsRef.current[0];
//     const focusTargetExists = isFocused !== null && isFocused?.length > 0;
//     const focusedTargetUUID = !focusTargetExists ? -1 : nameToUUIDRef.current[isFocused];
//     const focusedIndex = focusTargetExists ? (targetsInSceneRef.current[focusedTargetUUID]?.index ?? -1) : -1;
//     const isManualOverrideActive = elapsedTime < manualOverrideTimeRef.current;

//     if (focusedIndex >= 0 && cameraStopPositionsRef.current[focusedIndex]) {
//       prevTargetIndexRef.current = targetIndexRef.current;
//       targetIndexRef.current = focusedIndex;
//     }
//     else if (isManualOverrideActive && cameraStopPositionsRef.current[targetIndexRef.current]) {
//       // if current index points to a valid entry in cameraStopPositionsRef then prevent the else block from running.
//       // if false (e.g. isManualOverrideActive is false or cameraStopPositionsRef.current is shortened between frames by useEffect), then the else block resets the index.
//     }
//     else {
//       let currentIndex = targetIndexRef.current;
//       let nextIndex = currentIndex >= cameraStopPositionsRef.current.length - 1 ? 0 : currentIndex + 1;
//       const canSwitch = (elapsedTime - lastSwitchTimeRef.current) > MIN_DWELL_SECONDS;

//       if (canSwitch) {
//         prevTargetIndexRef.current = currentIndex;
//         lastSwitchTimeRef.current = elapsedTime;
//         targetIndexRef.current = nextIndex;
//       }
//     }

//     const targetUUID = targets[targetIndexRef.current]?.uuid;
//     const targetInScene = targetsInSceneRef.current[targetUUID]?.target;
//     const targetInSceneUUID = targetInScene?.uuid;
//     const isTargetInScene = (targetUUID?.length && targetInSceneUUID?.length) && (targetUUID === targetInSceneUUID);

//     if (isTargetInScene && targetInScene.isObject3D) {
//       // if (prevTargetIndexRef.current !== targetIndexRef.current || cameraStopPositionsRef.current[targetIndexRef.current].distanceTo(_scratchCenterRef.current) > EPSILON_10e4) {
//       getAABBCenterFast(targetInScene, _scratchCenterRef.current);
//       cameraStopPositionsRef.current[targetIndexRef.current].copy(_scratchCenterRef.current);
//       prevTargetIndexRef.current = targetIndexRef.current;
//       nextPosition = _scratchCenterRef.current;
//       // }
//     }
//     else {
//       nextPosition = cameraStopPositionsRef.current[targetIndexRef.current];
//     }

//     nextCameraPositionRef.current.set(nextPosition.x + xOffset, nextPosition.y + yOffset, nextPosition.z + zOffset);
//     easing.damp3(camera.position, nextCameraPositionRef.current, 1, clampedDelta);
//   });
// };

// export default SceneRigV2;