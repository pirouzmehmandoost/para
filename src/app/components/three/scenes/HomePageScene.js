'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Bvh } from '@react-three/drei'
import useSelection from '@stores/selectionStore';
import { portfolio } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';
import AnimatedRig from '../cameras/AnimatedRig';
import BasicModel from '../models/BasicModel';
import Ground from '../models/Ground';
import MaterialTextureInitializer from '../textures/MaterialTextureInitializer';
import { EffectComposer, N8AO, SelectiveBloom } from '@react-three/postprocessing';
import { BlurPass, BlendFunction, Resizer, KernelSize } from 'postprocessing'

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;

const { projects } = portfolio;
const homePageModel = projects[0];
const { 
  sceneData, 
  sceneData: {
    fileData: {
      nodeName,
    } = {},
  } = {},
} = homePageModel;

const HomePageScene = () => {
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
  const [meshReady, setMeshReady] = useState(false);
  const meshRef = useRef(null);
  const meshReadyFlag = useRef(false);
  const cameraTargets = useMemo(() => meshReady ? meshRef.current : null, [meshReady]);
  const totalMeshes = 1;

  const meshScale = Math.min(0.5, scaleMeshAtBreakpoint(size.width) * 0.5);

  const blurPassRef = useRef(new BlurPass());
  const lightRef = useRef(undefined);
  const planeRef = useRef(undefined);

  const meshPosition = new THREE.Vector3(0,0,0);

  const meshReadyHandlers = useMemo(() => {
    if (meshReadyFlag.current) return;
    return (mesh) => {
        meshRef.current = mesh;
        meshReadyFlag.current = true;
        readyCount.current += 1;
      if (readyCount.current === totalMeshes) setMeshReady(true);
    }
  }, []);

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
        ref={lightRef}
        castShadow={true}
        color={'#fff6e8'}
        intensity={0.5}
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
        <SelectiveBloom
          lights={lightRef}
          selection={planeRef} 
          selectionLayer={1}
          intensity={0.5}
          blurPass={blurPassRef.current} 
          width={Resizer.AUTO_SIZE}
          height={Resizer.AUTO_SIZE} 
          kernelSize={KernelSize.LARGE} 
          luminanceThreshold={0.5} // luminance threshold. Raise this value to mask out darker elements in the scene.
          luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
        />
      </EffectComposer>
       <Bvh firstHitOnly>
        <BasicModel
          key={nodeName}
          autoRotate={sceneData.autoRotate}
          autoRotateSpeed={sceneData.autoRotateSpeed}
          fileData={sceneData.fileData}
          materials={sceneData.materials}
          name={nodeName}
          onClick={handleClick}
          onMeshReady={meshReadyHandlers}
          position={meshPosition}
          rotation={sceneData.rotation}
          scale={sceneData.scale}
        />
      </Bvh>
      <mesh ref={planeRef} position={[0, 60 , -70]} rotation={[0, 0, 0]} scale={[70,70,70] }>
        <planeGeometry width={10} height={10} />
        <meshPhysicalMaterial color='white' side={THREE.DoubleSide} emissive = 'white' emissiveIntensity={5}/>
      </mesh>
      <AnimatedRig fallbackPositions={[0,200,0]} />
      <Ground rotation={[Math.PI/5, 0, 0]} scale={ [meshScale, meshScale * 1.4, meshScale]}  position={[0,-70, 0]}/>
    </>
  );
};

export default HomePageScene;