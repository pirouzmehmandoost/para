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

// Should be importing Model.js
const mModel = (data) => {
  const {
    colorCodes: {
      defaultColor: {
        material: materialProps,
      }
    },
    modelUrl,
    autoUpdateMaterial,
    autoRotate,
    scale,
    position = [0, -25, 0],
  } = data;

  const { size } = useThree();
  const groupRef = useRef();
  const { scene } = useGLTF(modelUrl);
  const material = new MeshPhysicalMaterial(materialProps);
  const groupScale = scaleMeshAtBreakpoint(size.width) * scale;

  scene.traverse((child) => {
    if (!!child.isMesh) {
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
      child.scale.set(groupScale, groupScale, groupScale);
      child.position.set(position[0], position[1], position[2]);
    }
  });

  // update rotation and material properties
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    if (autoRotate || autoUpdateMaterial) {
      scene.traverse((child) => {
        if (!!child?.isMesh && autoRotate) {
          child.rotation.set(0, Math.sin(Math.PI / 4) * elapsedTime * 0.25, 0);
        };
        if (!!child?.material && autoUpdateMaterial) {
          const color = new Color("black").lerp(
            new Color("white"),
            Math.sin(elapsedTime) * 0.5 + 0.5,
          );
          child.material.color = color;
          child.material.roughness = (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
          child.material.metalness = (Math.sin(elapsedTime * 0.25) + 1) * 0.5;
        };
      });
    };
  });

  return <primitive castShadow receiveShadow ref={groupRef} object={scene} />;
};
