"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Loader, useTexture, Plane } from "@react-three/drei";
import { scaleMeshAtBreakpoint } from "../../lib/utils"

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
  // const material = useMemo(() => new THREE.MeshPhysicalMaterial(materialProps), [materialProps]);
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
    const elapsedTime = clock.getElapsedTime();

    scene.traverse((child) => {
      if (!!child?.isMesh && autoRotate) {
        child.rotation.set(0, Math.sin(Math.PI / 2) * elapsedTime * 0.3, 0);
      };

      // if (!!child?.material && updateMaterial) {
      //   const color = new THREE.Color(colors[0]).lerp(
      //     new THREE.Color(colors[1]),
      //     Math.sin(elapsedTime) * 0.5 + 0.5,
      //   );

      //   child.material.reflectivity = (Math.sin(elapsedTime * 0.5) + 1);
      //   child.material.color = color;
      //   child.material.roughness = (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
      //   child.material.metalness = (Math.sin(elapsedTime * 0.25) + 1) * 0.5;
      // };
    });
  });

  return <primitive castShadow receiveShadow object={scene} />;
};

const Group = (data) => {
  const {
    autoUpdateMaterial: update,
    colorCodes,
    modelUrls,
    cameraPosition,
    autoRotate,
    scale,
  } = data;
  const [modelPosition, setModelPosition] = useState([]);
  const { size, camera, } = useThree();
  const groupRef = useRef();
  const positions = [];
  let groupScale = 1;
  const handles = [];
  const bezierCurve = new THREE.EllipseCurve(
    0,
    0,
    50,
    150,
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
  }

  const boxGeometry = new THREE.BoxGeometry(2, 2, 2); // to visualize handle positions
  // const boxMaterial = new THREE.MeshBasicMaterial();
  for (const handlePosition of handlePositions) {
    const handle = new THREE.Mesh(boxGeometry);//, boxMaterial);
    handle.position.copy(handlePosition);
    handles.push(handle);
    // scene.add(handle);
  }
  // scene.add(ellipse)
  // const material = new THREE.MeshPhysicalMaterial({ ...colorCodes.defaultColor.material })
  // material.wireframe = true
  // material.vertexColors = true

  const cameraPathCurve = new THREE.CatmullRomCurve3(handles.map((handle) => handle.position));
  cameraPathCurve.curveType = 'centripetal';
  cameraPathCurve.closed = true;

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
    };

  }, [modelUrls]);

  // Update camera position
  useFrame(({ clock }, delta) => {
    let s = (clock.getElapsedTime() * 0.1) % 1;

    if (groupRef.current && (delta > (1 / 60))) {
      const position = cameraPathCurve.getPoint(s);

      groupRef.current.scale.set(groupScale, groupScale, groupScale);

      if (modelUrls.length > 1) {
        camera.position.x = position.x;
        camera.position.y = modelUrls.length > 2 ? cameraPosition[1] + 27 : cameraPosition[1];
        camera.position.z = position.z + cameraPosition[2];
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
          // const pos = { ...modelPosition[index] }
          // const newPositions = []
          // for (const p in pos) {
          //   if (p == 1) {
          //     newPositions.push(pos[f] + 20)
          //   }
          //   else {
          //     newPositions.push(pos[f])
          //   }
          // }
          // console.log(newPositions)

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

const Floor = () => {
  const textureProps = useTexture({
    displacementMap: './rock_boulder_dry_disp_4k.jpg',
    normalMap: './rock_boulder_dry_nor_gl_4k.jpg',
    map: './rock_boulder_dry_diff_4k.jpg',
  });

  const props = {
    ...textureProps,
    metalness: 1,
    roughness: 1,
    ior: 1.5,
    sheen: 0,
    color: "#3d3d3d",
    displacementScale: 45
  };

  return (
    <Plane
      args={[1500, 1500, 45, 45]}
      position={[0, -65, 0]}
      rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      receiveShadow
      castShadow
    >
      <meshPhysicalMaterial {...props} />
    </Plane>
  )
}

const AdaptivePixelRatio = () => {
  const current = useThree((state) => state.performance.current);
  const setPixelRatio = useThree((state) => state.setDpr);

  useEffect(() => {
    setPixelRatio(window.devicePixelRatio * current)
  }, [current]);

  return null;
}

export const Scene = ({ data }) => {
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
        <AdaptivePixelRatio />
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
        <fog attach="fog" density={0.0055} color="#bcbcbc" near={50} far={320} />
        <Group {...data} />
        <Floor />
      </Canvas>
    </Suspense>
  );
};

export default Scene;
