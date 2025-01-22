"use client";

import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  Loader,
  Plane,
  CameraControls,
  SoftShadows,
} from "@react-three/drei";
import { scaleMeshAtBreakpoint, ACTION } from "../../lib/utils"

THREE.ColorManagement.enabled = true;

// const CameraRig = (data, { v = new THREE.Vector3() }) => {

//   const { cameraPosition } = data;
//   // const { size, camera, get } = useThree();

//   // camera.position.copy(center);
//   // camera.position.x = 0
//   // // camera.position.y += modelUrls.length > 2 ? cameraPosition[1] + 10 : cameraPosition[1];
//   // camera.position.z += cameraPosition[2]
//   // camera.lookAt(center);

//   return useFrame((state) => {
//     const t = state.clock.elapsedTime
//     state.camera.position.lerp(
//       v.set(
//         0,
//         (Math.tan(t * -0.5) + 1) * 50,
//         -1 * Math.log(t) + cameraPosition[2],
//         // (cameraPosition[2]) * (Math.cos(t / 2) + 1)
//         // (cameraPosition[2]) * (Math.cos(t / 2) + 1)
//       ),
//       0.06
//     )
//     state.camera.lookAt(0, 0, 0)
//   })
// }

const Model = (data) => {
  const {
    material: materialProps,
    modelUrl,
    autoUpdateMaterial,
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

  // update rotation and material properties
  useFrame(({ clock }) => {
    // material and rotation calculations are based on time
    const elapsedTime = clock.getElapsedTime();
    const color = new THREE.Color("black").lerp(
      new THREE.Color("white"),
      Math.sin(elapsedTime) * 0.5 + 0.5,
    );

    if (!autoRotate || autoUpdateMaterial) {
      scene.traverse((child) => {
        if (!!child?.isMesh && !autoRotate) {
          child.rotation.set(0, Math.sin(Math.PI / 4) * elapsedTime * 0.25, 0);
        };

        if (!!child?.material && autoUpdateMaterial) {
          child.material.color = color;
          child.material.roughness = (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
          child.material.metalness = (Math.sin(elapsedTime * 0.25) + 1) * 0.5;
        };
      });
    };
  });

  return <primitive castShadow receiveShadow object={scene} />;
};

const Scene = (data) => {
  const {
    autoUpdateMaterial,
    colorCodes,
    modelUrls,
    // cameraPosition,
    autoRotate,
  } = data;
  // const { size, camera, get } = useThree();
  const { size } = useThree();

  const groupRef = useRef();
  // const boundingBox = new THREE.Box3();
  useEffect(() => {
    if (groupRef.current) {
      const groupScale = scaleMeshAtBreakpoint(size.width);
      groupRef.current.scale.set(groupScale, groupScale, groupScale);
      // boundingBox.setFromObject(groupRef.current);
      // const center = boundingBox.getCenter(new THREE.Vector3());

      // camera.position.copy(center);
      // camera.position.x = 0
      // camera.position.z += cameraPosition[2]
      // camera.lookAt(center);

      // const controls = get().controls;
      // if (controls) {
      //   controls.target.copy(center);
      //   controls.update();
      // };
    };
  }, [groupRef]); //three.js state is not included in dependency array

  const newProps = {
    modelUrl: modelUrls[0],
    material: { ...colorCodes.defaultColor.material },
    scale: 0.45,
    autoUpdateMaterial,
    autoRotate,
  }
  return (
    <group castShadow receiveShadow ref={groupRef}>
      <Model {...newProps} />
    </group>
  );
};

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
        {/* <CameraRig {...data} /> */}
        <CameraControls
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 2}
          maxAzimuthAngle={Math.PI / 2}
          mouseButtons={{ left: ACTION.ROTATE, middle: ACTION.NONE, right: ACTION.NONE, wheel: ACTION.NONE }}
          touches={{ one: ACTION.TOUCH_ROTATE, two: ACTION.NONE, three: ACTION.NONE }}
        />

        <fog attach="fog" density={0.004} color="#bcbcbc" near={50} far={450} />

        <directionalLight
          castShadow={true}
          position={[0, 60, 10]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          intensity={1.5}
          angle={0.45}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
          shadow-bias={-0.001}
          shadow-camera-top={800}
          shadow-camera-bottom={-800}
          shadow-camera-left={-800}
          shadow-camera-right={800}
        />

        <Scene castShadow receiveShadow {...data} />
        <SoftShadows samples={15} size={10} />

        <Plane receiveShadow args={[1500, 1500]} position={[0, -53, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#3d3d3d" />
        </Plane>

      </Canvas>
    </Suspense>
  );
};

export default ModelViewer;
