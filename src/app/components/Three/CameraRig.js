'use client';
import { useEffect, useRef, useState } from 'react';
import { CatmullRomCurve3, Vector3 } from 'three';
import { useFrame, useThree, extend } from '@react-three/fiber';
import cameraConfigs from '@/lib/cameraConfigs';
import { easing, geometry } from 'maath';
import {
  useCursor,
  MeshPortalMaterial,
  CameraControls,
  Gltf,
  Text,
  Preload,
} from '@react-three/drei';

export const SimpleCameraRig = (data) => {
  const { cameraPosition = [0, 10, 180] } = data;
  const v = new Vector3();

  return useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;

    camera.position.lerp(
      v.set(
        0,
        Math.cos(t / 2) * 100,
        (Math.sin(t / 2) + 1) * cameraPosition[2],
      ),
      0.06,
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  });
};

function Rig({
  position = new THREE.Vector3(0, 0, 2),
  focus = new THREE.Vector3(0, 0, 0),
}) {
  const { controls, scene } = useThree();
  const [, params] = useRoute('/item/:id');
  useEffect(() => {
    const active = scene.getObjectByName(params?.id);
    if (active) {
      active.parent.localToWorld(position.set(0, 0.5, 0.25));
      active.parent.localToWorld(focus.set(0, 0, -2));
    }
    controls?.setLookAt(...position.toArray(), ...focus.toArray(), true);
  });
  return (
    <CameraControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
  );
}

// export const CameraRig2 = (positionVectors, targetPosition) => {
export const CameraRig2 = ({ positionVectors = [], target }) => {
  const {
    name = '',
    eventObject = '',
    position: targetPosition = null,
  } = target;
  const { controls, scene, camera: cam } = useThree();

  const ref = useRef(undefined);
  const v = new Vector3();
  const cameraPathCurve = new CatmullRomCurve3(
    positionVectors.map((pos) => pos),
    true,
    'centripetal',
  );

  // useEffect(() => {
  //   const targ = scene.getObjectByName(name);

  //   console.log('CameraRig useEffect.scene: ', scene);
  //   console.log('ref: ', ref?.current);
  //   // console.log(
  //   //   'name of target: ',
  //   //   name,
  //   //   'target object:',
  //   //   scene.getObjectByName(name),
  //   // );
  //   // if (ref?.current) {
  //   if (targ.type !== 'Mesh') {
  //     const firstTarg = scene.getObjectByName('bag_88');
  //     console.log('whats this', firstTarg);

  //     // controls?.lerpLookAt(...positionVectors[0].toArray());
  //     ref?.current.fitToBox(firstTarg);
  //     // controls?.setLookAt(
  //     //   ...cam.position.toArray(),
  //     //   ...targetPosition.toArray(),
  //     //   true,
  //     // );
  //     // targ.parent.localToWorld(cam.position.set(0, 10, 0));
  //     // targ.parent.localToWorld(targetPosition.set(0, 0, -2));
  //     // controls?.setLookAt(
  //     //   ...cam.position.toArray(),
  //     //   ...targetPosition.toArray(),
  //     //   true,
  //     // );
  //   } else {
  //     console.log('targ is now a mesh: ', targ);
  //     ref?.current?.fitToBox(targ);
  //     // ref.current.lerpLookAt(...positionVectors[0].toArray());
  //   }
  //   // }
  //   // console.log('and controls: ', controls);
  //   // console.log('what is this: ', cam.position.toArray());
  //   // controls?.setLookAt(...cam.position.toArray(), ...[0, 20, 10], true);
  //   // console.log('what is this: ', cam.position.toArray());
  //   // const active = scene.getObjectByName(params?.id);
  //   // if (active) {
  //   //   active.parent.localToWorld(position.set(0, 0.5, 0.25));
  //   //   active.parent.localToWorld(focus.set(0, 0, -2));
  //   // }
  //   // controls?.setLookAt(...position.toArray(), ...focus.toArray(), true);
  // });

  useFrame(({ clock, camera }, delta) => {
    // camera.updateProjectionMatrix(); //likely unnecessary at beggining of frame loop
    let t = clock.elapsedTime;

    if (targetPosition?.x) {
      v.set(
        targetPosition.x,
        camera.position.y, //+ Math.cos(t / 2),
        cameraConfigs.POSITION[2] - 20, // + Math.sin(t / 2) * 5,
      );

      const p = [
        targetPosition.x,
        camera.position.y,
        cameraConfigs.POSITION[2] - 20,
      ];

      //lerp camera target and position
      // camera.lookAt(camera.position.lerp(v, 0.06));

      easing.damp3(camera.position, p, 0.8, delta);

      // easing.damp3(camera.position, p, 0.25, delta);
      // camera.lookAt(targetPosition);
      // controls.moveTo(...[0, 10, 80], true);
      // controls?.setLookAt(...camera.position.toArray(), ...p, true);

      camera.updateProjectionMatrix();
    } else {
      let s = (clock.elapsedTime * 0.03) % 1;
      const position = cameraPathCurve.getPoint(s);

      const nextPoint = positionVectors.reduce((closest, pt) =>
        closest.distanceTo(position) < pt.distanceTo(position)
          ? closest.x
          : pt.x,
      );

      v.set(
        nextPoint + Math.sin(clock.elapsedTime),
        position.y + cameraConfigs.POSITION[1] + Math.cos(clock.elapsedTime), //+ (Math.cos(t / 2) * cameraConfigs.POSITION[1]) / 2,
        position.z + cameraConfigs.POSITION[2], //+ Math.sin(t / 4) * 5,
      );

      const j = [
        nextPoint + Math.sin(clock.elapsedTime),
        position.y + cameraConfigs.POSITION[1] + Math.cos(clock.elapsedTime), //+ (Math.cos(t / 2) * cameraConfigs.POSITION[1]) / 2,
        position.z + cameraConfigs.POSITION[2] + Math.sin(clock.elapsedTime), //+ Math.sin(t / 4) * 5,]
      ];

      // controls?.setLookAt(...camera.position.toArray(), ...j, true);

      //lerp camera target and position
      // camera.lookAt(camera.position.lerp(v, 0.06));

      easing.damp3(camera.position, j, 0.8, delta);
      // camera.lookAt(s);

      // easing.dampLookAt(camera.position, j, 0.25, delta);
      // camera.lookAt(easing.damp3(camera.position, j, 0.25, delta));

      camera.updateProjectionMatrix();
    }
    //end else
  });
  // return (
  //   <CameraControls
  //     makeDefault
  //     enabled={true}
  //     ref={ref}
  //     minPolarAngle={0}
  //     maxPolarAngle={Math.PI / 2}
  //   />
  // );

  return <perspectiveCamera ref={ref} />;
};

