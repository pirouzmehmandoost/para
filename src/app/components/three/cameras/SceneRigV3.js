'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import cameraConfigs from '@configs/cameraConfigs';
import useSelection from '@stores/selectionStore';
import { getAABBCenterFast } from '@/lib/utils/positionUtils';
import useTargetRegistry from '@hooks/useTargetRegistry';

const {
  MIN_DWELL_SECONDS,
  MANUAL_OVERRIDE_SECONDS,
  SWIPE_DELTA_PX, SWIPE_DELTA_TIME_MS,
  OFFSET_CAMERA_POSITION,
} = cameraConfigs;

/*
On an external display running over an HDMI frame pipeline,
Chromium's compositor relies on the asynchronous input queue to map pointer captures.
If the pointer coordinate update steps across a virtual scaling boundary,
the browser's window layer can intermittently drop pointer capture ownership mid-gesture,
firing a lostpointercapture or pointercancel before pointerup can fire.
The implementation below handles this by immediately short-circuiting out via onPointerCancel, abandoning a swipe mid-flight.

gesture logic potentially fails some displays
 because your swipe logic evaluates a fixed layout-pixel distance (SWIPE_DELTA_PX) using clientX and clientY.
 Because macOS heavily scales external monitor environments,
 the physical distance a human finger moves on the trackpad translates to fewer layout pixels in Chrome,
 failing your strict mathematical check
 */
const SceneRigV3 = ({
  onSwipe = undefined,
  targets = undefined,
  defaultPosition = undefined,
  lookAtPosition = undefined,
}) => {

  const _scratchCenterRef = useRef(new THREE.Vector3());

  const domElement = useThree((state) => state.gl.domElement);
  const stateClock = useThree((state) => state.clock);
  const size = useThree((state) => state.size)
  const scene = useThree((state) => state.scene);
  const cam = useThree((state) => state.camera);

  const defaultPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const lookAtPositionRef = useRef(new THREE.Vector3(0, 0, 0));

  const registryRef = useTargetRegistry(scene, targets);

  const activePointerIdRef = useRef(null);
  const pointerStartRef = useRef(null);

  const lastSwitchTimeRef = useRef(0);
  const manualOverrideTimeRef = useRef(-Infinity);

  const nextCameraPositionRef = useRef(new THREE.Vector3());
  const targetIndexRef = useRef(0);
  const prevTargetIndexRef = useRef(-1);

  useLayoutEffect(() => {
    if (!!defaultPosition && defaultPosition?.isVector3) {
      if (!defaultPositionRef.current.equals(defaultPosition)) defaultPositionRef.current.copy(defaultPosition);;
    }
  }, [defaultPosition]);


  useLayoutEffect(() => {
    if (!!lookAtPosition || lookAtPosition?.isVector3) {
      if (!lookAtPositionRef.current.equals(lookAtPosition)) lookAtPositionRef.current.copy(lookAtPosition);
    }

    cam.lookAt(lookAtPositionRef.current);
  }, [cam, lookAtPosition]);

  // useLayoutEffect(() => {
  //     cam.lookAt(INITIAL_CAMERA_POSITION[0], INITIAL_CAMERA_POSITION[1], -1 * INITIAL_CAMERA_POSITION[2]);
  // }, [cam]);

  useEffect(() => {
    if (!domElement) return;

    const onPointerDown = (e) => {
      if (!e.isPrimary) return;

      activePointerIdRef.current = e.pointerId;
      domElement.setPointerCapture?.(e.pointerId);
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

      const registry = registryRef.current;
      const positions = registry?.getPositions() ?? [];

      const deltaX = e.clientX - start.x;
      const deltaY = e.clientY - start.y;
      const deltaTime = Date.now() - start.time;
      const isSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_DELTA_PX && deltaTime < SWIPE_DELTA_TIME_MS;

      if (isSwipe) {
        const count = positions.length;

        if (count > 0) {
          const step = deltaX > 0 ? 1 : -1;

          targetIndexRef.current = (targetIndexRef.current + step + count) % count;
          manualOverrideTimeRef.current = stateClock.elapsedTime + MANUAL_OVERRIDE_SECONDS;
          lastSwitchTimeRef.current = stateClock.elapsedTime;

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
  }, [domElement, stateClock, onSwipe, registryRef, size]);

  useFrame(({ camera, clock }, delta) => {
    const registry = registryRef.current;
    if (!registry) return;

    const positions = registry.getPositions();
    const promoted = registry.getPromoted();

    if (positions.length === 0) return;

    const clampedDelta = Math.min(delta, 0.08);
    const elapsedTime = clock.elapsedTime;
    const xOffset = Math.sin(elapsedTime);
    const yOffset = -2 * xOffset;
    const zOffset = OFFSET_CAMERA_POSITION[2] + xOffset;
    const isFocused = useSelection.getState().selection.isFocused;

    if (targetIndexRef.current >= positions.length || targetIndexRef.current < 0) {
      targetIndexRef.current = 0;
    }

    const promotedEntries = Object.values(promoted);

    let nextPosition = positions[0];
    const focusTargetExists = isFocused !== null && isFocused?.length > 0;
    const focusedEntry = focusTargetExists
      ? promotedEntries.find(e => e.target.name === isFocused)
      : undefined;
    const focusedIndex = focusedEntry?.index ?? -1;
    const isManualOverrideActive = elapsedTime < manualOverrideTimeRef.current;

    if (focusedIndex >= 0 && positions[focusedIndex]) {
      prevTargetIndexRef.current = targetIndexRef.current;
      targetIndexRef.current = focusedIndex;
    }
    else if (isManualOverrideActive && positions[targetIndexRef.current]) {
      // manual override active and current index valid — hold position
    }
    else {
      const currentIndex = targetIndexRef.current;
      const nextIndex = currentIndex >= positions.length - 1 ? 0 : currentIndex + 1;
      const canSwitch = (elapsedTime - lastSwitchTimeRef.current) > MIN_DWELL_SECONDS;

      if (canSwitch) {
        prevTargetIndexRef.current = currentIndex;
        lastSwitchTimeRef.current = elapsedTime;
        targetIndexRef.current = nextIndex;
      }
    }

    const currentEntry = promotedEntries.find(e => e.index === targetIndexRef.current);

    if (currentEntry?.target?.isObject3D) {
      getAABBCenterFast(currentEntry.target, _scratchCenterRef.current);
      registry.refreshPosition(targetIndexRef.current, _scratchCenterRef.current);
      prevTargetIndexRef.current = targetIndexRef.current;
      nextPosition = _scratchCenterRef.current;
    } else {
      nextPosition = positions[targetIndexRef.current] ?? positions[0];
    }

    nextCameraPositionRef.current.set(
      nextPosition.x + xOffset,
      nextPosition.y + yOffset,
      nextPosition.z + zOffset,
    );
    easing.damp3(camera.position, nextCameraPositionRef.current, 1, clampedDelta);
  });
};

export default SceneRigV3;
