"use client";

import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  // OrbitControls,
  Environment,
  Loader,
  Plane,
  CameraControls,
  SoftShadows,
} from "@react-three/drei";
import { scaleMeshAtBreakpoint } from "../../lib/utils"

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
    cameraPosition,
    enablePan,
    enableZoom,
    enableRotate,
    autoRotate,
    autoRotateSpeed,
    orthographic,
    // scale,
  } = data;
  // const [modelPosition, setModelPosition] = useState([]);
  const { size, camera, get } = useThree();
  const groupRef = useRef();
  const boundingBox = new THREE.Box3();

  // useEffect(() => {
  //   const center = boundingBox.getCenter(new THREE.Vector3());
  //   const controls = get().controls;
  //
  //   if (controls) {
  //     controls.target.copy(center);
  //     controls.update();
  //   };
  // }, [get]);


  // Update camera position and orbit controls 
  useEffect(() => {
    if (groupRef.current) {
      const groupScale = scaleMeshAtBreakpoint(size.width);
      groupRef.current.scale.set(groupScale, groupScale, groupScale);
      // const positions = [];
      // const xOffset = [];
      // const yOffset = modelUrls.length >= 2 ? -25 : -30;
      // const zOffset = -40;

      // if (modelUrls.length == 1) {
      //   xOffset.push(0)
      // }
      // else {
      //   if (modelUrls.length % 2 == 1) {
      //     xOffset.push(0)
      //   };

      //   for (let i = 1; i < modelUrls.length; i++) {
      //     // x position based on rule of thirds.
      //     let offset = parseInt((scaleXAtBreakPoint(size.width) * parseInt(i * size.width)) / (modelUrls.length * 2)) * (i % 2 === 0 ? 1 : -1);
      //     xOffset.push(offset);
      //     xOffset.push(-1 * offset);
      //   };
      // };

      // for (let i = 0; i < modelUrls.length; i++) {
      //   let arr = [];
      //   arr.push(xOffset[i]);
      //   arr.push(yOffset);
      //   arr.push(zOffset)
      //   positions.push(arr);
      // };

      // positions.sort((a, b) => a[0] - b[0]);

      // if (modelUrls.length > 2) {
      //   positions.forEach((arr, i) => {
      //     arr[2] += (i % 2 === 0) ? -50 : 0
      //   })
      // };

      // setModelPosition([...positions]);

      // boundingBox.setFromObject(groupRef.current);
      // const center = boundingBox.getCenter(new THREE.Vector3());

      // camera.position.copy(center);
      // camera.position.x = 0
      // // camera.position.y += modelUrls.length > 2 ? cameraPosition[1] + 10 : cameraPosition[1];
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
    material: { ...colorCodes.defaultColor.material }, // material properties
    scale: 0.45,
    autoUpdateMaterial,
    autoRotate,
  }
  return (
    <>
      <group castShadow receiveShadow ref={groupRef}>
        <Model {...newProps} />

        {/* {
          modelUrls.map((url, index) => {
            let updateScale = modelUrls.length === 1 ? scale * 0.5 : scaleMeshAtBreakpoint(size.width) / modelUrls.length;
            const newProps = {
              modelUrl: url,
              material,
              scale: updateScale,
              autoUpdateMaterial,
              autoRotate,
              position: modelPosition[index],
            };

            return <Model key={index} {...newProps} />;
          }) 
        }*/}
        {/* <OrbitControls
          target={groupRef}
          makeDefault
          enablePan={enablePan}
          enableZoom={enableZoom}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          enableRotate={enableRotate}
          orthographic={orthographic}
          autoUpdateMaterial={false}
        /> */}
      </group>
    </>
  );
};

export const ModelViewer = ({ data }) => {
  const {
    orthographic,
    cameraPosition,
    enablePan,
    enableZoom
  } = data;
  const near = orthographic ? -100 : 1;
  const fov = orthographic ? 500 : 50;

  const ACTION = {
    NONE: 0,
    ROTATE: 1,
    TRUCK: 2,
    OFFSET: 4,
    DOLLY: 8,
    ZOOM: 16,
    TOUCH_ROTATE: 32,
    TOUCH_TRUCK: 64,
    TOUCH_OFFSET: 128,
    TOUCH_DOLLY: 256,
    TOUCH_ZOOM: 512,
    TOUCH_DOLLY_TRUCK: 1024,
    TOUCH_DOLLY_OFFSET: 2048,
    TOUCH_DOLLY_ROTATE: 4096,
    TOUCH_ZOOM_TRUCK: 8192,
    TOUCH_ZOOM_OFFSET: 16384,
    TOUCH_ZOOM_ROTATE: 32768
  }
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
        {/* <spotLight angle={0.5} penumbra={0.5} ref={light} castShadow intensity={10} shadow-mapSize={1024} shadow-bias={-0.001}>
          <orthographicCamera attach="shadow-camera" args={[-10, 10, -10, 10, 0.1, 50]} />
        </spotLight> */}

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
