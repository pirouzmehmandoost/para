'use client';

import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

const SimpleCameraRig = (data) => {
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

  export default SimpleCameraRig;