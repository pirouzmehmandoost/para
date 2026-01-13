'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Bvh, Cloud, Clouds, SoftShadows } from '@react-three/drei'
import AnimatedLight from "../lights/AnimatedLight";
import {
  EffectComposer,
  // Outline,
  N8AO,
  Vignette
} from '@react-three/postprocessing';
// import { BlendFunction, KernelSize, Resizer } from 'postprocessing';
import { portfolio } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import useSelection from '@stores/selectionStore';
import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';
import SceneRig from '../cameras/SceneRig';
import Ground from '../models/Ground';
import Model from '../models/Model';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;
const { projects } = portfolio;

const CloudGroup = (props) => {
  const { meshPositions } = props;
  const length = meshPositions?.length ?? 0

  if (!length) return null;

  const cloudProps = useMemo(() => meshPositions.map((p)=> {
    const position = [
      p.x + 10,
      p.z < 0 ? p.y - 50 : p.y - 140,
      p.z + 90 
    ];

    return {
      color: 'black',
      concentrate: 'outside',
      fade: 100,
      growth: 300,
      opacity: 0.14,
      position: position,
      seed: 0.4,
      segments: 4,
      speed: 0.2,
      volume: 300,
    };
  }), [meshPositions]);

  return (
    <Clouds material={THREE.MeshPhysicalMaterial} limit={projects.length * 4}>
      {cloudProps.map((cp, index) => <Cloud key={`cloud_${index}`} {...cp} />)}
    </Clouds>
  );
};

const HomeScene = () => {
  const { SWIPE_DELAY_MS } = cameraConfigs;
  const size = useThree((state) => state.size);
  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);

  const setSelectionStore = useSelection((state) => state.setSelection);
  const isFocused = useSelection((state) => state.selection.isFocused);
  const setIsFocused = useSelection((state) => state.setIsFocused);
  const resetSelectionStore = useSelection((state) => state.reset);

  const [groundMeshRef, setGroundMeshRef] = useState(undefined);

  const lastSwipeTimeRef = useRef(0); // track swipe timing so missed clicks after swipe dont count.
  // track Model component mount / when all Object3D's are in scene
  const readyCount = useRef(0);
  const [meshesReady, setMeshesReady] = useState(false);
  const meshRefs = useRef(new Array(projects.length).fill(null)); // all model
  const meshReadyFlags = useRef(new Array(projects.length).fill(false));
  const totalMeshes = projects.length;

  const cameraTargets = useMemo(() => meshesReady ? meshRefs.current : [], [meshesReady]);

  const meshScale = Math.min(0.5, scaleMeshAtBreakpoint(size.width) * 0.45)

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
    if (Date.now() - lastSwipeTimeRef.current < SWIPE_DELAY_MS) return;

    startTransition(() => {
      resetSelectionStore();
      setIsFocused(null)
    });
  }, [resetSelectionStore, setIsFocused, SWIPE_DELAY_MS]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    const clickedName = e.object.name;
    if (isFocused === clickedName) return;

    const index = projects.findIndex(({ sceneData: { fileData: { nodeName = '' } = {} } = {} }) => nodeName === clickedName);
    if (index < 0) return;

    startTransition(() => {
      setSelectionStore({ ...projects[index] });
      setIsFocused(clickedName)
    });
  }, [isFocused, setIsFocused, setSelectionStore]);

  const onSwipe = useCallback((e) => {
    lastSwipeTimeRef.current = Date.now();
    startTransition(() => {
      resetSelectionStore();
      setIsFocused(null);
    });
  }, [resetSelectionStore, setIsFocused]);

  // const outlineSelection = useMemo(() => {
  //   if (!isFocused) return undefined;

  //   const focusedMesh = meshRefs.current.find((m) => m?.name === isFocused);
  //   return focusedMesh ? [focusedMesh] : undefined;
  // }, [isFocused, meshesReady]);

  useEffect(() => {
    const prev = get().onPointerMissed;
    set({ onPointerMissed: handlePointerMissed });

    return () => set({ onPointerMissed: prev });
  }, [set, get, handlePointerMissed]);

  return (
    <>
      <SoftShadows focus={0.1} samples={10} size={30} />
      <directionalLight
        castShadow={true}
        intensity={3}
        position={[0, 100, -20]}
        shadow-bias={-0.001}
        shadow-camera-fov={50}
        shadow-camera-near={1}
        shadow-camera-far={2048}
        shadow-camera-top={2048}
        shadow-camera-bottom={-2048}
        shadow-camera-left={-2048}
        shadow-camera-right={2048}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <AnimatedLight
        castShadow={false}
        position={[0, 100, 100]}
        intensity={2.8}
        target={[0,-50,0]}
        type={'spotLight'}
        color={'#FFF6E8'}
        // helper={true}
      />
      <CloudGroup meshPositions={meshPositions} />

      <EffectComposer autoClear={false} disableNormalPass multisampling={0}>
        <N8AO aoRadius={100} distanceFalloff={0.2} intensity={7} screenSpaceRadius halfRes />
        {/* <Vignette eskil={false} offset={0.01} darkness={0.7} /> */}
        {/* <Outline
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
        /> */}
      </EffectComposer>
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
              scale={meshScale * sceneData.scale}
              onClick={handleClick}
            />
          );
        })}
      </Bvh>
      <Ground setGroundMeshRef={setGroundMeshRef} rotation={[Math.PI / 8, Math.PI /1.3, 0]} />
      <SceneRig
        focusTarget={isFocused}
        onSwipe={onSwipe}
        fallbackPositions={meshPositions}
        targets={cameraTargets}
      />
    </>
  );
};

export default HomeScene;