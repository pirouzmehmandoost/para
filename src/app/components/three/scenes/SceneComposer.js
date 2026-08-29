'use client';

import { startTransition, useCallback, useLayoutEffect, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
// import { EffectComposer, N8AO } from '@react-three/postprocessing';
import carouselConfigs from '@configs/carouselConfigs';
import groundConfigs  from '@configs/groundConfigs'
import useProjectStore from '@stores/projectStore';
import useSelection from '@stores/selectionStore';
import useTargetRegistry from '@stores/targetRegistryStore';
import Carousel from '../cameras/rigs/Carousel';
import Model from '../models/Model';
import Ground from '../models/Ground';

const { SWIPE_DELAY_MS } = carouselConfigs;

const meshPositions = [
  new THREE.Vector3(-100, -18, -40),
  new THREE.Vector3(100, -10, -40),
  new THREE.Vector3(0, -105, 40)
];
const offsetCameraPosition = new THREE.Vector3(0, 0, 200);
const lookAtPosition = new THREE.Vector3(0, 0, -1);

const SceneComposer = () => {
  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);
  const scene = useThree((state) => state.scene);

  const projects = useProjectStore((state) => state.projects);
  const setFocused = useSelection((state) => state.setFocused);
  const lastSwipeTimeRef = useRef(0);

  const targetKeys = useMemo(() =>
    new Set(
      projects
        .map((p) => `${p.sceneData?.fileData?.nodeName}`)
        .filter((key) => key !== 'undefined')
    ),
    [projects],
  );

  const targetFilter = useMemo(() => (obj) => targetKeys.has(obj.name), [targetKeys]);

  const handlePointerMissed = useCallback((e) => {
    startTransition(() => { useSelection.getState().reset() });
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (Date.now() - lastSwipeTimeRef.current < SWIPE_DELAY_MS) return;

    const clickedName = e.object.name || null; // e.object.name is the nodeName
    const clickedUUID = e.object.uuid || null;
    if (!clickedName || !clickedUUID || useSelection.getState().selection.focusedUUID === clickedUUID) return;

    const project = useProjectStore.getState().getProjectByNodeName(clickedName);
    if (!project) return;

    startTransition(() => {
      setFocused(clickedName, project.sceneData.materials.defaultMaterialID, clickedUUID)
    });
  }, [setFocused]);

  const onSwipe = useCallback((e) => {
    lastSwipeTimeRef.current = Date.now();
    startTransition(() => { useSelection.getState().reset() });
  }, []);

  useLayoutEffect(() => {
    useTargetRegistry.getState().initialize(scene, targetFilter);
    return () => useTargetRegistry.getState().reset();
  }, [scene, targetFilter]);

  useEffect(() => {
    const prev = get().onPointerMissed;
    set({ onPointerMissed: handlePointerMissed });

    return () => set({ onPointerMissed: prev });
  }, [set, get, handlePointerMissed]);

  return (
    <>
      <directionalLight
        castShadow={true}
        color={'#fff6e8'}
        intensity={1}
        position={[0, 120, 80]}
      />
      {/* <EffectComposer
        autoClear={false}
        disableNormalPass
        multisampling={0}
      >
        <N8AO
          aoRadius={15}
          distanceFalloff={1}
          intensity={1}
          screenSpaceRadius
          halfRes
        />
      </EffectComposer> */}

      {projects.map(({
        UIData: { slug } = {},
        sceneData: { fileData, materials, rotation, rotationSpeed, scale } = {},
      }, index) => {
        return (
          <Model
            key={slug}
            fileData={fileData}
            materials={materials}
            onClick={handleClick}
            position={meshPositions[index]}
            rotation={rotation}
            rotationSpeed={rotationSpeed}
            scale={scale}
          />
        )
      })}
      <Ground {...groundConfigs.groundProps}/>
      <Carousel
        lookAtPosition={lookAtPosition}
        offsetPosition={offsetCameraPosition}
        onSwipe={onSwipe}
        autoDwellTime={12} 
        manualDwellTime={15} 
        swipeDistanceThreshold={0.2}
        swipeTimeThreshold={600}
      />
    </>
  );
};

export default SceneComposer;