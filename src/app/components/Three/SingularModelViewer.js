"use client";

import { Suspense, useRef } from "react";
import { Color, ColorManagement, DoubleSide, MeshPhysicalMaterial } from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Loader, CameraControls, SoftShadows, Plane } from "@react-three/drei";
import { scaleMeshAtBreakpoint } from "../../../lib/utils";
import cameraConfigs from "../../../lib/cameraConfigs";
import { glossMaterial } from "../../../lib/globals";
import { Model as Ground } from "../../../../public/Env_ground_3";
import CameraRig from "./CameraRig";
// import Model from "./Model"
ColorManagement.enabled = true;

// Should be importing Model.js
const Model = (data) => {
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

export const SingularModelViewer = ({ data }) => {
  const {
    orthographic,
    cameraPosition,
  } = data;
  const near = orthographic ? -100 : 1;
  const fov = orthographic ? 500 : 50;

  return (
    <Suspense fallback={<Loader />}>
      <Canvas
        camera={{ position: cameraPosition, near: near, far: 500, fov: fov }}
        fallback={<div>Sorry no WebGL supported!</div>}
        orthographic={orthographic}
        shadows
      >
        <Environment shadows files="./studio_small_08_4k.exr" />
        <color args={["#bcbcbc"]} attach="background" />
        <CameraControls
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 2}
          maxAzimuthAngle={Math.PI / 2}
          mouseButtons={{ left: cameraConfigs.ROTATE, middle: cameraConfigs.NONE, right: cameraConfigs.NONE, wheel: cameraConfigs.NONE }}
          touches={{ one: cameraConfigs.TOUCH_ROTATE, two: cameraConfigs.NONE, three: cameraConfigs.NONE }}
        />
        <CameraRig {...data} />
        <fog attach="fog" density={0.006} color="#bcbcbc" near={50} far={320} />
        <directionalLight
          castShadow={true}
          position={[-12, 50, -50]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          intensity={3}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
          shadow-bias={-0.001}
          shadow-camera-top={1000}
          shadow-camera-bottom={-1000}
          shadow-camera-left={-1000}
          shadow-camera-right={1000}
        />
        <Model {...data} />
        <SoftShadows samples={10} size={6} />
        <Ground position={[0, -55, 0]} scale={[0.8, 0.6, 0.6]} rotation={Math.PI / 12} />
        {/* these plane positions should scale with canvas size */}
        <Plane castShadow args={[1500, 1500, 500, 500]} position={[-240, 0, 0]} side={DoubleSide} rotation={[0, Math.PI / 2.7, 0]}> <meshPhysicalMaterial {...glossMaterial} color={"black"} /> </Plane>
        <Plane castShadow args={[1500, 1500, 500, 500]} position={[240, 0, 0]} side={DoubleSide} rotation={[0, -Math.PI / 2.7, 0]}> <meshPhysicalMaterial {...glossMaterial} color={"black"} /> </Plane>
      </Canvas>
    </Suspense>
  );
};

export default SingularModelViewer;
