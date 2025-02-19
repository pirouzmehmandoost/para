"use client";

// import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { BufferGeometry, ColorManagement, EllipseCurve, Vector3 } from "three";
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
import { SetCameraRig } from "./CameraRig";

ColorManagement.enabled = true;
const SceneBuilder = () => {
  const setSelection = useSelection((state) => state.setSelection);
  //   const router = useRouter();
  const [currentSelection, select] = useState(null);
  const handleUpdateSelection = (data) => {
    if (!data) {
      setSelection();
      select(null);
    } else {
      setSelection(data);
      select(data);
    }
  };
  const [pointerTarget, setPointerTarget] = useState({
    eventObject: "",
    name: "",
    position: null,
  });
  const { size } = useThree();
  const { projects } = portfolio;
  const groupPositions = [];
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
  const positionAttribute = ellipseGeometry.getAttribute("position");

  const vertex = new Vector3();
  for (let i = 0; i < positionAttribute.count; i++) {
    const pt = vertex.fromBufferAttribute(positionAttribute, i);
    groupPositions.push(new Vector3(pt.x, 0, pt.y));
  }

  let cameraTarget =
    currentSelection?.name.length &&
    currentSelection.name === pointerTarget?.eventObject &&
    pointerTarget?.position
      ? pointerTarget?.position
      : null;

  console.log(
    "currentSelection",
    currentSelection,
    "pointerTarget?.position",
    pointerTarget?.position,
  );

  SetCameraRig(groupPositions, cameraTarget);

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
              ...data,
              sceneData: {
                ...data.sceneData,
                position: groupPositions[index],
                autoRotateSpeed: index % 2 == 0 ? -1 : 1,
                isPointerOver: pointerTarget.name,
              },
            };

            return (
              <group
                name={`${newProps?.name}`}
                key={index}
                onClick={(e) => {
                  if (e.pointerType === "mouse") {
                    if (pointerTarget?.name === e.object.name) {
                      console.log(
                        "\nonClick on desktop",
                        e,
                        e.object.name,
                        data,
                      );
                      handleUpdateSelection(newProps);
                      setPointerTarget({
                        eventObject: e.eventObject.name,
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
                    handleUpdateSelection(newProps);
                    setPointerTarget({
                      eventObject: e.eventObject.name,
                      name: e.object.name,
                      position: e.object.position,
                    });
                  }
                }}
                onPointerOver={(e) => {
                  if (e.pointerType === "mouse") {
                    setPointerTarget({
                      eventObject: e.eventObject.name,
                      name: e.object.name,
                      position: e.object.position,
                    });

                    console.log(
                      "\nonPointerOver on Desktop\n",
                      "event:",
                      e,
                      "pointerTarget: ",
                      pointerTarget,
                      "\n",
                    );
                  } else {
                    if (e.pointerType === "touch") {
                      console.log("onPointerOver on mobile", e.object.name);
                      //   setSelection(newProps);
                      handleUpdateSelection(newProps);
                      setPointerTarget({
                        eventObject: e.eventObject.name,
                        name: e.object.name,
                        position: e.object.position,
                      });
                    }
                  }
                }}
                onPointerMissed={(e) => {
                  if (e.pointerType === "mouse") {
                    console.log("\nonPointerMissed on desktop");
                    setPointerTarget({});
                    handleUpdateSelection();
                  } else {
                    if (e.pointerType === "touch") {
                      console.log("\nonPointerMissed on mobile");
                      setPointerTarget({});
                      handleUpdateSelection();
                    }
                  }
                }}
                onPointerOut={(e) => {
                  if (e.pointerType === "mouse") {
                    console.log("\nonPointerOut on desktop", e?.object?.name);
                    if (!currentSelection) {
                      setPointerTarget({});
                    }
                  } else {
                    if (e.pointerType === "touch") {
                      console.log("\nonPointerOut on mobile", e?.object?.name);
                    }
                  }
                }}
              >
                <Group {...newProps.sceneData} />
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
