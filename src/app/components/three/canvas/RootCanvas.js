'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, Html, Stats } from '@react-three/drei';
import cameraConfigs from '@configs/cameraConfigs';
import { envColor, envImageUrl } from '@configs/globals';
import HomeScene from '../scenes/HomeScene';
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
        gl={{ antialias: false }} // gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 666, 666], near: cameraConfigs.NEAR, far: cameraConfigs.FAR, fov: cameraConfigs.FOV }}
        fallback={<div> Sorry, WebGL is not supported.</div>}
        orthographic={false}
        shadows
      >
        <color args={[envColor]} attach='background' />
        <fog attach='fog' color={envColor} near={180} far={290} />
        <Suspense fallback={<Loader />}>
          <Environment shadows files={envImageUrl} environmentRotation={[0,Math.PI*1.5,0]}/>
          <HomeScene />
          {/* <SceneRouter /> */}
        </Suspense>
        <Stats />
      </Canvas>
    </div>
  );
};

export default RootCanvas;
