'use client';

import { startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Bvh, Cloud, Clouds, useTexture } from '@react-three/drei'
// import { EffectComposer, N8AO } from '@react-three/postprocessing';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import { portfolio } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';
import AnimatedRig from '../cameras/AnimatedRig';
import BasicModel from '../models/BasicModel';
import Ground from '../models/Ground';
// import AnimatedLight from '../lights/AnimatedLight';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;

const { projects } = portfolio;

/*
  The old model and cloud positions:
    gerd:              x: -130,  y: 42,   z: -75
    bag_v3_for_web001: x: 130,   y: 2,    z: -75
    Yoga_Mat_Strap:    x: 4.6,   y: -85,  z: 150
    cloud 0:           x: -120,  y: -8,   z: 15
    cloud 1:           x: 140,   y:-48,   z: 15
    cloud 2:           x: 10,    y: -155, z: 240
*/
// const CloudGroup = (props) => {
//   const { positions: [p1, p2] = [] } = props;
//   const size = useThree((state) => state.size);
//   const scale = Math.min(1.5, scaleMeshAtBreakpoint(size.width) * 1.5);

//   return (
//     <Clouds material={THREE.MeshPhysicalMaterial} limit={4}>
//       <Cloud
//         color={'black'}
//         concentrate={'inside'}
//         growth={200}
//         opacity={0.6}
//         position={[10, p1.y + 10, p1.z - 66]}
//         seed={0.4}
//         segments={2}
//         speed={0.2}
//         volume={20}
//         scale={scale}
//         fade={5}
//       />
//       <Cloud
//         color={'black'}
//         concentrate={'random'}
//         growth={100}
//         opacity={0.15}
//         position={[0, p2.y - 50, p2.z - 20]}
//         seed={0.4}
//         segments={2}
//         speed={0.2}
//         volume={300}
//         scale={scale}
//         fade={5}
//       />
//     </Clouds>
//   );
// };

const HomeScene = () => {
  const { SWIPE_DELAY_MS } = cameraConfigs;
  const size = useThree((state) => state.size);
  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);
  const setTextures = useMaterial((state) => state.setTextures);
  const materials = useMaterial((state) => state.materials);

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
  const cameraTargets = useMemo(() => meshesReady ? meshRefs.current : [], [meshesReady]);

  const meshScale = Math.min(0.5, scaleMeshAtBreakpoint(size.width) * 0.5);

  let temp = {};
  const temp2 = {};
    for (const materialID in materials) {
      const textureUrls = materials[materialID]?.textures;
      if (textureUrls) {
        temp = { ...temp, ...materials[materialID].textures };
        temp2[materialID] = {}
      }
    }

  const textures = useTexture(temp);

  for (const texture in textures) {
    textures[texture].flipY = false;
    textures[texture].name = texture;
    if (texture.toLowerCase().includes('color')) textures[texture].colorSpace = THREE.SRGBColorSpace;

    const matchingMaterialKey = Object.keys(temp2).find(key => textures[texture].name.includes(key));
    let key = texture.replace(matchingMaterialKey+'_', '')
    if (key.includes('color_')) key = key.replace('color_', '');
    temp2[matchingMaterialKey][key] = textures[texture]
  }

  // Model mesh positioning
  const meshPositions = useMemo(() => {
    // const fixedYPositions = [44, -8, -85];
    const fixedYPositions = [-12, 44, -85];

    const ellipseRadius = scaleMeshAtBreakpoint(size.width) * 130;
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
      0.5 * Math.PI
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
      // setSelectionStore({ ...projects[index] }); //temporarily test setting selection from the selection display modal. 
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

  useLayoutEffect(() => { setTextures(temp2) }, [textures]);

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
        intensity={2}
        position={[0, 120, 75]}
        shadow-bias={-0.004}
        shadow-camera-fov={50}
        shadow-camera-near={1}
        shadow-camera-far={4096}
        shadow-camera-top={4096}
        shadow-camera-bottom={-4096}
        shadow-camera-left={-4096}
        shadow-camera-right={4096}
        shadow-mapSize={4096}
      />

      {/* <CloudGroup positions={[meshPositions[0], meshPositions[2]]} /> */}
      {/* <EffectComposer autoClear={false} disableNormalPass multisampling={0}> */}
      {/* <N8AO aoRadius={50} distanceFalloff={0.2} intensity={7} /> */}
      {/* <Vignette eskil={false} offset={0.01} darkness={0.5} /> */}
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
      {/* </EffectComposer> */}
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
      <Ground
        rotation={[Math.PI / 6, Math.PI, 0]}
        scale={meshScale * 1.25}
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

export default HomeScene;