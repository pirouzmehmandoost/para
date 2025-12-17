'use client';

import React, { startTransition,  useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Cloud, Clouds, SoftShadows } from '@react-three/drei'
import { DepthOfField, EffectComposer, Vignette, Outline, N8AO } from '@react-three/postprocessing';
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

  //Model mesh tracking, to control the camera rig.
  const [readyCount, setReadyCount] = useState(0);
  const meshRefs = useRef( projects.map((project) => new Array(project.sceneData.modelUrls.length).fill(null)) );
  const meshReadyFlags = useRef( projects.map((project) => new Array(project.sceneData.modelUrls.length).fill(false)) );

  const meshReadyHandlers = useMemo(() => 
    projects.map((project, i) =>
      project.sceneData.modelUrls.map((_, j) => {
        //mesh is a THREE.Mesh. Fires after a Model mounts and is positioned above Ground.
        return (mesh) => {  
          if (!mesh || meshReadyFlags.current[i][j]) return;

          meshRefs.current[i][j] = mesh;
          meshRefs.current = meshRefs.current.map((row) => [...row]);
          meshReadyFlags.current[i][j] = true;
          setReadyCount((count) => count + 1);
        };
      })
  ), []);
  
  const totalMeshes = projects.reduce((acc, el)=> acc + el.sceneData.modelUrls.length, 0);
  const meshesReady = readyCount === totalMeshes;
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

  return (
    <>
      {meshesReady && (
        <ControllableCameraRig
          manualIndex={hasNavigated ? currentIndex : null}
          positionVectors={groupPositions}
          target={groupRef.current ?? undefined}
          targetRefs={meshRefs.current}
        />
      )}
      <EffectComposer autoClear={false} disableNormalPass multisampling={0}>
        <DepthOfField focusDistance={0.3} focalLength={0.5} bokehScale={2} height={Resizer.AUTO_SIZE} />
        <N8AO aoRadius={50} distanceFalloff={500} intensity={1} screenSpaceRadius halfRes aoSamples={16} denoiseSamples={16}/>
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
      <SoftShadows focus={0} samples={24} size={30} />
      <Clouds material={THREE.MeshLambertMaterial} limit={projects.length * 4}>
        {projects.map((_, index) => {
          const cloudPosition = [groupPositions[index].x + 100, groupPositions[index].y - 50, groupPositions[index].z + 90];
          return (
            <Cloud
              key={`cloud_${index}`}
              color='black'
              concentrate='outside'
              growth={300}
              opacity={0.12}
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
        intensity={1.5}
        position={[0,90,0]}
        shadow-bias={0.001}
        shadow-camera-near={0.1}
        shadow-camera-far={400}
        shadow-camera-top={400}
        shadow-camera-bottom={-400}
        shadow-camera-left={-400}
        shadow-camera-right={400}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <group
        onPointerMissed={(e) => {
          groupRef.current = null;
          e.stopPropagation();

          startTransition(() => {
            showMenu(undefined);
            resetSelectionStore();
          });
        }}
      >
        {projects.map((data, index) => {
          const groupProps = {
            ...data,
            sceneData: {
              ...data.sceneData,
              autoRotateSpeed: data.sceneData.autoRotateSpeed * (index % 2 == 0 ? -0.5 : 0.5),
              groupName: data.name,
              isPointerOver: groupRef.current?.name || '',
              position: groupPositions[index],
            }
          };
          // const lightPosition = [
          //   groupPositions[index].x*12,
          //   groupPositions[index].y +150,
          //   groupPositions[index].z +200
          // ];
          return (
            //   <directionalLight
            //     key={`light_${groupProps.name}`}
            //     castShadow={true}
            //     intensity={1}
            //     position={lightPosition}
                
            //     shadow-bias={0.001}
            //     shadow-camera-near={0.1}
            //     shadow-camera-far={500}
            //     shadow-camera-top={300}
            //     shadow-camera-bottom={-300}
            //     shadow-camera-left={-300}
            //     shadow-camera-right={300}
            //     shadow-mapSize-width={1024}
            //     shadow-mapSize-height={1024}
            //   />
              <Group 
                groundMeshRef={groundMeshRef}
                groupRef={groupRefs.current[index]}
                key={`group_${groupProps.name}`}
                name={`${groupProps?.name}`}
                onClick={(e) => {
                  const previousGroup = groupRef.current;           
                  groupRef.current = e.object;

                  if (previousGroup && previousGroup.name === e.object.name ) return;

                  e.stopPropagation();
                  setCurrentIndex(index);
                  currentIndexRef.current = index;
                  setHasNavigated(false);

                  startTransition(() => {
                    showMenu(e.object); 
                    setSelectionStore(groupProps);
                  });
                }}
                onMeshReady={meshReadyHandlers[index]}
                {...groupProps.sceneData}
              />
            // </group>
          );
        })}
      </group>
      <mesh position={[0, 0, -1000]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
        <planeGeometry args={[20000, 20000]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} />
      </mesh>
      <Ground setGroundMeshRef={setGroundMeshRef}  rotation={[Math.PI/9, 0, 0]}/>
    </>
  );
};

export default SceneBuilder;