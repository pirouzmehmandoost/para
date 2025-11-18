'use client';

import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, CameraControls, Html, SoftShadows } from '@react-three/drei';
import { envColor, envImageUrl } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import Ground from '../models/Ground';
import Model from '../models/Model';
import SimpleCameraRig from '../cameras/SimpleCameraRig';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

export const SingularModelViewer = ({ data }) => {
  return (
    <Canvas
      camera={{
        position: cameraConfigs.POSITION,
        near: cameraConfigs.NEAR,
        far: cameraConfigs.FAR + 100,
        fov: 50,
      }}
      fallback={<div> Sorry no WebGL supported! </div>}
      orthographic={false}
      shadows
    >
      <Environment shadows files={envImageUrl}/>
      <Ground position={[-50, 100, -50]} rotation={-Math.PI/4} scale={[0.8, 0.6, 0.6]} />
      <color args={[envColor]} attach="background" />
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
      <fog attach="fog" density={0.006} color={envColor} near={70} far={300} />
      <directionalLight
        castShadow={true}
        position={[-12, 50, -50]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        intensity={3}
        shadow-camera-near={0.1}
        shadow-camera-far={500}
        shadow-bias={-0.001}
        shadow-camera-top={1000}
        shadow-camera-bottom={-1000}
        shadow-camera-left={-1000}
        shadow-camera-right={1000}
      />
      {(!!data
        ? <Model {...data} />
        : <Html transform scale={[4, 4, 4]} position={[0, 0, 0]}>
            <div className="w-full h-full inset-0 left-0 uppercase place-self-center place-items-center text-5xl text-nowrap text-">
              <p> ⚒️ Please navigate back to the home page ⚒️ </p>
            </div>
          </Html>
      )}
      <SoftShadows focus={0} samples={10} size={40} />
      <Ground position={[0, -45, 0]} rotation={Math.PI/12} scale={[0.8, 0.6, 0.6]} />
    </Canvas>
  );
};

export default SingularModelViewer;
