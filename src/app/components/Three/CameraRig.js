"use client";
import { CatmullRomCurve3, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import cameraConfigs from "../../../lib/cameraConfigs";

const CameraRig = (data, { v = new Vector3() }) => {
  const { cameraPosition = [0, 10, 180] } = data;

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
  });
};

export const SetCameraRig = (positionVectors, targetPosition) => {
  const cameraPathCurve = new CatmullRomCurve3(
    positionVectors.map((pos) => pos),
    true,
    "centripetal",
  );
  return useFrame(({ clock, camera }) => {
    const v = new Vector3();
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
      t = clock.getElapsedTime();

      let s = (t * 0.03) % 1; //around 15 seconds
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
    }
  });
};

// export const setCameraRig = (positions, pointerPosition = null) => {
//   const cameraPathCurve = new CatmullRomCurve3(
//     positions.map((handle) => handle),
//     true,
//     "centripetal",
//   );
//   cameraPathCurve.closed = true;

//   let i = 0;

//   return useFrame(({ clock, camera }) => {
//     // let t = clock.getElapsedTime();
//     // let s = (t * 0.03) % 1;

//     // const v = new Vector3(
//     //   position.x,
//     //   position.y + cameraConfigs.POSITION[1],
//     //   position.z + cameraConfigs.POSITION[2],
//     // );
//     const v = new Vector3();

//     if (i <= 2) {
//       console.log("camera : ", camera);
//     }
//     i++;

//     if (pointerPosition) {
//       let t = clock.getElapsedTime();

//       camera.position.lerp(
//         v.set(0, Math.cos(t / 2) * 20, (Math.sin(t / 2) + 1) * 2),
//         0.05,
//       );
//       camera.lookAt(pointerPosition);
//     } else {
//       let t = clock.getElapsedTime();

//       let s = (t * 0.03) % 1;
//       const position = cameraPathCurve.getPoint(s);

//       v.set(
//         position.x,
//         position.y + cameraConfigs.POSITION[1],
//         position.z + cameraConfigs.POSITION[2],
//       );

//       camera.lookAt(
//         camera.position.lerp(
//           positions.reduce((acc = new Vector3(), el = new Vector3()) =>
//             Math.abs(acc.distanceTo(position) < el.distanceTo(position))
//               ? new Vector3(acc.x, v.y, v.z)
//               : new Vector3(el.x, v.y, v.z),
//           ),
//           0.055,
//         ),
//       );
//     }
//   });
// };

export default CameraRig;
