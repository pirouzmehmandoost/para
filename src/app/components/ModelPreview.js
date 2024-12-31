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

const Model = (data) => {
  const { material: materialProps, modelUrl, autoUpdateMaterial } = data;

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

  if (autoUpdateMaterial) {
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
  } else {
    const color = new Color("black")
    scene.children[0].material.color = color;
    scene.children[0].material.ior = 1.5;
    scene.children[0].material.roughness = 0.0;
    scene.children[0].material.reflectivity = 0.0;
    scene.children[0].material.clearcoat = 0.5;
    scene.children[0].material.clearcoatRoughness = 0.0;
    scene.children[0].material.specularIntensity = 0.03
    scene.children[0].material.specularColor = "#ffffff"
    scene.children[0].material.transmission = 1;
    scene.children[0].material.metalness = 0.0;
    scene.children[0].material.flatShading = true;
    scene.children[0].flatShading = true;
    scene.flatShading = true;
  }

  return <primitive castShadow receiveShadow object={scene} ref={modelRef} />;
};

export const ModelPreview = ({ data }) => {
  const { autoUpdateMaterial = true, colorCodes, modelUrl, rotation = 1, rotate, enableControls = true, orthographic = false, cameraPosition = [0, 10, 100] } = data;
  const newProps = {
    material: { ...colorCodes },
    modelUrl,
    position: [0, -20, 0],
    rotation,
    // rotation: [0, Math.PI / 1.5, 0],
    scale: 1.0,
    autoUpdateMaterial
  };
  const near = orthographic ? -100 : 1
  const fov = orthographic ? 500 : 50


  return (
    <Suspense fallback={<Loader />}>
      <Canvas
        camera={{ position: cameraPosition, near: near, far: 500, fov: fov }}
        fallback={<div>Sorry no WebGL supported!</div>}
        orthographic={orthographic}
        shadows
      >
        <Model {...newProps} />
        <hemisphereLight
          position={[0, 60, -30]}
          intensity={100}
          groundColor={"#ffffff"}
        />

        {orthographic &&
          <>
            <hemisphereLight
              position={[-20, 20, 100]}
              intensity={100}
              groundColor={"#ffffff"}
            />
            <hemisphereLight
              position={cameraPosition}
              intensity={100}
              groundColor={"#ffffff"}
            />
          </>
        }
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
          enablePan={false}
          enableZoom={false}
          autoRotate={rotate}
          autoRotateSpeed={rotation * 10.0}
          enableRotate={enableControls}
          orthographic={true}
        />
        <Environment shadows files="./studio_small_08_4k.exr" />
      </Canvas>
    </Suspense>
  );
};

export default ModelPreview;