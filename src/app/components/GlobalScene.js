"use client";
// import Link from "next/link";
import { Suspense, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  Loader,
  Html,
} from "@react-three/drei";
import {
  scaleMeshAtBreakpoint,
} from "../../lib/utils"
import portfolio from "../../lib/globals"
import { Model as Ground } from "./../../../public/Env_ground_3"
import useSelection from "../store/selection";

THREE.ColorManagement.enabled = true;

const Model = (data) => {
  const {
    material: materialProps,
    modelUrl,
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

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    scene.traverse((child) => {
      if (!!child?.isMesh && autoRotate) {
        child.rotation.set(0, Math.sin(Math.PI / 2) * elapsedTime * 0.3, 0);
      };
    });
  });

  return <primitive castShadow receiveShadow object={scene} />;
};

const Scene = (data) => {
  const [modelPosition, setModelPosition] = useState([]);
  const {
    size,
    scene,
  } = useThree();
  const groupRef = useRef();
  const setSelection = useSelection((state) => state.setSelection);


  console.log("Scene data: ", data)
  const {
    autoUpdateMaterial: update,
    colorCodes,
    modelUrls,
    autoRotate,
    scale,
    position: groupPosition,
    data: selectedProject,
  } = data;

  const positions = [];
  let groupScale = scaleMeshAtBreakpoint(size.width);
  const handles = [];
  const bezierCurve = new THREE.EllipseCurve(
    0,
    0,
    40,
    30,
    0,
    2 * Math.PI,
    false,
    0
  );
  bezierCurve.closed = true;

  const bezierCurvePoints = bezierCurve.getPoints(modelUrls.length);
  bezierCurvePoints.shift(); //remove an overlapping point

  const bezierGeometry = new THREE.BufferGeometry().setFromPoints(bezierCurvePoints);

  const ellipse = new THREE.Line(bezierGeometry, new THREE.MeshBasicMaterial());
  ellipse.rotation.x = Math.PI * 0.5;

  const vertex = new THREE.Vector3();
  const positionAttribute = ellipse.geometry.getAttribute('position');

  const handlePositions = [];

  for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++) {
    const pt = vertex.fromBufferAttribute(positionAttribute, vertexIndex);

    handlePositions.push({
      x: pt.x,
      y: 0,
      z: pt.y
    });
  };

  const boxGeometry = new THREE.BoxGeometry(2, 2, 2); // to visualize handle positions
  // const boxMaterial = new THREE.MeshBasicMaterial({ color: "red" });
  for (const handlePosition of handlePositions) {
    const handle = new THREE.Mesh(boxGeometry)//, boxMaterial);
    handle.position.copy(handlePosition);
    handles.push(handle);
    // scene.add(handle);
  }
  // scene.add(ellipse)
  // const material = new THREE.MeshPhysicalMaterial({ ...colorCodes.defaultColor.material })
  // material.wireframe = true
  // material.vertexColors = true

  // const cameraPathCurve = new THREE.CatmullRomCurve3(handles.map((handle) => handle.position));
  // cameraPathCurve.curveType = 'centripetal';
  // cameraPathCurve.closed = true;

  // const points = cameraPathCurve.getPoints(modelUrls.length);
  // const line = new THREE.LineLoop(
  //   new THREE.BufferGeometry().setFromPoints(points),
  //   new THREE.LineBasicMaterial({ color: 0x00ff00 })
  // );
  // scene.add(line);

  useEffect(() => {
    groupScale = scaleMeshAtBreakpoint(size.width);
    if (modelUrls.length > 1) {
      for (const handlePosition of handlePositions) {
        const p = [
          handlePosition.x * 1.6,
          handlePosition.y,
          handlePosition.z * 1.5,
        ]
        positions.push(p);
      }
      setModelPosition(positions);
      // if (groupRef.current) {
      //  groupRef.current.scale.set(groupScale, groupScale, groupScale);
      // }
    };

  }, [modelUrls]); //three.js state is not included in dependency array

  // Update camera position and orbit controls 
  // useFrame(({ clock }) => {
  // let s = (clock.getElapsedTime() * 0.1) % 1;

  // if (groupRef.current) {
  // const position = cameraPathCurve.getPoint(s);
  // groupRef.current.position.copy(position);
  // groupRef.current.scale.set(groupScale, groupScale, groupScale);

  // if (modelUrls.length > 1) {
  //   camera.position.x = position.x;
  //   camera.position.y = modelUrls.length > 2 ? cameraPosition[1] + 27 : cameraPosition[1];
  //   camera.position.z = position.z + cameraPosition[2];
  //   camera.lookAt(position);
  // } else {
  //   camera.position.x = 0
  //   camera.position.y = cameraPosition[1];
  //   camera.position.z = cameraPosition[2]
  //   camera.lookAt(0, 0, 0);
  // }
  // };
  // });

  return (
    <group ref={groupRef} position={groupPosition}>

      <Html
        position={groupPosition}
        className="bg-red-500 opacity-50 w-60 h-64"
        key={selectedProject.name}
        onClick={() => setSelection(selectedProject)}

      >
        {/* <Link
          className="w-full h-full place-self-center cursor-pointer"
          onClick={() => setSelection(selectedProject)}
          href="/project"
          rel="noopener noreferrer"
        /> */}
        <a
          // rel="noopener noreferrer"
          href="/project"
          className="w-full flex bg-yellow-400 items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white hover:bg-indigo-700"
        >
          {selectedProject.name}
        </a>
      </Html>
      {
        modelUrls.map((url, index) => {
          const updateScale = modelUrls.length === 1 ? scale * 0.5 : scaleMeshAtBreakpoint(size.width) / modelUrls.length;
          const newProps = {
            modelUrl: url,
            material: modelUrls.length === 1 ? { ...colorCodes.defaultColor.material } : Object.values(colorCodes.colorWays)[index].material, // material properties
            scale: updateScale,
            autoUpdateMaterial: {
              updateMaterial: update,
              colors: index % 2 == 0 ? ["black", "white"] : ["white", "black"]
            },
            autoRotate: modelUrls.length === 1 || index > 0 ? autoRotate : false,
            position: modelPosition[index]
          };

          return (
            <Model key={index} {...newProps} />
          );
        })
      }
    </group>
  );
};


