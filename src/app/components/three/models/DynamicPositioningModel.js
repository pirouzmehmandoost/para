'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import { materialConfig } from '@configs/materialConfigs';
import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;

useGLTF.preload('/yoga_mat_strap.glb');
useGLTF.preload('/textured_bag.glb');
useGLTF.preload('/bag_9_BAT-transformed.glb');

const DynamicPositioningModel = (props) => {
  const {
    autoRotate = true,
    autoRotateSpeed = 0.5,
    fileData: { nodeName = '', url = '' } = {},
    materials: { defaultMaterialID = '' } = {},
    onClick = undefined,
    onMeshReady = () => { },
    position = { x: 0, y: 0, z: 0 },
    rotation = 0,
    scale = 1,
    groundMeshRef,
  } = props;

  // const boxRef = useRef(undefined)
  const size = useThree((state) => state.size);
  const scene = useThree((state) => state.scene);

  const geometry = useGLTF(url).nodes?.[nodeName]?.geometry || null;

  const meshScale = Math.min(0.5, scaleMeshAtBreakpoint(size.width) * 0.5);

  const isFocused = useSelection((state) => state.selection.isFocused);
  const selectedMaterialID = useSelection((state) => state.selection.materialID);
  const materials = useMaterial(state => state.materials);

  const meshRef = useRef(undefined);
  const selectedMaterialRef = useRef(null);
  const defaultMaterialRef = useRef(null);
  const blendedMaterialRef = useRef(new THREE.MeshPhysicalMaterial({ ...materialConfig }));

  const hasPositionedRef = useRef(false);
  const defaultPositionRef = useRef(new THREE.Vector3(position.x, position.y, position.z));
  const animatePositionRef = useRef(new THREE.Vector3(0, 0, 0));

  const [newYPosition, setNewYPosition] = useState(position.y );
  
  const animateRotationRef = useRef(new THREE.Euler());

  const raycasterRef = useRef(new THREE.Raycaster());
  const groundRef = useRef(undefined);
  const _scratchBoxRef = useRef(new THREE.Box3());
  const _scratchCenterRef = useRef(new THREE.Vector3());
  const _scratchSizeRef = useRef(new THREE.Vector3());

  const positionModelAboveGround = useCallback((groundObj) => {
    if (!meshRef.current || !groundObj) return defaultPositionRef.current.y;

    meshRef.current.updateWorldMatrix(true, true);
    groundObj.updateWorldMatrix(true, true);

    _scratchBoxRef.current
      .setFromObject(meshRef.current)
      .getCenter(_scratchCenterRef.current);
    _scratchBoxRef.current.getSize(_scratchSizeRef.current);
  
    const bottomY = _scratchBoxRef.current.min.y;
    const centerX = _scratchCenterRef.current.x;
    const centerZ = _scratchCenterRef.current.z;
    const penetrationThreshold = _scratchSizeRef.current.y * 2;
  
    // Circle with radius = half-diagonal of bounding box's bottom.
    const circleRadius = Math.sqrt(Math.pow(_scratchSizeRef.current.x, 2) + Math.pow(_scratchSizeRef.current.z, 2)) / 2;
    const numSamples = 10;
    const samplePoints = [];

    for (let i = 0; i < numSamples; i++) {
      const angle = (i / numSamples) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * circleRadius;
      const z = centerZ + Math.sin(angle) * circleRadius;
      samplePoints.push(new THREE.Vector3(x, bottomY, z)); // Start at bottomY
    }

    // const curve = new THREE.CatmullRomCurve3(samplePoints)
    // const points = curve.getPoints( 11 );
    // const geometry = new THREE.BufferGeometry().setFromPoints( points );
    // const material = new THREE.LineBasicMaterial( { color: 0xffff00 } );
    // const curveObject = new THREE.Line(geometry, material);
    // scene.add(curveObject)
    samplePoints.push(new THREE.Vector3(centerX, bottomY, centerZ));

    let highestGroundAboveModel = null;

    samplePoints.forEach((point) => {
      raycasterRef.current.set(point, new THREE.Vector3(0, 1, 0));
      const upHits = raycasterRef.current
        .intersectObject(groundObj, true)
        .filter(hit => hit.object !== meshRef.current)

      if (upHits.length > 0) {
        const groundY = upHits[0].point.y;
        if (highestGroundAboveModel === null || groundY > highestGroundAboveModel) {
          highestGroundAboveModel = groundY; // repurposing variable for the time bieng 
        };
      }
    });

    console.log(`highestGroundAboveModel for ${nodeName}`, highestGroundAboveModel)
    if (highestGroundAboveModel === null) {
      return position.y;
    };

    const clearance = highestGroundAboveModel + Math.max(1, Math.abs(_scratchSizeRef.current.y * 0.01));
    // return clearance - bottomY;

    defaultPositionRef.current.y = clearance - bottomY;
    return defaultPositionRef.current.y
  }, [position.y]);


  // const positionModelAboveGround = useCallback((groundObj) => {

  //   if (!meshRef.current || !groundObj) return defaultPositionRef.current.y;

  //   meshRef.current.updateWorldMatrix(true, true);
  //   groundObj.updateWorldMatrix(true, true);

  //   const boundingBoxSize = new THREE.Vector3();
  //   _scratchBoxRef.current
  //     .setFromObject(meshRef.current)
  //     .getCenter(_scratchCenterRef.current);
  
  //   _scratchBoxRef.current.getSize(_scratchSizeRef.current);
  
  //   const bottomY = _scratchBoxRef.current.min.y;
  //   const centerX = _scratchCenterRef.current.x;
  //   const centerZ = _scratchCenterRef.current.z;
  //   const penetrationThreshold = _scratchSizeRef.current.y * 2;
  //   // Circle with radius = half-diagonal of bounding box's bottom.
  //   const circleRadius = Math.sqrt(Math.pow(_scratchSizeRef.current.x, 2) + Math.pow(_scratchSizeRef.current.z, 2)) / 2;
  //   const numSamples = 10;
  //   const samplePoints = [];

  //   for (let i = 0; i < numSamples; i++) {
  //     const angle = (i / numSamples) * Math.PI * 2;
  //     const x = centerX + Math.cos(angle) * circleRadius;
  //     const z = centerZ + Math.sin(angle) * circleRadius;
  //     samplePoints.push(new THREE.Vector3(x, bottomY, z)); // Start at bottomY
  //   }
  //   samplePoints.push(new THREE.Vector3(centerX, bottomY, centerZ));

  //   let highestGroundAboveModel = null; // ground above or at model level
  //   // let highestGroundBelowModel = null; // ground below or at model level

  //   samplePoints.forEach((point) => {
  //     // Cast downward to find ground below
  //     // raycasterRef.current.set(point, new THREE.Vector3(0, -1, 0));
  //     // const downHits = raycasterRef.current.intersectObject(groundObj, true).filter(hit => hit.object !== meshRef.current);

  //     // if (downHits.length > 0) {
  //     //   const groundY = downHits[0].point.y;
  //     //   // Track the highest ground point found below the model
  //     //   if (highestGroundBelowModel === null || groundY > highestGroundBelowModel) {
  //     //     highestGroundBelowModel = groundY;
  //     //   };
  //     // };

  //     // Cast upward to detect if model intersects with ground
  //     raycasterRef.current.set(point, new THREE.Vector3(0, 1, 0));
  //     const upHits = raycasterRef.current
  //       .intersectObject(groundObj, true)
  //       .filter(hit => hit.object !== meshRef.current)
  //       // .sort(((a, b) => b.distance - a.distance));

  //       // console.log(upHits)

  //     if (upHits.length > 0) {
  //       const groundY = upHits[0].point.y;
  //       const distance = upHits[0].distance;

  //       if (distance < penetrationThreshold) {
  //         if (highestGroundAboveModel === null || groundY > highestGroundAboveModel) {
  //           highestGroundAboveModel = groundY; // repurposing variable for the time bieng 
  //         };
  //       };
  //     }
  //   });

  //   // console.log(`highestGroundAboveModel for ${nodeName}`, highestAboveModel)
  //   if (highestGroundAboveModel === null) {
  //     return position.y;
  //   };

  //   const clearance = highestGroundAboveModel + Math.max(1, Math.abs(boundingBoxSize.y * 0.01));

  //   const newYclearance = clearance - bottomY;
  //   // return clearance - bottomY;

  //   defaultPositionRef.current.y = defaultPositionRef.current.y

  //   return defaultPositionRef.current.y
  // }, [position.y]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      const selectedAndFocused = isFocused?.length && (isFocused === nodeName);
      const selectedMatID = selectedMaterialID?.length && selectedAndFocused ? selectedMaterialID : defaultMaterialID;
      const selectedMat = materials[selectedMatID]?.material;
      selectedMaterialRef.current = selectedMat;
      const defaultMat = materials[defaultMaterialID]?.material;
      defaultMaterialRef.current = defaultMat;
    }
  }, [defaultMaterialID, isFocused, materials, nodeName, selectedMaterialID]);

  useLayoutEffect(() => {
    if (!groundRef?.current && groundMeshRef?.isObject3D) groundRef.current = groundMeshRef;
    if (!meshRef.current || !groundRef.current) return;
    if (hasPositionedRef.current) return;

    const adjustment = positionModelAboveGround(groundRef.current);
    meshRef.current.updateWorldMatrix(true, true);

    // console.log("\n\nadjustment: for " , nodeName , "\n old y: ", position.y, " new y: ", adjustment)
    setNewYPosition( s => s = adjustment);

    hasPositionedRef.current = true;
  }, [groundMeshRef, positionModelAboveGround, setNewYPosition]);

    useEffect(() => {
    if (meshRef.current) {
      // if (!boxRef.current) {
      //   const box = new THREE.BoxHelper( meshRef.current, 0xffff00 );
      //   boxRef.current = box;
      //   scene.add(boxRef.current);
      //   boxRef.current.updateWorldMatrix();
      // } else {
      //   boxRef.current.material.color = new THREE.Color('#ff0000')
      //   boxRef.current.updateWorldMatrix();
      // }

      meshRef.current.updateWorldMatrix(true, true);
      blendedMaterialRef.current.copy(defaultMaterialRef.current);

      if (typeof onMeshReady === 'function' && hasPositionedRef.current) onMeshReady(meshRef.current);
    }
  }, [newYPosition, onMeshReady]);

  useFrame(({ clock }, delta) => {
    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame
    const elapsedTime = clock.elapsedTime;
    const sine = Math.sin(elapsedTime);
    const cos = Math.cos(elapsedTime);


    if (meshRef?.current && nodeName?.length) {
      const selectedAndFocused = isFocused?.length && isFocused === nodeName;
      meshRef.current.updateWorldMatrix(true, true);

      if (selectedAndFocused) {
        animatePositionRef.current.set(defaultPositionRef.current.x, defaultPositionRef.current.y + 5, defaultPositionRef.current.z);
        easing.damp3(meshRef.current.position, animatePositionRef.current, 1.15, clampedDelta);

        if (autoRotate) {
          animateRotationRef.current.set(0, meshRef.current.rotation.y, 0);
          meshRef.current.rotation.y += delta * autoRotateSpeed;
        }

        easing.damp(blendedMaterialRef.current, "bumpScale", selectedMaterialRef.current?.bumpScale ?? 1, 0.3, clampedDelta);
        easing.dampC(blendedMaterialRef.current.color, selectedMaterialRef.current.color, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "dispersion", selectedMaterialRef.current?.dispersion ?? 0, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "ior", selectedMaterialRef.current?.ior ?? 1.5, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "iridescence", selectedMaterialRef.current?.iridescence ?? 0, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "iridescenceIOR", selectedMaterialRef.current?.iridescenceIOR ?? 1.3, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "reflectivity", selectedMaterialRef.current?.reflectivity ?? 0, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "roughness", selectedMaterialRef.current?.roughness ?? 0, 0.3, clampedDelta);
        blendedMaterialRef.current.map = selectedMaterialRef.current?.map;
        blendedMaterialRef.current.roughnessMap = selectedMaterialRef.current?.roughnessMap;
        blendedMaterialRef.current.bumpMap = selectedMaterialRef.current?.bumpMap;
      }
      else {
        animatePositionRef.current.set(defaultPositionRef.current.x - sine / 2, defaultPositionRef.current.y + cos * 1.5, defaultPositionRef.current.z + sine);
        easing.damp3(meshRef.current.position, animatePositionRef.current, 1.15, clampedDelta);

        if (autoRotate) {
          animateRotationRef.current.set(((0.015 * sine) % 1), (Math.PI * rotation + ((0.025 * sine) % 1)), ((0.015 * cos) % 1));
          easing.dampE(meshRef.current.rotation, animateRotationRef.current, 1.5, clampedDelta);
        }

        easing.damp(blendedMaterialRef.current, "bumpScale", defaultMaterialRef.current?.bumpScale ?? 1, 0.3, clampedDelta);
        easing.dampC(blendedMaterialRef.current.color, defaultMaterialRef.current.color, 0.3, clampedDelta)
        easing.damp(blendedMaterialRef.current, "dispersion", defaultMaterialRef.current?.dispersion ?? 0, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "ior", defaultMaterialRef.current?.ior ?? 1.5, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "iridescence", defaultMaterialRef.current?.iridescence ?? 0, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "iridescenceIOR", defaultMaterialRef.current?.iridescenceIOR ?? 1.3, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "reflectivity", defaultMaterialRef.current?.reflectivity ?? 0, 0.3, clampedDelta);
        easing.damp(blendedMaterialRef.current, "roughness", defaultMaterialRef.current?.roughness ?? 0.5, 0.3, clampedDelta);
        blendedMaterialRef.current.map = defaultMaterialRef.current?.map
        blendedMaterialRef.current.roughnessMap = defaultMaterialRef.current?.roughnessMap;
        blendedMaterialRef.current.bumpMap = defaultMaterialRef.current?.bumpMap;
      }
    }
  });

  return (
    <>
      {geometry && (
        <mesh
          ref={meshRef}
          castShadow={true}
          geometry={geometry}
          material={blendedMaterialRef.current}
          name={nodeName}
          onClick={onClick}
          position={position}
          receiveShadow={true}
          rotation={[0, Math.PI * rotation, 0]}
          scale={scale * meshScale}
        />
      )}
    </>
  );
};

export default DynamicPositioningModel;


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