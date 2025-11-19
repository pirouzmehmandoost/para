'use client';

import {Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Clouds, Cloud, Environment, Html} from '@react-three/drei';
import cameraConfigs from '@configs/cameraConfigs';
import { envColor, envImageUrl } from '@configs/globals';
import SceneBuilder from './SceneBuilder';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

export const GlobalModelViewer = ({ showMenu }) => {
  return (
    <Canvas
      camera={{
        position: [666, 666, 666],
        near: cameraConfigs.NEAR,
        far: cameraConfigs.FAR,
        fov: 50,
      }}
      fallback={<div> Sorry, WebGL is not supported.c</div>}
      orthographic={false}
      shadows
    >
      <Suspense fallback={
        <Html
          center 
          position={[0, 0, 0]}
          scale={[40, 40, 40]}
          style={{
            color: 'black',
            fontSize: '100px',
            fontFamily: 'didot',
            textAlign: 'center',
          }}>
            Loading...
        </Html>
      }>
        <AdaptiveDpr pixelated />
        <Environment shadows files={envImageUrl} />
        <color args={[envColor]} attach="background" />
        <fog attach="fog" color={envColor} density={0.004} near={180} far={290} />
        <Clouds material={THREE.MeshLambertMaterial} limit={100}>
          <Cloud
            bounds={[20, 20, 20]}
            color='white'
            concentrate='random'
            fade={10}
            growth={40}
            opacity={0.1}
            position={[350,-10,0]}
            seed={0.4}
            segments={10}
            speed={0.3}
            volume={400}
          />
          <Cloud
            bounds={[20, 20, 20]}
            color='white'
            concentrate='random'
            fade={10}
            growth={40}
            opacity={0.1}
            position={[-350,-10,0]}
            seed={0.4}
            segments={10}
            speed={0.3}
            volume={400}
          />
          <Cloud
            bounds={[20, 20, 20]}
            color='white'
            concentrate='random'
            fade={10}
            growth={40}
            opacity={0.1}
            position={[0,0,130]}
            seed={0.4}
            segments={10}
            speed={0.3}
            volume={400}
          />
        </Clouds>
        <SceneBuilder showMenu={showMenu}/>
      </Suspense>
    </Canvas>
  );
};

export default GlobalModelViewer;