const SceneBuilder = (data) => {
  const { cameraPosition } = data;
  const { projects } = portfolio;
  const [scenePosition, setScenePosition] = useState([]);
  const { scene, size, camera, } = useThree();
  const groupRef = useRef();
  const positions = [];
  let groupScale = scaleMeshAtBreakpoint(size.width);
  const handles = [];
  const bezierCurve = new THREE.EllipseCurve(
    0,
    0,
    150,
    10,
    0,
    2 * Math.PI,
    false,
    0
  );
  bezierCurve.closed = true;

  const bezierCurvePoints = bezierCurve.getPoints(projects.length);
  bezierCurvePoints.shift(); //remove an overlapping point

  const bezierGeometry = new THREE.BufferGeometry().setFromPoints(bezierCurvePoints);

  const ellipse = new THREE.Line(bezierGeometry, new THREE.MeshBasicMaterial());
  ellipse.rotation.x = Math.PI * 0.5;

  const vertex = new THREE.Vector3();
  const positionAttribute = ellipse.geometry.getAttribute('position');

  const handlePositions = [];

  for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++) {
    const pt = vertex.fromBufferAttribute(positionAttribute, vertexIndex);

    handlePositions.push({
      x: pt.x,
      y: 0,
      z: pt.y
    });
  };

  const boxGeometry = new THREE.BoxGeometry(5, 5, 5); // to visualize handle positions
  const boxMaterial = new THREE.MeshBasicMaterial({ color: "blue" });
  for (const handlePosition of handlePositions) {
    const handle = new THREE.Mesh(boxGeometry, boxMaterial);
    handle.position.copy(handlePosition);
    handles.push(handle);
    scene.add(handle);
  }
  scene.add(ellipse)
  const material = new THREE.MeshPhysicalMaterial({ color: 0xFF0000 })
  material.wireframe = true
  material.vertexColors = true

  const cameraPathCurve = new THREE.CatmullRomCurve3(handles.map((handle) => handle.position));
  cameraPathCurve.curveType = 'centripetal';
  cameraPathCurve.closed = true;

  const points = cameraPathCurve.getPoints(projects.length);
  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x00ff00 })
  );
  scene.add(line);

  useEffect(() => {
    groupScale = scaleMeshAtBreakpoint(size.width);
    if (projects.length > 1) {
      for (const handlePosition of handlePositions) {
        const p = [
          handlePosition.x * 1.6,
          handlePosition.y,
          handlePosition.z * 1.5,
        ]
        positions.push(p);
      }
      setScenePosition(positions);
    };

  }, [projects]); //three.js state is not included in dependency array

  // Update camera position and orbit controls 
  useFrame(({ clock }) => {
    let s = (clock.getElapsedTime() * 0.05) % 1;
    let t = Math.sin(clock.getElapsedTime() * 0.1) + 1

    if (groupRef.current) {
      groupRef.current.scale.set(groupScale, groupScale, groupScale);

      const position = cameraPathCurve.getPoint(s);

      camera.position.x = position.x * t * 1.12;
      // camera.position.x = position.x;
      camera.position.y = cameraPosition[1] * t * 2.2 + 27;
      camera.position.z = position.z + (Math.cos(clock.getElapsedTime() * 0.5) + 1) + cameraPosition[2];
      camera.lookAt(position);
    };
  });

  return (
    <group ref={groupRef}>
      {
        projects.map((data, index) => {
          const newProps = {
            data,
            ...data.sceneData,
            position: scenePosition[index]
          };

          return (
            <Scene key={index} {...newProps} />
          );
        })
      }
    </group>
  );
};

const AdaptivePixelRatio = () => {
  const current = useThree((state) => state.performance.current);
  const setPixelRatio = useThree((state) => state.setDpr);

  useEffect(() => {
    setPixelRatio(window.devicePixelRatio * current)
  }, [current]);

  return null;
};

export const GlobalScene = () => {
  const cameraPosition = [0, 10, 180];
  const orthographic = false;
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
        <AdaptivePixelRatio pixelated />
        <Environment shadows files="./studio_small_08_4k.exr" />
        <directionalLight
          castShadow={true}
          position={[0, 100, 0]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          intensity={7}
          angle={0.45}
          shadow-camera-near={0.5}
          shadow-camera-far={1000}
          shadow-bias={-0.001}
          shadow-camera-top={1500}
          shadow-camera-bottom={-1500}
          shadow-camera-left={-1500}
          shadow-camera-right={1500}
        />
        <directionalLight
          castShadow={true}
          position={[0, 200, 0]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          intensity={5}
          angle={0.45}
          shadow-camera-near={0.5}
          shadow-camera-far={1000}
          shadow-bias={-0.001}
          shadow-camera-top={1500}
          shadow-camera-bottom={-1500}
          shadow-camera-left={-1500}
          shadow-camera-right={1500}
        />
        <fog attach="fog" density={0.0055} color="#bcbcbc" near={50} far={320} />
        <SceneBuilder cameraPosition={cameraPosition} />
        <Ground position={[0, -75, 20]} scale={1.3} />
      </Canvas>
    </Suspense>
  );
};

export default GlobalScene;
