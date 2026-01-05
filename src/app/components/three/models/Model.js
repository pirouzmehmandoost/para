'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import useMaterial from '@stores/materialStore';

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
  const hasPositionedRef = useRef(false);
  const getMaterial = useMaterial((state) => state.getMaterial);
  // const materialRef = useRef(useMaterial.getState().materials[`${materialId}`]?.material); 
  const materialRef = useRef(getMaterial(materialId)?.material);
  const [newPosition, setNewPosition] = useState(position.y);

  const positionModelAboveGround = useCallback((groundMeshRef) => {
    if (!meshRef.current || !groundMeshRef) return null;

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
      return position.y;
    };

    const clearance = highestGroundBelowModel + Math.max(1, Math.abs(size.y * 0.01));
    return clearance - bottomY;
  }, [position.y]);

  useLayoutEffect(() => {
    if (hasPositionedRef.current || !groundMeshRef || !meshRef.current) return;

    const adjustment = positionModelAboveGround(groundMeshRef);
    hasPositionedRef.current = true;
    setNewPosition(adjustment ?? position.y);
  }, [groundMeshRef, positionModelAboveGround, position.y]);

  useEffect(() => {
    if (hasPositionedRef.current && meshRef.current) {
      meshRef.current.updateWorldMatrix(true, true);
      onMeshReady(meshRef.current);
    }
  }, [newPosition, onMeshReady]);

  useFrame(({ clock }, delta) => {
    // const blendPercentage = Math.abs(Math.sin(clock.elapsedTime/2)) % 1
    // console.log(blendPercentage)
    if (meshRef?.current) {
      if (autoRotate) meshRef.current.rotation.y += delta * autoRotateSpeed;
    }
  });

  if (!mesh) return null;

  return (
    <>
      {mesh && (
        <mesh
          ref={meshRef}
          castShadow={true}
          geometry={mesh?.geometry}
          material={materialRef.current}
          name={nodeName}
          onClick={onClick}
          position={[position.x, newPosition, position.z]}
          receiveShadow={true}
          scale={scale}
        />
      )}
    </>
  );
};

export default Model;