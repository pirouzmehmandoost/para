'use client';

import React, { Suspense, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Clouds, Cloud, Environment, CameraControls, Html, SoftShadows } from '@react-three/drei';
import { envColor, envImageUrl } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import Ground from '../models/Ground';
import Model from '../models/Model';
import SimpleCameraRig from '../cameras/SimpleCameraRig';
import useSelection from '@stores/selectionStore';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

export const SingularModelViewer = ( props ) => {
  const [groundMeshRef, setGroundMeshRef] = useState(undefined);
  const [meshRef, setMeshRef] = useState(undefined);
  const selection = useSelection((state) => state.getSelection());
  
  return (
    <> 
      {!! props && !!selection?.sceneData?.position?.x && (
        <Canvas
          camera={{
            position: cameraConfigs.POSITION,
            near: cameraConfigs.NEAR,
            far: cameraConfigs.FAR + 150,
            fov: 50,
          }}
          fallback={<div> Sorry no WebGL supported! </div>}
          orthographic={false}
          shadows
        >
          <Suspense
            fallback={
              <Html transform scale={[4, 4, 4]} position={[0, 0, 0]}>
                <div className="flex flex-col fixed w-full h-full inset-0 left-0 uppercase text-center text-5xl text-nowrap">
                  <p> ⚒️ Error, failed to mount Canvas Environment ⚒️ </p>
                </div>
              </Html>
            }
          >
            <Environment shadows files={envImageUrl} />
          </Suspense>
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
          <SimpleCameraRig target={meshRef} {...props} />
          <Ground position={[-50, 100, -50]} rotation={-Math.PI/4} scale={[0.8, 0.6, 0.6]} />
          <color args={[envColor]} attach="background" />
          <fog attach="fog" density={0.006} color={envColor} near={80} far={350} />
          <Clouds material={THREE.MeshLambertMaterial} limit={200}>
            <Cloud
              bounds={[50, 50, 50]}
              color='white'
              concentrate='outside'
              fade={100}
              growth={100}
              opacity={0.05}
              position={[500, 0, 0]}
              seed={0.35}
              segments={30}
              speed={0.05}
              volume={800}
            />
            <Cloud
              bounds={[50, 50, 50]}
              color='white'
              concentrate='outside'
              fade={100}
              growth={100}
              opacity={0.05}
              position={[-390, 0, 0]}
              seed={0.35}
              segments={30}
              speed={0.05}
              volume={800}
            />
          </Clouds>
          <SoftShadows focus={0} samples={12} size={40} />
          <directionalLight
            castShadow={true}
            intensity={5}
            position={[0, 100, -50]}
            shadow-bias={-0.001}
            shadow-camera-near={50}
            shadow-camera-far={1500}
            shadow-camera-top={1500}
            shadow-camera-bottom={-1500}
            shadow-camera-left={-1500}
            shadow-camera-right={1500}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <Model
            groundMeshRef={groundMeshRef}
            onMeshReady={setMeshRef}
            {...props}
          />
          <Ground
            setGroundMeshRef={setGroundMeshRef}
            position={[0, -45, 0]} rotation={Math.PI/12}
            scale={[0.8, 0.6, 0.6]}
          />
        </Canvas>
      )}
    </>
  );
};

export default SingularModelViewer;
