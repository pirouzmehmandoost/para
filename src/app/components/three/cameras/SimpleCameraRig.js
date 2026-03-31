'use client';

import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react'
import { easing } from 'maath';
import sceneConfigs from '@configs/sceneConfigs';
import { capitalize } from '@mui/material';

THREE.Cache.enabled = true;
const {
  cameraConfigs: {
    POSITION: [configX, configY, configZ],
  } = {},
} = sceneConfigs;

const SimpleCameraRig = ({
  focusTarget,
  fallbackPosition,
  cameraShake = false
}) => {
  const sceneCamera = useThree((s) => s.camera);
  const lookAtPositionRef = useRef(new THREE.Vector3(sceneCamera.position.x, sceneCamera.position.y, sceneCamera.position.z));
  const cameraPositionRef = useRef(new THREE.Vector3(sceneCamera.position.x, sceneCamera.position.y, sceneCamera.position.z));
  const blendedPositionRef = useRef(new THREE.Vector3(sceneCamera.position.x, sceneCamera.position.y, sceneCamera.position.z));
  // const defaultFallBackPosition = useRef(new THREE.Vector3(configX, configY, configZ))
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
        _scratchCenterRef.current.z + configZ + 10
      );
    }
    else if (fallbackPosition.isObject3D){
      lookAtPositionRef.current.set(
        fallbackPosition.x,
        fallbackPosition.y,
        fallbackPosition.z + configZ + 10
      );
    }
    blendedPositionRef.current.copy(lookAtPositionRef.current);
    sceneCamera.updateMatrixWorld();
  }, [focusTarget, fallbackPosition]);

  useFrame(({ clock, camera }, delta) => {
    const clampedDelta = Math.min(delta, 0.08);

    if (cameraShake) {
      const elapsedTime = clock.elapsedTime;
      const xOffset = Math.sin(elapsedTime) * 2.5;
      const yOffset = Math.cos(elapsedTime) * 5;
      const zOffset = Math.cos(elapsedTime) * -2;

      blendedPositionRef.current.set(
        lookAtPositionRef.current.x + xOffset,
        lookAtPositionRef.current.y + yOffset,
        lookAtPositionRef.current.z + zOffset
      );
    }
    cameraPositionRef.current.copy(camera.position)
    camera.lookAt(cameraPositionRef.current)
    easing.damp3(camera.position, blendedPositionRef.current, 1, clampedDelta);
    camera.updateMatrixWorld();
  });
};

export default SimpleCameraRig;