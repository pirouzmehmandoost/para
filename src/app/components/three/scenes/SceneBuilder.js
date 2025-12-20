'use client';

import React, { startTransition, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Cloud, Clouds, SoftShadows } from '@react-three/drei'
import { EffectComposer, Vignette, Outline } from '@react-three/postprocessing';
import { BlendFunction, KernelSize, Resizer } from 'postprocessing';
import { portfolio } from '@configs/globals';
import useSelection from '@stores/selectionStore';
import { scaleMeshAtBreakpoint } from '@utils/mesh/meshUtils';
import ControllableCameraRig from '../cameras/ControllableCameraRig';
import Ground from '../models/Ground';
import Group from '../groups/Group';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;
const { projects } = portfolio;

const SceneBuilder = ({ showMenu }) => {
  const { size } = useThree();
  const [groundMeshRef, setGroundMeshRef] = useState(undefined);
  const setSelectionStore = useSelection((state) => state.setSelection);
  const setIsFocused = useSelection((state) => state.setIsFocused);
  const resetSelectionStore = useSelection((state) => state.reset);
  const groupRef = useRef(null); 
  const groupRefs = useRef(projects.map(() => null));

  const groupPositions = useMemo(() => {
    const ellipseRadius = scaleMeshAtBreakpoint(size.width) * 150;
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
      projects.length % 2 == 0 ? 0 : Math.PI / 2
    );
    ellipseCurve.closed = true;
    
    const curvePoints = ellipseCurve.getPoints(projects.length);
    const ellipseCurvePoints = curvePoints.slice(1);
    const positionAttribute = new THREE.BufferGeometry()
      .setFromPoints(ellipseCurvePoints)
      .getAttribute('position');

    for (let i = 0; i < positionAttribute.count; i++) {
      const pt = vertex.fromBufferAttribute(positionAttribute, i);
      positions.push(new THREE.Vector3(pt.x, 0, pt.y));
    }
    return positions;
  }, [size.width]);

  const readyCount = useRef(0);
  const [meshesReady, setMeshesReady] = useState(false);
  const meshRefs = useRef( projects.map((project) => new Array(project.sceneData.modelUrls.length).fill(null)) );
  const meshReadyFlags = useRef( projects.map((project) => new Array(project.sceneData.modelUrls.length).fill(false)) );
  const totalMeshes = projects.reduce((acc, el)=> acc + el.sceneData.modelUrls.length, 0);

  const meshReadyHandlers = useMemo(() => 
    projects.map((project, i) =>
      project.sceneData.modelUrls.map((_, j) => {
        return (mesh) => {  
          if (!mesh || meshReadyFlags.current[i][j]) return;

          meshRefs.current[i][j] = mesh;
          meshReadyFlags.current[i][j] = true;
          readyCount.current += 1;

          if (readyCount.current === totalMeshes) setMeshesReady(true);
        };
      })
  ), [totalMeshes]);

  // swipe gesture tracking (doesn't work on mobile)
  const [hasNavigated, setHasNavigated] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const touchStartRef = useRef(null);
  const isSwipingRef = useRef(false);

  const handlePointerDown = (e) => {
    isSwipingRef.current = false;
    touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e) => {
    if (!touchStartRef.current) return;

    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 600) {
      const direction = deltaX > 0 ? 'right' : 'left';
      let nextIndex;

      if (direction === 'right') nextIndex = (currentIndexRef.current + 1) % projects.length
      else nextIndex = (currentIndexRef.current - 1 + projects.length) % projects.length;
      
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      setHasNavigated(true);
      groupRef.current = null; 
      isSwipingRef.current = true;
    };
    touchStartRef.current = null;
  };

  // const handleGroupClick = useCallback((e) => {
  //   const clickedName = e.object.name;
  //   const previous = groupRef.current;
  //   groupRef.current = e.object;

  //   if (previous?.name === clickedName) return;
  
  //   e.stopPropagation();

  //   const index = projects.findIndex((p) => p.sceneData.modelUrls[0].name === clickedName);
  //   setCurrentIndex(index);
  //   currentIndexRef.current = index;
  //   setHasNavigated(false);
  
  //   setIsFocused(clickedName);
  
  //   startTransition(() => {
  //     showMenu(e.object);
  //     setSelectionStore(projects[index]);
  //   });
  // }, [setHasNavigated, setCurrentIndex, setIsFocused, setSelectionStore, showMenu]);

  return (
    <>
      <ControllableCameraRig
        manualIndex={hasNavigated ? currentIndex : null}
        positionVectors={groupPositions}
        target={groupRef.current ?? undefined}
        targetRefs={meshesReady ? meshRefs.current : []}
      />
      <EffectComposer autoClear={false} disableNormalPass multisampling={0}>
        <Vignette eskil={false} offset={0.01} darkness={0.7} />
        <Outline
          selection={groupRef.current ? [groupRef.current] : undefined}
          selectionLayer={10}
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
        />
      </EffectComposer>
      <SoftShadows focus={0.1} samples={16} size={40} />
      <Clouds material={THREE.MeshLambertMaterial} limit={projects.length * 4}>
        {projects.map((_, index) => {
          const cloudPosition = [groupPositions[index].x + 90, groupPositions[index].y - 50, groupPositions[index].z + 90];
          return (
            <Cloud
              key={`cloud_${index}`}
              color='black'
              concentrate='outside'
              growth={300}
              opacity={0.14}
              position={cloudPosition}
              seed={0.4}
              segments={4}
              speed={0.2}
              volume={300}
            />
          );
        })}
      </Clouds>
      <directionalLight
        castShadow={true}
        intensity={5}
        position={[0,40,0]}
        shadow-bias={0.001}
        shadow-camera-near={0.1}
        shadow-camera-far={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <group
        onPointerMissed={(e) => {
          groupRef.current = null;
          setIsFocused(null);
          e.stopPropagation();

          startTransition(() => {
            showMenu(undefined);
            resetSelectionStore();
          });
        }}
      >
        {projects.map(({sceneData}, index) => {
          return (
            <Group
              key={`group_${sceneData.groupName}`}
              autoRotate={sceneData.autoRotate}
              autoRotateSpeed={sceneData.autoRotateSpeed * (index % 2 == 0 ? -0.5 : 0.5)} 
              groundMeshRef={groundMeshRef}
              groupRef={groupRefs.current[index]}
              materials={sceneData.materials}
              modelUrls={sceneData.modelUrls}
              onMeshReady={meshReadyHandlers[index]}
              position={groupPositions[index]}
              scale={sceneData.scale}
              // onClick={handleGroupClick}
              onClick={(e) => {
                const previousGroup = groupRef.current;           
                groupRef.current = e.object;

                if (previousGroup && previousGroup.name === e.object.name ) return;

                e.stopPropagation();
                setCurrentIndex(index);
                currentIndexRef.current = index;
                setHasNavigated(false);
                setIsFocused(groupRef.current?.name);
                startTransition(() => {
                  showMenu(e.object); 
                  setSelectionStore(projects[index]);
                });
              }}
            />
          );
        })}
      </group>
      <mesh name = "Planey McPlane" position={[0, 0, -1000]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
        <planeGeometry args={[20000, 20000]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} />
      </mesh>
      <Ground setGroundMeshRef={setGroundMeshRef}  rotation={[Math.PI/9, 0, 0]}/>
    </>
  );
};

export default SceneBuilder;