"use client";

import { useRouter } from "next/navigation";
import React, { Suspense, useState, useEffect } from "react";
import { BufferGeometry, ColorManagement, EllipseCurve, Vector3 } from "three";
import { Canvas, useThree } from "@react-three/fiber";
import Light from "./Light";
import {
  Environment,
  Loader,
  Bounds,
  // Html,
  Outlines,
  //   Plane,
} from "@react-three/drei";
// import {
//   EffectComposer,
//   //   RenderPass,
//   N8AO,
//   Selection,
//   Outline,
// } from "@react-three/postprocessing";
// import { BlendFunction } from "postprocessing";
import { portfolio } from "../../../lib/globals";
import { scaleMeshAtBreakpoint } from "../../../lib/utils";
import cameraConfigs from "../../../lib/cameraConfigs";
import { Ground } from "../../../../public/Ground";
import Group from "./Group";
import useSelection from "../../stores/selectionStore";
import { CameraRig } from "./CameraRig";

ColorManagement.enabled = true;

const SceneBuilder = () => {
  const setSelection = useSelection((state) => state.setSelection);
  //   const s = useSelection((state) => state.selection);
  const router = useRouter();
  const [currentSelection, select] = useState();
  const [pointerTarget, setPointerTarget] = useState({
    eventObject: "",
    name: "",
    position: null,
  });
  const { size } = useThree();
  const { projects } = portfolio;
  const groupPositions = [];
  //   const { camera } = useThree();

  //   useEffect(() => {
  //     console.log(camera);
  //     camera.position.copy(new Vector3(-10000, 1000, 0));
  //   }, []);

  const handleUpdateSelection = (data) => {
    if (!data) {
      //   setSelection();
      select();
    } else {
      setSelection(data);
      select(data);
    }
  };

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
  // getPoints() always returns one additioal point.
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

  return (
    <>
      {/* <Selection>    */}
      <Bounds fit clip margin={1.2} damping={10}>
        {projects.map((data, index) => {
          const newProps = {
            ...data,
            sceneData: {
              ...data.sceneData,
              poop: data.name,
              position: groupPositions[index],
              autoRotateSpeed: index % 2 == 0 ? -0.5 : 0.5,
              isPointerOver: pointerTarget.name,
            },
          };

          return (
            <group key={index}>
              <Light
                position={[
                  groupPositions[index].x,
                  groupPositions[index].y + 80,
                  groupPositions[index].z + 50,
                ]}
                intensity={6}
                //   color={index % 2 == 1 ? "magenta" : "blue"}
                target={[
                  groupPositions[index].x,
                  groupPositions[index].y,
                  groupPositions[index].z,
                ]}
              />
              <group
                name={`${newProps?.name}`}
                onClick={(e) => {
                  handleUpdateSelection(newProps);
                  setPointerTarget({
                    eventObject: e.eventObject.name,
                    name: e.object.name,
                    position: e.object.position,
                  });
                }}
                onPointerOver={(e) => {
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
                    handleUpdateSelection(newProps);
                    setPointerTarget({
                      eventObject: e.eventObject.name,
                      name: e.object.name,
                      position: e.object.position,
                    });
                  }
                }}
                onPointerMissed={() => {
                  setPointerTarget({});
                  handleUpdateSelection();
                }}
                onPointerOut={(e) => {
                  //don't handle this event on mobile devices.
                  if (e.pointerType === "mouse") {
                    if (!currentSelection) {
                      setPointerTarget({});
                    }
                  }
                }}
              >
                <Group {...newProps.sceneData} />

                {/* <Html
                      occlude={
                        !(
                          !!currentSelection &&
                          pointerTarget?.eventObject === currentSelection.name
                        )
                      }
                      transform
                      scale={[10, 10, 10]}
                      position={[
                        groupPositions[index].x,
                        groupPositions[index].y + 40,
                        groupPositions[index].z,
                      ]}
                    >
                      <div
                        // className={`flex flex-grow cursor-pointer uppercase text-nowrap w-fit h-full text-center p-4 place-self-center place-items-center rounded-full bg-zinc-300 text-clay_dark text-5xl transition-all duration-500 ease-in-out ${!!currentSelection && pointerTarget?.eventObject === currentSelection.name ? "w-96 opacity-90 transition-all duration-500 ease-in-out hover:text-slate-500 hover:bg-zinc-200" : "w-0 opacity-0"}`}
                        className={`flex grow cursor-pointer uppercase text-nowrap w-fit h-full text-center p-4 place-self-center place-items-center rounded-full bg-zinc-300 text-clay_dark text-5xl transition-all duration-500 ease-in-out ${!!currentSelection && pointerTarget?.eventObject === currentSelection.name ? "w-96 opacity-90 transition-all duration-500 ease-in-out hover:text-slate-500 hover:bg-zinc-200" : "w-0 opacity-0"}`}
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
                    </Html> */}
                {/* </Group> */}
              </group>
            </group>
          );
        })}
      </Bounds>
      {/* </Selection>*
      <EffectComposer multisampling={0} autoClear={true} disableNormalPass>
        <N8AO
          radius={0.05}
          intensity={100}
          xray={true}
          luminanceInfluence={0.5}
          color="white"
        /> */}
      {/* 
      <Outline
          visibleEdgeColor={"white"}
          hiddenEdgeColor={"white"}
          width={1000}
          edgeStrength={50}
          blur={true}
          pulseSpeed={0.3}
          // // blendFunction={BlendFunction.SCREEN} // set this to BlendFunction.ALPHA for dark outlines
          alpha={false}
          options={{ alpha: false }}
        /> 
        */}
      {/* </EffectComposer> */}
    </>
  );
};

