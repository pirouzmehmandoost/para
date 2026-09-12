'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import carouselConfigs from '@configs/carouselConfigs';
import useSelection from '@stores/selectionStore';
import useTargetRegistry from '@stores/targetRegistryStore';
import { getAABBCenterFast } from '@utils/positionUtils';

const { MANUAL_DWELL_SECONDS, AUTO_DWELL_SECONDS, SWIPE_DELTA_DISTANCE, SWIPE_DELTA_TIME_MS, OFFSET_CAMERA_POSITION } = carouselConfigs;

const positiveOr = (value, fallback) => (typeof value === 'number' && value > 0 ? value : fallback);

const Carousel = ({
  defaultPosition = undefined,
  lookAtPosition = undefined,
  offsetPosition = undefined,
  onSwipe = undefined,
  autoDwellTime = AUTO_DWELL_SECONDS, // seconds
  manualDwellTime = MANUAL_DWELL_SECONDS, // seconds
  swipeDistanceThreshold = SWIPE_DELTA_DISTANCE, // NDC
  swipeTimeThreshold = SWIPE_DELTA_TIME_MS, // milliseconds
}) => {
  const _scratchCenterRef = useRef(new Vector3());
  const _scratchLookAtRef = useRef(new Vector3());
  const _scratchPositionRef = useRef(new Vector3());
  const defaultPositionRef = useRef(new Vector3());
  const offsetPositionRef = useRef(new Vector3(OFFSET_CAMERA_POSITION[0], OFFSET_CAMERA_POSITION[1], OFFSET_CAMERA_POSITION[2]));
  const lookAtPositionRef = useRef(new Vector3(0,0,-1));

  const domElement = useThree((state) => state.gl.domElement);
  const get = useThree((state) => state.get);

  const isCameraOrientationSet = useRef(false);

  const autoDwellTimeRef = useRef(AUTO_DWELL_SECONDS);
  const manualDwellTimeRef = useRef(MANUAL_DWELL_SECONDS);
  const swipeDistanceThresholdRef = useRef(SWIPE_DELTA_DISTANCE);
  const swipeDeltaTimeRef = useRef(SWIPE_DELTA_TIME_MS);

  const activePointerIdRef = useRef(null);
  const pointerStartRef = useRef(null);

  const dwellRemainingRef = useRef(0);
  const phaseRef = useRef(0);

  const targetIndexRef = useRef(0);

  useLayoutEffect(() => {
    swipeDistanceThresholdRef.current = positiveOr(swipeDistanceThreshold, swipeDistanceThresholdRef.current);
    swipeDeltaTimeRef.current = positiveOr(swipeTimeThreshold, swipeDeltaTimeRef.current);
    manualDwellTimeRef.current = positiveOr(manualDwellTime, manualDwellTimeRef.current);
    autoDwellTimeRef.current = positiveOr(autoDwellTime, autoDwellTimeRef.current);
    dwellRemainingRef.current = autoDwellTimeRef.current;
  }, [autoDwellTime, manualDwellTime, swipeDistanceThreshold, swipeTimeThreshold]);

  useLayoutEffect(() => {
    if (!defaultPosition?.isVector3) return;
    
    if (!defaultPositionRef.current.equals(defaultPosition)) {
      defaultPositionRef.current.copy(defaultPosition);
    }
  }, [defaultPosition]);

  useLayoutEffect(() => {
    if (!lookAtPosition?.isVector3) return;

    if (!lookAtPositionRef.current.equals(lookAtPosition)) {
      lookAtPositionRef.current.copy(lookAtPosition);
      isCameraOrientationSet.current = false;
    }
    
}, [lookAtPosition]);

  useLayoutEffect(() => {
    if (!offsetPosition?.isVector3) return;

    if (!offsetPositionRef.current.equals(offsetPosition)) {
      offsetPositionRef.current.copy(offsetPosition)
    }
  }, [offsetPosition]);

  useEffect(() => {
    if (!domElement) return;

    const onPointerDown = (e) => {
      if (!e.isPrimary) return;

      activePointerIdRef.current = e.pointerId;
      domElement.setPointerCapture?.(e.pointerId);
      const size = get().size;
      const x = (e.offsetX / size.width) * 2 - 1;
      const y = -(e.offsetY / size.height) * 2 + 1;
      pointerStartRef.current = { x: x, y: y, time: Date.now() };
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

      const registry = useTargetRegistry.getState().registry;
      const positions = registry?.getPositions() ?? [];
      const size = get().size;
      const x = (e.offsetX / size.width) * 2 - 1;
      const y = -(e.offsetY / size.height) * 2 + 1;
      const deltaX = x - start.x;
      const deltaY = y - start.y;

      const deltaTime = Date.now() - start.time;
      const isSwipe = (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > swipeDistanceThresholdRef.current &&
        deltaTime < swipeDeltaTimeRef.current
      );

      if (isSwipe) {
        const count = positions.length;
        if (count > 0) {
          const step = deltaX > 0 ? 1 : -1;
          targetIndexRef.current = (targetIndexRef.current + step + count) % count;
          dwellRemainingRef.current = manualDwellTimeRef.current;
          onSwipe?.(e);
        }
      };

      finishPointer(e);
    };

    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointercancel', onPointerCancel);

    return () => {
      if (activePointerIdRef.current !== null) {
        domElement.releasePointerCapture?.(activePointerIdRef.current);
        activePointerIdRef.current = null;
        pointerStartRef.current = null;
      };

      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [domElement, get, onSwipe]);

  useFrame(({ camera }, delta) => {
    const clampedDelta = Math.min(delta, 0.08);
    phaseRef.current += clampedDelta;

    const registry = useTargetRegistry.getState().registry;
    const positions = registry ? registry.getPositions() : [];
    const promoted = registry ? registry.getPromoted() : null;

    if (isCameraOrientationSet.current === false) {
      _scratchLookAtRef.current.set(
        camera.position.x + lookAtPositionRef.current.x,
        camera.position.y + lookAtPositionRef.current.y,
        camera.position.z + lookAtPositionRef.current.z,
      );
      camera.lookAt(_scratchLookAtRef.current);
      isCameraOrientationSet.current = true;
    };

    if (!registry || positions.length === 0 || !promoted) {
      easing.damp3(camera.position, defaultPositionRef.current, 1, clampedDelta);
      return;
    };

    if (targetIndexRef.current >= positions.length || targetIndexRef.current < 0) {
      targetIndexRef.current = 0;
    };

    dwellRemainingRef.current -= clampedDelta;

    let nextPosition = positions[0];
    const focusedUUID = useSelection.getState().selection.focusedUUID;
    const promotedEntries = Object.values(promoted);
    const focusedEntry = focusedUUID ? promoted[focusedUUID] : undefined;
    const focusedIndex = focusedEntry?.index ?? -1;

    if (focusedIndex >= 0 && positions[focusedIndex]) {
      targetIndexRef.current = focusedIndex;
      dwellRemainingRef.current = autoDwellTimeRef.current;
    }
    else {
      const currentIndex = targetIndexRef.current;
      const nextIndex = currentIndex >= positions.length - 1 ? 0 : currentIndex + 1;

      if (dwellRemainingRef.current <= 0) {
        dwellRemainingRef.current = autoDwellTimeRef.current
        targetIndexRef.current = nextIndex;
      }
    }

    const currentEntry = promotedEntries.find(e => e.index === targetIndexRef.current);
  
    if (currentEntry?.target?.isObject3D) {
      getAABBCenterFast(currentEntry.target, _scratchCenterRef.current);
      registry.refreshPosition(targetIndexRef.current, _scratchCenterRef.current);
      nextPosition = _scratchCenterRef.current;
    }
    else {
      nextPosition = positions[targetIndexRef.current] ?? positions[0];
    }

    const sine = Math.sin(phaseRef.current)
    _scratchPositionRef.current.set(
      nextPosition.x + offsetPositionRef.current.x + sine,
      nextPosition.y + offsetPositionRef.current.y + (-2 * sine),
      nextPosition.z + offsetPositionRef.current.z + sine
    );
    easing.damp3(camera.position, _scratchPositionRef.current, 1, clampedDelta);
  });
};

export default Carousel;