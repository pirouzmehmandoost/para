// 'use client';

// import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// import { useFrame } from '@react-three/fiber';
// import { useGLTF } from '@react-three/drei';
// import useMaterial from '@stores/materialStore';
// import useSelection from '@stores/selectionStore';
// import { easing } from 'maath';

// THREE.Cache.enabled = true;
// THREE.ColorManagement.enabled = true;
// useGLTF.preload('/bag_v5_for_web-transformed.glb');
// useGLTF.preload('/yoga_mat_strap_for_web2.glb');
// useGLTF.preload('/bag_v3.5-transformed.glb');
// useGLTF.preload('/bag_9_BAT-transformed.glb');

// const Model = (props) => {
//   const {
//     autoRotate = true,
//     autoRotateSpeed = 0.5,
//     groundMeshRef,
//     materials: { defaultMaterialID = '' } = {},
//     materialID = '',
//     fileData: { nodeName = '', url = '' } = {},
//     onClick = undefined,
//     onMeshReady = () => { },
//     position = { x: 0, y: 0, z: 0 },
//     scale = 1,
//   } = props;

//   const mesh = useGLTF(url)?.nodes?.[nodeName] || null;
//   const meshRef = useRef(undefined);

//   const animateRotationRef = useRef(new THREE.Euler());
//   const animatePositionRef = useRef(new THREE.Vector3(0, 0, 0));

//   const hasPositionedRef = useRef(false);
//   const newPositionRef = useRef(new THREE.Vector3(position.x, position.y, position.z));
//   const [newPosition, setNewPosition] = useState(new THREE.Vector3(position.x, position.y, position.z));

//   const getMaterial = useMaterial((state) => state.getMaterial);
//   const matId = materialID?.length ? materialID : defaultMaterialID;
//   const material = getMaterial(matId)?.material;

//   const isFocused = useSelection((state) => state.selection.isFocused);

//   const groundRef = useRef(undefined);

//   const positionModelAboveGround = useCallback((groundObj) => {
//     if (!meshRef.current || !groundObj) return position.y;

//     meshRef.current.updateWorldMatrix(true, true);
//     groundObj.updateWorldMatrix(true, true);

//     const size = new THREE.Vector3();
//     const modelBoundingBox = new THREE.Box3().setFromObject(meshRef.current);
//     modelBoundingBox.getSize(size);
//     const bottomY = modelBoundingBox.min.y;
//     const centerX = (modelBoundingBox.min.x + modelBoundingBox.max.x) / 2;
//     const centerZ = (modelBoundingBox.min.z + modelBoundingBox.max.z) / 2;

//     // Circle with radius = half-diagonal of bounding box's bottom.
//     const circleRadius = Math.sqrt(Math.pow(size.x, 2) + Math.pow(size.z, 2)) / 2;
//     const numSamples = 10;
//     const samplePoints = [];

//     for (let i = 0; i < numSamples; i++) {
//       const angle = (i / numSamples) * Math.PI * 2;
//       const x = centerX + Math.cos(angle) * circleRadius;
//       const z = centerZ + Math.sin(angle) * circleRadius;
//       samplePoints.push(new THREE.Vector3(x, bottomY, z)); // Start at bottomY
//     }

//     samplePoints.push(new THREE.Vector3(centerX, bottomY, centerZ));

//     const raycaster = new THREE.Raycaster();
//     let highestGroundBelowModel = null; // ground below or at model level

//     samplePoints.forEach((point) => {
//       // Cast downward to find ground below
//       raycaster.set(point, new THREE.Vector3(0, -1, 0));
//       const downHits = raycaster.intersectObject(groundObj, true).filter(hit => hit.object !== meshRef.current);

//       if (downHits.length > 0) {
//         const groundY = downHits[0].point.y;
//         // Track the highest ground point found below the model
//         if (highestGroundBelowModel === null || groundY > highestGroundBelowModel) {
//           highestGroundBelowModel = groundY;
//         };
//       };

//       // Cast upward to detect if model intersects with ground
//       raycaster.set(point, new THREE.Vector3(0, 1, 0));
//       const upHits = raycaster.intersectObject(groundObj, true).filter(hit => hit.object !== meshRef.current);

