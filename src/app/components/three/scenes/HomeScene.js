'use client';

import React, { startTransition, useCallback, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Bvh, Cloud, Clouds, SoftShadows } from '@react-three/drei'
import { EffectComposer, Outline, Vignette} from '@react-three/postprocessing';
import { BlendFunction, KernelSize, Resizer } from 'postprocessing';
import { portfolio } from '@configs/globals';
import useSelection from '@stores/selectionStore';
import { scaleMeshAtBreakpoint } from '@utils/mesh/meshUtils';
import AnimatedRig from '../cameras/AnimatedRig';
import Ground from '../models/Ground';
import Model from '../models/Model';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;
const { projects } = portfolio;

const HomeScene = () => {
  const { size } = useThree();
  const [groundMeshRef, setGroundMeshRef] = useState(undefined);
  const setSelectionStore = useSelection((state) => state.setSelection);
  const isFocused = useSelection((state) => state.selection.isFocused);
  const setIsFocused = useSelection((state) => state.setIsFocused)
  const resetSelectionStore = useSelection((state) => state.reset);
  const targetMeshRef = useRef(null);
  // swipe gesture tracking
  const currentIndexRef = useRef(0);
  const swipeDirectionRef = useRef(null);
  const isSwipeRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const touchStartRef = useRef(null);
  // Model mount tracking
  const readyCount = useRef(0);
  const [meshesReady, setMeshesReady] = useState(false);
  const meshRefs = useRef(new Array(projects.length).fill(null));
  const meshReadyFlags = useRef(new Array(projects.length).fill(false));
  const totalMeshes = projects.length;
  //mesh positioning
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

  const cameraTargets = useMemo(() => meshesReady ? meshRefs.current : [], [meshesReady]);

  const handlePointerDown = (e) => {
    isSwipeRef.current = false;
    touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e) => {
    if (!touchStartRef.current) return;

    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const isSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 600;

    if (isSwipe) {
      isSwipeRef.current = true;
      e.stopPropagation?.();

      const direction = deltaX > 0 ? 'right' : 'left';
      let nextIndex;
      if (direction === 'right') {
        nextIndex = (currentIndexRef.current + 1) % projects.length;
        swipeDirectionRef.current = 1;
      }
      else {
        nextIndex = (currentIndexRef.current - 1 + projects.length) % projects.length;
        swipeDirectionRef.current = -1;
      }
      currentIndexRef.current = nextIndex;
      hasNavigatedRef.current = true;
      targetMeshRef.current = null;

      startTransition(() => {
        resetSelectionStore();
        setIsFocused(null);
      });
    };

    touchStartRef.current = null;
  };

  const outlineSelection = useMemo(() => {
    if (!isFocused) return undefined;

    const focusedMesh = meshRefs.current.find((m) => m?.name === isFocused);
    return focusedMesh ? [focusedMesh] : undefined;
  }, [isFocused, meshesReady]);

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

    swipeDirectionRef.current = null;
    currentIndexRef.current = index;
    hasNavigatedRef.current = false;

    startTransition(() => {
      setSelectionStore({ ...projects[index] });
      setIsFocused(clickedName)
    });
  }, [setSelectionStore]);

  const handleMiss = (e) => {
    if (isSwipeRef.current) return;

    targetMeshRef.current = null;
    e.stopPropagation();

    startTransition(() => {
      resetSelectionStore();
      setIsFocused(null)
    });
  };

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
        manualIndexRef={currentIndexRef}
        hasNavigatedRef={hasNavigatedRef}
        fallbackPositions={meshPositions}
        targetRefs={cameraTargets}
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
      <mesh
        position={[0, 0, -1000]}
        onClick={handleMiss}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[20000, 20000]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} />
      </mesh>
      <Ground setGroundMeshRef={setGroundMeshRef} rotation={[Math.PI / 9, 0, 0]} />
    </>
  );
};

export default HomeScene;