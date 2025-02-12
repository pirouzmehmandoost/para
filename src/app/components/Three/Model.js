"use client";

import { ColorManagement, MeshPhysicalMaterial, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Select, } from "@react-three/postprocessing"

ColorManagement.enabled = true;

const Model = (data) => {
  const {
    material: materialProps,
    modelUrl,
    autoRotate,
    autoRotateSpeed,
    scale,
    position = new Vector3(0, -25, 0),
    isPointerOver = '',
  } = data;

  const { scene } = useGLTF(modelUrl);

  scene.traverse((child) => {
    if (!!child.isMesh) {
      child.material = new MeshPhysicalMaterial(materialProps);;
      child.castShadow = true;
      child.receiveShadow = true;
      child.position.copy(position);
      child.scale.set(scale, scale, scale);
    };
  });

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    scene.traverse((child) => {
      if (!!child?.isMesh && autoRotate) {
        child.rotation.set(0, Math.sin(Math.PI / 2) * elapsedTime * 0.3 * autoRotateSpeed, 0);
      };
    });
  });

  return <Select name={scene.name} enabled={isPointerOver == scene.children[0].name}> <primitive castShadow receiveShadow object={scene} /> </Select>
};

export default Model;