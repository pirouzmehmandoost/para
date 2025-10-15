'use client';

import { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, AdaptiveDpr, Html, PerformanceMonitor } from '@react-three/drei';
import cameraConfigs from '@configs/cameraConfigs';
import { groundColor, backgroundImageURL } from '@configs/globals';
import Ground from '../models/Ground';
import SceneBuilder from './SceneBuilder';

THREE.ColorManagement.enabled = true;

export const GlobalModelViewer = ({ showMenu }) => {
  return (
    <Canvas
      camera={{
        position: [666, 80, 666],
        near: cameraConfigs.NEAR,
        far: cameraConfigs.FAR,
        fov: 50,
      }}
      fallback={<div> Sorry, WebGL is not supported.c</div>}
      orthographic={false}
      shadows
    >
      <AdaptiveDpr pixelated />
      <Environment shadows files={backgroundImageURL} />
      <color args={[groundColor]} attach="background" />
      <fog attach="fog" density={0.006} color={groundColor} near={150} far={280} />
      <directionalLight
        castShadow={true}
        position={[0, 80, -40]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        intensity={1}
        shadow-camera-near={0.05}
        shadow-camera-far={1000}
        shadow-bias={-0.001}
        shadow-camera-top={1500}
        shadow-camera-bottom={-1500}
        shadow-camera-left={-1500}
        shadow-camera-right={1500}
      />
      <directionalLight
        castShadow={true}
        position={[0, 100, 80]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        intensity={1}
        shadow-camera-near={0.05}
        shadow-camera-far={1000}
        shadow-bias={-0.001}
        shadow-camera-top={1500}
        shadow-camera-bottom={-1500}
        shadow-camera-left={-1500}
        shadow-camera-right={1500}
      />
      <Suspense 
        fallback={
          <Html center>
            <div style={{
              color: 'white',
              fontSize: '20px',
              fontFamily: 'system-ui',
              textAlign: 'center',
              padding: '20px'
            }}>
              Loading 3D Scene...
            </div>
          </Html>
        }
      >
        <SceneBuilder showMenu={showMenu} />
      </Suspense>
      <Ground
        position={[-50, -85, 20]}
        scale={[1.4, 1, 1.4]}
        rotation={Math.PI / 7}
      />
    </Canvas>
  );
};

export default GlobalModelViewer;