export const GlobalModelViewer = () => {
  return (
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
      {/* <Environment shadows files="./studio_small_08_4k.exr" /> */}
      {/* <color args={["#bcbcbc"]} attach="background" /> */}
      <fog attach="fog" density={0.005} color="#bcbcbc" near={160} far={290} />
      <directionalLight
        castShadow={true}
        // position={[0, 80, -40]}
        position={[-150, 80, -80]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        // intensity={2}
        intensity={0.2}
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
        // position={[0, 100, 80]}
        position={[150, 80, 80]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        intensity={0.2}
        // intensity={1}
        shadow-camera-near={0.05}
        shadow-camera-far={1000}
        shadow-bias={-0.001}
        shadow-camera-top={1500}
        shadow-camera-bottom={-1500}
        shadow-camera-left={-1500}
        shadow-camera-right={1500}
      />
      <ambientLight intensity={100} color="red" />
      {/* <ambientLight intensity={5} /> */}
      {/*     castShadow={true}
        position={[150, 80, -180]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        intensity={0.25}
        shadow-camera-near={0.5}
        shadow-camera-far={1000}
        shadow-bias={-0.001}
        shadow-camera-top={1500}
        shadow-camera-bottom={-1500}
        shadow-camera-left={-1500}
        shadow-camera-right={1500}
      />
      {/* <directionalLight
        castShadow={true}
        position={[150, 80, -180]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        intensity={0.25}
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
        position={[-150, 80, -180]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        intensity={0.25}
        shadow-camera-near={0.5}
        shadow-camera-far={1000}
        shadow-bias={-0.001}
        shadow-camera-top={1500}
        shadow-camera-bottom={-1500}
        shadow-camera-left={-1500}
        shadow-camera-right={1500}
      /> */}
      <Suspense>
        <SceneBuilder />
      </Suspense>
      <Ground
        position={[0, -80, 20]}
        scale={[2, 1.1, 0.8]}
        rotation={Math.PI / 14}
      />

      {/* <Plane args={[20, 20, 1, 1]} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="red" />
      </Plane> */}
    </Canvas>
  );
};

export default GlobalModelViewer;
