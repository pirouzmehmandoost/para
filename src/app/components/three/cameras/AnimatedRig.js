'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import cameraConfigs from '@configs/cameraConfigs';
import { easing } from 'maath';
import useSelection from '@stores/selectionStore';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;
const MIN_DWELL_SECONDS = 5; // rig dwells camera for 5 seconds at each position
const MANUAL_OVERRIDE_SECONDS = 5; // dwells for 5+5 if swipe gestures move the rig
// clicks force camera to dwell near clicked object position until manualIndexRef and hasNavigatedRef, or selectionStore.isFocused change.

const AnimatedRig = ({
  manualIndexRef = null,
  hasNavigatedRef = null,
  positionVectors = [], // an array of Vector3. Can be used as fallback positions when targetRefs omitted or is an empty array. 
  targetRefs = [], // objects the camera will look at
}) => {
  const isFocused = useSelection((state) => state.selection.isFocused);
  const targetIndex = useRef(0);
  const lastSwitchTimeRef = useRef(0);
  const lastManualInputTimeRef = useRef(-Infinity);
  const lastManualIndexRef = useRef(null);
  const cameraPosition = useRef(new THREE.Vector3());
  const lookAtPosition = useRef(new THREE.Vector3());
  const stopPositions = useRef([new THREE.Vector3(0, 0, 0)]);
  const fallbackPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const boxRef = useRef(new THREE.Box3());
  const centerRef = useRef(new THREE.Vector3());
  const nameToIndexMapRef = useRef({});

  useEffect(() => {
    const length = Math.max(targetRefs?.length ?? 0, positionVectors?.length ?? 0);
    for (let i = 0; i < length; i++) {
      if (!stopPositions.current[i]?.isVector3) stopPositions.current[i] = new THREE.Vector3();
      // if truthy but not Object3D... for some future case when I decide that targetRefs[i] doesnt have to be Object3D 
      if (!targetRefs[i] || typeof targetRefs[i].updateWorldMatrix !== 'function') {
        stopPositions.current[i].copy(positionVectors[i]?.isVector3 ? positionVectors[i] : fallbackPositionRef.current);
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
  }, [targetRefs, positionVectors]);

  useFrame(({ camera, clock }, delta) => {
    if (targetIndex.current >= stopPositions.current.length || targetIndex.current < 0) targetIndex.current = 0;
    if (stopPositions.current.length === 0) return;

    let nextPosition = stopPositions.current[0];
    const check = hasNavigatedRef?.current ? manualIndexRef?.current : null;
    const manualIndex = Number.isInteger(check) && check >= 0 && check < stopPositions.current.length ? check : null;

    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
    const elapsedTime = clock.elapsedTime;
    const xOffset = Math.sin(elapsedTime);
    const yOffset = 3 * Math.cos(elapsedTime);
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
        if (manualIndexRef) manualIndexRef.current = targetIndex.current;
      }

      nextPosition = stopPositions.current[targetIndex.current];
    }

    lookAtPosition.current.set(
      nextPosition.x + xOffset,
      nextPosition.y + yOffset,
      nextPosition.z + zOffset
    );
    easing.damp3(camera.position, lookAtPosition.current, 1, clampedDelta);
    easing.dampLookAt(camera, nextPosition, 1, clampedDelta);
    camera.updateMatrixWorld();
  });
};

export default AnimatedRig;

// const lookAtMatrixRef = useRef(new THREE.Matrix4());
// const targetQuatRef = useRef(new THREE.Quaternion());
// function dampCameraLookAt(camera, targetPoint, smoothTime, delta) {
//   // smoothTime: bigger = slower/smoother (same idea as maath damp)
//   const st = Math.max(1e-4, smoothTime); // avoid divide-by-zero
//   // exponential smoothing factor (0..1), derived from omega = 2/smoothTime style damping
//   const t = 1 - Math.exp((-2 * delta) / st);
//   // compute "look at" rotation matrix for a camera: from camera.position to targetPoint
//   lookAtMatrixRef.current.lookAt(camera.position, targetPoint, camera.up);
//   // convert to quaternion
//   targetQuatRef.current.setFromRotationMatrix(lookAtMatrixRef.current);
//   // smoothly rotate toward it
//   camera.quaternion.slerp(targetQuatRef.current, t);
// }
