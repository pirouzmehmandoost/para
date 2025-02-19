"use client";

// import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import {
  BufferGeometry,
  ColorManagement,
  EllipseCurve,
  Line,
  Vector3,
} from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Loader, Bounds, SoftShadows } from "@react-three/drei";
import {
  EffectComposer,
  N8AO,
  Selection,
  Outline,
} from "@react-three/postprocessing";
import { portfolio } from "../../../lib/globals";
import { scaleMeshAtBreakpoint } from "../../../lib/utils";
import cameraConfigs from "../../../lib/cameraConfigs";
import { Model as Ground } from "../../../../public/Env_ground_3";
import Group from "./Group";
import useSelection from "../../store/selection";
import { setCameraRig } from "./CameraRig";

ColorManagement.enabled = true;

const SceneBuilder = () => {
  const setSelection = useSelection((state) => state.setSelection);
  const currentSelection = useSelection((state) => state.getSelection());
  //   const router = useRouter();
  const [pointerTarget, setPointerTarget] = useState({
    name: "",
    position: null,
  });
  const { size } = useThree();
  const { projects } = portfolio;
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
  ellipseCurvePoints.shift();

  const ellipseGeometry = new BufferGeometry().setFromPoints(
    ellipseCurvePoints,
  );

  //to see camera path while developing
  const ellipse = new Line(ellipseGeometry);
  ellipse.rotation.x = Math.PI * 0.5;

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

  let cameraTarget =
    !!currentSelection && pointerTarget?.position
      ? pointerTarget?.position
      : null;

  console.log(
    "currentSelection",
    currentSelection,
    "pointerTarget?.position",
    pointerTarget?.position,
  );

  setCameraRig(handlePositions, cameraTarget);

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
          edgeStrength={50}
          blur={true}
          pulseSpeed={0.3} // whether the outline should be blurred
        />
      </EffectComposer>
      <Bounds fit clip margin={1.2} damping={10}>
        <group>
          {projects.map((data, index) => {
            const newProps = {
              data,
              ...data.sceneData,
              position: handlePositions[index],
              autoRotateSpeed: index % 2 == 0 ? -1 : 1,
              isPointerOver: pointerTarget.name,
            };

            return (
              <group
                name={`group_${data?.name}`}
                key={index}
                onClick={(e) => {
                  if (e.pointerType === "mouse") {
                    if (
                      pointerTarget.name.length > 0 &&
                      pointerTarget.name === e.object.name
                    ) {
                      console.log("\nonClick on desktop", e.object.name);
                      setSelection(data);
                      setPointerTarget({
                        name: e.object.name,
                        position: e.object.position,
                      });
                      // router.push("/project");
                    } else {
                      setPointerTarget({
                        name: e.object.name,
                        position: e.object.position,
                      });
                    }
                  } else {
                    console.log("onClick on mobile", e.object.name);
                    // if (
                    //   pointerTarget.name.length > 0 &&
                    //   pointerTarget.name === e.object.name
                    // ) {
                    setSelection(data);
                    setPointerTarget({
                      name: e.object.name,
                      position: e.object.position,
                    });
                    // }
                  }
                }}
                onPointerOver={(e) => {
                  if (e.pointerType === "touch") {
                    console.log("onClick on mobile", e.object.name);

                    setSelection(data);
                    setPointerTarget({
                      name: e.object.name,
                      position: e.object.position,
                    });
                  } else {
                    if (e.pointerType === "mouse") {
                      console.log("\nonPointerOver on Desktop", e.object.name);
                      setPointerTarget({
                        name: e.object.name,
                        position: e.object.position,
                      });
                    }
                  }
                }}
                onPointerMissed={(e) => {
                  if (e.pointerType === "mouse") {
                    console.log("\nonPointerMissed on desktop");
                    setPointerTarget({
                      name: "",
                      position: null,
                    });
                    setSelection();
                  } else {
                    if (e.pointerType === "touch") {
                      console.log("\nonPointerMissed on mobile");
                      setPointerTarget({
                        name: "",
                        position: null,
                      });
                      setSelection();
                    }
                  }
                }}
                onPointerOut={(e) => {
                  if (e.pointerType === "mouse") {
                    console.log("\nonPointerOut onn desktop", e?.object?.name);
                    if (!currentSelection) {
                      setPointerTarget({
                        name: "",
                        position: null,
                      });
                    }
                  } else {
                    if (e.pointerType === "touch") {
                      console.log("\nonPointerOut on mobile", e?.object?.name);
                    }
                  }
                }}
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
        <Environment shadows files="./studio_small_08_4k.exr" />
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
        <Ground
          position={[0, -75, 20]}
          scale={[2, 1.1, 1.1]}
          rotation={Math.PI / 14}
        />
      </Canvas>
    </Suspense>
  );
};

export default GlobalModelViewer;
