"use client";

import { Suspense, useState } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  ColorManagement,
  EllipseCurve,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Loader,
  Bounds,
  SoftShadows,
  //   Plane,
} from "@react-three/drei";
import {
  EffectComposer,
  N8AO,
  SMAA,
  Selection,
  Outline,
} from "@react-three/postprocessing";
import {
  portfolio,
  // glossMaterial,
} from "../../../lib/globals";
import { scaleMeshAtBreakpoint } from "../../../lib/utils";
import cameraConfigs from "../../../lib/cameraConfigs";
import { Model as Ground } from "../../../../public/Env_ground_3";
import Group from "./Group";

ColorManagement.enabled = true;

const SceneBuilder = () => {
  const [isHovering, setHover] = useState("");
  const { size } = useThree();
  const { projects } = portfolio;
  const handleBoxes = []; //to see positions while developing
  const handlePositions = [];
  const ellipseRadius = scaleMeshAtBreakpoint(size.width) * 290;

  const ellipseCurve = new EllipseCurve(
    0,
    0,
    ellipseRadius,
    ellipseRadius,
    0,
    2 * Math.PI,
    false,
    projects.length % 2 == 0 ? 0 : Math.PI / 2,
  );
  ellipseCurve.closed = true;

  const ellipseCurvePoints = ellipseCurve.getPoints(projects.length);
  const ellipseGeometry = new BufferGeometry().setFromPoints(
    ellipseCurvePoints,
  );

  //to see camera path while developing
  const ellipse = new Line(
    ellipseGeometry,
    new LineBasicMaterial({ color: "red" }),
  );
  ellipse.position.set(0, 0, 0);
  ellipse.rotation.x = Math.PI * 0.5;

  //   scene.add(ellipse);
  const positionAttribute = ellipse.geometry.getAttribute("position");
  const vertex = new Vector3();

  for (
    let vertexIndex = 0;
    vertexIndex < positionAttribute.count;
    vertexIndex++
  ) {
    const pt = vertex.fromBufferAttribute(positionAttribute, vertexIndex);
    handlePositions.push(new Vector3(pt.x, 0, pt.y));
  }

  const boxGeometry = new BoxGeometry(5, 100, 5); // to see handles positions while developing
  const boxMaterial = new MeshBasicMaterial({ color: "blue" });
  for (const handlePosition of handlePositions) {
    const handle = new Mesh(boxGeometry, boxMaterial);
    handle.position.copy(handlePosition);
    handleBoxes.push(handle);
    // scene.add(handle);
  }

  // this approach to positioning a camera must change.
  const cameraPoints = [];
  handleBoxes.forEach((box) => {
    cameraPoints.push(box.position);
    cameraPoints.push(
      new Vector3(
        box.position.x * 1.1,
        box.position.y + 5,
        box.position.z - 20,
      ),
    );
    cameraPoints.push(
      new Vector3(box.position.x, box.position.y - 5, box.position.z - 30),
    );
    cameraPoints.push(
      new Vector3(
        box.position.x * 0.9,
        box.position.y + 5,
        box.position.z - 25,
      ),
    );
    cameraPoints.push(
      new Vector3(
        box.position.x * 0.95,
        box.position.y + 8,
        box.position.z + -20,
      ),
    );
    cameraPoints.push(
      new Vector3(box.position.x, box.position.y + 10, box.position.z - 15),
    );
    cameraPoints.push(
      new Vector3(box.position.x * 0.9, box.position.y, box.position.z - 20),
    );
    cameraPoints.push(
      new Vector3(
        box.position.x * 1.02,
        box.position.y - 5,
        box.position.z - 25,
      ),
    );
  });

  const cameraPathCurve = new CatmullRomCurve3(
    cameraPoints.map((handle) => handle),
    true,
    "centripetal",
  );

  useFrame(({ clock, camera }) => {
    let s = (clock.getElapsedTime() * 0.03) % 1;
    const position = cameraPathCurve.getPoint(s);
    camera.position.x = position.x;
    camera.position.y = cameraConfigs.POSITION[1] + 27;
    camera.position.z = position.z + cameraConfigs.POSITION[2];
    camera.lookAt(position.x, position.y, position.z);
  });

  return (
    <Selection>
      <EffectComposer multisampling={0} autoClear={false}>
        <N8AO
          radius={0.05}
          intensity={100}
          xray={true}
          luminanceInfluence={0.5}
          color="white"
        />
        <Outline
          visibleEdgeColor="white"
          hiddenEdgeColor="white"
          width={1000}
          edgeStrength={100}
          blur={true}
          pulseSpeed={0.5} // whether the outline should be blurred
        />
        {/* <SMAA /> */}
      </EffectComposer>
      <Bounds fit clip margin={1.2} damping={10}>
        <group>
          {projects.map((data, index) => {
            const newProps = {
              data,
              ...data.sceneData,
              position: handlePositions[index],
              autoRotateSpeed: index % 2 == 0 ? -1 : 1,
              isPointerOver: isHovering,
            };

            return (
              <group
                key={index}
                onPointerOver={(e) => {
                  console.log("\nonPointerOver", e.object.name, e);
                  setHover(e.object.name);
                }}
                onPointerMissed={(e) => {
                  console.log("\nonPointerMissed", e);
                  //   if (!e?.object?.name || e?.object?.name !== isHovering) {
                  setHover("");
                }}
                // onPointerOut={(e) => {
                //   console.log("\nonPointerOut", e.object.name, e);
                //   setHover("");
                // }}
              >
                <Group {...newProps} />
              </group>
            );
          })}
        </group>
      </Bounds>
    </Selection>
  );
};

export const GlobalModelViewer = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Canvas
        camera={{
          position: cameraConfigs.POSITION,
          near: cameraConfigs.NEAR,
          far: cameraConfigs.FAR,
          fov: 50,
        }}
        fallback={<div>Sorry no WebGL supported!</div>}
        orthographic={false}
        shadows
      >
        <Environment
          shadows
          files="./kloofendal_misty_morning_puresky_4k.hdr"
        />
        <color args={["#bcbcbc"]} attach="background" />
        <fog
          attach="fog"
          density={0.005}
          color="#bcbcbc"
          near={160}
          far={290}
        />
        <directionalLight
          castShadow={true}
          position={[0, 80, -40]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          intensity={2}
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
          position={[0, 100, 80]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          intensity={1}
          shadow-camera-near={0.5}
          shadow-camera-far={1000}
          shadow-bias={-0.001}
          shadow-camera-top={1500}
          shadow-camera-bottom={-1500}
          shadow-camera-left={-1500}
          shadow-camera-right={1500}
        />
        <SoftShadows samples={8} size={10} />
        <SceneBuilder />
        <Ground position={[0, -75, 20]} scale={[2, 1.2, 1.1]} />
        {/* these plane positions should scale with canvas size */}
        {/* <Plane
          castShadow
          args={[5000, 5000, 1, 1]}
          position={[-750, 0, 0]}
          rotation={[-Math.PI / 1.4, Math.PI / 2.8, 0]}
        >
          <meshPhysicalMaterial {...glossMaterial} color={"black"} />{" "}
        </Plane>
        <Plane
          castShadow
          args={[5000, 5000, 1, 1]}
          position={[750, 0, 0]}
          rotation={[-Math.PI / 1.4, -Math.PI / 2.8, 0]}
        > 
          <meshPhysicalMaterial {...glossMaterial} color={"black"} />{" "}
        </Plane>
        */}
      </Canvas>
    </Suspense>
  );
};

export default GlobalModelViewer;
