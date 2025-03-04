"use client";

import { ColorManagement } from "three";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  CameraControls,
  SoftShadows,
  Html,
} from "@react-three/drei";
import cameraConfigs from "../../../lib/cameraConfigs";
import { Ground } from "../../../../public/Ground";
import { SimpleCameraRig } from "./CameraRig";
import Model from "./Model";

ColorManagement.enabled = true;

export const scaleModel = (width) => {
  if (width <= 360) {
    return 0.525;
  }
  if (width <= 400) {
    return 0.55;
  }
  if (width <= 480) {
    return 0.7;
  }
  if (width <= 640) {
    //sm
    return 0.75;
  }
  if (width <= 768) {
    //md
    return 0.8;
  }
  if (width <= 1024) {
    //lg
    return 0.9;
  }
  if (width <= 1280) {
    //xl
    return 1.0;
  }
  if (width <= 1536) {
    //2xl
    return 1.1;
  }
  return 1.2;
};

export const SingularModelViewer = ({ data }) => {
  console.log("SingularModelViewer data: ", data);
  return (
    <Canvas
      camera={{
        position: cameraConfigs.POSITION,
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
        {data.modelUrl?.name?.length
        ? <Model{...data}/>
        : 
            <Html transform scale={[4, 4, 4]} position={[0, 0, 0]}>
                <div className="w-full h-full inset-0 left-0 uppercase place-self-center place-items-center text-5xl text-nowrap text-">
                    <p>⚒️ Please navigate back to the home page ⚒️</p>
                </div>
            </Html>
        }
        <SoftShadows samples={10} size={6} />
        <Ground
            position={[0, -45, 0]}
            scale={[0.8, 0.6, 0.6]}
            rotation={Math.PI / 12}
        />
    </Canvas>
  );
};

export default SingularModelViewer;
