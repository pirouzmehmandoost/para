'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, Html, Stats } from '@react-three/drei';
import cameraConfigs from '@configs/cameraConfigs';
import { envColor, invImageUrl } from '@configs/globals';
import HomeScene from '../scenes/HomeScene';
import { envImageUrl } from '../../../../lib/configs/globals';
// import ProjectScene from '../scenes/ProjectScene';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

export const Loader = () => {
  return (
    <Html center className='text-black text-nowrap text-5xl animate-pulse'>
      Loading...
    </Html>
  );
};

export const RootCanvas = () => {
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
        frameloop={interactive ? 'always' : 'demand'}
        gl={{ antialias: true }}
        camera={{ position: [0, 666, 666], near: cameraConfigs.NEAR, far: cameraConfigs.FAR, fov: cameraConfigs.FOV - 5 }}
        fallback={<div> Sorry, WebGL is not supported. </div>}
        orthographic={false}
        shadows
      >
        <color args={[envColor]} attach='background' />
        <fog attach='fog' color={envColor} near={180} far={270} />
          <Environment shadows files={envImageUrl} environmentIntensity={0.3}  />
          <Suspense fallback={<Loader />}>
            <HomeScene />
            {/* <SceneRouter /> */}
        </Suspense>
        <Stats />
      </Canvas>
    </div>
  );
};

export default RootCanvas;