// export const CameraRig = (positionVectors, targetPosition) => {
//   // export const CameraRig = ({positionVectors=[], targetPosition}) => {
//   const v = new Vector3();
//   const cameraPathCurve = new CatmullRomCurve3(
//     positionVectors.map((pos) => pos),
//     true,
//     'centripetal',
//   );

//   return useFrame(({ clock, camera }) => {
//     camera.updateProjectionMatrix(); //likely unnecessary at beggining of frame loop
//     let t = clock.elapsedTime;

//     if (targetPosition?.x) {
//       v.set(
//         targetPosition.x,
//         camera.position.y + Math.cos(t / 2),
//         cameraConfigs.POSITION[2] - 20 + Math.sin(t / 2) * 5,
//       );

//       //lerp camera target and position
//       camera.lookAt(camera.position.lerp(v, 0.06));
//     } else {
//       //Takes about 15 seconds for the camera to lookAt/move between positionVectors.
//       //Position is the vector3 value of a vector2 point on the curve. curve.getPoint(s) => Vector3(x,y,0)
//       //When the distance betw position & positionVector[i] > distanceTo(position, positionVector[i+1])
//       //the camera lerps from positionVector[i] to positionVector[i+1].
//       t = clock.getElapsedTime();
//       let s = (t * 0.03) % 1;
//       const position = cameraPathCurve.getPoint(s);

//       v.set(
//         Math.sin(t / 2) * 5,
//         position.y + (Math.cos(t / 2) * cameraConfigs.POSITION[1]) / 2,
//         position.z + cameraConfigs.POSITION[2] + Math.sin(t / 4) * 5,
//       );
//       //lerp camera target and position
//       camera.lookAt(
//         camera.position.lerp(
//           positionVectors.reduce(
//             (closest = new Vector3(), pt = new Vector3()) =>
//               closest.distanceTo(position) < pt.distanceTo(position)
//                 ? new Vector3(v.x + closest.x, v.y + 10, v.z)
//                 : new Vector3(v.x + pt.x, v.y + 10, v.z),
//           ),
//           0.06,
//         ),
//       );
//     } //end else
//     camera.updateProjectionMatrix();
//   });
//   //   return <perspectiveCamera ref={camRef}/>
// };
