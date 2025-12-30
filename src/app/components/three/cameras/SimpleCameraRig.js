'use client';

import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useLayoutEffect, useRef } from 'react'
import { easing } from 'maath';
import cameraConfigs from '@configs/cameraConfigs';

THREE.Cache.enabled = true;

const SimpleCameraRig = ({ target, onTargetReady }) => {
  const { camera } = useThree();

  const cameraTargetPosition = useMemo(()=> {
    const positionVector = new THREE.Vector3(cameraConfigs);
    if (target) {
      target.updateWorldMatrix(true, true);
      const modelBoundingBox = new THREE.Box3().setFromObject(target);
      const center = new THREE.Vector3();
      modelBoundingBox.getCenter(center);
      positionVector.copy(center);
    };
    return positionVector;
  }, [target]);

  const lookAtPosition = useRef(new THREE.Vector3());

  useLayoutEffect(() => {
    if (target) {
      camera.position.set( cameraTargetPosition.x, cameraTargetPosition.y, cameraTargetPosition.z + 220);
      camera.lookAt(cameraTargetPosition);
      camera.updateMatrixWorld();
      if (onTargetReady) onTargetReady(cameraTargetPosition);
    }
  }, [target, cameraTargetPosition, camera]);

  useFrame(({ clock, camera }, delta) => {
    camera.lookAt(cameraTargetPosition);
    camera.updateMatrixWorld();
    const elapsedTime = clock.elapsedTime;
    const xOffset = 50 * Math.sin(elapsedTime);
    const yOffset = 50 * Math.cos(elapsedTime);
    const zOffset = cameraConfigs.POSITION[2] + yOffset;
    lookAtPosition.current.set(
      cameraTargetPosition.x + xOffset,
      cameraTargetPosition.y + yOffset,
      cameraTargetPosition.z + zOffset
    );
    easing.damp3(camera.position, lookAtPosition.current, 1, 0.06)
  });
};

export default SimpleCameraRig;