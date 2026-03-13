'use client';

import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Cloud, Clouds } from '@react-three/drei'
import { EffectComposer, N8AO, SelectiveBloom } from '@react-three/postprocessing';
import { BlurPass, BlendFunction, Resizer, KernelSize } from 'postprocessing'
import { portfolio } from '@configs/globals';
import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';
import MaterialTextureInitializer from '../textures/MaterialTextureInitializer';
import SimpleCameraRig from '../cameras/SimpleCameraRig';
import BasicModel from '../models/BasicModel';
import Ground from '../models/Ground';

THREE.Cache.enabled = true;
THREE.ColorManagement.enabled = true;

const { projects } = portfolio;
const { sceneData, sceneData: { fileData: { nodeName, } = {}, } = {}, } = projects[1];

const HomePageScene = () => {
  const size = useThree((state) => state.size);

  const readyCount = useRef(0);
  const blurPassRef = useRef(new BlurPass());
  const lightRef = useRef(undefined);
  const planeRef = useRef(undefined);
  const meshRef = useRef(undefined);
  const meshPositionRef = useRef(new THREE.Vector3(0,0,0));
  const cameraFallbackPositionRef = useRef(new THREE.Vector3(0, 50, 50));
  const meshReadyFlag = useRef(false);

  const [meshReady, setMeshReady] = useState(false);
  const cameraTarget = useMemo(() => meshReady ? meshRef.current : null, [meshReady]);

  const totalMeshes = 1;
  const meshScale = Math.min(0.5, scaleMeshAtBreakpoint(size.width) * 0.5);
  const cloudScale = Math.min(1.5, scaleMeshAtBreakpoint(size.width) * 1.5);

  const meshReadyHandlers = useMemo(() => {
    if (meshReadyFlag.current) return;
    return (mesh) => {
        meshRef.current = mesh;
        meshReadyFlag.current = true;
        readyCount.current += 1;
      if (readyCount.current === totalMeshes) setMeshReady(true);
    }
  }, []);

  return (
    <>
      <MaterialTextureInitializer />
      <directionalLight
        ref={lightRef}
        castShadow={true}
        color={'#fff6e8'}
        intensity={1}
        position={[0, 100, -120]}
        shadow-bias={-0.004}
        shadow-camera-fov={50}
        shadow-camera-near={1}
        shadow-camera-far={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-mapSize={2048}
      />
      {/*
      <AnimatedLight
        intensity={5}
        type='directionalLight'
        color='#FFF6E8'
        castShadow={false}
      />
      */}
      <Clouds material={THREE.MeshPhysicalMaterial} limit={6}>
        <Cloud
          color={'black'}
          concentrate={'random'}
          growth={200}
          opacity={0.6}
          position={[-50, 50, -120]}
          seed={0.4}
          segments={3}
          speed={0.2}
          volume={20}
          scale={cloudScale}
          fade={5}
        />
        <Cloud
          color={'black'}
          concentrate={'random'}
          growth={100}
          opacity={0.15}
          position={[50, 50, -120]}
          seed={0.4}
          segments={3}
          speed={0.2}
          volume={300}
          scale={cloudScale}
          fade={5}
        />
      </Clouds>
      <EffectComposer autoClear={false} disableNormalPass multisampling={0}>
        <N8AO aoRadius={270} distanceFalloff={0.5} intensity={10} />
        <SelectiveBloom
          blurPass={blurPassRef.current} 
          height={Resizer.AUTO_SIZE} 
          intensity={0}
          kernelSize={KernelSize.LARGE} 
          lights={lightRef}
          luminanceSmoothing={0.05} // smoothness of the luminance threshold. Range is [0, 1]
          luminanceThreshold={0.05} // luminance threshold. Raise this value to mask out darker elements in the scene.
          selection={planeRef} 
          selectionLayer={2}
          width={Resizer.AUTO_SIZE}
        />
      </EffectComposer>
      <BasicModel
        key={nodeName}
        autoRotate={false}
        autoRotateSpeed={sceneData.autoRotateSpeed}
        fileData={sceneData.fileData}
        materials={sceneData.materials}
        name={nodeName}
        onMeshReady={meshReadyHandlers}
        position={meshPositionRef.current}
        rotation={sceneData.rotation}
        scale={sceneData.scale}
      />
      <mesh
        ref={planeRef}
        position={[0, 50, 0]}
        rotation={[Math.PI * -0.001, 0, 0]}
        scale={[100, 50, 100]}
      >
        <planeGeometry />
        <meshPhysicalMaterial
          color='white'
          emissive='gray'
          emissiveIntensity={5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <SimpleCameraRig
        focusTarget={cameraTarget}
        fallbackPosition={cameraFallbackPositionRef.current}
      />
      <Ground 
        rotation={[Math.PI/3.5, 0, 0]}
        scale={[meshScale * 1.3, meshScale * 1.3, meshScale * 1.3]} 
        position={[0, -60, 0]}
      />

    </>
  );
};

export default HomePageScene;