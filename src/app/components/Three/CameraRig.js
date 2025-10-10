'use client';

import { useRef } from 'react';
import { CatmullRomCurve3, Vector3 } from 'three';
import { easing } from 'maath';
import { useFrame, useThree } from '@react-three/fiber';
import cameraConfigs from '@/lib/cameraConfigs';

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
  });
};

export const CameraRig2 = ({ positionVectors = [], target = {} }) => {
  const { position: targetPosition = null } = target;
  const ref = useRef(undefined);
  const v = new Vector3();
  const cameraPathCurve = new CatmullRomCurve3(
    positionVectors.map((pos) => pos),
    true,
    'centripetal',
  );

  useFrame(({ clock, camera }, delta) => {
    let t = clock.elapsedTime;

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
      //lerp camera target and position
      camera.lookAt(camera.position.lerp(v, 0.06));
    }
  });

  return <perspectiveCamera ref={ref} />;
};