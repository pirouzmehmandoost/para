'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, N8AO, Vignette } from '@react-three/postprocessing';
import { projects } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import useSelection from '@stores/selectionStore';
import MaterialTextureInitializer from '../textures/MaterialTextureInitializer';
import SceneRigV3 from '../cameras/SceneRigV3';
import Model from '../models/Model';
import Ground from '../models/Ground';

const { SWIPE_DELAY_MS, OFFSET_CAMERA_POSITION, INITIAL_CAMERA_POSITION } = cameraConfigs;
const meshPositions = [
  new THREE.Vector3(-100, -18, -40),
  new THREE.Vector3(100, -10, -40),
  new THREE.Vector3(0, -105, 40)
];
const defaultCameraPosition = new THREE.Vector3(OFFSET_CAMERA_POSITION[0], OFFSET_CAMERA_POSITION[1], OFFSET_CAMERA_POSITION[2]);
const lookAtPosition = new THREE.Vector3(INITIAL_CAMERA_POSITION[0], INITIAL_CAMERA_POSITION[1], -1 * INITIAL_CAMERA_POSITION[2]);

const SceneComposer = () => {

  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);

  const resetSelectionStore = useSelection((state) => state.reset);
  const setFocusAndMaterial = useSelection((state) => state.setFocusAndMaterial);

  const lastSwipeTimeRef = useRef(0);

  const targetKeys = useMemo(() =>
    new Set(
      projects
        .map((p) => `${p.sceneData?.fileData?.nodeName}`)
        .filter((key) => key !== 'undefined')
    ),
    [],
  );

  const targetFilter = useMemo(() => (obj) => targetKeys.has(obj.name), [targetKeys]);

  const handlePointerMissed = useCallback((e) => {
    if (Date.now() - lastSwipeTimeRef.current < SWIPE_DELAY_MS) return;

    startTransition(() => {
      resetSelectionStore();
    });
  }, [resetSelectionStore]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    const clickedKey = e.object.name || null;
    if (!clickedKey) return;

    if (useSelection.getState().selection.focusedName === clickedKey) return;

    const index = projects.findIndex(({ sceneData: { fileData: { nodeName = '' } = {} } = {} }) => nodeName === clickedKey);
    if (index < 0) return;

    startTransition(() => {
      setFocusAndMaterial(clickedKey, projects[index].sceneData.materials.defaultMaterialID);
    });
  }, [setFocusAndMaterial]);

  const onSwipe = useCallback((e) => {
    lastSwipeTimeRef.current = Date.now();
    startTransition(() => {
      resetSelectionStore();
    });
  }, [resetSelectionStore]);

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
        shadow-mapSize={2048}
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
      {projects.map(({
        sceneData = {},
        sceneData: {
          fileData: {
            nodeName
          } = {}
        } = {}
      }, index) => {
        return (
          <Model
            key={nodeName}
            fileData={sceneData.fileData}
            materials={sceneData.materials}
            onClick={handleClick}
            position={meshPositions[index]}
            rotation={sceneData.rotation}
            rotationSpeed={sceneData.rotationSpeed}
            scale={sceneData.scale}
          />
        );
      })}
      <Ground
        position={[0, -90, -15]}
        rotation={[Math.PI / 4.5, Math.PI / 2, 0]}
        scale={[0.7, 0.7, 0.7]}
      />
      <SceneRigV3
        onSwipe={onSwipe}
        targets={targetFilter}
        defaultPosition={defaultCameraPosition}
        lookAtPosition={lookAtPosition}
      />
    </>
  );
};

export default SceneComposer;