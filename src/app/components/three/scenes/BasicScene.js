'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Bvh, } from '@react-three/drei'
import { EffectComposer, N8AO, Vignette } from '@react-three/postprocessing';
import { portfolio } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import useSelection from '@stores/selectionStore';
import MaterialTextureInitializer from '../textures/MaterialTextureInitializer';
import AnimatedRig from '../cameras/AnimatedRig';
import BasicModelTest from '../models/BasicModelTest';
import Ground from '../models/Ground';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;

const BasicScene = () => {
  const { SWIPE_DELAY_MS } = cameraConfigs;
  const { projects } = portfolio;
  const totalMeshes = projects.length;

  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);

  const setSelectionStore = useSelection((state) => state.setSelection);
  const isFocused = useSelection((state) => state.selection.isFocused);
  const setIsFocused = useSelection((state) => state.setIsFocused);
  const setMaterialID = useSelection((state) => state.setMaterialID);
  const resetSelectionStore = useSelection((state) => state.reset);

  const [meshesReady, setMeshesReady] = useState(false);

  const lastSwipeTimeRef = useRef(0);
  const meshesReadyCount = useRef(0);
  const meshRefs = useRef(new Array(projects.length).fill(null));
  const meshReadyFlags = useRef(new Array(projects.length).fill(false));
  const meshPositions = useRef([
    new THREE.Vector3(-100, -15, -40),
    new THREE.Vector3(100, 0, -40),
    new THREE.Vector3(0, -105, 40)
  ]);

  const cameraTargets = useMemo(() => meshesReady ? meshRefs.current : [], [meshesReady]);

  const meshReadyHandlers = useMemo(() =>
    projects.map((_, i) => {
      return (mesh) => {
        if (!mesh || meshReadyFlags.current[i]) return;

        meshRefs.current[i] = mesh;
        meshReadyFlags.current[i] = true;
        meshesReadyCount.current += 1;
        if (meshesReadyCount.current === totalMeshes) setMeshesReady(true);
      }
    }), [totalMeshes]);

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
        position={[0, 120, 80]}
        shadow-bias={-0.004}
        shadow-camera-fov={50}
        shadow-camera-near={1}
        shadow-camera-far={270}
        shadow-camera-top={250}
        shadow-camera-bottom={-250}
        shadow-camera-left={-250}
        shadow-camera-right={250}
        shadow-mapSize={4096}
      />
      <EffectComposer
        autoClear={false}
        disableNormalPass
        multisampling={0}
      >
        <N8AO
          aoRadius={50}
          distanceFalloff={0.3}
          intensity={0.5}
          screenSpaceRadius
          halfRes
        />
        <Vignette
          eskil={false}
          offset={0.01}
          darkness={0.75}
        />
      </EffectComposer>
      <Bvh firstHitOnly>
        {projects.map(({ sceneData, sceneData: { fileData: { nodeName } = {} } = {} }, index) => {
          return (
            <BasicModelTest
              key={nodeName}
              autoRotate={sceneData.autoRotate}
              autoRotateSpeed={sceneData.autoRotateSpeed}
              fileData={sceneData.fileData}
              materials={sceneData.materials}
              name={nodeName}
              onClick={handleClick}
              onMeshReady={meshReadyHandlers[index]}
              position={meshPositions.current[index]}
              rotation={sceneData.rotation}
              scale={sceneData.scale / totalMeshes}
            />
          );
        })}
      </Bvh>
      <Ground
        position={[0, -90, -15]}
        rotation={[Math.PI / 4.5, Math.PI, 0]}
        scale={[0.7, 0.7, 0.7]}
      />
      <AnimatedRig
        fallbackPositions={meshPositions.current}
        focusTarget={isFocused}
        onSwipe={onSwipe}
        targets={cameraTargets}
      />
    </>
  );
};

export default BasicScene;