//       if (upHits.length > 0) {
//         const groundY = upHits[0].point.y;
//         const distance = upHits[0].distance;
//         const penetrationThreshold = size.y * 2; // Within 2x model height = penetration

//         if (distance < penetrationThreshold) {
//           if (highestGroundBelowModel === null || groundY > highestGroundBelowModel) {
//             highestGroundBelowModel = groundY; // repurposing variable for the time bieng 
//           };
//         };
//       }
//     });

//     if (highestGroundBelowModel === null) {
//       return position.y;
//     };

//     const clearance = highestGroundBelowModel + Math.max(1, Math.abs(size.y * 0.01));
//     return clearance - bottomY;
//   }, [position.y]);

//   useLayoutEffect(() => {
//     if (groundMeshRef?.isObject3D) groundRef.current = groundMeshRef;

//     if (!meshRef.current || !groundRef.current || hasPositionedRef.current) return;

//     const adjustment = positionModelAboveGround(groundRef.current);

//     newPositionRef.current.set(position.x, adjustment, position.z);
//     setNewPosition(new THREE.Vector3(position.x, adjustment, position.z));

//     hasPositionedRef.current = true;
//   }, [groundMeshRef, positionModelAboveGround, setNewPosition]);

//   useEffect(() => {
//     if (hasPositionedRef.current && meshRef.current) {
//       meshRef.current.updateWorldMatrix(true, true);
//       onMeshReady(meshRef.current);
//     }
//   }, [newPosition, onMeshReady]);

//   useFrame(({ clock }, delta) => {
//     const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
//     const elapsedTime = clock.elapsedTime;
//     const sine = Math.sin(elapsedTime) / 2;

//     if (meshRef?.current && nodeName?.length) {
//       meshRef.current.updateWorldMatrix();

//       if (autoRotate) {
//         if (isFocused?.length && isFocused === nodeName) {
//           animatePositionRef.current.set(meshRef.current.position.x + sine, meshRef.current.position.y + sine, meshRef.current.position.z + sine);
//           animateRotationRef.current.set(0, 0, 0);
//           easing.damp3(meshRef.current.position, animatePositionRef.current, 1, clampedDelta);
//           easing.dampE(meshRef.current.rotation, animateRotationRef.current, 1.5, clampedDelta);
//         }
//         else {
//           animatePositionRef.current.set(...meshRef.current.position);
//           animateRotationRef.current.set(0, meshRef.current.rotation.y, 0);
//           meshRef.current.rotation.y += delta * autoRotateSpeed;
//         }
//       }
//     }
//   });

//   return (
//     <>
//       {mesh && (
//         <mesh
//           ref={meshRef}
//           castShadow={true}
//           geometry={mesh?.geometry}
//           material={material}
//           name={nodeName}
//           onClick={onClick}
//           position={[newPosition.x, newPosition.y, newPosition.z]}
//           receiveShadow={true}
//           scale={scale}
//         />
//       )}
//     </>
//   );
// };

// export default Model;


// // const OldModel = (props) => {
// //   const {
// //     autoRotate = true,
// //     autoRotateSpeed = 0.5,
// //     groundMeshRef,
// //     materialId = '',
// //     fileData: { nodeName = '', url = '' } = {},
// //     onClick = undefined,
// //     onMeshReady = () => { },
// //     position = { x: 0, y: 0, z: 0 },
// //     scale = 1,
// //   } = props;

// //   const mesh = url ? useGLTF(url).nodes?.[nodeName] : null;
// //   // const vertexCount = mesh.geometry.attributes.position.count;
// //   const meshRef = useRef(undefined);
// //   const hasPositionedRef = useRef(false);
// //   const getMaterial = useMaterial((state) => state.getMaterial);
// //   // const materialRef = useRef(useMaterial.getState().materials[`${materialId}`]?.material); 
// //   // const materialRef = useRef(getMaterial(materialId)?.material);
// //   const material = getMaterial(materialId)?.material;

// //   const [newPosition, setNewPosition] = useState(position.y);

// //   const positionModelAboveGround = useCallback((groundMeshRef) => {
// //     if (!meshRef.current || !groundMeshRef) return null;

// //     meshRef.current.updateWorldMatrix(true, true);
// //     groundMeshRef.updateWorldMatrix(true, true);

