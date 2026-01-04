'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import cameraConfigs from '@configs/cameraConfigs';
import { easing } from 'maath';
import useSelection from '@stores/selectionStore';
import dampCameraLookAt from '@utils/cameraRig/dampCameraLookAt';

/*
Inputs:
- targetRefs: array of Three.js Object3D instances (or falsy/invalid entries)
- fallbackPositions: array of THREE.Vector3 (or falsy entries)
- manualIndexRef: ref<number> (index) provided by the parent (input-only)
- hasNavigatedRef: ref<boolean> shared control flag (see below)

Stop positions are computed in useEffect with:
  length = max(targetRefs.length, fallbackPositions.length)
For each i in [0..length-1]:
- If targetRefs[i] is a valid Object3D (has updateWorldMatrix), stopPositions[i] = world-space center of its bounding box.
- Otherwise, if fallbackPositions[i] is a Vector3, stopPositions[i] = fallbackPositions[i].
- Otherwise, stopPositions[i] = (0,0,0).
If both arrays are empty, there is still one stop position at (0,0,0).

Per-frame priority order (useFrame):
1) Focused target (selectionStore.selection.isFocused by name) overrides everything.
2) Manual override (ONLY when hasNavigatedRef.current === true):
   - reads manualIndexRef.current, validates/clamps, and uses it if valid.
   - manual override automatically expires after MANUAL_OVERRIDE_SECONDS of no manual index change,
     and AnimatedRig sets hasNavigatedRef.current = false to resume auto-cycling.
3) Auto-cycle between stop positions every MIN_DWELL_SECONDS.

Contract note:
- HomeScene sets hasNavigatedRef.current = true on swipe.
- AnimatedRig sets hasNavigatedRef.current = false after the manual override timeout.
- AnimatedRig does NOT write back to manualIndexRef.current.
*/
const MIN_DWELL_SECONDS = 5; // dwell time at each position
const MANUAL_OVERRIDE_SECONDS = 5; // dwell an additional 5 if swipe gesture moves the rig
// clicks force camera to dwell near clicked object position until manualIndexRef and hasNavigatedRef, or selectionStore.isFocused change.

// // For testing
// const useScene = () => {
//   const { scene } = useThree();
//   const lib = useRef({});
//   useEffect(() => { scene.traverse((object) => { if (object.isMesh) lib.current[`${object.name}`] = object }) }, []);
//   return lib.current;
// };

// const handleSwipe = () => {
//   let nextIndex;
  
//   if (swipeDirectionRef.current > 0)  nextIndex = (manualIndexRef.current + 1) % stopPositions.length
//   else nextIndex = (manualIndexRef.current - 1 + stopPositions.length) % stopPositions.length

//   console.log("nextIndex: ", nextIndex)
//   return nextIndex
//   // manualIndexRef.current = nextIndex;
//   // hasNavigatedRef.current = true;
//   // targetMeshRef.current = null;
// };

