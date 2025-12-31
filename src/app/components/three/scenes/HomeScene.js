'use client';

import React, {startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Bvh, Cloud, Clouds, SoftShadows } from '@react-three/drei'
import { EffectComposer, Vignette, Outline } from '@react-three/postprocessing';
import { BlendFunction, KernelSize, Resizer } from 'postprocessing';
import { portfolio } from '@configs/globals';
import useSelection from '@stores/selectionStore';
import { scaleMeshAtBreakpoint } from '@utils/mesh/meshUtils';
import AnimatedRig from '../cameras/AnimatedRig';
import Ground from '../models/Ground';
import Group from '../groups/Group';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;
const { projects } = portfolio;

// HomeScene composes the scene and supplies events and handlers down to children. 
// Its Primary responsibilites can are environment staging, setting up the Camera Rig, mounting Groups and providing event handlers: 
// 
// 1- Environment Staging: 
//  HomeScene uses PostProcessing Effects, SoftShadows, a DirectionLight and an invisible Plane geometry.
//  The Invisible Plane: 
//   The Plane and DirectionalLight have static positions. 
//   HomeScene provides the Plane with handlers capture pointer events, which register swiping gestures.
//
// 2- Camera Rig: a custom rig named AnimatedRig is controlled via event handlers.
//
// 3- Mounting: Ground, Group(s), and AnimatedRig components. Groups mount Mesh components.
//  Ground- 
//   A Ground component is positioned and passed a prop to forward up a ref when mounted. 
//   HomeScene passes that ref to Groups.
//  Group- 
//   HomeScene provides Group with positions, event handlers and refs.
//   Groups calculate a relative position for children.
//    I- Group passes refs from HomeScene to track when all the children mount. 
//    II- Group passes down the Ground ref.
//  Mesh- 
//   HomeScene passes a prop to forward Mesh refs and notify if and when they mount.
//   Meshes rotate. They use the Group and Ground ref position to calculate one that never intersects with the Ground.
//  AnimatedRig- 
//   The Rig is the most complicated component. HomeScene passes multiple refs forwarded up from Meshes and Groups. 
//    I- targetRef
//      this ref is updated when the invisible Mesh or a Group's event handler fires.
//      The Rig positions the camera relative to this ref. 
//        if not null, the camera moves sticks to that position. Otherwises it behaves differently. 
//   II- manualIndexRef
//     HomeScene updates this while handling swipe gestures, the ref moves the Rig in one direction or another to temporatily dwell at a position.
//   III- If no click or swipes, the Rig moves along a circular to temporarily dwell at the position of Meshes for 5 seconds. 
//   IV- The dwell time differ.
//    if a Swipe gesture registers then the Rig dwells in the new position for 5 + 4 seconds longer before reverting to 5 second intervals.
//   V- targetRefs
//    The Rig is passed refs of all meshes. Once they mounts, its movement becomes relative to ref positions. 
//    Otherwise the original positioning which HomeScene calculates for each Group is used. 
//

// Notes: 
//  Swipe gesture registration logic: 
//   I wrote my own. The useGesture library hasnt been updated in many years, 
//   I dont have brains to assess its compatibility with modern React and Three.js ecosystems. 
//   My implementation is hacky, to work on mobile devices it relies on a custom class in Globals.css.
//
// Ref drilling:
//  Mesh positions are dynamically calculated and so is the Rig. I did that for fun, not for optimization. 
//  The refs track the position of Meshes so that I can slap them or Groups anywhere in HomeScene,
//  and they'll always hover above the Ground component,
//  and AnimatedRig forces the camera to lift and look at the center of a Mesh's bounding box.
//  Refs dont force React state to update haphazardly while requesting animation frames.
//  To keep things sane the Ground never moves. 
//  The final y-position of Meshes is calculated only once after The Ground mounts, 
//  They Render once on mount, and again only if they intersect and need a lift.


