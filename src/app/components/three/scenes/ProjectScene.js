'use client';

import React, { Suspense, useState, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Clouds, Cloud, Environment, CameraControls, Html, SoftShadows } from '@react-three/drei';
import { envColor } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import Ground from '../models/Ground';
import Model from '../models/Model';
import SimpleCameraRig from '../cameras/SimpleCameraRig';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

const cloudProps = (i) => { 
  return {
    color:'black',
    concentrate: 'inside',
    fade: 100,
    growth: 100,
    opacity: 0.1,
    position:[(i % 2 === 0 ? 390 : -390), 0, 0],
    seed: 0.4,
    segments: 50,
    speed: 0.2,
    volume: 700,
  };
};

export const ProjectScene = ( props ) => {
  const cameraControlsRef = useRef();
  const [groundMeshRef, setGroundMeshRef] = useState(undefined);
  const [meshRef, setMeshRef] = useState(undefined);
  const [cameraReady, setCameraReady] = useState(false);

  return (
    <> 
      {!!props?.modelUrl?.url && (
        <Canvas
          camera={{ position: [0, 60, 250], near: cameraConfigs.NEAR, far: cameraConfigs.FAR + 150, fov: 50, }}
          fallback={<div> Sorry no WebGL supported! </div>}
          orthographic={false}
          shadows
        >
          <Suspense 
            fallback={
              <Html center position={[0, 0, 0]} scale={[40, 40, 40]} style={{ color: 'black', fontSize: '100px', fontFamily: 'didot', textAlign: 'center' }}>
                Loading...
              </Html>
            }
          >
            <Environment shadows files={"/kloofendal_misty_morning_puresky_4k.hdr"} />
            {meshRef && groundMeshRef && (
              <>
                {cameraReady && (
                  <CameraControls
                    ref={cameraControlsRef}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI/2}
                    minAzimuthAngle={-Math.PI/3}
                    maxAzimuthAngle={Math.PI/3}
                    mouseButtons={{
                      left: cameraConfigs.ROTATE,
                      middle: cameraConfigs.NONE,
                      right: cameraConfigs.NONE,
                      wheel: cameraConfigs.NONE,
                    }}
                    touches={{
                      one: cameraConfigs.NONE,
                      two: cameraConfigs.NONE,
                      three: cameraConfigs.NONE,
                    }}
                  />
                )}
                <SimpleCameraRig target={meshRef} onTargetReady={() => setCameraReady(true)} />
              </>
            )}
            <color args={[envColor]} attach="background" />
            <fog attach="fog" color={envColor} near={100} far={410} />
            <Clouds material={THREE.MeshLambertMaterial} limit={100}>
              <Cloud {...cloudProps(0)}/>
              <Cloud {...cloudProps(1)}/>
            </Clouds>
            <SoftShadows focus={0.1} samples={12} size={40} />
            <directionalLight
              castShadow={true}
              intensity={1}
              position={[0, 80, 100]}
              shadow-bias={0.001}
              shadow-camera-near={0.1}
              shadow-camera-far={600}
              shadow-camera-top={600}
              shadow-camera-bottom={-600}
              shadow-camera-left={-600}
              shadow-camera-right={600}
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <Model groundMeshRef={groundMeshRef} onMeshReady={setMeshRef} {...props} />
            <Ground rotation={[Math.PI, 0, 0]} scale={[1, 1, 1]} position={[-50, -80, 20]} setGroundMeshRef={setGroundMeshRef} />
            <Ground rotation={[Math.PI/-4, Math.PI/4, Math.PI/2.5]} position={[180, -50, -180]} scale={[1, 1, 1]} />
            <Ground rotation={[Math.PI/-4, -Math.PI/4, -Math.PI/2.5]} position={[-180, -50, -180]} scale={[1, 1, 1]} />
          </Suspense>
        </Canvas>
      )}
    </>
  );
};

export default ProjectScene;