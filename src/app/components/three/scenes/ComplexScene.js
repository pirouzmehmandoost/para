// 'use client';

// import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import * as THREE from 'three';
// import { useThree } from '@react-three/fiber';
// import { Bvh } from '@react-three/drei'
// import { EffectComposer, Outline } from '@react-three/postprocessing';
// import { BlendFunction, Resizer, KernelSize } from 'postprocessing'
// import useSelection from '@stores/selectionStore';
// import { portfolio } from '@configs/globals';
// import cameraConfigs from '@configs/cameraConfigs';
// import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';
// import AnimatedRig from '../cameras/AnimatedRig';
// import DynamicPositioningModel from '../models/DynamicPositioningModel';
// import Ground from '../models/Ground';
// import MaterialTextureInitializer from '../textures/MaterialTextureInitializer';

// THREE.Cache.enabled = true;
// THREE.ColorManagement.enabled = true;

// const { projects } = portfolio;

// const ComplexScene = () => {
//   const { SWIPE_DELAY_MS } = cameraConfigs;
//   const size = useThree((state) => state.size);
//   const set = useThree((state) => state.set);
//   const get = useThree((state) => state.get);

//   const setSelectionStore = useSelection((state) => state.setSelection);
//   const resetSelectionStore = useSelection((state) => state.reset);
//   const isFocused = useSelection((state) => state.selection.isFocused);
//   const setIsFocused = useSelection((state) => state.setIsFocused);
//   const setMaterialID = useSelection((state) => state.setMaterialID);

//   const lastSwipeTimeRef = useRef(0);
//   const [groundMeshRef, setGroundMeshRef] = useState(undefined);

//   const readyCount = useRef(0);
//   const [meshesReady, setMeshesReady] = useState(false);
//   const meshRefs = useRef(new Array(projects.length).fill(null));
//   const meshReadyFlags = useRef(new Array(projects.length).fill(false));
//   const totalMeshes = projects.length;
//   const cameraTargets = useMemo(() => meshesReady ? meshRefs.current : [], [meshesReady]);

//   const meshScale = Math.min(0.5, scaleMeshAtBreakpoint(size.width) * 0.5);

//   const meshPositions = useMemo(() => {
//     const fixedYPositions = [-8, 40, -105];

//     const ellipseRadius = scaleMeshAtBreakpoint(size.width) * 130;
//     const positions = [];
//     const vertex = new THREE.Vector3();
//     const ellipseCurve = new THREE.EllipseCurve(
//       0,
//       0,
//       ellipseRadius,
//       ellipseRadius,
//       0,
//       2 * Math.PI,
//       false,
//       0.5 * Math.PI
//     );
//     ellipseCurve.closed = true;

//     const curvePoints = ellipseCurve.getPoints(projects.length);
//     const ellipseCurvePoints = curvePoints.slice(1);
//     const positionAttribute = new THREE.BufferGeometry()
//       .setFromPoints(ellipseCurvePoints)
//       .getAttribute('position');

//     for (let i = 0; i < positionAttribute.count; i++) {
//       const pt = vertex.fromBufferAttribute(positionAttribute, i);
//       positions.push(new THREE.Vector3(pt.x, fixedYPositions[i], pt.y));
//     }

//     return positions;
//   }, [size.width]);

//   const meshReadyHandlers = useMemo(() =>
//     projects.map((_, i) => {
//       return (mesh) => {
//         if (!mesh || meshReadyFlags.current[i]) return;

//         meshRefs.current[i] = mesh;
//         meshReadyFlags.current[i] = true;
//         readyCount.current += 1;

//         if (readyCount.current === totalMeshes) setMeshesReady(true);
//       }
//     }
//     ), [totalMeshes]);

//   const handlePointerMissed = useCallback((e) => {
//     if (Date.now() - lastSwipeTimeRef.current < SWIPE_DELAY_MS) return;

//     startTransition(() => {
//       resetSelectionStore();
//       setIsFocused(null)
//     });
//   }, [resetSelectionStore, setIsFocused, SWIPE_DELAY_MS]);