const AnimatedRig = ({
  manualIndexRef = null,
  hasNavigatedRef = null,
  fallbackPositions = [], 
  targetRefs = [],
}) => {
  const isFocused = useSelection((state) => state.selection.isFocused);

  const lastSwitchTimeRef = useRef(0);
  const lastManualInputTimeRef = useRef(-Infinity);

  const cameraPosition = useRef(new THREE.Vector3());
  const lookAtPosition = useRef(new THREE.Vector3());

  const stopPositions = useRef([new THREE.Vector3(0, 0, 0)]);
  const fallbackPositionRef = useRef(new THREE.Vector3(0, 0, 0));

  const boxRef = useRef(new THREE.Box3());
  const centerRef = useRef(new THREE.Vector3());

  const targetIndex = useRef(0);
  const lastManualIndexRef = useRef(null);

  const nameToIndexMapRef = useRef({});

  useEffect(() => {
    const length = Math.max(targetRefs?.length ?? 0, fallbackPositions?.length ?? 0);
    for (let i = 0; i < length; i++) {
      if (!stopPositions.current[i]?.isVector3) stopPositions.current[i] = new THREE.Vector3();
      // if truthy but not Object3D - futureproofing 
      if (!targetRefs[i] || typeof targetRefs[i].updateWorldMatrix !== 'function') {
        stopPositions.current[i].copy(fallbackPositions[i]?.isVector3 ? fallbackPositions[i] : fallbackPositionRef.current);
        continue;
      }
      targetRefs[i].updateWorldMatrix(true, true);
      boxRef.current.setFromObject(targetRefs[i]).getCenter(centerRef.current);
      stopPositions.current[i].copy(centerRef.current);
    }

    stopPositions.current.length = length || 1;

    if (length === 0) {
      if (!stopPositions.current[0]?.isVector3) stopPositions.current[0] = new THREE.Vector3();
      stopPositions.current[0].copy(fallbackPositionRef.current);
    }

    const map = {};
    for (let i = 0; i < targetRefs.length; i++) {
      if (targetRefs[i]?.name) {
        map[targetRefs[i].name] = i;
      }
    }
    nameToIndexMapRef.current = map;

    if (targetIndex.current < 0 || targetIndex.current >= stopPositions.current.length) targetIndex.current = 0;
  }, [targetRefs, fallbackPositions]);

  useFrame(({ camera, clock }, delta) => {
    if (targetIndex.current >= stopPositions.current.length || targetIndex.current < 0) targetIndex.current = 0;
    if (stopPositions.current.length === 0) return;

    let nextPosition = stopPositions.current[0];
    const check = hasNavigatedRef?.current ? manualIndexRef?.current : null;
    const manualIndex = Number.isInteger(check) && check >= 0 && check < stopPositions.current.length ? check : null;

    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
    const elapsedTime = clock.elapsedTime;
    const xOffset = Math.sin(elapsedTime);
    const yOffset = -2 * xOffset;
    const zOffset = cameraConfigs.POSITION[2] + xOffset;
    const focusedIndex = isFocused !== null ? (nameToIndexMapRef.current[isFocused] ?? -1) : -1;

    if (hasNavigatedRef?.current) {
      const compare = manualIndex;
      if (compare !== lastManualIndexRef.current) {
        lastManualIndexRef.current = compare;
        lastManualInputTimeRef.current = elapsedTime;
      }
    }

    if (
      focusedIndex < 0 &&
      hasNavigatedRef?.current &&
      (elapsedTime - lastManualInputTimeRef.current) > MANUAL_OVERRIDE_SECONDS
    ) {
      hasNavigatedRef.current = false;
      lastManualIndexRef.current = null;
      lastSwitchTimeRef.current = elapsedTime;
    }

    if (focusedIndex >= 0 && stopPositions.current[focusedIndex]) {
      targetIndex.current = focusedIndex;
      nextPosition = stopPositions.current[targetIndex.current];
    }
    else if (manualIndex !== null && stopPositions.current[manualIndex]) {
      targetIndex.current = manualIndex;
      nextPosition = stopPositions.current[targetIndex.current];
    }
    else {
      cameraPosition.current.copy(stopPositions.current[targetIndex.current]);
      let currentIndex = targetIndex.current;
      let nextIndex = currentIndex >= stopPositions.current.length - 1 ? 0 : currentIndex + 1;
      const canSwitch = (elapsedTime - lastSwitchTimeRef.current) > MIN_DWELL_SECONDS;

      if (canSwitch) {
        lastSwitchTimeRef.current = elapsedTime;
        targetIndex.current = nextIndex;
        // if (manualIndexRef) manualIndexRef.current = targetIndex.current;
      }

      nextPosition = stopPositions.current[targetIndex.current];
    }

    lookAtPosition.current.set(
      nextPosition.x + xOffset,
      nextPosition.y + yOffset,
      nextPosition.z + zOffset
    );
    easing.damp3(camera.position, lookAtPosition.current, 1, clampedDelta);
    dampCameraLookAt(camera, nextPosition, 1.5, clampedDelta, 0, Math.PI / 6, 0);

    camera.updateMatrixWorld();
  });
};

export default AnimatedRig;