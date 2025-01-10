"use client";

import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  Loader,
} from "@react-three/drei";

THREE.ColorManagement.enabled = true;

const scaleAtBreakpoint = (width) => {
  if (width <= 360) {
    return 0.6;
  }
  if (width <= 480) {
    return 0.7;
  }
  if (width <= 768) {
    return 0.8;
  }
  return 1;
};

const scaleX = (width) => {
  if (width <= 360) {
    return 1.5;
  }
  if (width <= 480) {
    return 1.2;
  }
  if (width <= 768) {
    return 1.0;
  }
  return 0.7;
};

const Model = (data) => {
  const {
    material: materialProps,
    modelUrl,
    autoUpdateMaterial,
    scale,
    position = [0, -25, 0],
  } = data;
  const { scene } = useGLTF(modelUrl);
  const material = new THREE.MeshPhysicalMaterial(materialProps);

  scene.traverse((child) => {
    if (!!child.isMesh) {
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
      child.scale.set(scale, scale, scale);
      child.position.set(position[0], position[1], position[2]);
    }
  });

  //update material properties
  useFrame(({ clock }) => {
    // Calculate color based on time
    const elapsedTime = clock.getElapsedTime();
    const color = new THREE.Color("black").lerp(
      new THREE.Color("white"),
      Math.sin(elapsedTime) * 0.5 + 0.5,
    );

    scene.traverse((child) => {
      if (!!child?.isMesh) {
        const center = new THREE.Vector3();
        child.geometry.boundingSphere.center = center;
        child.geometry.boundingBox.center = center;
        child.rotation.set(0, Math.sin(Math.PI / 4) * elapsedTime * 0.25, 0);
      };

      if (!!child?.material) {
        if (autoUpdateMaterial) {
          child.material.color = color;
          child.material.roughness = (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
          child.material.metalness = (Math.sin(elapsedTime * 0.25) + 1) * 0.5;
        }
        else {
          const color = new THREE.Color("black");
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
      };
    });
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
    scale,
  } = data;

  const { size, camera, get } = useThree();
  const groupRef = useRef();
  // Update camera position and orbit controls 
  useEffect(() => {
    if (groupRef.current) {
      const groupScale = scaleAtBreakpoint(size.width);
      groupRef.current.scale.set(groupScale, groupScale, groupScale);

      const boundingBox = new THREE.Box3().setFromObject(groupRef.current);
      const center = boundingBox.getCenter(new THREE.Vector3());

      camera.position.copy(center);
      //lift the camera up by a small amount if there are more than 2 models
      camera.position.y += modelUrls.length > 2 ? cameraPosition[1] + 10 : cameraPosition[1];
      camera.position.z += cameraPosition[2];
      camera.lookAt(center);
      //  update OrbitControls target.
      const controls = get().controls;
      if (controls) {
        controls.target.copy(center);
        controls.update();
      }
    }
  }, [groupRef, size, camera, cameraPosition, modelUrls, get]);

  return (
    <>
      <group castShadow receiveShadow ref={groupRef}>
        {modelUrls.map((url, index) => {
          let updateScale = modelUrls.length === 1 ? scale * 0.5 : scaleAtBreakpoint(size.width) / modelUrls.length;
          // stagger z-position of models if there are more than 2
          const zOffset = modelUrls.length > 2 ? -50 : 0;
          const newProps = {
            modelUrl: url,
            material: { ...colorCodes }, // material properties
            scale: updateScale,
            autoUpdateMaterial,
            position: [
              scaleX(size.width) * parseInt((index * size.width) / (modelUrls.length * 2)), //position x at midpoints of divided viewport
              - 25, // position the model below the camera by a small amount
              index % 2 === 0 ? -40 + zOffset : -40, // and away from the camera away by a small amount
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
      scale,
      colorCodes,
      modelUrls,
      orthographic,
      autoUpdateMaterial = true,
      autoRotate = false, // disable camera auto rotation. Model rotation is calculated in Model component.
      autoRotateSpeed = 3,
      enableRotate = false,
      enablePan = false,
      enableZoom = false,
      cameraPosition = [0, 10, 160],
    },
  } = data;
  const sceneProps = {
    scale,
    material: { ...colorCodes },
    modelUrls,
    orthographic,
    autoUpdateMaterial,
    autoRotate,
    autoRotateSpeed,
    enableRotate,
    enablePan,
    enableZoom,
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
        <Environment shadows files="./studio_small_08_4k.exr" blur={0.6} />
      </Canvas>
    </Suspense>
  );
};

export default SceneViewer;
