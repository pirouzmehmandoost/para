'use client';

import { Suspense, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, AdaptiveDpr } from '@react-three/drei';
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
import cameraConfigs from '@configs/cameraConfigs';
import { portfolio } from '@configs/globals';
import { scaleMeshAtBreakpoint } from '@utils/mesh/meshUtils';
import { CameraRig2 } from '../cameras/CameraRig';
import { Ground } from '@public/Ground';
import Group from './Group';

THREE.ColorManagement.enabled = true;

const SceneBuilder = ({ showMenu }) => {
  const setSelection = useSelection((state) => state.setSelection);
  const resetSelection = useSelection((state) => state.reset);
  const { size } = useThree();
  const [clicked, setClicked] = useState(undefined);
  const selected = clicked ? [clicked] : undefined;
  const { projects } = portfolio;

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

  return (
    <>
      <CameraRig2 positionVectors={groupPositions} target={clicked} />
      <EffectComposer autoClear={false} disableNormalPass multisampling={4}>
        <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          height={Resizer.AUTO_SIZE} // render height
        />
        <Bloom luminanceThreshold={10} luminanceSmoothing={1} height={200} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        <Outline
          selection={selected} // selection of objects that will be outlined
          selectionLayer={10} // selection layer
          blendFunction={BlendFunction.SCREEN} // set this to BlendFunction.ALPHA for dark outlines
          patternTexture={null} // a pattern texture
          edgeStrength={7} // the edge strength
          pulseSpeed={0.3} // a pulse speed. A value of zero disables the pulse effect
          visibleEdgeColor={0xffffff} // the color of visible edges
          hiddenEdgeColor={0xffffff} // the color of hidden edges
          width={Resizer.AUTO_SIZE} // render width
          height={Resizer.AUTO_SIZE} // render height
          kernelSize={KernelSize.LARGE} // blur kernel size
          blur={true} // whether the outline should be blurred
          xRay={true} // indicates whether X-Ray outlines are enabled
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
            // isPointerOver: pointerTarget.name,
            isPointerOver: clicked?.name || '',
          },
        };
        return (
          <group
            key={groupProps?.name}
            name={`${groupProps?.name}`}
            onClick={(e) => {
              setClicked(e.object);
              showMenu(e.object);
              setSelection(groupProps);
            }}
            onPointerMissed={(e) => {
              e.stopPropagation();
              setClicked(undefined);
              showMenu(undefined);
              resetSelection();
            }}
            // onPointerOver={(e) => {
            //   if (e.pointerType === "mouse") {
            //     //if a model is highlighted via onClick, do not invoke handler.
            //     //otherwise pointerTarget will set to a new value if mouse hovers over nearby meshes.
            //     if (!currentSelection) {
            //       setPointerTarget({
            //         eventObject: e.eventObject.name,
            //         name: e.object.name,
            //         position: e.object.position,
            //       });
            //     }
            //   } else {
            //     //mobile
            //     handleUpdateSelection(groupProps);
            //     setPointerTarget({
            //       eventObject: e.eventObject.name,
            //       name: e.object.name,
            //       position: e.object.position,
            //     });
            //   }
            // }}
            // onPointerOut={(e) => {
            //   //don't handle this event on mobile devices.
            //   if (e.pointerType === "mouse") {
            //     if (!currentSelection) {
            //       setPointerTarget({});
            //     }
            //   }
            // }}
          >
            {/* 
            shader error occurs when with these lights are used along with SoftShadow
            <Light
              position={[
                groupPositions[index].x,
                groupPositions[index].y + 900,
                groupPositions[index].z + 50,
              ]}
              intensity={1}
              target={[
                groupPositions[index].x,
                groupPositions[index].y,
                groupPositions[index].z,
              ]}
            /> */}
            <Group {...groupProps.sceneData} />
          </group>
        );
      })}
    </>
  );
};

export const GlobalModelViewer = ({ showMenu }) => {
  return (
    <Canvas
      camera={{
        // position: cameraConfigs.POSITION,
        position: [666, 80, 666],
        near: cameraConfigs.NEAR,
        far: cameraConfigs.FAR,
        fov: 50,
      }}
      fallback={<div> Sorry, WebGL is not supported.c</div>}
      orthographic={false}
      shadows
    >
      <AdaptiveDpr pixelated />
      <Environment shadows files="./studio_small_08_4k.exr" />
      <color args={['#bcbcbc']} attach="background" />
      <fog attach="fog" density={0.006} color="#bcbcbc" near={150} far={280} />
      <directionalLight
        castShadow={true}
        position={[0, 80, -40]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        intensity={1}
        shadow-camera-near={0.05}
        shadow-camera-far={1000}
        shadow-bias={-0.001}
        shadow-camera-top={1500}
        shadow-camera-bottom={-1500}
        shadow-camera-left={-1500}
        shadow-camera-right={1500}
      />
      <directionalLight
        castShadow={true}
        position={[0, 100, 80]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        intensity={1}
        shadow-camera-near={0.05}
        shadow-camera-far={1000}
        shadow-bias={-0.001}
        shadow-camera-top={1500}
        shadow-camera-bottom={-1500}
        shadow-camera-left={-1500}
        shadow-camera-right={1500}
      />
      <Suspense>
        <SceneBuilder showMenu={showMenu} />
      </Suspense>
      <Ground
        position={[-50, -85, 20]}
        scale={[1.4, 1, 1.4]}
        rotation={Math.PI / 7}
      />
    </Canvas>
  );
};

export default GlobalModelViewer;
