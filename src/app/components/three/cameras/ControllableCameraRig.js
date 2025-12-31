'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import cameraConfigs from '@configs/cameraConfigs';
import { easing } from 'maath';

/** ControllableCameraRig
* NOTES: 
*   Delta clamping in useFrame(): 
*   When a user switches to a different browser tab, refreshes that tab and returns back, 
*   the camera's positioning becomes odd.
*   when requesting animation frames delta is clamped before passing to lerp(), resolving the issue. 
*   Using a fixed value instead of delta does not cause the same behavior but is frame-rate dependent.
**/

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

function getNextCameraPosition(p1, arr) {
  let p2 = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].distanceTo(p1) < p2.distanceTo(p1)) p2 = arr[i];
  }
  return p2;
};

const ControllableCameraRig = ({
  manualIndex = null,
  positionVectors = [],
  target: { position: clickTargetPosition = null } = {},
  targetRefs = [],
}) => {
  const targetIndexRef = useRef(manualIndex ?? 0);
  const cameraPositionRef = useRef(new THREE.Vector3());
  const lookAtPosition = useRef(new THREE.Vector3());
  const [stopPositions, setStopPositions] = useState([]);
  const [cameraPathCurve, setCameraPathCurve] = useState(null);

  useLayoutEffect(() => {
    if (manualIndex !== null) targetIndexRef.current = manualIndex; 
  }, [manualIndex]);

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
    setCameraPathCurve(stops.length > 1 ? new THREE.CatmullRomCurve3(stops, true, 'centripetal') : null);
  }, [targetRefs, positionVectors]);

  useFrame(({camera, clock}, delta) => {
    if (!cameraPathCurve || stopPositions.length === 0) return;

    const clampedDelta = Math.min(delta, 0.08);  // Max 80ms per frame
    const elapsedTime = clock.elapsedTime;
    const xOffset = Math.sin(elapsedTime);
    const yOffset = 3 * Math.cos(elapsedTime);
    const zOffset = cameraConfigs.POSITION[2] + 20 + xOffset;
    let nextPoint = stopPositions[0];

    if (clickTargetPosition?.isVector3) {
      nextPoint = getNextCameraPosition(clickTargetPosition, stopPositions);
    }
    else if (manualIndex !== null && stopPositions[targetIndexRef.current]) {
      nextPoint = stopPositions[targetIndexRef.current];
      targetIndexRef.current = manualIndex;
    }
    else {
      const pointOnCurve = (elapsedTime * 0.03) % 1;
      nextPoint = getNextCameraPosition(cameraPathCurve.getPoint(pointOnCurve), stopPositions);
    }

    cameraPositionRef.current.copy(camera.position);
    camera.lookAt(cameraPositionRef.current);

    lookAtPosition.current.set(
      nextPoint.x + xOffset,
      nextPoint.y + yOffset,
      nextPoint.z + zOffset
    );

    easing.damp3(camera.position, lookAtPosition.current, 1, clampedDelta);
  });
};

export default ControllableCameraRig;