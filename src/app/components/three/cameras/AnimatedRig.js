'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import useSelection from '@stores/selectionStore';
import { dampCameraLookAt } from '@utils/quaternionUtils';
import cameraConfigs from '@configs/cameraConfigs';

const AnimatedRig = ({
  onSwipe = undefined,
  fallbackPositions = [], 
  targets = [],
}) => {

  const { MIN_DWELL_SECONDS, MANUAL_OVERRIDE_SECONDS } = cameraConfigs;
  const _scratchBoxRef = useRef(new THREE.Box3());
  const _scratchCenterRef = useRef(new THREE.Vector3());

  const focusedObjectName = useSelection((state) => state.selection.isFocused);

  const domElement = useThree((state) => state.gl.domElement);
  const clock = useThree((state) => state.clock);

  const pointerStartRef = useRef(null);

  const lastSwitchTimeRef = useRef(0);
  const manualOverrideTimeRef = useRef(-Infinity); // active while elapsedTime < this value)

  const cameraPosition = useRef(new THREE.Vector3());
  const lookAtPosition = useRef(new THREE.Vector3());

  const stopPositions = useRef([new THREE.Vector3(0, 0, 0)]);
  const fallbackPositionRef = useRef(new THREE.Vector3(0, 0, 0));

  const targetIndex = useRef(0);
  const nameToIndexMapRef = useRef({});

  useEffect(()=>{
    const map = {};
    for (let i = 0; i < targets.length; i++) {
      if (targets[i]?.name) {
        map[targets[i].name] = i;
      }
    }
    nameToIndexMapRef.current = map;

  }, [targets]);

  useEffect(() => {
    if (!domElement) return;

    const onPointerDown = (e) => {
      pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    };

    const onPointerUp = (e) => {
      const start = pointerStartRef.current;
      if (!start) return;

      const deltaX = e.clientX - start.x;
      const deltaY = e.clientY - start.y;
      const deltaTime = Date.now() - start.time;
      const isSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 600;

      if (isSwipe) {
        const count = stopPositions.current.length;
        if (count > 0) {
          const step = deltaX > 0 ? 1 : -1;

          targetIndex.current = (targetIndex.current + step + count) % count;
          manualOverrideTimeRef.current = clock.elapsedTime + MANUAL_OVERRIDE_SECONDS;
          lastSwitchTimeRef.current = clock.elapsedTime;

          onSwipe?.(e);
        }
      } else {
        manualOverrideTimeRef.current = -Infinity;
      }

      pointerStartRef.current = null;
    };

    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointercancel', onPointerUp);

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerUp);
    };
  }, [domElement, clock, onSwipe]);

  useEffect(() => {
    const length = Math.max(targets?.length ?? 0, fallbackPositions?.length ?? 0);
    for (let i = 0; i < length; i++) {
      if (!stopPositions.current[i]?.isVector3) stopPositions.current[i] = new THREE.Vector3();

      if (
        !targets[i] ||
        typeof targets[i].updateWorldMatrix !== 'function'
      ) {
        stopPositions.current[i].copy(fallbackPositions[i]?.isVector3 ? fallbackPositions[i] : fallbackPositionRef.current);
        continue;
      }

      targets[i].updateWorldMatrix(true, true);
      _scratchBoxRef.current.setFromObject(targets[i]).getCenter(_scratchCenterRef.current);
      stopPositions.current[i].copy(_scratchCenterRef.current);
    }

    stopPositions.current.length = length || 1;

    if (length === 0) {
      if (!stopPositions.current[0]?.isVector3) stopPositions.current[0] = new THREE.Vector3();
      stopPositions.current[0].copy(fallbackPositionRef.current);
    }

    if (targetIndex.current < 0 || targetIndex.current >= stopPositions.current.length) targetIndex.current = 0;
  }, [targets, fallbackPositions]);

  useFrame(({ camera, clock }, delta) => {
    if (targetIndex.current >= stopPositions.current.length || targetIndex.current < 0) targetIndex.current = 0;
    if (stopPositions.current.length === 0) return;

    let nextPosition = stopPositions.current[0];
    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
    const elapsedTime = clock.elapsedTime;

    const focusedIndex = focusedObjectName !== null 
      ? (nameToIndexMapRef.current[focusedObjectName] ?? -1) 
      : -1;

    const isManualOverrideActive = elapsedTime < manualOverrideTimeRef.current;

    if (focusedIndex >= 0 && stopPositions.current[focusedIndex]) {
      targetIndex.current = focusedIndex;
      nextPosition = stopPositions.current[targetIndex.current];
    }
    else if (isManualOverrideActive && stopPositions.current[targetIndex.current]) {
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
      }

      nextPosition = stopPositions.current[targetIndex.current];
    }

    const sine = Math.sin(elapsedTime);
    const yOffset = -2 * sine;
    const zOffset = 180 + sine;

    lookAtPosition.current.set( nextPosition.x + sine, nextPosition.y + yOffset, nextPosition.z + zOffset);
    easing.damp3(camera.position, lookAtPosition.current, 1, clampedDelta);
    dampCameraLookAt(camera, nextPosition, 1.5, clampedDelta, 0, Math.PI / 6, 0);

    camera.updateMatrixWorld();
  });
};

export default AnimatedRig;