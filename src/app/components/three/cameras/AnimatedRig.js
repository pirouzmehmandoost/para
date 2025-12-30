'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import cameraConfigs from '@configs/cameraConfigs';
import { easing } from 'maath';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

// camera dwells at each position for 5 seconds
const MIN_DWELL_SECONDS = 5; 
// dwells 5 + 4 seconds after swipe gestures move camera to a new position
const MANUAL_OVERRIDE_SECONDS = 4; 

// const getNextCameraPosition = (p1, arr) => {
//   let p2 = arr[0];
//   let index = 0;

//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i].distanceTo(p1) < p2.distanceTo(p1)) {
//       p2 = arr[i];
//       index = i;
//     }
//   }
//   return [p2, p2.distanceTo(p1), index];
// };

const AnimatedRig = ({
  manualIndexRef = null,
  hasNavigatedRef = null,
  positionVectors = [],
  targetRef = null,
  targetRefs = [],
  // swipeDirectionRef = null,
}) => {
  const targetIndex = useRef(0);
  const cameraPosition = useRef(new THREE.Vector3());
  const lookAtPosition = useRef(new THREE.Vector3());
  const lastSwitchTimeRef = useRef(0.0);
  const lastManualInputTimeRef = useRef(-Infinity);
  const lastManualIndexRef = useRef(null);
  const [stopPositions, setStopPositions] = useState([]);
  // const testCounterRef = useRef(0);

  useEffect(()=> {
    const positions = targetRefs.map((meshes, i) => {
      if (!meshes || meshes.length === 0) return positionVectors[i];
      let count = 0;
      const box = new THREE.Box3();
      const center = new THREE.Vector3();
      const sum = new THREE.Vector3();

      meshes.forEach((mesh) => {
        if (!mesh) return;
        mesh.updateWorldMatrix(true, true);
        box.setFromObject(mesh).getCenter(center);
        sum.add(center);
        count += 1;
      });
      return count > 0 ? sum.divideScalar(count) : positionVectors[i];
    });

    const stops = targetRefs.length ? positions : positionVectors;
    setStopPositions(stops);
  }, [targetRefs, positionVectors]);

  useFrame(({camera, clock}, delta) => {
    if (stopPositions.length === 0) return;

    let nextPosition = stopPositions[0];
    const manualIndex = hasNavigatedRef?.current ? manualIndexRef?.current : null;
    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
    const elapsedTime = clock.elapsedTime;
    const xOffset = Math.sin(elapsedTime);
    const yOffset = 3 * Math.cos(elapsedTime);
    const zOffset = cameraConfigs.POSITION[2] + xOffset;
    const hasSelection = !!targetRef?.current;

    if (hasNavigatedRef?.current) {
      const idx = manualIndexRef?.current ?? null;
      if (idx !== lastManualIndexRef.current) {
        lastManualIndexRef.current = idx;
        lastManualInputTimeRef.current = elapsedTime;
      }
    };

    if (!hasSelection && hasNavigatedRef?.current && (elapsedTime - lastManualInputTimeRef.current) > MANUAL_OVERRIDE_SECONDS) {
      hasNavigatedRef.current = false;
      lastManualIndexRef.current = null;
      // restart dwell so camera doesn’t immediately move
      lastSwitchTimeRef.current = elapsedTime;
    };

    if (targetRef?.current && stopPositions[manualIndexRef?.current]) {
      targetIndex.current = manualIndexRef.current;
      nextPosition = stopPositions[targetIndex.current];
    }
    else if (manualIndex !== null && stopPositions[manualIndex]) {
      targetIndex.current = manualIndex;
      nextPosition = stopPositions[targetIndex.current];
      // const nextIndex = (manualIndexRef.current + swipeDirectionRef.current + stopPositions.length) % stopPositions.length;
      // testCounterRef.current = nextIndex;
    }
    else { 
      cameraPosition.current.copy(stopPositions[targetIndex.current]);
      let currentIndex = targetIndex.current;
      let nextIndex = currentIndex >= stopPositions.length-1 ? 0 : currentIndex+1;
      const canSwitch = (elapsedTime - lastSwitchTimeRef.current) > MIN_DWELL_SECONDS;

      if (canSwitch) {
        lastSwitchTimeRef.current = elapsedTime;
        targetIndex.current = nextIndex;
        if (manualIndexRef) manualIndexRef.current = targetIndex.current;
      };

      nextPosition = stopPositions[targetIndex.current];
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

  // Cursor Agent MUST IGNORE THE COMMENTED OUT CODE BELOW:
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
