"use client";

import { CatmullRomCurve3, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import cameraConfigs from "../../../lib/cameraConfigs";

// export const SimpleCameraRig = (data, { v = new Vector3() }) => {
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

export const CameraRig = (positionVectors, targetPosition) => {
  // export const CameraRig = ({positionVectors=[], targetPosition}) => {
  const v = new Vector3();
  const cameraPathCurve = new CatmullRomCurve3(
    positionVectors.map((pos) => pos),
    true,
    "centripetal",
  );

  return useFrame(({ clock, camera }) => {
    //   useFrame(({ clock, camera }) => {
    camera.updateProjectionMatrix(); //likely unnecessary at beggining of frame loop
    let t = clock.elapsedTime;

    if (targetPosition?.x) {
      v.set(
        targetPosition.x,
        camera.position.y + Math.cos(t / 2),
        cameraConfigs.POSITION[2] - 20 + Math.sin(t / 2) * 5,
      );

      //lerp camera target and position
      camera.lookAt(camera.position.lerp(v, 0.06));
    } else {
      //Takes about 15 seconds for the camera to lookAt/move between positionVectors.
      //Position is the vector3 value of a vector2 point on the curve. curve.getPoint(s) => Vector3(x,y,0)
      //When the distance betw position & positionVector[i] > distanceTo(position, positionVector[i+1])
      //the camera lerps from positionVector[i] to positionVector[i+1].
      t = clock.getElapsedTime();
      let s = (t * 0.03) % 1;
      const position = cameraPathCurve.getPoint(s);

      v.set(
        Math.sin(t / 2) * 5,
        position.y + (Math.cos(t / 2) * cameraConfigs.POSITION[1]) / 2,
        position.z + cameraConfigs.POSITION[2] + Math.sin(t / 4) * 5,
      );
      //lerp camera target and position
      camera.lookAt(
        camera.position.lerp(
          positionVectors.reduce(
            (closest = new Vector3(), pt = new Vector3()) =>
              closest.distanceTo(position) < pt.distanceTo(position)
                ? new Vector3(v.x + closest.x, v.y, v.z)
                : new Vector3(v.x + pt.x, v.y, v.z),
          ),
          0.06,
        ),
      );
    } //end else
    camera.updateProjectionMatrix();
  });

  //   return <perspectiveCamera ref={camRef}/>
};
