"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  Loader,
  Plane,
  CameraControls,
  SoftShadows,
  useTexture,
} from "@react-three/drei";
import { scaleMeshAtBreakpoint, ACTION } from "../../lib/utils"

THREE.ColorManagement.enabled = true;

const CameraRig = (data, { v = new THREE.Vector3() }) => {
  const { cameraPosition } = data;
  return useFrame((state) => {
    const t = state.clock.elapsedTime
    state.camera.position.lerp(
      v.set(
        0,
        Math.cos(t / 2) * 100,
        (Math.sin(t / 2) + 1) * cameraPosition[2],
      ),
      0.06
    )
    state.camera.lookAt(0, 0, 0)
  })
}

const Model = (data) => {
  const {
    colorCodes: {
      defaultColor: {
        material: materialProps,
      }
    },
    modelUrl,
    autoUpdateMaterial,
    autoRotate,
    scale,
    position = [0, -25, 0],
  } = data;

  const { size } = useThree();
  const groupRef = useRef();
  const { scene } = useGLTF(modelUrl);
  const material = new THREE.MeshPhysicalMaterial(materialProps);
  const groupScale = scaleMeshAtBreakpoint(size.width) * scale;

  scene.traverse((child) => {
    if (!!child.isMesh) {
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
      child.scale.set(groupScale, groupScale, groupScale);
      child.position.set(position[0], position[1], position[2]);
    }
  });

  // update rotation and material properties
  useFrame(({ clock }) => {
    // material and rotation calculations are based on time
    const elapsedTime = clock.getElapsedTime();

    if (autoRotate || autoUpdateMaterial) {
      scene.traverse((child) => {
        if (!!child?.isMesh && autoRotate) {
          child.rotation.set(0, Math.sin(Math.PI / 4) * elapsedTime * 0.25, 0);
        };

        if (!!child?.material && autoUpdateMaterial) {
          const color = new THREE.Color("black").lerp(
            new THREE.Color("white"),
            Math.sin(elapsedTime) * 0.5 + 0.5,
          );
          child.material.color = color;
          child.material.roughness = (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
          child.material.metalness = (Math.sin(elapsedTime * 0.25) + 1) * 0.5;
        };
      });
    };
  });

  return <primitive castShadow receiveShadow ref={groupRef} object={scene} />;
};

const Floor = () => {
  const textureProps = useTexture({
    displacementMap: './rock_boulder_dry_disp_4k.png',
    normalMap: './rock_boulder_dry_nor_gl_4k.jpg',
    map: './rock_boulder_dry_diff_4k.jpg',
    aoMap: './rock_boulder_dry_ao_4k.png',
    bumpMap: './rock_boulder_dry_disp_4k.png',
  })
  const props = {
    ...textureProps,
    metalness: 1,
    roughness: 1,
    ior: 1.8,
    reflectivity: 1,
    sheen: 0,
    color: "#3d3d3d",
    bumpScale: 30,
    displacementScale: 30
  }

  return (
    <Plane args={[1500, 1500, 400, 400]} position={[0, -60, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow castShadow >
      <meshStandardMaterial {...props} />
    </Plane>
  )
}

export const ModelViewer = ({ data }) => {
  const {
    orthographic,
    cameraPosition,
  } = data;
  const near = orthographic ? -100 : 1;
  const fov = orthographic ? 500 : 50;

  return (
    <Suspense fallback={<Loader />}>
      <Canvas
        camera={{ position: cameraPosition, near: near, far: 500, fov: fov }}
        fallback={<div>Sorry no WebGL supported!</div>}
        orthographic={orthographic}
        shadows
      >
        <Environment shadows files="./studio_small_08_4k.exr" />
        <CameraControls
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 2}
          maxAzimuthAngle={Math.PI / 2}
          mouseButtons={{ left: ACTION.ROTATE, middle: ACTION.NONE, right: ACTION.NONE, wheel: ACTION.NONE }}
          touches={{ one: ACTION.TOUCH_ROTATE, two: ACTION.NONE, three: ACTION.NONE }}
        />
        <CameraRig {...data} />
        <fog attach="fog" density={0.005} color="#bcbcbc" near={50} far={400} />
        <directionalLight
          castShadow={true}
          position={[-12, 55, -40]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          intensity={5}
          angle={0.45}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
          shadow-bias={-0.001}
          shadow-camera-top={1000}
          shadow-camera-bottom={-1000}
          shadow-camera-left={-1000}
          shadow-camera-right={1000}
        />
        <Model {...data} />
        <SoftShadows samples={10} size={4} />
        <Floor />
      </Canvas>
    </Suspense>
  );
};

export default ModelViewer;
