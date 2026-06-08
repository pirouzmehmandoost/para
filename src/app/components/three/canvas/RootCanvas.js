'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, Html, useGLTF } from '@react-three/drei';
import { envColor, envImageUrl } from '@configs/globals';
import cameraConfigs from '@configs/cameraConfigs';
import SceneComposer from '../scenes/SceneComposer';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

const { NEAR, FAR, FOV, INITIAL_CAMERA_POSITION } = cameraConfigs;

useGLTF.preload('/yoga_mat_strap.glb');
useGLTF.preload('/textured_bag.glb');
useGLTF.preload('/sang.glb');
useGLTF.preload('/env_ground_3-transformed.glb');

export const Loader = () => {
  return (
    <Html center className='text-black text-nowrap text-5xl'>
      Loading...
    </Html>
  );
};

// NOTE: SceneComposer is experimental. Swap with BasicScene as needed during local development. 
export const RootCanvas = () => {

  // Route-based frameloop execution. 
  const pathname = usePathname();
  const interactive = pathname === '/' || pathname.startsWith('/projects/');

  // function SceneRouter() {
  //   if (pathname === '/') return <HomeScene />;
  //   if (pathname.startsWith('/projects/')) return <ProjectScene />;
  //   return <Loader />;
  // };

  return (
    <div className={`fixed inset-0 bg-[${envColor}] ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={interactive ? 'always' : 'demand'}
        gl={{ antialias: true }}
        camera={{ position: INITIAL_CAMERA_POSITION, near: NEAR, far: FAR, fov: FOV - 15 }}
        fallback={<div> Sorry, WebGL is not supported. </div>}
        orthographic={false}
        shadows={{ type: THREE.PCFShadowMap }}
      >
        <color args={[envColor]} attach='background' />
        <fog attach='fog' color={envColor} near={180} far={270} />
        <Environment shadows files={envImageUrl} environmentIntensity={0.5} />
        <Suspense fallback={<Loader />}>
          <SceneComposer />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RootCanvas;