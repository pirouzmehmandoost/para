'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import { dampCameraLookAt } from '@utils/quaternionUtils';
import cameraConfigs from '@configs/cameraConfigs';

const AnimatedRig = ({
  focusTarget = null,
  onSwipe = undefined,
  fallbackPositions = [],
  targets = [],
}) => {

  const { MIN_DWELL_SECONDS, MANUAL_OVERRIDE_SECONDS, SWIPE_DELTA_PX, SWIPE_DELTA_TIME_MS, POSITION } = cameraConfigs;
  const _scratchBoxRef = useRef(new THREE.Box3());
  const _scratchCenterRef = useRef(new THREE.Vector3());

  const domElement = useThree((state) => state.gl.domElement);
  const clock = useThree((state) => state.clock);

  const activePointerIdRef = useRef(null);
  const pointerStartRef = useRef(null);

  const lastSwitchTimeRef = useRef(0);
  const manualOverrideTimeRef = useRef(-Infinity); // active while elapsedTime < this value)

  const cameraPosition = useRef(new THREE.Vector3());
  const lookAtPosition = useRef(new THREE.Vector3());

  const stopPositions = useRef([new THREE.Vector3(0, 0, 0)]);
  const fallbackPositionRef = useRef(new THREE.Vector3(0, 0, 0));

  const targetIndex = useRef(0);
  const nameToIndexMapRef = useRef({});

  useEffect(() => {
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
      if (!e.isPrimary) return; // ignore secondary touches

      activePointerIdRef.current = e.pointerId;
      domElement.setPointerCapture?.(e.pointerId); // capture pointerup even if pointer leaves the canvas
      pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    };

    const finishPointer = (e) => {
      if (activePointerIdRef.current !== e.pointerId) return;

      domElement.releasePointerCapture?.(e.pointerId);
      activePointerIdRef.current = null;
      pointerStartRef.current = null;
    };

    const onPointerCancel = (e) => finishPointer(e);

    const onPointerUp = (e) => {
      const start = pointerStartRef.current;
      if (!start || activePointerIdRef.current !== e.pointerId) return;

      const deltaX = e.clientX - start.x;
      const deltaY = e.clientY - start.y;
      const deltaTime = Date.now() - start.time;
      const isSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_DELTA_PX && deltaTime < SWIPE_DELTA_TIME_MS;

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

      finishPointer(e);
    };

    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointercancel', onPointerCancel);
    domElement.addEventListener('lostpointercapture', onPointerCancel);

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerCancel);
      domElement.removeEventListener('lostpointercapture', onPointerCancel);
    };
  }, [domElement, clock, onSwipe, SWIPE_DELTA_TIME_MS, SWIPE_DELTA_PX, MANUAL_OVERRIDE_SECONDS]);

  useEffect(() => {
    const length = Math.max(targets?.length ?? 0, fallbackPositions?.length ?? 0);
    for (let i = 0; i < length; i++) {
      if (!stopPositions.current[i]?.isVector3) stopPositions.current[i] = new THREE.Vector3();

      if (!targets[i] || !targets[i]?.isObject3D) {
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

    const focusedIndex = focusTarget !== null
      ? (nameToIndexMapRef.current[focusTarget] ?? -1)
      : -1;

    const isManualOverrideActive = elapsedTime < manualOverrideTimeRef.current;

    if (focusedIndex >= 0 && stopPositions.current[focusedIndex]) {
      // experimental logic. nextPoint is current bounding box center position
      if (targets[focusedIndex]?.isObject3D) {
        targetIndex.current = focusedIndex;
        targets[targetIndex.current].updateWorldMatrix(true, true);
        _scratchBoxRef.current
          .setFromObject(targets[targetIndex.current])
          .getCenter(_scratchCenterRef.current);
        nextPosition = _scratchCenterRef.current;
      } else {
        targetIndex.current = focusedIndex;
        nextPosition = stopPositions.current[targetIndex.current];
      }
      // original logic
      // targetIndex.current = focusedIndex;
      // nextPosition = stopPositions.current[targetIndex.current];
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
    const yOffset = -2.5 * sine;
    const zOffset = POSITION[2] + sine;

    lookAtPosition.current.set(
      nextPosition.x + sine,
      nextPosition.y + yOffset,
      nextPosition.z + zOffset
    );
    easing.damp3(camera.position, lookAtPosition.current, 1, clampedDelta);
    // dampCameraLookAt(camera, nextPosition, 1.5, clampedDelta, 0, (Math.PI / 6), 0);
    easing.dampLookAt(camera, nextPosition, 1.5, clampedDelta);
    camera.updateMatrixWorld();
  });
};

export default AnimatedRig;