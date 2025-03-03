"use client";

import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import { BufferGeometry, ColorManagement, EllipseCurve, Vector3 } from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Html } from "@react-three/drei";
import useSelection from "../../stores/selectionStore";
import { portfolio } from "../../../lib/globals";
import { scaleMeshAtBreakpoint } from "../../../lib/utils";
import cameraConfigs from "../../../lib/cameraConfigs";
import { Ground } from "../../../../public/Ground";
import Light from "./Light";
import Group from "./Group";
import { CameraRig } from "./CameraRig";

ColorManagement.enabled = true;

const SceneBuilder = () => {
  const setSelection = useSelection((state) => state.setSelection);
  const resetSelection = useSelection((state) => state.reset);
  const { size } = useThree();
  const router = useRouter();
  const [currentSelection, select] = useState();
  const [pointerTarget, setPointerTarget] = useState({
    eventObject: "",
    name: "",
    position: null,
  });
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
  // getPoints always returns one additional point.
  ellipseCurvePoints.shift();

  const positionAttribute = new BufferGeometry()
    .setFromPoints(ellipseCurvePoints)
    .getAttribute("position");

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

  CameraRig(groupPositions, cameraTarget);

  const handleUpdateSelection = (data) => {
    if (!data) {
      select();
      resetSelection();
    } else {
      setSelection(data);
      select(data);
    }
  };

  return (
    <>
      {projects.map((data, index) => {
        const groupProps = {
          ...data,
          sceneData: {
            ...data.sceneData,
            groupName: data.name,
            position: groupPositions[index],
            autoRotateSpeed: index % 2 == 0 ? -0.5 : 0.5,
            isPointerOver: pointerTarget.name,
          },
        };

        return (
          <group
            key={groupProps?.name}
            name={`${groupProps?.name}`}
            onClick={(e) => {
              console.log("%cOnClick", "color:blue; background:red;", e);
              handleUpdateSelection(groupProps);
              setPointerTarget({
                eventObject: e.eventObject.name,
                name: e.object.name,
                position: e.object.position,
              });
            }}
            onPointerOver={(e) => {
              console.log(
                "%cOnpointerOver",
                "color:yellow; background:magenta;",
                e,
              );

              if (e.pointerType === "mouse") {
                //if a model is highlighted via onClick, do not invoke handler.
                //otherwise pointerTarget will set to a new value if mouse hovers over nearby meshes.
                if (!currentSelection) {
                  setPointerTarget({
                    eventObject: e.eventObject.name,
                    name: e.object.name,
                    position: e.object.position,
                  });
                }
              } else {
                //mobile
                handleUpdateSelection(groupProps);
                setPointerTarget({
                  eventObject: e.eventObject.name,
                  name: e.object.name,
                  position: e.object.position,
                });
              }
            }}
            onPointerMissed={(e) => {
              console.log(
                "%cOnpointerMissed",
                "color:purple; background:orange;",
                e,
              );
              setPointerTarget({});
              handleUpdateSelection();
            }}
            onPointerOut={(e) => {
              console.log("%cOnpointerOut", "color:green;", e);
              //don't handle this event on mobile devices.
              if (e.pointerType === "mouse") {
                if (!currentSelection) {
                  setPointerTarget({});
                }
              }
            }}
          >
            <Light
              position={[
                groupPositions[index].x,
                groupPositions[index].y + 100,
                groupPositions[index].z + 50,
              ]}
              intensity={1}
              target={[
                groupPositions[index].x,
                groupPositions[index].y,
                groupPositions[index].z,
              ]}
            />
            <Group {...groupProps.sceneData} />
            <Html
              transform
              scale={[10, 10, 10]}
              position={[
                groupPositions[index].x,
                groupPositions[index].y + 40,
                groupPositions[index].z,
              ]}
            >
              <div
                className={`flex grow cursor-pointer uppercase text-nowrap w-fit h-full text-center p-4 place-self-center place-items-center rounded-full bg-neutral-300 text-neutral-600 text-5xl transition-all duration-500 ease-in-out ${!!currentSelection && pointerTarget?.eventObject === currentSelection.name ? "w-96 opacity-90 transition-all duration-500 ease-in-out hover:text-neutral-500 hover:bg-neutral-200" : "w-0 opacity-0"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentSelection) {
                    setSelection(currentSelection);
                    router.push("/project");
                  }
                }}
              >
                See More
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
};

export const GlobalModelViewer = () => {
  return (
    <Canvas
      camera={{
        position: [666, 666, 666],
        near: cameraConfigs.NEAR,
        far: cameraConfigs.FAR,
        fov: 50,
      }}
      fallback={<div>My regrets, lowly peon! WebGL is not supported.</div>}
      orthographic={false}
      shadows
    >
      <Environment shadows files="./studio_small_08_4k.exr" />
      <color args={["#bcbcbc"]} attach="background" />
      <fog attach="fog" density={0.006} color="#bcbcbc" near={160} far={285} />
      <directionalLight
        castShadow={true}
        position={[0, 80, -40]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        intensity={2}
        shadow-camera-near={0.05}
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
        shadow-camera-near={0.05}
        shadow-camera-far={1000}
        shadow-bias={-0.001}
        shadow-camera-top={1500}
        shadow-camera-bottom={-1500}
        shadow-camera-left={-1500}
        shadow-camera-right={1500}
      />
      <Suspense>
        <SceneBuilder />
      </Suspense>
      <Ground
        position={[0, -80, 20]}
        scale={[2.3, 1.1, 1.1]}
        rotation={Math.PI / 14}
      />
    </Canvas>
  );
};

export default GlobalModelViewer;