const HomeScene = ({ showModal }) => {
  const { size, invalidate } = useThree();
  const [groundMeshRef, setGroundMeshRef] = useState(undefined);
  const setSelectionStore = useSelection((state) => state.setSelection);
  // const setIsFocused = useSelection((state) => state.setIsFocused);
  const resetSelectionStore = useSelection((state) => state.reset);
  const groupRef = useRef(null); // really its a Mesh and not a Group.
  const groupRefs = useRef(projects.map(() => null));
  // swipe gesture tracking
  const currentIndexRef = useRef(0); 
  const swipeDirectionRef = useRef(null);
  const hasNavigatedRef = useRef(false);
  const touchStartRef = useRef(null);

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

  // useEffect(() => {

  //   if (!meshesReady) return;
  
  //   const selection = useSelection.getState().selection;
  //   const modelName = selection?.sceneData?.modelUrls?.[0]?.name;
  //   if (!modelName) return;
  
  //   const idx = projects.findIndex((p) => p.sceneData?.modelUrls?.[0]?.name === modelName);
  //   if (idx < 0) return;
  
  //   const mesh = meshRefs.current?.[idx]?.[0];
  //   if (!mesh) return;
  
  //   groupRef.current = mesh;
  //   currentIndexRef.current = idx;
  //   swipeDirectionRef.current = null;
  //   hasNavigatedRef.current = false;
  // }, [meshesReady]);

  const handlePointerDown = (e) => {
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

      if (direction === 'right') {
        nextIndex = (currentIndexRef.current + 1) % projects.length;
        swipeDirectionRef.current = 1;
      }
      else {
        nextIndex = (currentIndexRef.current - 1 + projects.length) % projects.length;
        swipeDirectionRef.current = -1;
      }
      
      currentIndexRef.current = nextIndex;
      hasNavigatedRef.current = true;
      groupRef.current = null; 
    };
    touchStartRef.current = null;
  };

  const handleClick = useCallback((e) => {
    const clickedName = e.object.name;
    const previous = groupRef.current;
    groupRef.current = e.object;

    if (previous?.name === clickedName) return;
  
    e.stopPropagation();

    const index = projects.findIndex((p) => p.sceneData.modelUrls[0].name === clickedName);
    swipeDirectionRef.current = null;
    currentIndexRef.current = index;
    hasNavigatedRef.current = false;
    // setIsFocused(clickedName);
  
    startTransition(() => {
      showModal(e.object);
      setSelectionStore({ ...projects[index], isFocused: clickedName });
      // setSelectionStore(projects[index]);
    });
  }, [setSelectionStore, showModal]);

  const handleMiss = useCallback((e) => {
    groupRef.current = null;
    // setIsFocused(null);
    e.stopPropagation();

    startTransition(() => {
      showModal(undefined);
      resetSelectionStore();
    });
  }, [resetSelectionStore, showModal]);

  useFrame((state) => {
    // request the next frame
    invalidate()
  })

  return (
    <>
      <directionalLight
        castShadow={true}
        intensity={3}
        position={[-100,50,0]}
        shadow-bias={0.01}
        shadow-camera-near={2}
        shadow-camera-far={1024}
        shadow-camera-top={1024}
        shadow-camera-bottom={-1024}
        shadow-camera-left={-1024}
        shadow-camera-right={1024}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        castShadow={true}
        intensity={3}
        position={[100,50,0]}
        shadow-bias={0.01}
        shadow-camera-near={2}
        shadow-camera-far={1024}
        shadow-camera-top={1024}
        shadow-camera-bottom={-1024}
        shadow-camera-left={-1024}
        shadow-camera-right={1024}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <AnimatedRig
        swipeDirectionRef={swipeDirectionRef}
        manualIndexRef={currentIndexRef} //for swiping
        hasNavigatedRef={hasNavigatedRef}
        positionVectors={groupPositions} 
        targetRef={groupRef} //for clicking
        targetRefs={meshesReady ? meshRefs.current : []}
      />
      <EffectComposer autoClear={false} disableNormalPass multisampling={0}>
        {/* <Vignette eskil={false} offset={0.01} darkness={0.7} /> */}
        <Outline
          // selection={selectedMesh ? [selectedMesh] : (groupRef.current ? [groupRef.current] : undefined)}
          selection={groupRef.current ? [groupRef.current] : undefined}
          // selectionLayer={10}
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
      <SoftShadows focus={0.1} samples={12} size={30} />
      <Clouds material={THREE.MeshLambertMaterial} limit={projects.length * 4}>
        {projects.map((_, index) => {
          return (
            <Cloud
              key={`cloud_${index}`}
              color='black'
              concentrate='outside'
              growth={300}
              opacity={0.13}
              position={[groupPositions[index].x + 100, groupPositions[index].y - 40, groupPositions[index].z + 90]}
              seed={0.4}
              segments={4}
              speed={0.2}
              volume={300}
            />
          );
        })}
      </Clouds>

      <Bvh firstHitOnly>
        <group
          // onPointerMissed={handleMiss}
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
                onClick={handleClick}
              />
            );
          })}
        </group>
      </Bvh>

      <mesh 
        position={[0, 0, -1000]}
        onClick={handleMiss}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[20000, 20000]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} />
      </mesh>
      <Ground setGroundMeshRef={setGroundMeshRef} rotation={[Math.PI/9, 0, 0]}/>
    </>
  );
};

export default HomeScene;