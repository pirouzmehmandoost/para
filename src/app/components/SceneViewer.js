"use client";

import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  Loader,
  CameraShake,
} from "@react-three/drei";
import { Color } from "three";

THREE.ColorManagement.enabled = true;

const Model = (data) => {
  const {
    material: materialProps,
    modelUrl,
    autoUpdateMaterial,
    position,
    scale: scaleRatio,
  } = data;
  const { scene } = useGLTF(modelUrl);
  const { viewport } = useThree();
  let material = new THREE.MeshPhysicalMaterial(materialProps);
  // scale is adjusted based on the aspect ratio of the viewport. 6 was chosen as a good divisor to get the right scale
  let scale = scaleRatio * (viewport.getCurrentViewport().aspect / 6);
  scene.traverse((child) => {
    if (!!child.isMesh) {
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
      child.scale.set(scale, scale, scale);
    }
  });

  if (position) {
    scene.position.set(position[0], position[1], position[2]);
  } else {
    scene.position.set(0, -25, 0);
  }

  // if flag is true then on the material properties update based on time on each frame
  useFrame((state) => {
    if (autoUpdateMaterial) {
      // Calculate color based on time
      const elapsedTime = state.clock.getElapsedTime();
      const color = new Color("white").lerp(
        new Color("black"),
        Math.sin(elapsedTime) * 0.5 + 0.5,
      );

      // Update material color, metalness and roughness
      scene.traverse((child) => {
        if (!!child?.material) {
          child.material.color = color;
          child.material.roughness = (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
          child.material.metalness = (Math.sin(elapsedTime * 0.25) + 1) * 0.5;
          child.rotation.set(0, Math.sin(Math.PI / 4) * elapsedTime * 0.25, 0);
        }
      });
    }
    else {
      const color = new Color("black");
      scene.traverse((child) => {
        if (!!child.isMesh) {
          child.material.ior = 1.5;
          child.material.color = color;
          child.material.roughness = 0.0;
          child.material.reflectivity = 0.0;
          child.material.clearcoat = 0.5;
          child.material.clearcoatRoughness = 0.0;
          child.material.specularIntensity = 0.03;
          child.material.specularColor = "#ffffff";
          child.material.transmission = 1;
          child.material.metalness = 0.0;
        }
      });
    };
  });

  return <primitive castShadow receiveShadow object={scene} />;
};

const Group = (data) => {
  const {
    autoUpdateMaterial,
    colorCodes,
    modelUrls,
    cameraPosition,
    enablePan,
    enableZoom,
    enableRotate,
    autoRotate,
    autoRotateSpeed,
    orthographic,
  } = data;

  const { viewport, size, camera, get } = useThree();
  const groupRef = useRef();

  // Update camera position and target whenever the group or viewport dimensions are updated
  useEffect(() => {
    if (groupRef.current) {
      const boundingBox = new THREE.Box3().setFromObject(groupRef.current);
      const center = boundingBox.getCenter(new THREE.Vector3());

      camera.position.copy(center);
      //lift the camera up by a small amount if there are more than 2 models
      camera.position.y +=
        modelUrls.length > 2 ? cameraPosition[1] + 10 : cameraPosition[1];
      camera.position.z += cameraPosition[2];
      // update R3F OrbitControls target. OrbitControls' makeDefault flag automatically positions the camera to look at the target
      const controls = get().controls;
      if (controls) {
        controls.target.copy(center);
        controls.update();
      }
    }
  }, [groupRef, viewport, size, camera, cameraPosition, modelUrls, get]);

  return (
    <>
      <group castShadow receiveShadow ref={groupRef}>
        {modelUrls.map((url, index) => {
          // stagger z-position of models if there are more than 2 models
          const xOffset = modelUrls.length > 2 ? -50 : 0;

          const newProps = {
            modelUrl: url,
            material: { ...colorCodes }, // material properties
            scale: modelUrls.length == 1 ? 1.0 : 0.9, // scale of the model is decreased by a small amount
            autoUpdateMaterial,
            position: [
              // x position is the midpoints of viewport's width divided by the number of models
              //0.7 is a scaling factor to adjust the position of the models.
              parseInt((index * size.width) / (modelUrls.length * 2)) * 0.7,
              -25, // position the model below the camera by a small amount
              index % 2 === 0 ? -40 + xOffset : -40, // and away from the camera away by a small amount
            ],
          };
          return <Model key={index} {...newProps} />;
        })}
      </group>
      <OrbitControls
        target={groupRef}
        makeDefault
        enablePan={enablePan}
        enableZoom={enableZoom}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        enableRotate={enableRotate}
        orthographic={orthographic}
      />
    </>
  );
};

export const SceneViewer = ({ data }) => {
  const {
    sceneData: {
      colorCodes,
      modelUrls,
      //default values for the scene
      autoUpdateMaterial = true,
      autoRotate = false, // disable camera auto rotation. Model rotation is calculated in Model component.
      autoRotateSpeed = 3,
      enableRotate = false,
      enablePan = false,
      enableZoom = false,
      orthographic = false,
      cameraPosition = [0, 10, 160],
    },
  } = data;
  const sceneProps = {
    material: { ...colorCodes },
    modelUrls,
    autoUpdateMaterial,
    autoRotate,
    autoRotateSpeed,
    enableRotate,
    enablePan,
    enableZoom,
    orthographic,
    cameraPosition,
  };
  // near and fov differ for orthographic/perspective camera to show the models properly
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
        <Group {...sceneProps} />
        <CameraShake
          maxYaw={0.1}
          maxPitch={0.1}
          yawFrequency={0.1}
          pitchFrequency={0.1}
          intensity={0.5}
          decay
          decayRate={0.65}
        />
        {/* background, shsdows, and studio lighting of the scene*/}
        <Environment shadows files="./studio_small_08_4k.exr" />
      </Canvas>
    </Suspense>
  );
};

export default SceneViewer;
