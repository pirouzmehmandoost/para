'use client';

import { useRef, useEffect } from 'react';
import { CatmullRomCurve3, Vector3 } from 'three';
import { easing } from 'maath';
import { useFrame } from '@react-three/fiber';
import cameraConfigs from '@configs/cameraConfigs';

const ControllableCameraRig = ({ positionVectors = [], target = {}, manualIndex = null }) => {
  const { position: targetPosition = null } = target;
  const ref = useRef(undefined);
  const targetIndexRef = useRef(manualIndex ?? 0);

  const v = new Vector3();
  const cameraPathCurve = new CatmullRomCurve3(
    positionVectors.map((pos) => pos),
    true,
    'centripetal',
  );

  useEffect(() => {
    if (manualIndex !== null) {
      targetIndexRef.current = manualIndex;
    }
  }, [manualIndex]);

  useFrame(({ clock, camera }, delta) => {
    // let t = clock.elapsedTime; //unused, keeping for reference.

    if (targetPosition?.x) {
      v.set(
        targetPosition.x,
        camera.position.y, // + Math.cos(t / 2),
        cameraConfigs.POSITION[2] - 20, // + Math.sin(t / 2) * 5,
      );

      const p = [
        targetPosition.x,
        camera.position.y,
        cameraConfigs.POSITION[2] - 20,
      ];

      easing.damp3(camera.position, p, 0.8, delta);
    } 
    else if (manualIndex !== null) {
    // Manual navigation mode
      const targetPos = positionVectors[targetIndexRef.current];
      if (targetPos) {
        easing.damp3(camera.position,
          [
            targetPos.x,
            cameraConfigs.POSITION[1],
            cameraConfigs.POSITION[2]
          ],
          0.8,
          delta
        );
      }
    }
    else {
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
      //lerp camera target and position
      camera.lookAt(camera.position.lerp(v, 0.06));
    }
  });

  return <perspectiveCamera ref={ref} />;
};

export default ControllableCameraRig;