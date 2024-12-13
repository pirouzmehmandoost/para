"use client";

import { Suspense, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  Loader,
  AccumulativeShadows,
  RandomizedLight,
} from "@react-three/drei";
// import { LayerMaterial, Color, Depth } from "lamina";
import useSelection from "../store/selection";

THREE.ColorManagement.enabled = true;

const Model = ({ material: materialProps }) => {
  const modelRef = useRef();
  const selection = useSelection((state) => state.selection);
  const { modelUrl } = selection;
  const { scene } = useGLTF(modelUrl);
  const { viewport } = useThree();
  let width = viewport.width;
  let height = viewport.height;
  let material = new THREE.MeshPhysicalMaterial(materialProps);
  let scale = (height > width ? width : height) * 0.0034;

  if (scene?.children?.length) {
    scene.children[0].material = material;
    scene.children[0].castShadow = true;
    scene.children[0].receiveShadow = true;
    scene.children[0].position.set(0, -25, 0);
    scene.children[0].scale.set(scale, scale, scale);
  }

  return <primitive castShadow receiveShadow object={scene} ref={modelRef} />;
};

const ModelView = ({ material }) => {
  const newProps = {
    position: [0, -20, 0],
    scale: 0.3,
    rotation: [0, Math.PI / 1.5, 0],
    material: { ...material },
  };

  return (
    <div className="w-full h-full">
      <Suspense fallback={<Loader />}>
        <Canvas
          fallback={<div>Sorry no WebGL supported!</div>}
          camera={{ position: [0, 10, 100], near: 1, far: 500, fov: 50 }}
        >
          <Model {...newProps} />
          <hemisphereLight
            position={[0, 60, -30]}
            intensity={4}
            groundColor={"#333333"}
          />
          <AccumulativeShadows
            temporal
            frames={100}
            alphaTest={0.9}
            color="#3ead5d"
            colorBlend={1}
            opacity={0.8}
            scale={20}
          >
            <RandomizedLight
              radius={10}
              ambient={0.5}
              intensity={Math.PI}
              position={[2.5, 8, -2.5]}
              bias={0.001}
            />
          </AccumulativeShadows>
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={11.0}
          />
          <Environment shadows files="./studio_small_08_4k.exr" blur={100} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export const ModelViewer = () => {
  const [material, setMaterial] = useState(null);
  const selection = useSelection((state) => state.selection);
  const { colorCodes } = selection;

  return (
    <div className="relative flex w-full h-full flex-column items-end justify-stretch content-stretch">
      <ModelView material={material} />

      <div
        className={`absolute w-full flex flex-row items-center justify-evenly items-end mb-3`}
      >
        {Object.entries(colorCodes).map((entry) => {
          let value = entry[1];
          return (
            <div
              onClick={() => {
                setMaterial(value.material);
              }}
              key={value.label}
              className={`${value.tailwindColor} w-3 h-3 border-solid border-clay_dark border-2 rounded-full cursor-pointer`}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelViewer;
