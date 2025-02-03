"use client";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

THREE.ColorManagement.enabled = true;

const CameraRig = (data, { v = new THREE.Vector3() }) => {
  const { cameraPosition } = data;

  return useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;

    camera.position.lerp(
      v.set(
        0,
        Math.cos(t / 2) * 100,
        (Math.sin(t / 2) + 1) * cameraPosition[2],
      ),
      0.06
    );
    camera.lookAt(0, 0, 0);
  });
};

export default CameraRig; 