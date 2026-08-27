'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import carouselConfigs from '@configs/carouselConfigs';
import useSelection from '@stores/selectionStore';
import useTargetRegistry from '@stores/targetRegistryStore';
import { getAABBCenterFast } from '@utils/positionUtils';

const { MANUAL_OVERRIDE_SECONDS, MIN_DWELL_SECONDS, SWIPE_DELTA_DISTANCE, SWIPE_DELTA_TIME_MS } = carouselConfigs;

const Carousel = ({
  defaultPosition = undefined,
  lookAtPosition = undefined,
  offsetPosition = undefined,
  onSwipe = undefined,
  autoDwellTime = undefined, // dwell time (seconds) for automatic position cycling in seconds.
  manualDwellTime = undefined, // dwell time (seconds) after a valid swipe gesture triggers reposition.
  swipeDistanceThrehold = undefined, // min "length" of a swip gesture in normalized device coordinates [0, 1]
  swipeTimeThreshold = undefined, // minimum duration (milliseconds) for a valid swipe gesture.
}) => {
  const _scratchCenterRef = useRef(new THREE.Vector3());
  const _scratchLookAtRef = useRef(new THREE.Vector3());

  const domElement = useThree((state) => state.gl.domElement);
  const stateClock = useThree((state) => state.clock);
  const size = useThree((state) => state.size);
  const pointer = useThree((state) => state.pointer);

  const initializeLookAtRef = useRef(false);
  const defaultPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const lookAtPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const offsetPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const nextCameraPositionRef = useRef(new THREE.Vector3(0, 0, 0));

  const minDwellTimeSecondsRef = useRef(MIN_DWELL_SECONDS);
  const manualDwellTimeSecondsRef = useRef(MANUAL_OVERRIDE_SECONDS);
  const swipeDistanceThresholdRef = useRef(SWIPE_DELTA_DISTANCE);
  const swipeDeltaTimeMSRef = useRef(SWIPE_DELTA_TIME_MS);

  const activePointerIdRef = useRef(null);
  const pointerStartRef = useRef(null);

  const lastSwitchTimeRef = useRef(0);
  const manualOverrideTimeRef = useRef(-Infinity);

  const targetIndexRef = useRef(0);
  const prevTargetIndexRef = useRef(-1);

  useLayoutEffect(() => {
    if (typeof swipeDistanceThrehold === 'number' && swipeDistanceThrehold > 0) {
      if (swipeDistanceThrehold !== swipeDistanceThresholdRef.current) {
        swipeDistanceThresholdRef.current = swipeDistanceThrehold;
      }
    }
  }, [swipeDistanceThrehold]);

  useLayoutEffect(() => {
    if (typeof swipeTimeThreshold === 'number' && swipeTimeThreshold > 0) {
      if (swipeTimeThreshold !== swipeDeltaTimeMSRef.current) {
        swipeDeltaTimeMSRef.current = swipeTimeThreshold;
      }
    }
  }, [swipeTimeThreshold]);

  useLayoutEffect(() => {
    if (typeof autoDwellTime === 'number' && autoDwellTime > 0) {
      if (autoDwellTime !== minDwellTimeSecondsRef.current) {
        minDwellTimeSecondsRef.current = autoDwellTime;
      }
    }
  }, [autoDwellTime]);

  useLayoutEffect(() => {
    if (typeof manualDwellTime === 'number') {
      if (manualDwellTime !== manualDwellTimeSecondsRef.current) {
        manualDwellTimeSecondsRef.current = manualDwellTime;
      }
    }
  }, [manualDwellTime]);

  useLayoutEffect(() => {
    if (!!defaultPosition && defaultPosition?.isVector3) {
      if (!defaultPositionRef.current.equals(defaultPosition)) {
        defaultPositionRef.current.copy(defaultPosition);
      }
    }
  }, [defaultPosition]);

  useLayoutEffect(() => {
    if (lookAtPosition?.isVector3) {
      if (!lookAtPositionRef.current.equals(lookAtPosition)) {
        lookAtPositionRef.current.copy(lookAtPosition);
        initializeLookAtRef.current = true;
      }
    }
  }, [lookAtPosition]);

  useLayoutEffect(() => {
    if (offsetPosition?.isVector3) {
      if (!offsetPositionRef.current.equals(offsetPosition)) {
        offsetPositionRef.current.copy(offsetPosition);
      }
    }
  }, [offsetPosition]);

  useEffect(() => {
    if (!domElement) return;

    const onPointerDown = (e) => {
      // console.log("\x1b[32m onPointerDown start. e: \x1b[0m", e)
      if (!e.isPrimary) return;

      activePointerIdRef.current = e.pointerId;
      domElement.setPointerCapture?.(e.pointerId);
      pointerStartRef.current = { x: pointer.x, y: pointer.y, time: Date.now() };
      // pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      // console.log("\x1b[32m onPointerDown end: \x1b[0m", pointerStartRef.current)
    };

    // On extended screens, lostpointercapture events can occur between pointerDown and pointerup. 
    // a listener on that event will onPointerCancel, which invokes finishPointer() to null out pointerStartRef.current. 
    // onPointerUp returns early if pointerStartRef.current is null to prevent setting time and index refs and firing onSwipe().
    // Since an intermediary lostPointerCapture event triggers on extended displays: 
    // onPointerDown sets the ref-> onPointerCancel nulls it ->  onPointerUp returns early -> some valid swipes dont register.
    
    // I'm pre-emptively commenting out the line that adds a listener on lostPointerCancel.
    // My rationale isnt concrete, however:
    // - onPointerUp itself calls finishPointer() to clean after itself.
    // - Native JavaScript pointerUp events are followed by lostPointerCapture events (meaning that onPointerCancel will fire 2 times regardless of an intermediary lostPointerCapture). 
    // - without a listener on lostPointerCancel, onPointerUp's invokation of finishPointer() triggers the flow of logic is otherwise triggered by onPointerCancel.
    // - The potentially redundant finishPointer() call becomes necessary.  
    const finishPointer = (e) => {
      // console.log("\x1b[31m FINISHPOINTER. e: \x1b[0m", e)
      if (activePointerIdRef.current !== e.pointerId) return;

      domElement.releasePointerCapture?.(e.pointerId);
      activePointerIdRef.current = null;
      pointerStartRef.current = null;
    };

    const onPointerCancel = (e) => finishPointer(e);

    const onPointerUp = (e) => {
      e.stopPropagation();
      const start = pointerStartRef.current;
      // console.log("\x1b[33m PointerUP: \x1b[0m", pointerStartRef.current);
      if (!start || activePointerIdRef.current !== e.pointerId) return;

      const registry = useTargetRegistry.getState().registry;
      const positions = registry?.getPositions() ?? [];
      const deltaX = pointer.x - start.x; 
      const deltaY = pointer.y - start.y;
      // const deltaX = e.clientX - start.x;
      // const deltaY = e.clientY - start.y;
      // console.log("\n\x1b[33m deltaX: ", deltaX, " deltaY: ", deltaY, " theshold: \x1b[0m", swipeDistanceThresholdRef.current)

      const deltaTime = Date.now() - start.time;
      // const isSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_DELTA_PX && deltaTime < SWIPE_DELTA_TIME_MS;
      const isSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeDistanceThresholdRef.current && deltaTime < swipeDeltaTimeMSRef.current;

      if (isSwipe) {
        const count = positions.length;
        if (count > 0) {
          const step = deltaX > 0 ? 1 : -1;
          targetIndexRef.current = (targetIndexRef.current + step + count) % count;
          manualOverrideTimeRef.current = stateClock.elapsedTime + manualDwellTimeSecondsRef.current;
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
    // domElement.addEventListener('lostpointercapture', onPointerCancel);

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerCancel);
      // domElement.removeEventListener('lostpointercapture', onPointerCancel);
    };
  }, [domElement, stateClock, onSwipe, size, pointer]);

  useFrame(({ camera, clock }, delta) => {
    const clampedDelta = Math.min(delta, 0.08);
    const registry = useTargetRegistry.getState().registry;
    const positions = registry ? registry.getPositions() : [];
    const promoted = registry ? registry.getPromoted() : null;

    if (initializeLookAtRef.current === true) {
      _scratchLookAtRef.current.set(
        camera.position.x + lookAtPositionRef.current.x,
        camera.position.y + lookAtPositionRef.current.y,
        camera.position.z + lookAtPositionRef.current.z,
      );
      camera.lookAt(_scratchLookAtRef.current);
      initializeLookAtRef.current = false;
    };

    if (!registry || positions.length === 0 || !promoted) {
      easing.damp3(camera.position, defaultPositionRef.current, 1, clampedDelta);
      return;
    };

    const elapsedTime = clock.elapsedTime;
    const sine = Math.sin(elapsedTime);
    const xOffset = offsetPositionRef.current.x + sine;
    const yOffset = offsetPositionRef.current.y + (-2 * sine);
    const zOffset = offsetPositionRef.current.z + sine;
    const focusedUUID = useSelection.getState().selection.focusedUUID;

    if (targetIndexRef.current >= positions.length || targetIndexRef.current < 0) {
      targetIndexRef.current = 0;
    };

    const promotedEntries = Object.values(promoted);
    let nextPosition = positions[0];
    const focusedEntry = focusedUUID ? promoted[focusedUUID] : undefined;
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
      const canSwitch = (elapsedTime - lastSwitchTimeRef.current) > minDwellTimeSecondsRef.current;
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
    }
    else {
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

export default Carousel;