// //     const size = new THREE.Vector3();
// //     const modelBoundingBox = new THREE.Box3().setFromObject(meshRef.current);
// //     modelBoundingBox.getSize(size);
// //     const bottomY = modelBoundingBox.min.y;
// //     const centerX = (modelBoundingBox.min.x + modelBoundingBox.max.x) / 2;
// //     const centerZ = (modelBoundingBox.min.z + modelBoundingBox.max.z) / 2;

// //     // Circle with radius = half-diagonal of bounding box's bottom.
// //     const circleRadius = Math.sqrt(Math.pow(size.x, 2) + Math.pow(size.z, 2)) / 2;
// //     const numSamples = 10;
// //     const samplePoints = [];

// //     for (let i = 0; i < numSamples; i++) {
// //       const angle = (i / numSamples) * Math.PI * 2;
// //       const x = centerX + Math.cos(angle) * circleRadius;
// //       const z = centerZ + Math.sin(angle) * circleRadius;
// //       samplePoints.push(new THREE.Vector3(x, bottomY, z)); // Start at bottomY
// //     }

// //     samplePoints.push(new THREE.Vector3(centerX, bottomY, centerZ));

// //     const raycaster = new THREE.Raycaster();
// //     let highestGroundBelowModel = null; // ground below or at model level

// //     samplePoints.forEach((point) => {
// //       // Cast downward to find ground below
// //       raycaster.set(point, new THREE.Vector3(0, -1, 0));
// //       const downHits = raycaster.intersectObject(groundMeshRef, true).filter(hit => hit.object !== meshRef.current);

// //       if (downHits.length > 0) {
// //         const groundY = downHits[0].point.y;
// //         // Track the highest ground point found below the model
// //         if (highestGroundBelowModel === null || groundY > highestGroundBelowModel) {
// //           highestGroundBelowModel = groundY;
// //         };
// //       };

// //       // Cast upward to detect if model intersects with ground
// //       raycaster.set(point, new THREE.Vector3(0, 1, 0));
// //       const upHits = raycaster.intersectObject(groundMeshRef, true).filter(hit => hit.object !== meshRef.current);

// //       if (upHits.length > 0) {
// //         const groundY = upHits[0].point.y;
// //         const distance = upHits[0].distance;
// //         const penetrationThreshold = size.y * 2; // Within 2x model height = penetration

// //         if (distance < penetrationThreshold) {
// //           if (highestGroundBelowModel === null || groundY > highestGroundBelowModel) {
// //             highestGroundBelowModel = groundY;
// //           };
// //         };
// //       }
// //     });

// //     if (highestGroundBelowModel === null) {
// //       return position.y;
// //     };

// //     const clearance = highestGroundBelowModel + Math.max(1, Math.abs(size.y * 0.01));
// //     return clearance - bottomY;
// //   }, [position.y]);

// //   useLayoutEffect(() => {
// //     if (hasPositionedRef.current || !groundMeshRef || !meshRef.current) return;

// //     const adjustment = positionModelAboveGround(groundMeshRef);
// //     hasPositionedRef.current = true;
// //     setNewPosition(adjustment ?? position.y);
// //   }, [groundMeshRef, positionModelAboveGround, position.y]);

// //   useEffect(() => {
// //     if (hasPositionedRef.current && meshRef.current) {
// //       meshRef.current.updateWorldMatrix(true, true);
// //       onMeshReady(meshRef.current);
// //     }
// //   }, [newPosition, onMeshReady]);

// //   useFrame(({ clock }, delta) => {
// //     // const blendPercentage = Math.abs(Math.sin(clock.elapsedTime/2)) % 1
// //     // console.log(blendPercentage)
// //     if (meshRef?.current) {
// //       if (autoRotate) meshRef.current.rotation.y += delta * autoRotateSpeed;
// //     }
// //   });

// //   if (!mesh) return null;

// //   return (
// //     <>
// //       {mesh && (
// //         <mesh
// //           ref={meshRef}
// //           castShadow={true}
// //           geometry={mesh?.geometry}
// //           material={material}
// //           name={nodeName}
// //           onClick={onClick}
// //           position={[position.x, newPosition, position.z]}
// //           receiveShadow={true}
// //           scale={scale}
// //         />
// //       )}
// //     </>
// //   );
// // };