//   const handleClick = useCallback((e) => {
//     e.stopPropagation();

//     const clickedName = e.object.name;
//     if (isFocused === clickedName) return;

//     const index = projects.findIndex(({ sceneData: { fileData: { nodeName = '' } = {} } = {} }) => nodeName === clickedName);
//     if (index < 0) return;

//     startTransition(() => {
//       setMaterialID(projects[index].sceneData.materials.defaultMaterialID);
//       setIsFocused(clickedName);
//     });
//   }, [isFocused, setIsFocused, setMaterialID, setSelectionStore]);

//   const onSwipe = useCallback((e) => {
//     lastSwipeTimeRef.current = Date.now();
//     startTransition(() => {
//       resetSelectionStore();
//       setIsFocused(null);
//     });
//   }, [resetSelectionStore, setIsFocused]);

//   const outlineSelection = useMemo(() => {
//     if (!isFocused) return undefined;
//     const focusedMesh = meshRefs.current.find((m) => m?.name === isFocused);
//     return focusedMesh ? [focusedMesh] : undefined;
//   }, [isFocused, meshesReady]);

//   useEffect(() => {
//     const prev = get().onPointerMissed;
//     set({ onPointerMissed: handlePointerMissed });
//     return () => set({ onPointerMissed: prev });
//   }, [set, get, handlePointerMissed]);

//   return (
//     <>
//       <MaterialTextureInitializer />
//       <directionalLight
//         castShadow={true}
//         color={'#fff6e8'}
//         intensity={2}
//         position={[0, 120, 75]}
//         shadow-bias={-0.004}
//         shadow-camera-fov={50}
//         shadow-camera-near={1}
//         shadow-camera-far={270}
//         shadow-camera-top={250}
//         shadow-camera-bottom={-250}
//         shadow-camera-left={-250}
//         shadow-camera-right={250}
//         shadow-mapSize={2048}
//       />
//       <EffectComposer autoClear={false} disableNormalPass multisampling={0}>
//         {/* <N8AO aoRadius={50} distanceFalloff={0.2} intensity={7} /> */}
//         {/* <Vignette eskil={false} offset={0.01} darkness={0.5} /> */}
//         <Outline
//           selection={outlineSelection}
//           blendFunction={BlendFunction.SCREEN}
//           patternTexture={null}
//           edgeStrength={5}
//           pulseSpeed={0.25}
//           visibleEdgeColor={0xffffff}
//           hiddenEdgeColor={0xffffff}
//           width={Resizer.AUTO_SIZE}
//           height={Resizer.AUTO_SIZE}
//           kernelSize={KernelSize.VERY_LARGE}
//           blur={true}
//           xRay={true}
//         />
//       </EffectComposer>
//       <Bvh firstHitOnly>
//         {projects.map(({ sceneData, sceneData: { fileData: { nodeName } = {} } = {} }, index) => {
//           return (
//             <DynamicPositioningModel
//               key={nodeName}
//               autoRotate={sceneData.autoRotate}
//               autoRotateSpeed={sceneData.autoRotateSpeed}
//               fileData={sceneData.fileData}
//               groundMeshRef={groundMeshRef}
//               materials={sceneData.materials}
//               name={nodeName}
//               onClick={handleClick}
//               onMeshReady={meshReadyHandlers[index]}
//               position={meshPositions[index]}
//               rotation={sceneData.rotation}
//               scale={sceneData.scale}
//             />
//           );
//         })}
//       </Bvh>
//       <Ground
//         rotation={[Math.PI / 6, Math.PI, 0]}
//         scale={meshScale * 1.25}
//         onGroundReady={setGroundMeshRef}
//       />
//       <AnimatedRig
//         fallbackPositions={meshPositions}
//         focusTarget={isFocused}
//         onSwipe={onSwipe}
//         targets={cameraTargets}
//       />
//     </>
//   );
// };

// export default ComplexScene;