'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Bvh, } from '@react-three/drei'
import { EffectComposer, N8AO } from '@react-three/postprocessing';
// import { BlurPass, BlendFunction, Resizer, KernelSize } from 'postprocessing'
import { portfolio } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';
import useSelection from '@stores/selectionStore';
import MaterialTextureInitializer from '../textures/MaterialTextureInitializer';
import AnimatedRig from '../cameras/AnimatedRig';
import BasicModel from '../models/BasicModel';
import Ground from '../models/Ground';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;

const { projects } = portfolio;

const BasicScene = () => {
  const { SWIPE_DELAY_MS } = cameraConfigs;
  const size = useThree((state) => state.size);
  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);
  const setSelectionStore = useSelection((state) => state.setSelection);
  const isFocused = useSelection((state) => state.selection.isFocused);
  const setIsFocused = useSelection((state) => state.setIsFocused);
  const setMaterialID = useSelection((state) => state.setMaterialID);
  const resetSelectionStore = useSelection((state) => state.reset);
  const lastSwipeTimeRef = useRef(0);
  const readyCount = useRef(0);
  const [meshesReady, setMeshesReady] = useState(false);
  const meshRefs = useRef(new Array(projects.length).fill(null));
  const meshReadyFlags = useRef(new Array(projects.length).fill(false));
  const totalMeshes = projects.length;
  const cameraTargets = useMemo(() => meshesReady ? meshRefs.current : [], [meshesReady]);
  // const planeRef = useRef(null);
  // const lightRef = useRef(null);
  // const blurPassRef = useRef(new BlurPass());

  const groundScale = Math.min(0.5, scaleMeshAtBreakpoint(size.width) * 0.5);

  const meshPositions = useMemo(() => {
    const finalPositions = [];
    const fixedYPositions = [-8, 30, -100];
    const ellipseRadius = scaleMeshAtBreakpoint(size.width) * 95;
    const vertex = new THREE.Vector3();
    const ellipseCurve = new THREE.EllipseCurve(0, 0, ellipseRadius, ellipseRadius, 0, 2 * Math.PI, false, 0.5 * Math.PI);
    ellipseCurve.closed = true;

    const curvePoints = ellipseCurve.getPoints(projects.length);
    const ellipseCurvePoints = curvePoints.slice(1);
    const positionAttribute = new THREE.BufferGeometry()
      .setFromPoints(ellipseCurvePoints)
      .getAttribute('position');

    for (let i = 0; i < positionAttribute.count; i++) {
      const xzPosition = vertex.fromBufferAttribute(positionAttribute, i);
      finalPositions.push(new THREE.Vector3(xzPosition.x, fixedYPositions[i], xzPosition.y));
    }

    return finalPositions;
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

  useEffect(() => {
    const prev = get().onPointerMissed;
    set({ onPointerMissed: handlePointerMissed });

    return () => set({ onPointerMissed: prev });
  }, [set, get, handlePointerMissed]);

  return (
    <>
      <MaterialTextureInitializer />
      <directionalLight
        castShadow={true}
        color={'#fff6e8'}
        intensity={2}
        position={[0, 120, 75]}
        shadow-bias={-0.004}
        shadow-camera-fov={50}
        shadow-camera-near={1}
        shadow-camera-far={270}
        shadow-camera-top={250}
        shadow-camera-bottom={-250}
        shadow-camera-left={-250}
        shadow-camera-right={250}
        shadow-mapSize={2048}
      />
      <EffectComposer autoClear={false} disableNormalPass multisampling={0}>
        <N8AO aoRadius={50} distanceFalloff={0.3} intensity={7} />
        {/* <Vignette eskil={false} offset={0.01} darkness={0.7} /> */}
        {/* <SelectiveBloom
          blurPass={blurPassRef.current} 
          height={Resizer.AUTO_SIZE} 
          intensity={0.1}
          kernelSize={KernelSize.LARGE} 
          lights={lightRef}
          luminanceSmoothing={0.5} // smoothness of the luminance threshold. Range is [0, 1]
          luminanceThreshold={0.025} // luminance threshold. Raise this value to mask out darker elements in the scene.
          selection={planeRef} 
          selectionLayer={4}
          width={Resizer.AUTO_SIZE}
        /> */}
      </EffectComposer>
      <Bvh firstHitOnly>
        {projects.map(({ sceneData, sceneData: { fileData: { nodeName } = {} } = {} }, index) => {
          return (
            <BasicModel
              key={nodeName}
              autoRotate={sceneData.autoRotate}
              autoRotateSpeed={sceneData.autoRotateSpeed}
              fileData={sceneData.fileData}
              materials={sceneData.materials}
              name={nodeName}
              onClick={handleClick}
              onMeshReady={meshReadyHandlers[index]}
              position={meshPositions[index]}
              rotation={sceneData.rotation}
              scale={sceneData.scale}
            />
          );
        })}
      </Bvh>
      {/* <mesh
        ref={planeRef}
        position={[78, 25, -120]}
        scale={[25, 25, 25]}
      >
        <planeGeometry />
        <meshPhysicalMaterial
          color='white'
          emissive='white'
          emissiveIntensity={5}
          side={THREE.DoubleSide}
        />
      </mesh> */}
      <Ground
        rotation={[Math.PI / 6, Math.PI, 0]}
        scale={[groundScale * 1.3, groundScale, groundScale * 0.9]}
      />
      <AnimatedRig
        fallbackPositions={meshPositions}
        focusTarget={isFocused}
        onSwipe={onSwipe}
        targets={cameraTargets}
      />
    </>
  );
};

export default BasicScene;