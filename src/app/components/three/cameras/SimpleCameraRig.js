'use client';

import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react'
import { easing } from 'maath';
import cameraConfigs from '@configs/cameraConfigs';

THREE.Cache.enabled = true;

const SimpleCameraRig = ({ focusTarget, fallbackPosition, cameraShake, }) => {
  const sceneCamera = useThree((s) => s.camera);
  const lookAtPositionRef = useRef(new THREE.Vector3(sceneCamera.position.x, sceneCamera.position.y, sceneCamera.position.z));
  const cameraPositionRef = useRef(new THREE.Vector3(sceneCamera.position.x, sceneCamera.position.y, sceneCamera.position.z));
  const blendedPositionRef = useRef(new THREE.Vector3(sceneCamera.position.x, sceneCamera.position.y, sceneCamera.position.z));
  const _scratchBoxRef = useRef(new THREE.Box3());
  const _scratchCenterRef = useRef(new THREE.Vector3());

  useLayoutEffect(() => {
    if (focusTarget && focusTarget?.isObject3D) {
      focusTarget.updateWorldMatrix(true, true);
      _scratchBoxRef.current
      .setFromObject(focusTarget)
      .getCenter(_scratchCenterRef.current);

      lookAtPositionRef.current.set(
        _scratchCenterRef.current.x,
        _scratchCenterRef.current.y,
        _scratchCenterRef.current.z + cameraConfigs.POSITION[2] + 10
      );
    }
    else {
      lookAtPositionRef.current.set(
        fallbackPosition.x,
        fallbackPosition.y,
        fallbackPosition.z + cameraConfigs.POSITION[2] + 10
      );
    }
    blendedPositionRef.current.copy(lookAtPositionRef.current);
    sceneCamera.updateMatrixWorld();
  }, [focusTarget, fallbackPosition]);

  useFrame(({ clock, camera }, delta) => {
    const clampedDelta = Math.min(delta, 0.08);

    if (cameraShake) {
      const elapsedTime = clock.elapsedTime;
      blendedPositionRef.current.set(
        lookAtPositionRef.current.x + 2.5 * Math.sin(elapsedTime),
        lookAtPositionRef.current.y + 5 * Math.cos(elapsedTime),
        lookAtPositionRef.current.z + (-2 * Math.cos(elapsedTime))
      );
    }
    cameraPositionRef.current.copy(camera.position)
    camera.lookAt(cameraPositionRef.current)
    easing.damp3(camera.position, blendedPositionRef.current, 1, clampedDelta);
    camera.updateMatrixWorld();
  });
};

export default SimpleCameraRig;