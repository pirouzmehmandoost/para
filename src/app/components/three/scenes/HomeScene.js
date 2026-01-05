'use client';

import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Bvh, Cloud, Clouds, SoftShadows } from '@react-three/drei'
import { EffectComposer, Outline, Vignette } from '@react-three/postprocessing';
import { BlendFunction, KernelSize, Resizer } from 'postprocessing';
import { portfolio } from '@configs/globals';
import useSelection from '@stores/selectionStore';
import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';
import AnimatedRig from '../cameras/AnimatedRig';
import Ground from '../models/Ground';
import Model from '../models/Model';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;
const { projects } = portfolio;

const HomeScene = () => {
  const size = useThree((state) => state.size);
  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);

  const setSelectionStore = useSelection((state) => state.setSelection);
  const isFocused = useSelection((state) => state.selection.isFocused); // in focus does not imply selected.
  const setIsFocused = useSelection((state) => state.setIsFocused)
  const resetSelectionStore = useSelection((state) => state.reset);

  const [groundMeshRef, setGroundMeshRef] = useState(undefined);

  const lastSwipeTimeRef = useRef(0); // track swipe timing so missed clicks after swipe dont count.

  // track Model component mount / when all Object3D's are in scene
  const readyCount = useRef(0);
  const [meshesReady, setMeshesReady] = useState(false);
  const meshRefs = useRef(new Array(projects.length).fill(null)); // all model
  const meshReadyFlags = useRef(new Array(projects.length).fill(false));
  const totalMeshes = projects.length;
  const targetMeshRef = useRef(null); // currently clicked Object3D (selected and in focus)
  const cameraTargets = useMemo(() => meshesReady ? meshRefs.current : [], [meshesReady]);

  // Model mesh positioning
  const meshPositions = useMemo(() => {
    const ellipseRadius = scaleMeshAtBreakpoint(size.width) * 150;
    const positions = [];
    const vertex = new THREE.Vector3();
    const ellipseCurve = new THREE.EllipseCurve(
      0,
      0,
      ellipseRadius,
      ellipseRadius,
      0,
      2 * Math.PI,
      false,
      projects.length % 2 == 0 ? 0 : Math.PI / 2
    );
    ellipseCurve.closed = true;

    const curvePoints = ellipseCurve.getPoints(projects.length);
    const ellipseCurvePoints = curvePoints.slice(1);
    const positionAttribute = new THREE.BufferGeometry()
      .setFromPoints(ellipseCurvePoints)
      .getAttribute('position');

    for (let i = 0; i < positionAttribute.count; i++) {
      const pt = vertex.fromBufferAttribute(positionAttribute, i);
      positions.push(new THREE.Vector3(pt.x, 0, pt.y));
    }
    return positions;
  }, [size.width]);

  const meshReadyHandlers = useMemo(() =>
    projects.map((_, i) => {
      return (mesh) => {
        if (!mesh || meshReadyFlags.current[i]) return;

        meshRefs.current[i] = mesh;
        meshReadyFlags.current[i] = true;
        readyCount.current += 1;

        if (readyCount.current === totalMeshes) setMeshesReady(true);
      }
    }
    ), [totalMeshes]);

  const handlePointerMissed = useCallback((e) => {
    if (Date.now() - lastSwipeTimeRef.current < 250) return;

    targetMeshRef.current = null;
    startTransition(() => {
      resetSelectionStore();
      setIsFocused(null)
    });
  }, [resetSelectionStore, setIsFocused]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    const clickedName = e.object.name;
    const previous = targetMeshRef.current;
    targetMeshRef.current = e.object;

    if (previous?.name === clickedName) return;

    const index = projects.findIndex(
      ({
        sceneData: {
          fileData: {
            nodeName = '',
          } = {},
        } = {},
      }) => nodeName === clickedName
    );

    startTransition(() => {
      setSelectionStore({ ...projects[index] });
      setIsFocused(clickedName)
    });
  }, [setSelectionStore]);

  const onSwipe = (e) => {
    lastSwipeTimeRef.current = Date.now();
    startTransition(() => {
      resetSelectionStore();
      setIsFocused(null)
    });
  }

  const outlineSelection = useMemo(() => {
    if (!isFocused) return undefined;

    const focusedMesh = meshRefs.current.find((m) => m?.name === isFocused);
    return focusedMesh ? [focusedMesh] : undefined;
  }, [isFocused, meshesReady]);

  useEffect(() => {
    const prev = get().onPointerMissed;
    set({ onPointerMissed: handlePointerMissed });
    return () => set({ onPointerMissed: prev });
  }, [set, get, handlePointerMissed]);

  return (
    <>
      <directionalLight
        castShadow={true}
        intensity={3}
        position={[-100, 50, 0]}
        shadow-bias={0.01}
        shadow-camera-near={2}
        shadow-camera-far={1024}
        shadow-camera-top={1024}
        shadow-camera-bottom={-1024}
        shadow-camera-left={-1024}
        shadow-camera-right={1024}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        castShadow={true}
        intensity={3}
        position={[100, 50, 0]}
        shadow-bias={0.01}
        shadow-camera-near={2}
        shadow-camera-far={1024}
        shadow-camera-top={1024}
        shadow-camera-bottom={-1024}
        shadow-camera-left={-1024}
        shadow-camera-right={1024}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <AnimatedRig
        onSwipe={onSwipe}
        fallbackPositions={meshPositions}
        targets={cameraTargets}
      />
      <EffectComposer autoClear={false} disableNormalPass multisampling={0}>
        <Vignette eskil={false} offset={0.01} darkness={0.7} />
        <Outline
          selection={outlineSelection}
          blendFunction={BlendFunction.SCREEN}
          patternTexture={null}
          edgeStrength={5}
          pulseSpeed={0.25}
          visibleEdgeColor={0xffffff}
          hiddenEdgeColor={0xffffff}
          width={Resizer.AUTO_SIZE}
          height={Resizer.AUTO_SIZE}
          kernelSize={KernelSize.VERY_LARGE}
          blur={true}
          xRay={true}
        />
      </EffectComposer>
      <SoftShadows focus={0.1} samples={12} size={30} />
      <Clouds material={THREE.MeshLambertMaterial} limit={projects.length * 4}>
        {projects.map((_, index) => {
          return (
            <Cloud
              key={`cloud_${index}`}
              color='black'
              concentrate='outside'
              growth={300}
              opacity={0.13}
              position={[meshPositions[index].x + 10, meshPositions[index].y - 50, meshPositions[index].z + 90]}
              seed={0.4}
              segments={4}
              speed={0.2}
              volume={300}
            />
          );
        })}
      </Clouds>
      <Bvh firstHitOnly>
        {projects.map(({ sceneData, sceneData: { fileData: { nodeName } = {} } = {} }, index) => {
          return (
            <Model
              key={nodeName}
              name={nodeName}
              autoRotate={sceneData.autoRotate}
              autoRotateSpeed={sceneData.autoRotateSpeed * 0.5}
              groundMeshRef={groundMeshRef}
              materials={sceneData.materials}
              materialId={sceneData.materials.defaultMaterial}
              fileData={sceneData.fileData}
              onMeshReady={meshReadyHandlers[index]}
              position={meshPositions[index]}
              scale={sceneData.scale * 0.5}
              onClick={handleClick}
            />
          );
        })}
      </Bvh>
      <Ground setGroundMeshRef={setGroundMeshRef} rotation={[Math.PI / 9, 0, 0]} />
    </>
  );
};

export default HomeScene;