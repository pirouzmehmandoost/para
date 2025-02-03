"use client";

import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { ColorManagement, MeshPhysicalMaterial } from "three";

ColorManagement.enabled = true;

const Model = (data) => {
  const {
    material: materialProps,
    modelUrl,
    autoRotate,
    scale,
    position = [0, -25, 0],
  } = data;

  const { scene } = useGLTF(modelUrl);

  const material = new MeshPhysicalMaterial(materialProps);

  scene.traverse((child) => {
    if (!!child.isMesh) {
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
      child.scale.set(scale, scale, scale);
      child.position.set(position[0], position[1], position[2]);
    }
  });

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    scene.traverse((child) => {
      if (!!child?.isMesh && autoRotate) {
        child.rotation.set(0, Math.sin(Math.PI / 2) * elapsedTime * 0.3, 0);
      };
    });
  });

  return <primitive castShadow receiveShadow object={scene} />;
};

export default Model;