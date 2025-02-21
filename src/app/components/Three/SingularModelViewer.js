"use client";

import { Suspense } from "react";
import { ColorManagement } from "three";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Loader,
  CameraControls,
  SoftShadows,
} from "@react-three/drei";
import cameraConfigs from "../../../lib/cameraConfigs";
import { Ground } from "../../../../public/Env_ground_3";
import { SimpleCameraRig } from "./CameraRig";
import Model from "./Model";

ColorManagement.enabled = true;

export const SingularModelViewer = ({ data }) => {
  const { cameraPosition, ...modelData } = data;

  return (
    <Suspense fallback={<Loader />}>
      <Canvas
        camera={{
          position: cameraPosition,
          near: cameraConfigs.NEAR,
          far: cameraConfigs.FAR + 100,
          fov: 50,
        }}
        fallback={<div>Sorry no WebGL supported!</div>}
        orthographic={false}
        shadows
      >
        <Environment shadows files="./studio_small_08_4k.exr" />
        <color args={["#bcbcbc"]} attach="background" />
        <CameraControls
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
          mouseButtons={{
            left: cameraConfigs.ROTATE,
            middle: cameraConfigs.NONE,
            right: cameraConfigs.NONE,
            wheel: cameraConfigs.NONE,
          }}
          touches={{
            one: cameraConfigs.TOUCH_ROTATE,
            two: cameraConfigs.NONE,
            three: cameraConfigs.NONE,
          }}
        />
        <SimpleCameraRig {...data} />
        <fog attach="fog" density={0.007} color="#bcbcbc" near={70} far={300} />
        <directionalLight
          castShadow={true}
          position={[-12, 50, -50]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          intensity={3}
          shadow-camera-near={0.1}
          shadow-camera-far={500}
          shadow-bias={-0.001}
          shadow-camera-top={1000}
          shadow-camera-bottom={-1000}
          shadow-camera-left={-1000}
          shadow-camera-right={1000}
        />
        <Model {...modelData} />
        <SoftShadows samples={10} size={6} />
        <Ground
          position={[0, -55, 0]}
          scale={[0.8, 0.6, 0.6]}
          rotation={Math.PI / 12}
        />
      </Canvas>
    </Suspense>
  );
};

export default SingularModelViewer;
