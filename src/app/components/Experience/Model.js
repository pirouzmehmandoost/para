"use client";

import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { ColorManagement, MeshPhysicalMaterial, Vector3 } from "three";

ColorManagement.enabled = true;

const Model = (data) => {
  const {
    material: materialProps,
    modelUrl,
    autoRotate,
    scale,
    position = new Vector3(0, -25, 0)
  } = data;

  const { scene } = useGLTF(modelUrl);

  scene.traverse((child) => {
    if (!!child.isMesh) {

      console.log(child)
      child.material = new MeshPhysicalMaterial(materialProps);;
      child.castShadow = true;
      child.receiveShadow = true;
      child.position.copy(position);
      child.scale.set(scale, scale, scale);

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