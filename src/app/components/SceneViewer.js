"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  Loader,
} from "@react-three/drei";

THREE.ColorManagement.enabled = true;

const scaleMeshAtBreakpoint = (width) => {
  if (width <= 360) {
    return 0.6;
  }
  if (width <= 480) {
    return 0.7;
  }
  if (width <= 640) { //sm
    return 0.8;
  }
  if (width <= 768) { //md
    return 0.9;
  }
  return 1;   //lg, xl, 2xl
};

const scaleXAtBreakPoint = (width) => {
  if (width <= 360) {
    return 1.5;
  }
  if (width <= 480) {
    return 1.2;
  }
  if (width <= 640) { //sm
    return 1.0;
  }
  if (width <= 768) { //md
    return 0.9;
  }
  return 0.7; //lg, xl, 2xl
};

// const cameraZPosition = (width, position) => {
//   if (width <= 360) {
//     return 1.0 * position;
//   }
//   if (width <= 480) {
//     return 1.0 * position;
//   }
//   if (width <= 768) { //md
//     return 1.0 * position;
//   }
//   return 1.0 * position; //lg, xl, 2xl
// };

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

const Scene = (data) => {
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
  const [modelPosition, setModelPosition] = useState([]);
  const { size, camera, get } = useThree();
  const groupRef = useRef();

  // Update camera position and orbit controls 
  useEffect(() => {
    if (groupRef.current) {
      const positions = [];
      const xOffset = [];
      const yOffset = modelUrls.length >= 2 ? -25 : -30;
      const zOffset = -40;

      if (modelUrls.length == 1) {
        xOffset.push(0)
      }
      else {
        if (modelUrls.length % 2 == 1) {
          xOffset.push(0)
        };

        for (let i = 1; i < modelUrls.length; i++) {
          // x position based on rule of thirds.
          let offset = parseInt((scaleXAtBreakPoint(size.width) * parseInt(i * size.width)) / (modelUrls.length * 2)) * (i % 2 === 0 ? 1 : -1);
          xOffset.push(offset);
          xOffset.push(-1 * offset);
        };
      };

      for (let i = 0; i < modelUrls.length; i++) {
        let arr = [];
        arr.push(xOffset[i]);
        arr.push(yOffset);
        arr.push(zOffset)
        positions.push(arr);
      };

      positions.sort((a, b) => a[0] - b[0]);

      if (modelUrls.length > 2) {
        positions.forEach((arr, i) => {
          arr[2] += (i % 2 === 0) ? -50 : 0
        })
      };

      setModelPosition([...positions]);

      const groupScale = scaleMeshAtBreakpoint(size.width);
      groupRef.current.scale.set(groupScale, groupScale, groupScale);

      const boundingBox = new THREE.Box3().setFromObject(groupRef.current);
      const center = boundingBox.getCenter(new THREE.Vector3());

      camera.position.copy(center);
      camera.position.x = 0
      camera.position.y += modelUrls.length > 2 ? cameraPosition[1] + 10 : cameraPosition[1];
      camera.position.z += cameraPosition[2]
      camera.lookAt(center);

      const controls = get().controls;
      if (controls) {
        // controls.target.copy(groupRef.current.position);
        controls.target.copy(center);
        controls.update();
      };
    };
  }, [groupRef, size, camera, cameraPosition, modelUrls, get, modelPosition]);

  return (
    <>
      <group ref={groupRef}>
        {
          modelUrls.map((url, index) => {

            let updateScale = modelUrls.length === 1 ? scale * 0.5 : scaleMeshAtBreakpoint(size.width) / modelUrls.length;

            const newProps = {
              modelUrl: url,
              material: { ...colorCodes }, // material properties
              scale: updateScale,
              autoUpdateMaterial,
              position: modelPosition[index],
            };

            return <Model key={index} {...newProps} />;

          })
        }
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
        <Scene {...sceneProps} />
      </Canvas>
    </Suspense>
  );
};

export default SceneViewer;
