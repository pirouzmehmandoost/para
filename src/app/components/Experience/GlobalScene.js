"use client";

import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Environment, Loader } from "@react-three/drei";
import portfolio from "../../../lib/globals"
import { Model as Ground } from "../../../../public/Env_ground_3"
import Group from "./Group";

THREE.ColorManagement.enabled = true;
const cameraPosition = [0, 10, 180];

const SceneBuilder = () => {
  const groupRef = useRef();
  const { camera } = useThree();

  const { projects } = portfolio;
  const handleBoxes = []; //to see positions developing
  const handlePositions = [];

  const bezierCurve = new THREE.EllipseCurve(0, 0, 280, 20, 0, (2 * Math.PI), false, 0);
  bezierCurve.closed = true;

  const bezierCurvePoints = bezierCurve.getPoints(projects.length);
  bezierCurvePoints.shift(); //remove an overlapping point

  const bezierGeometry = new THREE.BufferGeometry().setFromPoints(bezierCurvePoints);

  const ellipse = new THREE.Line(bezierGeometry, new THREE.LineBasicMaterial({ color: "red" }));
  ellipse.position.set(0, 0, 0);
  ellipse.rotation.x = Math.PI * 0.5;

  const positionAttribute = ellipse.geometry.getAttribute('position');
  const vertex = new THREE.Vector3();

  for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++) {
    const pt = vertex.fromBufferAttribute(positionAttribute, vertexIndex);
    handlePositions.push(new THREE.Vector3(pt.x, 0, pt.y));
  };

  const boxGeometry = new THREE.BoxGeometry(5, 5, 5); // to visualize handle positions
  const boxMaterial = new THREE.MeshBasicMaterial({ color: "blue" });
  for (const handlePosition of handlePositions) {
    const handle = new THREE.Mesh(boxGeometry, boxMaterial);
    handle.position.copy(handlePosition);
    handleBoxes.push(handle);
  };

  const cameraPoints = [];
  handleBoxes.forEach(box => {
    cameraPoints.push(box.position)
    cameraPoints.push(new THREE.Vector3(box.position.x * 1.1, box.position.y + 5, box.position.z - 20))
    cameraPoints.push(new THREE.Vector3(box.position.x, box.position.y - 5, box.position.z - 30))
    cameraPoints.push(new THREE.Vector3(box.position.x * 0.9, box.position.y + 5, box.position.z - 25))
    cameraPoints.push(new THREE.Vector3(box.position.x * 0.95, box.position.y + 8, box.position.z + -20))
    cameraPoints.push(new THREE.Vector3(box.position.x, box.position.y + 10, box.position.z - 15))
    cameraPoints.push(new THREE.Vector3(box.position.x * 0.9, box.position.y, box.position.z - 20))
    cameraPoints.push(new THREE.Vector3(box.position.x * 1.02, box.position.y - 5, box.position.z - 25))
    cameraPoints.push(new THREE.Vector3(box.position.x * 0, box.position.y, box.position.z))
  });

  const cameraPathCurve = new THREE.CatmullRomCurve3(cameraPoints.map((handle) => handle));
  cameraPathCurve.curveType = 'centripetal';
  cameraPathCurve.closed = true;

  useFrame(({ clock }) => {
    let s = (clock.getElapsedTime() * 0.03) % 1;
    const position = cameraPathCurve.getPoint(s);

    camera.position.x = position.x
    camera.position.y = cameraPosition[1] + 27
    camera.position.z = position.z + cameraPosition[2];

    camera.lookAt(position.x, position.y, position.z);
  });

  return (
    <group ref={groupRef}>
      {
        projects.map((data, index) => {
          const newProps = {
            data,
            ...data.sceneData,
            position: handlePositions[index],
            autoRotateSpeed: index % 2 == 0 ? -1 : 1
          };

          return <Group key={index} {...newProps} />
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
        <fog attach="fog" density={0.006} color="#bcbcbc" near={50} far={310} />
        <SceneBuilder />
        <Ground position={[0, -85, 20]} scale={1.6} />
      </Canvas>
    </Suspense>
  );
};

export default GlobalScene;


// const Scene = (data) => {
//   const router = useRouter()
//   const [modelPosition, setModelPosition] = useState([]);
//   const { size } = useThree();
//   const groupRef = useRef();
//   const setSelection = useSelection((state) => state.setSelection);

//   console.log("Scene data: ", data)
//   const {
//     colorCodes,
//     modelUrls,
//     autoRotate,
//     scale,
//     position: groupPosition,
//     data: selectedProject,
//   } = data;

//   const positions = [];
//   // let groupScale = scaleMeshAtBreakpoint(size.width);
//   const handles = [];
//   const bezierCurve = new THREE.EllipseCurve(
//     0,
//     0,
//     40,
//     30,
//     0,
//     2 * Math.PI,
//     false,
//     0
//   );
//   bezierCurve.closed = true;

//   const bezierCurvePoints = bezierCurve.getPoints(modelUrls.length);
//   bezierCurvePoints.shift(); //remove an overlapping point

//   const bezierGeometry = new THREE.BufferGeometry().setFromPoints(bezierCurvePoints);

//   const ellipse = new THREE.Line(bezierGeometry, new THREE.MeshBasicMaterial());
//   ellipse.rotation.x = Math.PI * 0.5;

//   const vertex = new THREE.Vector3();
//   const positionAttribute = ellipse.geometry.getAttribute('position');

//   const handlePositions = [];

//   for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++) {
//     const pt = vertex.fromBufferAttribute(positionAttribute, vertexIndex);

//     handlePositions.push({
//       x: pt.x,
//       y: 0,
//       z: pt.y
//     });
//   };

//   const boxGeometry = new THREE.BoxGeometry(2, 2, 2); // to visualize handle positions
//   // const boxMaterial = new THREE.MeshBasicMaterial({ color: "red" });
//   for (const handlePosition of handlePositions) {
//     const handle = new THREE.Mesh(boxGeometry)//, boxMaterial);
//     handle.position.copy(handlePosition);
//     handles.push(handle);
//     // scene.add(handle);
//   }
//   // scene.add(ellipse)
//   // const material = new THREE.MeshPhysicalMaterial({ ...colorCodes.defaultColor.material })
//   // material.wireframe = true
//   // material.vertexColors = true

//   // const cameraPathCurve = new THREE.CatmullRomCurve3(handles.map((handle) => handle.position));
//   // cameraPathCurve.curveType = 'centripetal';
//   // cameraPathCurve.closed = true;

//   // const points = cameraPathCurve.getPoints(modelUrls.length);
//   // const line = new THREE.LineLoop(
//   //   new THREE.BufferGeometry().setFromPoints(points),
//   //   new THREE.LineBasicMaterial({ color: 0x00ff00 })
//   // );
//   // scene.add(line);

//   useEffect(() => {
//     // groupScale = scaleMeshAtBreakpoint(size.width);
//     if (modelUrls.length > 1) {
//       for (const handlePosition of handlePositions) {
//         const p = [
//           handlePosition.x * 1.6,
//           handlePosition.y,
//           handlePosition.z * 1.5,
//         ]
//         positions.push(p);
//       }
//       setModelPosition(positions);
//       // if (groupRef.current) {
//       //  groupRef.current.scale.set(groupScale, groupScale, groupScale);
//       // }
//     };

//   }, [modelUrls]); //three.js state is not included in dependency array

//   // Update camera position and orbit controls 
//   // useFrame(({ clock }) => {
//   // let s = (clock.getElapsedTime() * 0.1) % 1;

//   // if (groupRef.current) {
//   // const position = cameraPathCurve.getPoint(s);
//   // groupRef.current.position.copy(position);
//   // groupRef.current.scale.set(groupScale, groupScale, groupScale);

//   // if (modelUrls.length > 1) {
//   //   camera.position.x = position.x;
//   //   camera.position.y = modelUrls.length > 2 ? cameraPosition[1] + 27 : cameraPosition[1];
//   //   camera.position.z = position.z + cameraPosition[2];
//   //   camera.lookAt(position);
//   // } else {
//   //   camera.position.x = 0
//   //   camera.position.y = cameraPosition[1];
//   //   camera.position.z = cameraPosition[2]
//   //   camera.lookAt(0, 0, 0);
//   // }
//   // };
//   // });

//   return (
//     <group
//       ref={groupRef}
//       position={groupPosition}
//       onClick={() => {
//         console.log("clicked!", selectedProject.name);
//         setSelection(selectedProject);
//         router.push('/project');
//       }}
//     >
//       {
//         modelUrls.map((url, index) => {
//           const updateScale = modelUrls.length === 1 ? scale * 0.5 : scaleMeshAtBreakpoint(size.width) / modelUrls.length;
//           const newProps = {
//             modelUrl: url,
//             material: modelUrls.length === 1 ? { ...colorCodes.defaultColor.material } : Object.values(colorCodes.colorWays)[index].material, // material properties
//             scale: updateScale,
//             autoRotate: modelUrls.length === 1 || index > 0 ? autoRotate : false,
//             position: modelPosition[index]
//           };

//           return (
//             <Model key={index} {...newProps} />
//           );
//         })
//       }
//     </group>
//   );
// };

