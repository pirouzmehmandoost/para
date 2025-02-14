"use client";

import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { DoubleSide } from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Environment, Loader, Bounds, Plane } from "@react-three/drei";
import { EffectComposer, N8AO, SMAA, Selection, Outline } from "@react-three/postprocessing";
import { cameraPosition, portfolio, glossMaterial } from "../../../lib/globals";
import { Model as Ground } from "../../../../public/Env_ground_3";
import Group from "./Group";

THREE.ColorManagement.enabled = true;

const SceneBuilder = () => {
  const [hovered, hover] = useState('');
  const { projects } = portfolio;
  const handleBoxes = []; //to see positions while developing
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
    cameraPoints.push(new THREE.Vector3(box.position.x * 1.1, box.position.y + 5, box.position.z - 20));
    cameraPoints.push(new THREE.Vector3(box.position.x, box.position.y - 5, box.position.z - 30));
    cameraPoints.push(new THREE.Vector3(box.position.x * 0.9, box.position.y + 5, box.position.z - 25));
    cameraPoints.push(new THREE.Vector3(box.position.x * 0.95, box.position.y + 8, box.position.z + -20));
    cameraPoints.push(new THREE.Vector3(box.position.x, box.position.y + 10, box.position.z - 15));
    cameraPoints.push(new THREE.Vector3(box.position.x * 0.9, box.position.y, box.position.z - 20));
    cameraPoints.push(new THREE.Vector3(box.position.x * 1.02, box.position.y - 5, box.position.z - 25));
    cameraPoints.push(new THREE.Vector3(box.position.x * 0, box.position.y, box.position.z));
  });

  const cameraPathCurve = new THREE.CatmullRomCurve3(cameraPoints.map((handle) => handle));
  cameraPathCurve.curveType = 'centripetal';
  cameraPathCurve.closed = true;

  useFrame(({ clock, camera }) => {
    let s = (clock.getElapsedTime() * 0.03) % 1;
    const position = cameraPathCurve.getPoint(s);
    camera.position.x = position.x;
    camera.position.y = cameraPosition[1] + 27;
    camera.position.z = position.z + cameraPosition[2];
    camera.lookAt(position.x, position.y, position.z);
  });

  return (
    <Selection>
      <EffectComposer multisampling={0} autoClear={false}>
        < N8AO radius={0.05} intensity={100} xray={true} luminanceInfluence={0.5} color="white" />
        <Outline visibleEdgeColor="white" hiddenEdgeColor="white" width={1000} edgeStrength={100} blur={true} pulseSpeed={0.5}// whether the outline should be blurred
        />
        <SMAA />
      </EffectComposer>
      <Bounds fit clip margin={1.2} damping={10}>
        {/* <group ref={groupRef}> */}
        <group>
          {
            projects.map((data, index) => {
              const newProps = {
                data,
                ...data.sceneData,
                position: handlePositions[index],
                autoRotateSpeed: index % 2 == 0 ? -1 : 1,
                isPointerOver: hovered
              };

              return (
                <group
                  key={index}
                  onPointerOver={(e) => {
                    console.log("\nonPointerOver", e.object.name, e);
                    hover(e.object.name);
                  }}
                  onPointerOut={(e) => {
                    console.log("\nonPointerOut", e.object.name, e);
                    hover('');
                  }}
                >
                  <Group{...newProps} />
                </group>
              )
            })
          }
        </group>
      </Bounds>
    </Selection >
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
        <Environment shadows files="./kloofendal_misty_morning_puresky_4k.hdr" />
        <color args={["#bcbcbc"]} attach="background" />
        <fog attach="fog" density={0.004} color="#bcbcbc" near={160} far={290} />
        <directionalLight
          castShadow={true}
          position={[0, 100, 0]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          intensity={4}
          shadow-camera-near={0.5}
          shadow-camera-far={1000}
          shadow-bias={-0.001}
          shadow-camera-top={1500}
          shadow-camera-bottom={-1500}
          shadow-camera-left={-1500}
          shadow-camera-right={1500}
        />
        <SceneBuilder />
        <Ground position={[0, -75, 20]} scale={[1.6, 1.1, 1]} rotation={Math.PI / 20} />
        <Plane castShadow args={[5000, 5000, 1, 1]} position={[-600, 0, 0]} side={DoubleSide} rotation={[-Math.PI / 1.4, Math.PI / 2.8, 0]}> <meshPhysicalMaterial {...glossMaterial} color={"black"} /> </Plane>
        <Plane castShadow args={[5000, 5000, 1, 1]} position={[600, 0, 0]} side={DoubleSide} rotation={[-Math.PI / 1.4, -Math.PI / 2.8, 0]}> <meshPhysicalMaterial {...glossMaterial} color={"black"} /> </Plane>
      </Canvas>
    </Suspense>
  );
};

export default GlobalScene;
