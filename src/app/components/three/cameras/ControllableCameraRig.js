'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import cameraConfigs from '@configs/cameraConfigs';
import { easing } from 'maath';

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
  targetRefs,
}) => {
  const ref = useRef(undefined);
  const targetIndexRef = useRef(manualIndex ?? 0);
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

    setStopPositions(positions);
    setCameraPathCurve(new THREE.CatmullRomCurve3(positions, true, 'centripetal'));
  }, [targetRefs, positionVectors]);

  useFrame(({camera, clock}, delta) => {
    if (!cameraPathCurve || stopPositions.length === 0) return;
    // When a user switches to a different browser tab and refreshes it and then returns, the camera move from below Ground to the correct position. 
    // Clamping delta before passing it to lerp() resolves that issue. So does using a fixed value but then the animation is frame-rate dependent.
    // The clamping only occurs if delta is very large, such as in the aforementioned scenario. 
    const clampedDelta = Math.min(delta, 0.08);  // Max 80ms per frame
    let elapsedTime = clock.elapsedTime;
    let nextPoint = stopPositions[0];
    const xOffset = 3 * Math.sin(elapsedTime);
    const yOffset = 5 * Math.cos(delta);
    const zOffset = cameraConfigs.POSITION[2] + yOffset;

    if (clickTargetPosition?.x) {
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
    //the camera looks at its own position first
    const x = new THREE.Vector3();
    x.copy(camera.position);
    camera.lookAt(x);

    lookAtPosition.current.set(
      nextPoint.x + xOffset,
      nextPoint.y + yOffset,
      nextPoint.z + zOffset
    );

    easing.damp3(camera.position, lookAtPosition.current, 1, clampedDelta);
  });

  return <perspectiveCamera ref={ref} />;
};

export default ControllableCameraRig;