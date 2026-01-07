'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import { easing } from 'maath';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;
useGLTF.preload('/bag_v5_for_web-transformed.glb');
useGLTF.preload('/yoga_mat_strap_for_web2.glb');
useGLTF.preload('/bag_v3.5-transformed.glb');
useGLTF.preload('/bag_9_BAT-transformed.glb');

const Model = (props) => {
  const {
    autoRotate = true,
    autoRotateSpeed = 0.5,
    groundMeshRef,
    materials: { defaultMaterial = '' } = {},
    materialId = '',
    fileData: { nodeName = '', url = '' } = {},
    onClick = undefined,
    onMeshReady = () => { },
    position = { x: 0, y: 0, z: 0 },
    scale = 1,
  } = props;

  const mesh = url ? useGLTF(url).nodes?.[nodeName] : null;
  // const vertexCount = mesh.geometry.attributes.position.count;
  const meshRef = useRef(undefined);
  const animateRotationRef = useRef(new THREE.Euler());
  const animatePositionRef = useRef(new THREE.Vector3(0,0,0));
  const hasPositionedRef = useRef(false);
  const getMaterial = useMaterial((state) => state.getMaterial);
  const matId = materialId?.length? materialId : defaultMaterial;
  const material = getMaterial(matId)?.material;
  const isFocused = useSelection((state) => state.selection.isFocused);
  // const previousGround = useRef(groundMeshRef);
  const [newYPosition, setNewYPosition] = useState(position.y);

  // console.log(`%cModel.js. groundMeshRef: ${groundMeshRef?.name}`, "color: orange;");

  const positionModelAboveGround = useCallback((groundMeshRef) => {
    // console.log(`%c${"\n"}positionModelAboveGround() called.${"\n"}groundMeshRef: ${groundMeshRef?.name}`,"color: red; font-weight: bold");

    // if (!meshRef.current || !groundMeshRef) return null;     // original line: 
    if (!meshRef.current) {
      // console.log("%cNo mesh, returning null", "color: red;")
      return null;
    }

    if (!groundMeshRef) {
      // console.log("%cReturning position.y", "color: red;")
      return position.y;
    }

    meshRef.current.updateWorldMatrix(true, true);
    groundMeshRef.updateWorldMatrix(true, true);

    const size = new THREE.Vector3();
    const modelBoundingBox = new THREE.Box3().setFromObject(meshRef.current);
    modelBoundingBox.getSize(size);
    const bottomY = modelBoundingBox.min.y;
    const centerX = (modelBoundingBox.min.x + modelBoundingBox.max.x) / 2;
    const centerZ = (modelBoundingBox.min.z + modelBoundingBox.max.z) / 2;

    // Circle with radius = half-diagonal of bounding box's bottom.
    const circleRadius = Math.sqrt(Math.pow(size.x, 2) + Math.pow(size.z, 2)) / 2;
    const numSamples = 10;
    const samplePoints = [];

    for (let i = 0; i < numSamples; i++) {
      const angle = (i / numSamples) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * circleRadius;
      const z = centerZ + Math.sin(angle) * circleRadius;
      samplePoints.push(new THREE.Vector3(x, bottomY, z)); // Start at bottomY
    }

    samplePoints.push(new THREE.Vector3(centerX, bottomY, centerZ));

    const raycaster = new THREE.Raycaster();
    let highestGroundBelowModel = null; // ground below or at model level

    samplePoints.forEach((point) => {
      // Cast downward to find ground below
      raycaster.set(point, new THREE.Vector3(0, -1, 0));
      const downHits = raycaster.intersectObject(groundMeshRef, true).filter(hit => hit.object !== meshRef.current);

      if (downHits.length > 0) {
        const groundY = downHits[0].point.y;
        // Track the highest ground point found below the model
        if (highestGroundBelowModel === null || groundY > highestGroundBelowModel) {
          highestGroundBelowModel = groundY;
        };
      };

      // Cast upward to detect if model intersects with ground
      raycaster.set(point, new THREE.Vector3(0, 1, 0));
      const upHits = raycaster.intersectObject(groundMeshRef, true).filter(hit => hit.object !== meshRef.current);

      if (upHits.length > 0) {
        const groundY = upHits[0].point.y;
        const distance = upHits[0].distance;
        const penetrationThreshold = size.y * 2; // Within 2x model height = penetration

        if (distance < penetrationThreshold) {
          if (highestGroundBelowModel === null || groundY > highestGroundBelowModel) {
            highestGroundBelowModel = groundY;
          };
        };
      }
    });

    if (highestGroundBelowModel === null) {
      // console.log("%c highestGroundBelowModel === null, returning position.y", "color: red;")
      return position.y;
    };

    const clearance = highestGroundBelowModel + Math.max(1, Math.abs(size.y * 0.01));
    // console.log(`%cReturning ${clearance - bottomY}`, "color: red;")
    return clearance - bottomY;
  }, [position.y]);

  useLayoutEffect(() => {
//     console.log(`\n%cuseLayoutEffect
// groundMeshRef: ${groundMeshRef?.name}`, "color: green; font-weight: bold;");
    // if (hasPositionedRef.current || !groundMeshRef || !meshRef.current) return;  // original line: 
    if (!groundMeshRef || !meshRef.current) return;

    const adjustment = positionModelAboveGround(groundMeshRef);
    // console.log(`%cgroundMeshRef after if statement: ${groundMeshRef?.name}${"\n"}adjustment: ${adjustment}${"\n"}`, "color: green; font-weight: bold;");
    setNewYPosition(adjustment);
    hasPositionedRef.current = true;
  }, [groundMeshRef, positionModelAboveGround, position.y]);

  useEffect(() => {
    if (hasPositionedRef.current && meshRef.current) {
      meshRef.current.updateWorldMatrix(true, true);
      onMeshReady(meshRef.current);
    }
  }, [newYPosition, onMeshReady]);

  if (!mesh) return null;

  useFrame(({pointer, clock}, delta) => {
    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
    const elapsedTime = clock.elapsedTime;
    const sine = Math.sin(elapsedTime)/2;

    if (meshRef?.current && nodeName?.length) {
      if (autoRotate) {
        if (isFocused?.length && isFocused === nodeName) {
          animatePositionRef.current.set(meshRef.current.position.x + sine, meshRef.current.position.y + sine, meshRef.current.position.z + sine);
          animateRotationRef.current.set(0, pointer.x * (Math.PI / 10),  0);
          easing.damp3(meshRef.current.position, animatePositionRef.current, 1, clampedDelta);
          easing.dampE(meshRef.current.rotation, animateRotationRef.current, 1.5, clampedDelta);
        }
        else {
          animatePositionRef.current.set(...meshRef.current.position);
          animateRotationRef.current.set(0, meshRef.current.rotation.y, 0);
          meshRef.current.rotation.y += delta * autoRotateSpeed;
        } 
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      castShadow={true}
      geometry={mesh?.geometry}
      material={material}
      name={nodeName}
      onClick={onClick}
      position={[position.x, newYPosition, position.z]}
      receiveShadow={true}
      scale={scale}
    />
  );
};

export default Model;


// const OldModel = (props) => {
//   const {
//     autoRotate = true,
//     autoRotateSpeed = 0.5,
//     groundMeshRef,
//     materialId = '',
//     fileData: { nodeName = '', url = '' } = {},
//     onClick = undefined,
//     onMeshReady = () => { },
//     position = { x: 0, y: 0, z: 0 },
//     scale = 1,
//   } = props;

//   const mesh = url ? useGLTF(url).nodes?.[nodeName] : null;
//   // const vertexCount = mesh.geometry.attributes.position.count;
//   const meshRef = useRef(undefined);
//   const hasPositionedRef = useRef(false);
//   const getMaterial = useMaterial((state) => state.getMaterial);
//   // const materialRef = useRef(useMaterial.getState().materials[`${materialId}`]?.material); 
//   // const materialRef = useRef(getMaterial(materialId)?.material);
//   const material = getMaterial(materialId)?.material;

//   const [newPosition, setNewPosition] = useState(position.y);

//   const positionModelAboveGround = useCallback((groundMeshRef) => {
//     if (!meshRef.current || !groundMeshRef) return null;

//     meshRef.current.updateWorldMatrix(true, true);
//     groundMeshRef.updateWorldMatrix(true, true);

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
//       const downHits = raycaster.intersectObject(groundMeshRef, true).filter(hit => hit.object !== meshRef.current);

//       if (downHits.length > 0) {
//         const groundY = downHits[0].point.y;
//         // Track the highest ground point found below the model
//         if (highestGroundBelowModel === null || groundY > highestGroundBelowModel) {
//           highestGroundBelowModel = groundY;
//         };
//       };

//       // Cast upward to detect if model intersects with ground
//       raycaster.set(point, new THREE.Vector3(0, 1, 0));
//       const upHits = raycaster.intersectObject(groundMeshRef, true).filter(hit => hit.object !== meshRef.current);

//       if (upHits.length > 0) {
//         const groundY = upHits[0].point.y;
//         const distance = upHits[0].distance;
//         const penetrationThreshold = size.y * 2; // Within 2x model height = penetration

//         if (distance < penetrationThreshold) {
//           if (highestGroundBelowModel === null || groundY > highestGroundBelowModel) {
//             highestGroundBelowModel = groundY;
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
//     if (hasPositionedRef.current || !groundMeshRef || !meshRef.current) return;

//     const adjustment = positionModelAboveGround(groundMeshRef);
//     hasPositionedRef.current = true;
//     setNewPosition(adjustment ?? position.y);
//   }, [groundMeshRef, positionModelAboveGround, position.y]);

//   useEffect(() => {
//     if (hasPositionedRef.current && meshRef.current) {
//       meshRef.current.updateWorldMatrix(true, true);
//       onMeshReady(meshRef.current);
//     }
//   }, [newPosition, onMeshReady]);

//   useFrame(({ clock }, delta) => {
//     // const blendPercentage = Math.abs(Math.sin(clock.elapsedTime/2)) % 1
//     // console.log(blendPercentage)
//     if (meshRef?.current) {
//       if (autoRotate) meshRef.current.rotation.y += delta * autoRotateSpeed;
//     }
//   });

//   if (!mesh) return null;

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
//           position={[position.x, newPosition, position.z]}
//           receiveShadow={true}
//           scale={scale}
//         />
//       )}
//     </>
//   );
// };