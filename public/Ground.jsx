/*
gltfjsx command: npx gltfjsx@latest env_ground_3.glb --transform --shadows -D 
*/
"use client";

import { useGLTF } from "@react-three/drei";
import useMaterial from "../src/app/stores/materialStore";

export function Ground({
  rotation = 0,
  position = [0, 0, 0],
  scale = [1, 1, 1],
}) {
  const getMaterial = useMaterial((state) => state.getMaterial);
  const { nodes } = useGLTF("/env_ground_3-transformed.glb");
  const material= getMaterial('ground').material;

  return (
    <group scale={scale} position={position} dispose={null}>
      <mesh
        castShadow={true}
        geometry={nodes.Plane.geometry}
        material={material}
        receiveShadow={true}
        rotation={[rotation, 0, 0]}
      >
      </mesh>
    </group>
  );
}

useGLTF.preload("/env_ground_3-transformed.glb");
