'use client';

import { useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { BlendFunction, KernelSize, Resizer } from 'postprocessing';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
  Outline,
} from '@react-three/postprocessing';
import useSelection from '@stores/selectionStore';
import { portfolio } from '@configs/globals';
import { scaleMeshAtBreakpoint } from '@utils/mesh/meshUtils';
import ControllableCameraRig from '../cameras/ControllableCameraRig';
import Group from './Group';

THREE.ColorManagement.enabled = true;

const SceneBuilder = ({ showMenu }) => {
  const { size } = useThree();
  const setSelection = useSelection((state) => state.setSelection);
  const resetSelection = useSelection((state) => state.reset);

  const [clicked, setClicked] = useState(undefined);
  const selected = clicked ? [clicked] : undefined;

  const [hasNavigated, setHasNavigated] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const touchStartRef = useRef(null);
  const isSwipingRef = useRef(false);

  const { projects } = portfolio;
  const ENABLE_WRAPAROUND = projects.length > 2;

  const ellipseRadius = useMemo(() => scaleMeshAtBreakpoint(size.width) * 150, [size.width]);

  const groupPositions = useMemo(() => {
    const ellipseCurve = new THREE.EllipseCurve(
      0, 0,
      ellipseRadius, ellipseRadius,
      0, 2 * Math.PI, false,
      projects.length % 2 == 0 ? 0 : Math.PI / 2,
    );
    ellipseCurve.closed = true;

    const ellipseCurvePoints = ellipseCurve.getPoints(projects.length);
    ellipseCurvePoints.shift();

    const positionAttribute = new THREE.BufferGeometry()
      .setFromPoints(ellipseCurvePoints)
      .getAttribute('position');

    const positions = [];
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positionAttribute.count; i++) {
      const pt = vertex.fromBufferAttribute(positionAttribute, i);
      positions.push(new THREE.Vector3(pt.x, 0, pt.y));
    }

    return positions;
  }, [ellipseRadius]);

  const handlePointerDown = (e) => {
    isSwipingRef.current = false;
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
  };

  const handlePointerUp = (e) => {
    if (!touchStartRef.current) {
      return;
    }

    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;


    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 500) {
      const direction = deltaX > 0 ? 'right' : 'left';
      let nextIndex;

      if (ENABLE_WRAPAROUND) {
        // Circular navigation
        if (direction === 'right') {
          nextIndex = (currentIndexRef.current + 1) % projects.length;
        } else {
          nextIndex = (currentIndexRef.current - 1 + projects.length) % projects.length;
        }
      } else {
        // Bounded navigation
        nextIndex = direction === 'right'
          ? currentIndexRef.current + 1
          : currentIndexRef.current - 1;

        if (nextIndex < 0 || nextIndex >= projects.length) {
          touchStartRef.current = null;
          return;
        }
      }

      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      setHasNavigated(true);
      setClicked(undefined);
      isSwipingRef.current = true;

      const targetProject = projects[nextIndex];

      setSelection({
        ...targetProject,
        sceneData: {
          description: targetProject.description,
          shortDescription: targetProject.shortDescription,
          ...targetProject.sceneData,
          groupName: targetProject.name,
          position: groupPositions[nextIndex],
        },
      });

      showMenu({ name: targetProject.name });
    } 

    touchStartRef.current = null;
  };

  return (
    <>
      <ControllableCameraRig
        positionVectors={groupPositions}
        target={clicked}
        manualIndex={clicked ? null : (hasNavigated ? currentIndex : null)}
      />
      <EffectComposer
        autoClear={false}
        disableNormalPass
        multisampling={4}
      >
        <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          height={Resizer.AUTO_SIZE}
        />
        <Bloom
          luminanceThreshold={10}
          luminanceSmoothing={1}
          height={200}
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        <Outline
          selection={selected}
          selectionLayer={10}
          blendFunction={BlendFunction.SCREEN} // set to BlendFunction.ALPHA for dark outlines
          patternTexture={null}
          edgeStrength={7} 
          pulseSpeed={0.3}
          visibleEdgeColor={0xffffff}
          hiddenEdgeColor={0xffffff}
          width={Resizer.AUTO_SIZE}
          height={Resizer.AUTO_SIZE}
          kernelSize={KernelSize.LARGE}
          blur={true}
          xRay={true}
        />
      </EffectComposer>
      
      {projects.map((data, index) => {
        const groupProps = {
          ...data,
          sceneData: {
            description: data.description,
            shortDescription: data.shortDescription,
            ...data.sceneData,
            groupName: data.name,
            position: groupPositions[index],
            autoRotateSpeed: index % 2 == 0 ? -0.5 : 0.5,
            isPointerOver: clicked?.name || '',
          },
        };
        return (
          <group
            key={groupProps?.name}
            name={`${groupProps?.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setClicked(e.object);
              setCurrentIndex(index);
              currentIndexRef.current = index;
              setHasNavigated(false);
              showMenu(e.object);
              setSelection(groupProps);
            }}
            onPointerMissed={(e) => {
              e.stopPropagation();
              setClicked(undefined);
              showMenu(undefined);
              resetSelection();
            }}
          >
            <Group {...groupProps.sceneData} />
          </group>
        );
      })}
      <mesh
        position={[0, 0, -1000]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[20000, 20000]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} />
      </mesh>
    </>
  );
};

export default SceneBuilder;