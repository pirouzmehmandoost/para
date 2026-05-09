'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import cameraConfigs from '@configs/cameraConfigs';
import useSelection from '@stores/selectionStore';
// import { EPSILON_10e4 } from '@/lib/utils/animationUtils';
import { getAABBCenterFast } from '@/lib/utils/positionUtils';

const SceneRig = ({
  onSwipe = undefined, // optional callback
  fallbackPositions = [], // array of Vector3
  targets = [], // array of Object3D refs.
}) => {

  const {
    MIN_DWELL_SECONDS,
    MANUAL_OVERRIDE_SECONDS,
    SWIPE_DELTA_PX, SWIPE_DELTA_TIME_MS,
    INITIAL_CAMERA_POSITION,
    OFFSET_CAMERA_POSITION,
  } = cameraConfigs;
  const _scratchBoxRef = useRef(new THREE.Box3());
  const _scratchCenterRef = useRef(new THREE.Vector3());

  const domElement = useThree((state) => state.gl.domElement);
  const clock = useThree((state) => state.clock);
  const scene = useThree((state) => state.scene);
  const cam = useThree((state) => state.camera);

  const activePointerIdRef = useRef(null);
  const pointerStartRef = useRef(null);

  const lastSwitchTimeRef = useRef(0);
  const manualOverrideTimeRef = useRef(-Infinity); // active while elapsedTime < this value)

  const nextCameraPositionRef = useRef(new THREE.Vector3());
  const cameraStopPositionsRef = useRef([new THREE.Vector3(0, 0, 0)]);
  const defaultFallbackPositionRef = useRef(new THREE.Vector3(OFFSET_CAMERA_POSITION[0], OFFSET_CAMERA_POSITION[1], OFFSET_CAMERA_POSITION[2]));

  const targetIndexRef = useRef(0);
  const prevTargetIndexRef = useRef(-1);
  const targetsInSceneRef = useRef({});
  const targetsNotInSceneRef = useRef({});
  const nameToUUIDRef = useRef({});

  useLayoutEffect(() => {
    cam.lookAt(INITIAL_CAMERA_POSITION[0], INITIAL_CAMERA_POSITION[1], -1 * INITIAL_CAMERA_POSITION[2]);
  }, [cam]);

  useEffect(() => {
    const targetsInScene = {};
    const nameToUUID = {};
    targetsInSceneRef.current = {};
    targetsNotInSceneRef.current = {};

    scene.traverse((object) => { if (object.isObject3D) targetsInScene[`${object.uuid}`] = object });

    for (let i = 0; i < targets.length; i++) {
      if (targets[i]?.uuid?.length) {
        const targetUUID = targets[i].uuid;
        const foundTargetInScene = targetsInScene[targetUUID] || null;
        if (foundTargetInScene) {
          targetsInSceneRef.current[targetUUID] = { target: foundTargetInScene, index: i, targetUUID };
          if (foundTargetInScene.name?.length) nameToUUID[foundTargetInScene.name] = targetUUID;
        }
        else {
          targetsNotInSceneRef.current[targetUUID] = { target: targets[i], index: i, targetUUID };
        }
      }
    }

    nameToUUIDRef.current = nameToUUID;
  }, [targets, scene]);

  useEffect(() => {
    const addedEventHandlers = [];
    // const removedEventHandlers = [];

    // for (const [uuid, entry] of Object.entries(targetsInSceneRef.current)) {
    //   const removedEventHandler = () => {
    //     // index of cameraStopPositionsRef to update (element is currently a fallback Vector3).
    //     const staleTargetIndex = entry.index;
    //     // get parent uuid for validation (Object3D _addedEvent signals parentage and sets Object3D.parent to non-null).
    //     const parentUUID = entry.target.parent?.uuid;
    //     // Validate parent in scene graph (parentage does not imply parent in scene, though the parent can be the scene). 
    //     const isParentInScene = parentUUID ? scene?.getObjectByProperty('uuid', parentUUID)?.isObject3D : null;
    //     if (isParentInScene) return;
    //     // Update targetsNotInSceneRef.
    //     targetsNotInSceneRef.current[uuid] = entry;
    //     const staleStopPosition = cameraStopPositionsRef.current[staleTargetIndex]?.isVector3 ?  cameraStopPositionsRef.current[staleTargetIndex] : null
    //     // Update cameraStopPositionsRef.current
    //     if (staleStopPosition) {
    //       cameraStopPositionsRef.current.splice(staleTargetIndex, 1);
    //     }
    //     // Update name to uuid map.
    //     if (entry.target?.name?.length) delete nameToUUIDRef.current[entry.target?.name];
    //     // Update targetsInSceneRef.
    //     delete targetsInSceneRef.current[uuid];
    //     // Remove self after firing
    //     entry.target.removeEventListener('removed', removedEventHandler);
    //   };
    //   entry.target.addEventListener('removed', removedEventHandler);
    //   removedEventHandlers.push({ target: entry.target, removedEventHandler });
    // }

    for (const [uuid, entry] of Object.entries(targetsNotInSceneRef.current)) {
      const addedEventHandler = () => {
        // index of cameraStopPositionsRef to update (element is currently a fallback Vector3).
        const pendingTargetIndex = entry.index;
        // get parent uuid for validation (Object3D _addedEvent signals parentage and sets Object3D.parent to non-null).
        const parentUUID = entry.target.parent?.uuid;
        // Validate parent in scene graph (parentage does not imply parent in scene, though the parent can be the scene). 
        const isParentInScene = parentUUID ? scene?.getObjectByProperty('uuid', parentUUID)?.isObject3D : null;
        if (!isParentInScene) return;
        // Update targetsInSceneRef.
        targetsInSceneRef.current[uuid] = entry;
        // Get AABB center position.
        const newStopPosition = getAABBCenterFast(entry.target, _scratchCenterRef.current);
        // Update cameraStopPositionsRef.current[index].
        if (newStopPosition) {
          if (cameraStopPositionsRef.current[pendingTargetIndex]?.isVector3) cameraStopPositionsRef.current[pendingTargetIndex].copy(newStopPosition);
          else {
            while (cameraStopPositionsRef.current.length <= pendingTargetIndex) {
              cameraStopPositionsRef.current.push(new THREE.Vector3().copy(defaultFallbackPositionRef.current));
            }
            cameraStopPositionsRef.current[pendingTargetIndex].copy(newStopPosition);
          }
        }
        // Update name to uuid map.
        if (entry.target?.name?.length) nameToUUIDRef.current[entry.target?.name] = uuid;
        // Update targetsNotInSceneRef.
        delete targetsNotInSceneRef.current[uuid];
        // Remove self after firing
        entry.target.removeEventListener('added', addedEventHandler);
      };

      entry.target.addEventListener('added', addedEventHandler);
      addedEventHandlers.push({ target: entry.target, addedEventHandler });
    }
    return () => {
      for (const { target, addedEventHandler } of addedEventHandlers) {
        target.removeEventListener('added', addedEventHandler);
      }
      // for (const { target, removedEventHandler } of removedEventHandlers) {
      //   target.removeEventListener('removed', removedEventHandler);
      // }

    };
  }, [targets, scene]);

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
        const count = cameraStopPositionsRef.current.length;

        if (count > 0) {
          const step = deltaX > 0 ? 1 : -1;

          targetIndexRef.current = (targetIndexRef.current + step + count) % count;
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
    const length = Math.max(Object.entries(targetsInSceneRef.current)?.length ?? 0, fallbackPositions?.length ?? 0);

    for (let i = 0; i < length; i++) {
      if (!cameraStopPositionsRef.current[i]?.isVector3) cameraStopPositionsRef.current[i] = new THREE.Vector3();

      if (!targets[i] || !targets[i]?.isObject3D) {
        cameraStopPositionsRef.current[i].copy(fallbackPositions[i]?.isVector3 ? fallbackPositions[i] : defaultFallbackPositionRef.current);
        continue;
      }

      const key = targets[i]?.uuid;
      const exists = targetsInSceneRef.current[key]?.target?.uuid ?? 0;
      if (exists?.length) {
        const target = targetsInSceneRef.current[key].target;

        if (typeof target['updateWorldMatrix'] === 'function') target.updateWorldMatrix(true, false);
        _scratchBoxRef.current.setFromObject(target).getCenter(_scratchCenterRef.current);
        cameraStopPositionsRef.current[i].copy(_scratchCenterRef.current);
      }
    }

    cameraStopPositionsRef.current.length = length || 1;

    if (length === 0) {
      if (!cameraStopPositionsRef.current[0]?.isVector3) cameraStopPositionsRef.current[0] = new THREE.Vector3();
      cameraStopPositionsRef.current[0].copy(defaultFallbackPositionRef.current);
    }

    if (targetIndexRef.current < 0 || targetIndexRef.current >= cameraStopPositionsRef.current.length) targetIndexRef.current = 0;
  }, [targets, fallbackPositions]);

  useFrame(({ camera, clock }, delta) => {
    const clampedDelta = Math.min(delta, 0.08);
    const elapsedTime = clock.elapsedTime;
    const xOffset = Math.sin(elapsedTime);
    const yOffset = -2 * xOffset;
    const zOffset = OFFSET_CAMERA_POSITION[2] + xOffset;
    const { selection } = useSelection.getState();

    if (targetIndexRef.current >= cameraStopPositionsRef.current.length || targetIndexRef.current < 0) targetIndexRef.current = 0;
    if (cameraStopPositionsRef.current.length === 0) return;

    let nextPosition = cameraStopPositionsRef.current[0];
    const focusTargetExists = selection.isFocused !== null && selection.isFocused?.length > 0;
    const focusedTargetUUID = !focusTargetExists ? -1 : nameToUUIDRef.current[selection.isFocused];
    const focusedIndex = focusTargetExists ? (targetsInSceneRef.current[focusedTargetUUID]?.index ?? -1) : -1;
    const isManualOverrideActive = elapsedTime < manualOverrideTimeRef.current;

    if (focusedIndex >= 0 && cameraStopPositionsRef.current[focusedIndex]) {
      prevTargetIndexRef.current = targetIndexRef.current;
      targetIndexRef.current = focusedIndex;
    }
    else if (isManualOverrideActive && cameraStopPositionsRef.current[targetIndexRef.current]) {
      // if current index points to a valid entry in cameraStopPositionsRef then prevent the else block from running.
      // if false (e.g. isManualOverrideActive is false or cameraStopPositionsRef.current is shortened between frames by useEffect), then the else block resets the index.
    }
    else {
      let currentIndex = targetIndexRef.current;
      let nextIndex = currentIndex >= cameraStopPositionsRef.current.length - 1 ? 0 : currentIndex + 1;
      const canSwitch = (elapsedTime - lastSwitchTimeRef.current) > MIN_DWELL_SECONDS;

      if (canSwitch) {
        prevTargetIndexRef.current = currentIndex;
        lastSwitchTimeRef.current = elapsedTime;
        targetIndexRef.current = nextIndex;
      }
    }

    const targetUUID = targets[targetIndexRef.current]?.uuid;
    const targetInScene = targetsInSceneRef.current[targetUUID]?.target;
    const targetInSceneUUID = targetInScene?.uuid;
    const isTargetInScene = (targetUUID?.length && targetInSceneUUID?.length) && (targetUUID === targetInSceneUUID);

    if (isTargetInScene && targetInScene.isObject3D) {
      // if (prevTargetIndexRef.current !== targetIndexRef.current || cameraStopPositionsRef.current[targetIndexRef.current].distanceTo(_scratchCenterRef.current) > EPSILON_10e4) {
      getAABBCenterFast(targetInScene, _scratchCenterRef.current);
      cameraStopPositionsRef.current[targetIndexRef.current].copy(_scratchCenterRef.current);
      prevTargetIndexRef.current = targetIndexRef.current;
      nextPosition = _scratchCenterRef.current;
      // }
    }
    else {
      nextPosition = cameraStopPositionsRef.current[targetIndexRef.current];
    }

    nextCameraPositionRef.current.set(nextPosition.x + xOffset, nextPosition.y + yOffset, nextPosition.z + zOffset);
    easing.damp3(camera.position, nextCameraPositionRef.current, 1, clampedDelta);
  });
};

export default SceneRig;