"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  Loader,
} from "@react-three/drei";
import {
  scaleMeshAtBreakpoint,
  // scalePositionAtBreakPoint 
} from "../../lib/utils"

THREE.ColorManagement.enabled = true;

const Model = (data) => {
  const {
    material: materialProps,
    modelUrl,
    autoUpdateMaterial: {
      updateMaterial,
      colors,
    },
    autoRotate,
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

  //update rotation and material properties
  useFrame(({ clock }) => {
    //material and rotation calculations are based on time
    const elapsedTime = clock.getElapsedTime();

    scene.traverse((child) => {
      if (!!child?.isMesh && autoRotate) {
        child.rotation.set(0, Math.sin(Math.PI / 3) * elapsedTime * 0.3, 0);
      };

      if (!!child?.material) {
        if (updateMaterial) {
          // Calculate color based on time
          const color = new THREE.Color(colors[0]).lerp(
            new THREE.Color(colors[1]),
            Math.sin(elapsedTime) * 0.5 + 0.5,
          );

          child.material.reflectivity = (Math.sin(elapsedTime * 0.5) + 1);
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
  // const { projects } = portfolio;

  const {
    autoUpdateMaterial: update,
    colorCodes,
    modelUrls,
    cameraPosition,
    autoRotate,
    scale,
  } = data;
  const [modelPosition, setModelPosition] = useState([]);
  const { scene, size, camera, } = useThree();
  const groupRef = useRef();
  const positions = [];
  // const xOffset = [];
  // const yOffset = modelUrls.length >= 2 ? -25 : -30;
  // const zOffset = -40;
  const boundingBox = new THREE.Box3();
  let groupScale = scaleMeshAtBreakpoint(size.width);

  const curveHandles = [];
  const curve2 = new THREE.EllipseCurve(
    0,
    0,
    100,
    100,
    0,
    2 * Math.PI,
    false,
    0
  );
  // curve2.closed = true;

  // const points2 = curve2.getPoints(numCurveHandles);
  const points2 = curve2.getPoints(modelUrls.length);
  points2.shift() //remove a duplicate point

  const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);

  const ellipse = new THREE.Line(geometry2, new THREE.MeshBasicMaterial());
  ellipse.rotation.x = Math.PI * 0.5;

  const vertex = new THREE.Vector3();
  const positionAttribute = ellipse.geometry.getAttribute('position');

  const handlePositions = [];
  for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++) {
    const pt = vertex.fromBufferAttribute(positionAttribute, vertexIndex)

    handlePositions.push({
      x: pt.x,
      y: 0,
      z: pt.y
    });
  }

  const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
  const boxMaterial = new THREE.MeshBasicMaterial();

  for (const handlePosition of handlePositions) {
    const handle = new THREE.Mesh(boxGeometry, boxMaterial);
    handle.position.copy(handlePosition);
    curveHandles.push(handle);
    scene.add(handle);
  }
  scene.add(ellipse)
  const material = new THREE.MeshPhysicalMaterial({ ...colorCodes.defaultColor.material })
  material.wireframe = true
  material.vertexColors = true

  const curve = new THREE.CatmullRomCurve3(curveHandles.map((handle) => handle.position));
  curve.curveType = 'centripetal';
  curve.closed = true;

  const points = curve.getPoints(modelUrls.length);

  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x00ff00 })
  );
  scene.add(line);

  useEffect(() => {
    groupScale = scaleMeshAtBreakpoint(size.width);
    if (modelUrls.length > 1) {
      for (const handlePosition of handlePositions) {
        const p = [
          handlePosition.x * 1.6,
          handlePosition.y * 1.2,
          handlePosition.z * 1.5,
        ]
        positions.push(p);
      }
      setModelPosition(positions);
    };

  }, [modelUrls]); //three.js state is not included in dependency array

  // Update camera position and orbit controls 
  useFrame(({ clock }) => {
    let s = (clock.getElapsedTime() * 0.1) % 1;

    if (groupRef.current) {
      const position = curve.getPoint(s);
      // groupRef.current.position.copy(position);
      groupRef.current.scale.set(groupScale, groupScale, groupScale);
      boundingBox.setFromObject(groupRef.current);

      const center = boundingBox.getCenter(new THREE.Vector3());
      camera.position.copy(center);

      if (modelUrls.length > 1) {
        camera.position.x = position.x;
        camera.position.y = modelUrls.length > 2 ? cameraPosition[1] + 10 : cameraPosition[1];
        camera.position.z = position.z + 80
        camera.lookAt(position);
      } else {
        camera.position.x = 0
        camera.position.y = cameraPosition[1];
        camera.position.z = cameraPosition[2]
        camera.lookAt(0, 0, 0);
      }
    };
  });

  return (
    <group ref={groupRef}>
      {
        modelUrls.map((url, index) => {
          let updateScale = modelUrls.length === 1 ? scale * 0.5 : scaleMeshAtBreakpoint(size.width) / modelUrls.length;
          const newProps = {
            modelUrl: url,
            material: { ...colorCodes.defaultColor.material }, // material properties
            scale: updateScale,
            autoUpdateMaterial: {
              updateMaterial: update,
              colors: index % 2 == 0 ? ["black", "white"] : ["white", "black"]
            },
            autoRotate: autoRotate,
            position: modelPosition[index]
          };

          return <Model key={index} {...newProps} />;
        })
      }
    </group>
  );
};

export const Scene = ({ data }) => {
  const {
    orthographic,
    cameraPosition = [0, 10, 160],
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
        <Group {...data} />
      </Canvas>
    </Suspense>
  );
};

export default Scene;
