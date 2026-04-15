'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import cameraConfigs from '@configs/cameraConfigs';
import useSelection from '@stores/selectionStore';

/* 
Potential Redesign: 
1- keys of meshesInSceneRef are the name property of each scene child. Maybe they could be uuids since those are unique. 
2- Cut down unnecessary calls to camera.updateMatrixWorld();
4- The if-else logic in useFrame() needs revision. 
5- The old way of reading focusTarget provide this value as a prop. Now this value is read directly from selectionStore per frame

 old way: 
  (BasicScene provided focusTarget as a prop to SceneRig)
  const focusedIndex = focusTarget !== null ? (meshesInSceneRef.current[focusTarget]?.index ?? -1) : -1;

new way: 
  (store snapshot is read directly per frame/within useFrame())
  const { selection } = useSelection.getState();
  const focusTargetExists =  selection.isFocused !== null || selection?.isFocused?.length !== 0
  const focusedIndex = focusTargetExists ? (meshesInSceneRef.current[selection.isFocused]?.index ?? -1) : -1;

  Determine if this is a valid and if it is the best approach. 
*/

const SceneRig = ({
  onSwipe = undefined, // optional callback
  fallbackPositions = [], // array of Vector3
  targets = [], // array of Object3D refs.
}) => {

  const { MIN_DWELL_SECONDS, MANUAL_OVERRIDE_SECONDS, SWIPE_DELTA_PX, SWIPE_DELTA_TIME_MS, POSITION } = cameraConfigs;
  const _scratchBoxRef = useRef(new THREE.Box3());
  const _scratchCenterRef = useRef(new THREE.Vector3());

  const domElement = useThree((state) => state.gl.domElement);
  const clock = useThree((state) => state.clock);
  const scene = useThree((state) => state.scene);

  const activePointerIdRef = useRef(null);
  const pointerStartRef = useRef(null);

  const lastSwitchTimeRef = useRef(0);
  const manualOverrideTimeRef = useRef(-Infinity); // active while elapsedTime < this value)

  const currentCameraPositionRef = useRef(new THREE.Vector3());
  const nextCameraPositionRef = useRef(new THREE.Vector3());
  const cameraTargetRef = useRef(new THREE.Vector3());

  const cameraStopPositionsRef = useRef([new THREE.Vector3(0, 0, 0)]);
  const defaultFallbackPositionRef = useRef(new THREE.Vector3(POSITION[0], POSITION[1], POSITION[2]));

  const targetIndexRef = useRef(0);
  const meshesInSceneRef = useRef({});

  useEffect(() => {
    const meshesInScene = {};

    scene.traverse((object) => { if (object.isMesh) meshesInScene[`${object.name}`] = object });

    for (let i = 0; i < targets.length; i++) {
      if (targets[i]?.name?.length) {
        const targetName = targets[i].name;
        const foundTargetInScene = meshesInScene[targetName] || null;
        
        if (foundTargetInScene) {
          meshesInSceneRef.current[targetName] = { target: foundTargetInScene, index: i, targetName };
        }
      }
    }
  }, [targets, scene, scene.children]);


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
    const length = Math.max(Object.entries(meshesInSceneRef.current)?.length ?? 0, fallbackPositions?.length ?? 0);
  
    for (let i = 0; i < length; i++) {
      if (!cameraStopPositionsRef.current[i]?.isVector3) cameraStopPositionsRef.current[i] = new THREE.Vector3();

      if (!targets[i] || !targets[i]?.isObject3D) {
        cameraStopPositionsRef.current[i].copy(fallbackPositions[i]?.isVector3 ? fallbackPositions[i] : defaultFallbackPositionRef.current);
        continue;
      }

      const key = targets[i]?.name;
      const exists = meshesInSceneRef.current[key].target?.name;
      if (exists?.length && typeof targets[i]['updateWorldMatrix'] === 'function') meshesInSceneRef.current[key].target.updateWorldMatrix(true, false);

      _scratchBoxRef.current.setFromObject(meshesInSceneRef.current[key].target).getCenter(_scratchCenterRef.current);
      cameraStopPositionsRef.current[i].copy(_scratchCenterRef.current);
    }

    cameraStopPositionsRef.current.length = length || 1;

    if (length === 0) {
      if (!cameraStopPositionsRef.current[0]?.isVector3) cameraStopPositionsRef.current[0] = new THREE.Vector3();
      cameraStopPositionsRef.current[0].copy(defaultFallbackPositionRef.current);
    }

    if (targetIndexRef.current < 0 || targetIndexRef.current >= cameraStopPositionsRef.current.length) targetIndexRef.current = 0;
  }, [targets, fallbackPositions]);

  useFrame(({ camera, clock }, delta) => {
    const elapsedTime = clock.elapsedTime;
    const xOffset = Math.sin(elapsedTime);
    const yOffset = -2 * xOffset;
    const zOffset = POSITION[2] + xOffset;
    const clampedDelta = Math.min(delta, 0.08);
    const { selection } = useSelection.getState();

    if (targetIndexRef.current >= cameraStopPositionsRef.current.length || targetIndexRef.current < 0) targetIndexRef.current = 0;
    if (cameraStopPositionsRef.current.length === 0) return;

    let nextPosition = cameraStopPositionsRef.current[0];
    const focusTargetExists =  selection.isFocused !== null || selection?.isFocused?.length !== 0
    // const focusedIndex = focusTarget !== null ? (meshesInSceneRef.current[focusTarget]?.index ?? -1) : -1;
    const focusedIndex = focusTargetExists ? (meshesInSceneRef.current[selection.isFocused]?.index ?? -1) : -1;
    const isManualOverrideActive = elapsedTime < manualOverrideTimeRef.current;

    if (focusedIndex >= 0 && cameraStopPositionsRef.current[focusedIndex]) targetIndexRef.current = focusedIndex
    else if (isManualOverrideActive && cameraStopPositionsRef.current[targetIndexRef.current]) targetIndexRef.current = targetIndexRef.current
    else {
      currentCameraPositionRef.current.copy(cameraStopPositionsRef.current[targetIndexRef.current]); // TEST: temporarily uncomment this line. 
      let currentIndex = targetIndexRef.current;
      let nextIndex = currentIndex >= cameraStopPositionsRef.current.length - 1 ? 0 : currentIndex + 1;
      const canSwitch = (elapsedTime - lastSwitchTimeRef.current) > MIN_DWELL_SECONDS;

      if (canSwitch) {
        lastSwitchTimeRef.current = elapsedTime;
        targetIndexRef.current = nextIndex;
      }
    }

    const targetName = targets[targetIndexRef.current]?.name;
    const meshInScene = meshesInSceneRef.current[targetName]?.target;
    const meshInSceneName = meshInScene?.name;
    const isTargetInScene = (targetName?.length && meshInSceneName?.length) && (targetName === meshInSceneName); 

    if (isTargetInScene && meshInScene.isObject3D) {
      camera.updateMatrixWorld();
      if (meshInScene['updateWorldMatrix'] === 'function') meshesInSceneRef.current[targetName].target.updateWorldMatrix(true, false);

      _scratchBoxRef.current.setFromObject(meshInScene).getCenter(_scratchCenterRef.current);
      nextPosition = _scratchCenterRef.current;
    }
    else {
      nextPosition = cameraStopPositionsRef.current[targetIndexRef.current];
    }

    currentCameraPositionRef.current.copy(camera.position);
    camera.lookAt(currentCameraPositionRef.current);
    nextCameraPositionRef.current.set(nextPosition.x + xOffset, nextPosition.y + yOffset, nextPosition.z + zOffset);
    // cameraTargetRef.current.set(currentCameraPositionRef.current.x, currentCameraPositionRef.current.y, currentCameraPositionRef.current.z-POSITION[2]);
    // camera.lookAt(cameraTargetRef.current);
    easing.damp3(camera.position, nextCameraPositionRef.current, 1, clampedDelta);
  });
};

export default SceneRig;