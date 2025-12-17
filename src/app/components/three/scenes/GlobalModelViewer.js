'use client';

import {Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, Html} from '@react-three/drei';
import cameraConfigs from '@configs/cameraConfigs';
import { envColor, envImageUrl } from '@configs/globals';
import SceneBuilder from './SceneBuilder';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

export const GlobalModelViewer = ({ showMenu }) => {
  return (
    <Canvas
      gl={{ antialias: true }}
      camera={{
        position: [666, 666, 666],
        near: cameraConfigs.NEAR,
        far: cameraConfigs.FAR,
        fov: 50,
      }}
      fallback={<div> Sorry, WebGL is not supported.</div>}
      orthographic={false}
      shadows
    >
      <Suspense 
        fallback={
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
        }
      >
        <Environment shadows files={envImageUrl} />
        <color args={[envColor]} attach='background' />
        <fog attach='fog' color={envColor} density={0.004} near={180} far={290} />
        <SceneBuilder showMenu={showMenu}/>
      </Suspense>
    </Canvas>
  );
};

export default GlobalModelViewer;
