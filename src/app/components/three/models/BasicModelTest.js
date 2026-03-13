'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, useGLTF } from '@react-three/drei';
import { easing } from 'maath';
// import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';
import useMaterial, { defaultMeshTransmissionMaterialConfig, defaultMeshPhysicalMaterialConfig } from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import { portfolio } from '@configs/globals';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

useGLTF.preload('/yoga_mat_strap.glb');
useGLTF.preload('/textured_bag.glb');
useGLTF.preload('/bag_9_BAT-transformed.glb');

const PROJECTS_LENGTH = portfolio.projects.length;

const BasicModelTest = (props) => {
  const {
    autoRotate = true,
    autoRotateSpeed = 0.5,
    fileData: { nodeName = '', url = '' } = {},
    materials: { defaultMaterialID = '' } = {},
    onClick = undefined,
    onMeshReady = undefined,
    position = { x: 0, y: 0, z: 0 },
    rotation = 0,
    scale = 0.035,
  } = props;

  // size: Bounds of the canvas in px
  // viewport: Bounds of the viewport in 3d units. viewport.aspect is (viewport.width / viewport.height)
  const { size, viewport } = useThree();
  const geometry = useGLTF(url).nodes?.[nodeName]?.geometry || null;
  const isFocused = useSelection((state) => state.selection.isFocused);
  const selectedMaterialID = useSelection((state) => state.selection.materialID);
  const materials = useMaterial((state) => state.materials);
  const setMeshTransmissionMaterial = useMaterial((state) => state.setMeshTransmissionMaterial);

  const _scratchBoxRef = useRef(new THREE.Box3());
  const _scratchCenterRef = useRef(new THREE.Vector3());
  const _scratchSizeRef = useRef(new THREE.Vector3());
  const meshRef = useRef(undefined);
  const animateRotationRef = useRef(new THREE.Euler());
  const animatePositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const scaleRef = useRef(new THREE.Vector3(0.035, 0.035, 0.035));
  const prevCanvasHeightRef = useRef(size.height);
  const defaultPositionRef = useRef(new THREE.Vector3(position.x, position.y, position.z));
  const selectedMaterialRef = useRef(null);
  const defaultMaterialRef = useRef(null);
  const blendedMaterialRef = useRef(new THREE.MeshPhysicalMaterial({ ...defaultMeshPhysicalMaterialConfig }));
  const transmissionMaterialRef = useRef(null);
  const isMaterialTranslucentRef = useRef(false);
  const meshRotation = useMemo(() => { return [0, Math.PI * rotation, 0]}, [rotation]);

  // old method for scaling is replaced by the new effect below
  // const meshScale = Math.min(0.5, scaleMeshAtBreakpoint(size.width) * 0.5) * scale;
  useEffect(() => {
    const heightDelta = size.height / prevCanvasHeightRef.current;
    if (!meshRef.current) return;

    meshRef.current.updateWorldMatrix(true, true);
    _scratchBoxRef.current
      .setFromObject(meshRef.current)
      .getCenter(_scratchCenterRef.current);
    _scratchBoxRef.current.getSize(_scratchSizeRef.current);
    const minb = Math.min( _scratchSizeRef.current.x , _scratchSizeRef.current.y)
    const maxb = Math.max( _scratchSizeRef.current.x , _scratchSizeRef.current.y)
    const minv = Math.min(viewport.height , viewport.width)
    const maxv = Math.max( viewport.height , viewport.width)
    const boundingBoxRatio = minb / maxb;
    const viewportRatio = minv / maxv;
    const factor = viewportRatio / boundingBoxRatio;
    const newScale = (factor * scale * heightDelta) / PROJECTS_LENGTH;
    scaleRef.current = new THREE.Vector3(newScale, newScale, newScale);
    prevCanvasHeightRef.current = size.height;
    // console.log(nodeName + "'s new scale: ",  scaleRef.current);
  }, [scale]);

  useLayoutEffect(() => {
    if (meshRef.current && !defaultMaterialID.replace('_', ' ').includes('translucent')) {
      const selectedAndFocused = isFocused?.length && (isFocused === nodeName);
      const selectedMatID = selectedMaterialID?.length && selectedAndFocused ? selectedMaterialID : defaultMaterialID;
      const selectedMat = materials[selectedMatID]?.material;
      selectedMaterialRef.current = selectedMat;
      const defaultMat = materials[defaultMaterialID]?.material;
      defaultMaterialRef.current = defaultMat;
    }
  }, [defaultMaterialID, isFocused, materials, nodeName, selectedMaterialID]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.updateWorldMatrix(true, true);
      if (defaultMaterialID.replace('_', ' ').includes('translucent')) {
        if (transmissionMaterialRef?.current && !isMaterialTranslucentRef.current) {
          setMeshTransmissionMaterial(transmissionMaterialRef.current);
          isMaterialTranslucentRef.current = true;
        }
      }
      else {
        blendedMaterialRef.current.copy(defaultMaterialRef.current);
      }

      if (typeof onMeshReady === 'function') onMeshReady(meshRef.current);
    }
  }, [onMeshReady, defaultMaterialID, setMeshTransmissionMaterial]);


  useFrame(({ clock, viewport: vp, size: canvasDimensions }, delta) => {
    // Clamp on delta eliminates frame jumping during browser tab navigation.
    const clampedDelta = Math.min(delta, 0.08); // Max 80ms per frame.
    const elapsedTime = clock.elapsedTime;
    const sine = Math.sin(elapsedTime);
    const cos = Math.cos(elapsedTime);
    const canvasHeightDelta = canvasDimensions.height / prevCanvasHeightRef.current;

    if (meshRef?.current && nodeName?.length) {
      const selectedAndFocused = isFocused?.length && isFocused === nodeName;
      const isTransmissionMaterial = defaultMaterialID.replace('_', ' ').includes('translucent');
      meshRef.current.updateWorldMatrix(true, true);

      const minBB = Math.min( _scratchSizeRef.current.x , _scratchSizeRef.current.y);
      const maxBB = Math.max( _scratchSizeRef.current.x , _scratchSizeRef.current.y);
      const minVP = Math.min(vp.height , vp.width);
      const maxVP = Math.max(vp.height , vp.width);
      const factor = (minVP / maxVP) / ( minBB / maxBB); // viewport ratio / bounding box ratio
      const newScale = (factor * scale * canvasHeightDelta) / PROJECTS_LENGTH;

      scaleRef.current.set(newScale, newScale, newScale);
      easing.damp3(meshRef.current.scale, scaleRef.current, 0.3, clampedDelta);
      prevCanvasHeightRef.current = canvasDimensions.height;

      if (selectedAndFocused) {
        animatePositionRef.current.set(defaultPositionRef.current.x, defaultPositionRef.current.y + 5, defaultPositionRef.current.z);
        easing.damp3(meshRef.current.position, animatePositionRef.current, 1.15, clampedDelta);

        if (!isTransmissionMaterial) {
          if (autoRotate) {
            animateRotationRef.current.set(0, meshRef.current.rotation.y, 0);
            meshRef.current.rotation.y += delta * autoRotateSpeed;
          }

          easing.damp(blendedMaterialRef.current, "bumpScale", selectedMaterialRef.current?.bumpScale ?? 1, 0.3, clampedDelta);
          easing.dampC(blendedMaterialRef.current.color, selectedMaterialRef.current?.color ?? 'red', 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "dispersion", selectedMaterialRef.current?.dispersion ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "ior", selectedMaterialRef.current?.ior ?? 1.5, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "iridescence", selectedMaterialRef.current?.iridescence ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "iridescenceIOR", selectedMaterialRef.current?.iridescenceIOR ?? 1.3, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "opacity", selectedMaterialRef.current?.opacity ?? 1, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "reflectivity", selectedMaterialRef.current?.reflectivity ?? 0.5, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "roughness", selectedMaterialRef.current?.roughness ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "thickness", selectedMaterialRef.current?.thickness ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "transmission", selectedMaterialRef.current?.transmission ?? 0, 0.3, clampedDelta);
          blendedMaterialRef.current.side = selectedMaterialRef.current?.side ?? THREE.DoubleSide;
          blendedMaterialRef.current.tranparent = selectedMaterialRef.current?.tranparent ?? false;
          blendedMaterialRef.current.map = selectedMaterialRef.current?.map;
          blendedMaterialRef.current.roughnessMap = selectedMaterialRef.current?.roughnessMap;
          blendedMaterialRef.current.bumpMap = selectedMaterialRef.current?.bumpMap;
        }
      }
      else {
        animatePositionRef.current.set(defaultPositionRef.current.x - sine / 2, defaultPositionRef.current.y + cos * 1.5, defaultPositionRef.current.z + sine);
        easing.damp3(meshRef.current.position, animatePositionRef.current, 1.15, clampedDelta);

        if (!isTransmissionMaterial) {
          if (autoRotate) {
            animateRotationRef.current.set(((0.015 * sine) % 1), (Math.PI * rotation + ((0.025 * sine) % 1)), ((0.015 * cos) % 1));
            easing.dampE(meshRef.current.rotation, animateRotationRef.current, 1.5, clampedDelta);
          }

          easing.damp(blendedMaterialRef.current, "bumpScale", defaultMaterialRef.current?.bumpScale ?? 1, 0.3, clampedDelta);
          easing.dampC(blendedMaterialRef.current.color, defaultMaterialRef.current?.color ?? 'red', 0.3, clampedDelta)
          easing.damp(blendedMaterialRef.current, "dispersion", defaultMaterialRef.current?.dispersion ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "ior", defaultMaterialRef.current?.ior ?? 1.5, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "iridescence", defaultMaterialRef.current?.iridescence ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "iridescenceIOR", defaultMaterialRef.current?.iridescenceIOR ?? 1.3, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "opacity", defaultMaterialRef.current?.opacity ?? 1, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "reflectivity", defaultMaterialRef.current?.reflectivity ?? 0.5, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "roughness", defaultMaterialRef.current?.roughness ?? 0.5, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "thickness", defaultMaterialRef.current?.thickness ?? 0, 0.3, clampedDelta);
          easing.damp(blendedMaterialRef.current, "transmission", defaultMaterialRef.current?.transmission ?? 0, 0.3, clampedDelta);
          blendedMaterialRef.current.side = defaultMaterialRef.current?.side ?? THREE.DoubleSide;
          blendedMaterialRef.current.tranparent = defaultMaterialRef.current?.tranparent ?? false;
          blendedMaterialRef.current.map = defaultMaterialRef.current?.map;
          blendedMaterialRef.current.roughnessMap = defaultMaterialRef.current?.roughnessMap;
          blendedMaterialRef.current.bumpMap = defaultMaterialRef.current?.bumpMap;
        }
      }
    }
  });

  return (
    <>
      {geometry && (
        defaultMaterialID.replace('_', ' ').includes('translucent') ?
          (
            <mesh
              ref={meshRef}
              castShadow={true}
              geometry={geometry}
              name={nodeName}
              onClick={onClick}
              position={position}
              receiveShadow={true}
              rotation={meshRotation}
              scale={scaleRef.current}
            >
              <MeshTransmissionMaterial
                ref={transmissionMaterialRef}
                {...defaultMeshTransmissionMaterialConfig}
              />
            </mesh>
          )
          : (
            <mesh
              ref={meshRef}
              castShadow={true}
              geometry={geometry}
              material={blendedMaterialRef.current}
              name={nodeName}
              onClick={onClick}
              position={position}
              receiveShadow={true}
              rotation={meshRotation}
              scale={scaleRef.current}
            />
          )
      )}
    </>
  );
};

export default BasicModelTest;