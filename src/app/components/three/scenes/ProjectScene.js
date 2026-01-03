'use client';

import React, { useState } from 'react';
import * as THREE from 'three';
import { Clouds, Cloud, Environment, SoftShadows } from '@react-three/drei';
import { envColor } from '@configs/globals';
// import cameraConfigs from '@configs/cameraConfigs';
import Ground from '../models/Ground';
import Model from '../models/Model';
// import SimpleCameraRig from '../cameras/SimpleCameraRig';
import useSelection from '@stores/selectionStore';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

const cloudProps = (i) => {
  return {
    color: 'black',
    concentrate: 'inside',
    fade: 100,
    growth: 100,
    opacity: 0.1,
    position: [(i % 2 === 0 ? 390 : -390), 0, 0],
    seed: 0.4,
    segments: 50,
    speed: 0.2,
    volume: 700,
  };
};

export const ProjectScene = () => {
  const selection = useSelection((s) => s.selection);
  const fileData = selection?.sceneData?.fileData;

  if (!fileData?.url) return null;

  // const cameraControlsRef = useRef();
  const [groundMeshRef, setGroundMeshRef] = useState(undefined);
  const [meshRef, setMeshRef] = useState(undefined);
  // const [cameraReady, setCameraReady] = useState(false);

  return (
    <>
      <color args={[envColor]} attach="background" />
      <fog attach="fog" color={envColor} near={100} far={410} />
      <Environment shadows files={"/kloofendal_misty_morning_puresky_4k.hdr"} />
      {/* {meshRef && groundMeshRef && (
            <>
              {cameraReady && (
                <CameraControls
                  ref={cameraControlsRef}
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
                    one: cameraConfigs.NONE,
                    two: cameraConfigs.NONE,
                    three: cameraConfigs.NONE,
                  }}
                />
              )}
              <SimpleCameraRig target={meshRef} onTargetReady={() => setCameraReady(true)} />
            </>
          )} */}
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
      <Clouds material={THREE.MeshLambertMaterial} limit={100}>
        <Cloud {...cloudProps(0)} />
        <Cloud {...cloudProps(1)} />
      </Clouds>
      <Model groundMeshRef={groundMeshRef} onMeshReady={setMeshRef} fileData={fileData} {...selection.sceneData} />
      <Ground rotation={[Math.PI, 0, 0]} scale={[1, 1, 1]} position={[-50, -80, 20]} setGroundMeshRef={setGroundMeshRef} />
      <Ground rotation={[Math.PI / -4, Math.PI / 4, Math.PI / 2.5]} position={[180, -50, -180]} scale={[1, 1, 1]} />
      <Ground rotation={[Math.PI / -4, -Math.PI / 4, -Math.PI / 2.5]} position={[-180, -50, -180]} scale={[1, 1, 1]} />
    </>
  );
};

export default ProjectScene;