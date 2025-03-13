'use client';

import React, { Suspense, useState, useRef } from 'react';
import { BufferGeometry, EllipseCurve, Vector3 } from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Stats, AdaptiveDpr } from '@react-three/drei';
import cameraConfigs from '@/lib/cameraConfigs';
import { portfolio } from '@/lib/globals';
import { scaleMeshAtBreakpoint } from '@/lib/utils/meshUtils';
// import AdaptivePixelRatio from './AdaptivePixelRatio';
import { CameraRig2 } from './CameraRig';
// import { Ground } from '@/public/Ground';
import Group from './Group';
// import Light from './Light';
import * as THREE from 'three';
import { BlendFunction, Resizer, KernelSize } from 'postprocessing';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
  Outline,
} from '@react-three/postprocessing';

THREE.ColorManagement.enabled = true;

const SceneBuilder = ({ showMenu }) => {
  const selectedRef = useRef();
  const { size, scene } = useThree();
  const [clicked, onSelect] = useState(null);
  const selected = clicked ? [clicked] : undefined;

  const [pointerTarget, setPointerTarget] = useState({
    eventObject: '',
    name: '',
    position: null,
  });

  if (
    pointerTarget?.name?.length > 0 &&
    scene.getObjectByName(pointerTarget.name)
  ) {
    selectedRef.current = scene.getObjectByName(pointerTarget.name);
  }

  const { projects } = portfolio;
  const groupPositions = [];
  const ellipseRadius = scaleMeshAtBreakpoint(size.width) * 150;

  const ellipseCurve = new EllipseCurve(
    0,
    0,
    ellipseRadius,
    ellipseRadius,
    0,
    2 * Math.PI,
    false,
    projects.length % 2 == 0 ? 0 : Math.PI / 2,
  );
  ellipseCurve.closed = true;

  const ellipseCurvePoints = ellipseCurve.getPoints(projects.length);
  // getPoints always returns one additional point.
  ellipseCurvePoints.shift();

  const positionAttribute = new BufferGeometry()
    .setFromPoints(ellipseCurvePoints)
    .getAttribute('position');

  const vertex = new Vector3();
  for (let i = 0; i < positionAttribute.count; i++) {
    const pt = vertex.fromBufferAttribute(positionAttribute, i);
    groupPositions.push(new Vector3(pt.x, 0, pt.y));
  }

  // let cameraTarget =
  //   pointerTarget?.eventObject && pointerTarget?.position
  //     ? pointerTarget
  //     : null;

  return (
    <>
      <CameraRig2 positionVectors={groupPositions} target={pointerTarget} />
      <EffectComposer autoClear={false} disableNormalPass multisampling={8}>
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
          // selectionLayer={10} // selection layer
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
          onSelect: onSelect,
          ...data,
          sceneData: {
            description: data.description,
            shortDescription: data.shortDescription,
            ...data.sceneData,
            groupName: data.name,
            position: groupPositions[index],
            autoRotateSpeed: index % 2 == 0 ? -0.5 : 0.5,
            isPointerOver: pointerTarget.name,
          },
        };
        return (
          <group
            key={groupProps?.name}
            name={`${groupProps?.name}`}
            onClick={(e) => {
              setPointerTarget({
                eventObject: e.eventObject.name,
                name: e.object.name,
                position: e.object.position,
              });
              onSelect(selectedRef);
              showMenu(selectedRef);
              // console.log('what is the current ref? ', selectedRef);
            }}
            onPointerMissed={(e) => {
              setPointerTarget({});
              onSelect(undefined);
              showMenu(undefined);
              e.stopPropagation();
              // selectedRef.current = null;
            }}
            // onPointerOver={(e) => {
            //   console.log(
            //     "%cOnpointerOver",
            //     "color:yellow; background:magenta;",
            //     e,
            //   );

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
            //   console.log("%cOnpointerOut", "color:green;", e);
            //   //don't handle this event on mobile devices.
            //   if (e.pointerType === "mouse") {
            //     if (!currentSelection) {
            //       setPointerTarget({});
            //     }
            //   }
            // }}
          >
            {/* <Light
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

            <Group
              // onSelect={onSelect}
              ref={selectedRef}
              {...groupProps.sceneData}
            />
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
      <Stats />
      {/* <SoftShadows samples={10} size={6} /> */}
      <AdaptiveDpr pixelated />

      {/* <AdaptivePixelRatio /> */}
      <Environment shadows files="./studio_small_08_4k.exr" />
      {/* <Ground
        position={[-50, 150, 20]}
        scale={[1.4, 1, 1.4]}
        rotation={-Math.PI / 4}
      /> */}
      <color args={['#bcbcbc']} attach="background" />
      <fog attach="fog" density={0.006} color="#bcbcbc" near={150} far={280} />
      <directionalLight
        castShadow={true}
        position={[0, 80, -40]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
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
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
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
      {/* <Ground
        position={[-50, -85, 20]}
        scale={[1.4, 1, 1.4]}
        rotation={Math.PI / 7}
      /> */}
    </Canvas>
  );
};

export default GlobalModelViewer;
