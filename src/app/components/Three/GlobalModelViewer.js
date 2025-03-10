'use client';

import React, { Suspense, useState } from 'react';
import {
  BufferGeometry,
  CatmullRomCurve3,
  ColorManagement,
  EllipseCurve,
  Vector3,
} from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import cameraConfigs from '@/lib/cameraConfigs';
import { portfolio } from '@/lib/globals';
import { CameraRig } from './CameraRig';
import { scaleMeshAtBreakpoint } from '@/lib/utils/meshUtils';
import { Ground } from '@/public/Ground';
import Light from './Light';
import Group from './Group';

ColorManagement.enabled = true;

const SceneBuilder = () => {
  const { size } = useThree();
  const [pointerTarget, setPointerTarget] = useState({
    eventObject: '',
    name: '',
    position: null,
  });
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

  let cameraTarget =
    pointerTarget?.eventObject && pointerTarget?.position
      ? pointerTarget?.position
      : null;

  CameraRig(groupPositions, cameraTarget);
  // const v = new Vector3();
  // const cameraPathCurve = new CatmullRomCurve3(
  //   groupPositions.map((pos) => pos),
  //   true,
  //   'centripetal',
  // );

  // useFrame(({ clock, camera }) => {
  //   let t = clock.elapsedTime;

  //   if (cameraTarget?.x) {
  //     v.set(
  //       cameraTarget.x,
  //       camera.position.y + Math.cos(t / 2),
  //       cameraConfigs.POSITION[2] - 20 + Math.sin(t / 2) * 5,
  //     );

  //     //lerp camera target and position
  //     camera.lookAt(camera.position.lerp(v, 0.06));
  //   } else {
  //     t = clock.getElapsedTime();
  //     let s = (t * 0.03) % 1;
  //     const position = cameraPathCurve.getPoint(s);

  //     v.set(
  //       Math.sin(t / 2) * 5,
  //       position.y + (Math.cos(t / 2) * cameraConfigs.POSITION[1]) / 2,
  //       position.z + cameraConfigs.POSITION[2] + Math.sin(t / 4) * 5,
  //     );
  //     //lerp camera target and position
  //     camera.lookAt(
  //       camera.position.lerp(
  //         groupPositions.reduce(
  //           (closest = new Vector3(), pt = new Vector3()) =>
  //             closest.distanceTo(position) < pt.distanceTo(position)
  //               ? new Vector3(v.x + closest.x, v.y + 10, v.z)
  //               : new Vector3(v.x + pt.x, v.y + 10, v.z),
  //         ),
  //         0.06,
  //       ),
  //     );
  //   } //end else
  //   camera.updateProjectionMatrix();
  // });

  return (
    <>
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
            }}
            onPointerMissed={(e) => {
              setPointerTarget({});
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
            />
            <Group {...groupProps.sceneData} />
          </group>
        );
      })}
    </>
  );
};

export const GlobalModelViewer = () => {
  return (
    <Canvas
      camera={{
        position: [666, 80, 666],
        near: cameraConfigs.NEAR,
        far: cameraConfigs.FAR,
        fov: 50,
      }}
      fallback={<div> Sorry, WebGL is not supported.c</div>}
      orthographic={false}
      shadows
    >
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
        <SceneBuilder />
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
