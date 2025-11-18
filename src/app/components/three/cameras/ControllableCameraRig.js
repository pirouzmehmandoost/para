'use client';

import { useRef, useEffect, useLayoutEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import cameraConfigs from '@configs/cameraConfigs';
import * as THREE from 'three';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

const ControllableCameraRig = ({
  manualIndex = null,
  positionVectors = [],
  target: { position: clickTargetPosition = null } = {},
  targetRefs,
}) => {
  const ref = useRef(undefined);
  const targetIndexRef = useRef(manualIndex ?? 0);
  const traversalDistance = useRef(0);
  const [stopPositions, setStopPositions] = useState([]);
  const [cameraPathCurve, setCameraPathCurve] = useState(null);
  
  const lookAtPosition = useRef(new THREE.Vector3());

  useLayoutEffect(() => {
    if (manualIndex !== null) targetIndexRef.current = manualIndex; 
  }, [manualIndex]);

  useEffect(()=> {
    const positions = targetRefs.map((meshes, i) => {
      if (!meshes || meshes.length === 0) return positionVectors[i];
  
      const box = new THREE.Box3();
      const center = new THREE.Vector3();
      const sum = new THREE.Vector3();
      let count = 0;
  
      meshes.forEach((mesh) => {
        if (!mesh) return;
        mesh.updateWorldMatrix(true, true);
        box.setFromObject(mesh).getCenter(center);
        sum.add(center);
        count += 1;
      });
  
      return count > 0 ? sum.divideScalar(count) : positionVectors[i];
    });

    setStopPositions(positions);
    setCameraPathCurve(new THREE.CatmullRomCurve3(positions, true, 'centripetal'));
  }, [targetRefs, positionVectors]);

  useFrame(({ clock, camera }, delta) => {
    if (!cameraPathCurve || stopPositions.length === 0) return;

    let elapsedTime = clock.elapsedTime;
    const cos =   5 * Math.cos(elapsedTime);
    const sin = 3 * Math.sin(elapsedTime);
    let pointOnCurve = (elapsedTime * 0.03);

    if (clickTargetPosition?.x) {
      // traversalDistance.current = (traversalDistance.current + pointOnCurve)/(stopPositions.length-1);
      const nextPoint = stopPositions.reduce((closest, pt) => 
        closest.distanceTo(clickTargetPosition) < pt.distanceTo(clickTargetPosition) ? closest : pt);

      lookAtPosition.current.set(
        nextPoint.x + sin,
        nextPoint.y + cos,
        nextPoint.z + cameraConfigs.POSITION[2] + cos
      );
      
      easing.damp3(camera.position, lookAtPosition.current, 0.8, delta);

      // const clickTargetIndex = cameraPathCurve.points.findIndex((closest) => 
      //   closest.distanceTo(clickTargetPosition) <= 1.0);

      // traversalDistance.current = clickTargetIndex/(stopPositions.length-1); 
      // targetIndexRef.current = clickTargetIndex;
    }
    else { 
      if (manualIndex !== null && stopPositions[targetIndexRef.current]) {
        const segmentLength = manualIndex/(stopPositions.length-1);
        const nextPoint = stopPositions[targetIndexRef.current];;

        targetIndexRef.current = manualIndex;
        traversalDistance.current = (segmentLength + (pointOnCurve%1))/(stopPositions.length-1)

        lookAtPosition.current.set(
          nextPoint.x + sin,
          nextPoint.y + cos,
          nextPoint.z + cameraConfigs.POSITION[2] + cos
        );

        easing.damp3(camera.position, lookAtPosition.current, 0.8, delta);

        // if (cameraPathCurve.getPointAt(traversalDistance.current).distanceTo(cameraPathCurve.getPointAt(segmentLength)) <= 10.0) {
        //   manualIndex = null;
        //   targetIndexRef.current = 0;
        // };
      }
      else {
        traversalDistance.current = (traversalDistance.current + pointOnCurve)/(stopPositions.length-1);
        const position = cameraPathCurve.getPoint(traversalDistance.current); 
        const nextPoint = stopPositions.reduce((closest, pt) => 
          closest.distanceTo(position) < pt.distanceTo(position) ? closest : pt);

        lookAtPosition.current.set(
          nextPoint.x + sin,
          nextPoint.y + cos,
          nextPoint.z + cameraConfigs.POSITION[2] + cos
        );
        
        camera.lookAt(camera.position.lerp(lookAtPosition.current, 0.02));
      }
    }
  });

  return <perspectiveCamera ref={ref} />;
};


// export const ControllableCameraRig2 = (
//   { 
//     manualIndex = null,
//     positionVectors = [],
//     target: { position: clickTargetPosition = null } = {},
//     targetRefs,
//   }) => {
//   const ref = useRef(undefined);
//   const targetIndexRef = useRef(manualIndex ?? 0);
//   // const traversalDistance = useRef(0);
//   const v = new THREE.Vector3();

//   const stopPositions = useMemo(()=> targetRefs?.map((mesh, index) => {
//     const temp = new THREE.Vector3();
//     const nextStop = mesh? mesh?.getWorldPosition(temp) : positionVectors[index];
//     return nextStop;
//   }),[targetRefs]);

//   const cameraPathCurve = useMemo(()=> new THREE.CatmullRomCurve3(stopPositions.map((pos) => pos),true, 'centripetal'), [positionVectors, targetRefs]);

//   useEffect(() => {
//     if (manualIndex !== null) {
//       targetIndexRef.current = manualIndex;
//     }
//   }, [manualIndex]);

//   useFrame(({ clock, camera }, delta) => {

//     if (clickTargetPosition?.x) {
//       v.set(
//         clickTargetPosition.x +  Math.sin(clock.elapsedTime),
//         clickTargetPosition.y + 20 + Math.cos(clock.elapsedTime),
//         clickTargetPosition.z + cameraConfigs.POSITION[2]
//       );
//       easing.damp3(camera.position, v, 0.8, delta);

//       // const what = cameraPathCurve.points.reduce((closest, pt) => closest.distanceTo(clickTargetPosition) < pt.distanceTo(clickTargetPosition) ? closest : pt)
//       // const clickTargetIndex = cameraPathCurve.points.findIndex((closest) => closest.distanceTo(what) <= 1.0);
//       // targetIndexRef.current = clickTargetIndex;
//     } 
//     else if (manualIndex !== null) {
//       const targetPos = stopPositions[targetIndexRef.current];

//       if (targetPos) {
//         // let s = (clock.elapsedTime * 0.05) % 1;
//         // targetIndexRef.current = manualIndex;
//         // traversalDistance.current = (s)/(stopPositions.length-1);
//         // const end = Math.abs(0.5 - traversalDistance.current)
//         v.set(
//           targetPos.x + Math.sin(clock.elapsedTime),
//           targetPos.y + 20 + cameraConfigs.POSITION[1] + Math.cos(clock.elapsedTime), 
//           targetPos.z + cameraConfigs.POSITION[2]
//         );
//         easing.damp3(camera.position, v, 0.8, delta);

//         // if (camera.position.equals(v) && end < 0.1) {

//         //   let nextPoint = stopPositions.reduce((closest, pt) => closest.distanceTo(position) < pt.distanceTo(position) ? closest : pt);
//         //   manualIndex =  null;
//         //   targetIndexRef.current = stopPositions.findIndex(x => x.distanceTo(nextPoint) < 0.1);
//         // }
//       };
//     }
//     else {
//       let s = (clock.elapsedTime * 0.03) % 1;
//       const position = cameraPathCurve.getPoint(s);
//       let nextPoint = stopPositions.reduce((closest, pt) => closest.distanceTo(position) < pt.distanceTo(position) ? closest : pt);
//       targetIndexRef.current = stopPositions.findIndex(x => x.distanceTo(nextPoint) < 0.1);

//       v.set(
//         nextPoint.x + Math.sin(clock.elapsedTime),
//         nextPoint.y + 20 + cameraConfigs.POSITION[1] + Math.cos(clock.elapsedTime), 
//         nextPoint.z + cameraConfigs.POSITION[2],
//       );
//       camera.lookAt(camera.position.lerp(v, 0.05));
//     }
//   });

//   return <perspectiveCamera ref={ref} />;
// };




  // const cameraTravelPaths = useMemo(() => {
  //   const destinationVectors = [];
  //   const travelCurves = [];
  //   for (let i = 0; i < stopPositions.length; i++) {
  //     const pt1 = cameraPathCurve.getPoint(i/stopPositions.length-1);
  //     const pt2 = cameraPathCurve.getPoint(i+1/stopPositions.length-1);
  //     destinationVectors.push([pt1, pt2]);
  //   }

  //   for (let i = 0; i < destinationVectors.length; i++) {
  //     const c =  new THREE.CatmullRomCurve3(destinationVectors[i],true, 'centripetal');
  //     travelCurves.push(c);
  //   }

  //   return travelCurves;
  // }, [targetRefs, cameraPathCurve, positionVectors]);

  export default ControllableCameraRig;
