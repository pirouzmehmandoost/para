"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  Loader,
  CameraShake,
} from "@react-three/drei";
import { Color } from "three";

THREE.ColorManagement.enabled = true;

const MyComponent = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    const elapsedTime = state.clock.getElapsedTime();

    // Calculate a color based on time
    const color = new Color("red").lerp(
      new Color("blue"),
      Math.sin(elapsedTime) * 0.5 + 0.5,
    );

    // Update the material color
    meshRef.current.material.color = color;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </mesh>
  );
};

const Model = (data) => {
  const { material: materialProps, modelUrl } = data;

  const modelRef = useRef();
  const { scene } = useGLTF(modelUrl);
  const { viewport } = useThree();
  let width = viewport.width;
  let height = viewport.height;
  let material = new THREE.MeshPhysicalMaterial(materialProps);
  let scale = (height > width ? width : height) * 0.0034;

  if (scene?.children?.length) {
    scene.children[0].material = material;
    scene.children[0].castShadow = true;
    scene.children[0].receiveShadow = true;
    scene.children[0].position.set(0, -25, 0);
    scene.children[0].scale.set(scale, scale, scale);
  }

  useFrame((state, delta) => {
    const elapsedTime = state.clock.getElapsedTime();

    // Calculate color based on time
    const color = new Color("white").lerp(
      new Color("black"),
      Math.sin(elapsedTime) * 0.5 + 0.5,
    );

    // Update material color and roughness
    scene.children[0].material.color = color;
    scene.children[0].material.roughness =
      (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
  });

  return <primitive castShadow receiveShadow object={scene} ref={modelRef} />;
};

// const PreviewCanvas = (data) => {
//   const { colorCodes, modelUrl, rotation } = data;
//   const newProps = {
//     modelUrl,
//     position: [0, -20, 0],
//     scale: 0.3,
//     rotation: [0, Math.PI / 1.5, 0],
//     material: { ...colorCodes.gloss_black.material },
//     rotation,
//   };

//   return (
//     <Suspense fallback={<Loader />}>
//       <Canvas
//         shadows
//         fallback={<div>Sorry no WebGL supported!</div>}
//         camera={{ position: [0, 10, 100], near: 1, far: 500, fov: 50 }}
//       >
//         <Model {...newProps} />
//         <hemisphereLight
//           position={[0, 60, -30]}
//           intensity={4}
//           groundColor={"#333333"}
//         />
//         <CameraShake
//           maxYaw={0.1}
//           maxPitch={0.1}
//           yawFrequency={0.1}
//           pitchFrequency={0.1}
//           intensity={0.5}
//           decay
//           decayRate={0.65}
//         />
//         <OrbitControls
//           makeDefault
//           autoRotate
//           enableZoom={false}
//           enablePan={false}
//           autoRotateSpeed={rotation * 5.0}
//         />
//         <Environment shadows files="./studio_small_08_4k.exr" />
//       </Canvas>
//     </Suspense>
//   );
// };

export const ModelPreview = ({ data }) => {
  const { colorCodes, modelUrl, rotation } = data;
  const newProps = {
    modelUrl,
    position: [0, -20, 0],
    scale: 1.0,
    rotation: [0, Math.PI / 1.5, 0],
    material: { ...colorCodes.gloss_black.material },
    rotation,
  };

  return (
    <Suspense fallback={<Loader />}>
      <Canvas
        shadows
        fallback={<div>Sorry no WebGL supported!</div>}
        camera={{ position: [0, 10, 100], near: 1, far: 500, fov: 50 }}
      >
        <Model {...newProps} />
        <hemisphereLight
          position={[0, 60, -30]}
          intensity={6}
          groundColor={"#333333"}
        />
        <CameraShake
          maxYaw={0.1}
          maxPitch={0.1}
          yawFrequency={0.1}
          pitchFrequency={0.1}
          intensity={0.5}
          decay
          decayRate={0.65}
        />
        <OrbitControls
          makeDefault
          autoRotate
          enableZoom={false}
          enablePan={false}
          autoRotateSpeed={rotation * 5.0}
        />
        <Environment shadows files="./studio_small_08_4k.exr" />
      </Canvas>
    </Suspense>
  );
};

export default ModelPreview;
