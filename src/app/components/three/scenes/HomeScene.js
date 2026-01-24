'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Bvh, Cloud, Clouds, SoftShadows } from '@react-three/drei'
import { EffectComposer, Vignette } from '@react-three/postprocessing';
import { portfolio } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import useSelection from '@stores/selectionStore';
import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';
import AnimatedRig from '../cameras/AnimatedRig';
import BasicModel from '../models/BasicModel';
import AnimatedLight from '../lights/AnimatedLight';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;

const { projects } = portfolio;

/*
  The old cloud positions, relative to model positions:
    gerd:              x: -130,  y: 42,   z: -75
    bag_v3_for_web001: x: 130,   y: 2,    z: -75
    Yoga_Mat_Strap:    x: 4.6,   y: -85,  z: 150
    cloud 0:           x: -120,  y: -8,   z: 15
    cloud 1:           x: 140,   y:-48,   z: 15
    cloud 2:           x: 10,    y: -155, z: 240

  The old cloud positioning logic: 
    const cloudProps = useMemo(() => meshPositions.map((p) => {
      const position = [
        p.x + 10,
        p.z < 0 ? p.y - 50 : p.y - 70,
        p.z + 90
      ];

  // const fixedCloudPositions = [
  //   [-300, -20, 15],
  //   [300, -20, 15],
  //   [-210, -130, 130],
  // ];
  
*/
const CloudGroup = () => {
  const cloudProps = [];
  const fixedCloudPositions = [
    [-130, -8, 15],
    [130, -8, 15],
    [10, -135, 240],
  ];

  for (let i = 0; i < fixedCloudPositions.length; i++) {
    cloudProps.push({
      color: 'black',
      concentrate: 'inside',
      growth: 300,
      opacity: 0.13,
      position: fixedCloudPositions[i],
      seed: 0.4,
      segments: 7,
      speed: 0.2,
      volume: 300,
    });
  }

  return (
    <Clouds material={THREE.MeshPhysicalMaterial} limit={21}>
      <Cloud key={`cloud_0`} {...cloudProps[0]} />
      <Cloud key={`cloud_1`} {...cloudProps[1]} />
      <Cloud key={`cloud_2`} {...cloudProps[2]} />
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
  const setMaterialID = useSelection((state) => state.setMaterialID);
  const resetSelectionStore = useSelection((state) => state.reset);
  // const [groundMeshRef, setGroundMeshRef] = useState(undefined);
  const lastSwipeTimeRef = useRef(0); // track swipe timing so missed clicks after swipe dont count.
  // track Models mount/ready state
  const readyCount = useRef(0);
  const [meshesReady, setMeshesReady] = useState(false);
  const meshRefs = useRef(new Array(projects.length).fill(null)); // all model
  const meshReadyFlags = useRef(new Array(projects.length).fill(false));
  const totalMeshes = projects.length;
  // eslint-disable-next-line react-hooks/refs
  const cameraTargets = useMemo(() => meshesReady ? meshRefs.current : [], [meshesReady]);

  const meshScale = Math.min(0.5, scaleMeshAtBreakpoint(size.width) * 0.45)

  // Model mesh positioning
  const meshPositions = useMemo(() => {
    const fixedYPositions = [40, 2, -79];
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
      positions.push(new THREE.Vector3(pt.x, fixedYPositions[i], pt.y));
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
      setMaterialID(projects[index].sceneData.materials.defaultMaterialID);
      setIsFocused(clickedName);
    });
  }, [isFocused, setIsFocused, setMaterialID, setSelectionStore]);

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
      <SoftShadows focus={0.06} samples={14} size={36} />
      <AnimatedLight
        castShadow
        intensity={3}
        type='directionalLight'
      // color='#white'
      />
      {/* <directionalLight
        castShadow={true}
        color={'#fff6e8'}
        intensity={3}
        position={[0, 120, 50]}
        shadow-bias={-0.001}
        shadow-camera-fov={50}
        shadow-camera-near={1}
        shadow-camera-far={2048}
        shadow-camera-top={2048}
        shadow-camera-bottom={-2048}
        shadow-camera-left={-2048}
        shadow-camera-right={2048}
        shadow-mapSize={4096}
      /> */}
      <CloudGroup />
      <EffectComposer autoClear={false} disableNormalPass multisampling={0}>
        {/* <N8AO aoRadius={180} distanceFalloff={0.2} intensity={7} /> */}
        <Vignette eskil={false} offset={0.01} darkness={0.5} />
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
            <BasicModel
              key={nodeName}
              autoRotate={sceneData.autoRotate}
              autoRotateSpeed={sceneData.autoRotateSpeed * 0.5}
              fileData={sceneData.fileData}
              // groundMeshRef={groundMeshRef}
              materials={sceneData.materials}
              name={nodeName}
              onClick={handleClick}
              onMeshReady={meshReadyHandlers[index]}
              position={meshPositions[index]}
              rotation={sceneData.rotation}
              scale={meshScale * sceneData.scale}
            />
          );
        })}
      </Bvh>
      <AnimatedRig
        fallbackPositions={meshPositions}
        focusTarget={isFocused}
        onSwipe={onSwipe}
        targets={cameraTargets}
      />
    </>
  );
};

export default HomeScene;