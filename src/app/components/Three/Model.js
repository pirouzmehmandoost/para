"use client";

import { useRef } from "react";
import { Vector3, Color, MeshPhysicalMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import useMaterial from "../../stores/materialStore";
import useMesh from "../../stores/meshStore";
import useSelection from "../../stores/selectionStore";
import { useRouter } from "next/navigation";

const Model = (data) => {
  const router = useRouter();
  const setSelection = useSelection((state) => state.setSelection);
  const resetSelection = useSelection((state) => state.reset);
  const selection = useSelection((state) => state.getSelection());
  const getMaterial = useMaterial((state) => state.getMaterial);
  const getMesh = useMesh((state) => state.getMesh);
  const setMesh = useMesh((state) => state.setMesh);
  const meshRef = useRef(undefined);
    console.log("Model. Data: ",  data)

  const {
    sceneData: {
        autoRotate = true,
        autoRotateSpeed = 1,
        isPointerOver = "",
        materialId,
        modelUrl: { name = "", url = "" },
        position = new Vector3(0, -25, 0),
        scale,
    },
  } = data;

  let mesh = null;

  if (name.length) {
    if (getMesh(name)) {
      mesh = getMesh(name);
    } else {
      mesh = useGLTF(url).nodes[`${name}`];
      setMesh(mesh);
    }
  } else {
    return (
      <Html transform scale={[1, 1, 1]} position={[0, 0, 0]}>
        <div className="w-full h-full inset-0 left-0 uppercase place-self-center place-items-center text-5xl text-nowrap text-">
          <p>⚒️ Please navigate back to the home page ⚒️</p>
        </div>
      </Html>
    );
  }

  const meshProps = {
    name: name,
    scale: scale,
    castShadow: true,
    receiveShadow: true,
    position: position,
    geometry: mesh.geometry,
    material: getMaterial(materialId).material,
  };

  //TESTING
  const mutableMaterial = new MeshPhysicalMaterial();
  mutableMaterial.copy(getMaterial(materialId).material);
  const c = new Color();
  c.copy(mutableMaterial.color);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (meshRef?.current) {
      if (
        selection.sceneData.isPointerOver === name &&
        isPointerOver === name
      ) {
        const color = c.lerp(
          new Color("red"),
          (Math.sin(elapsedTime * 0.5) + 1) * 0.2,
        );
        meshRef.current.material.color = color;
        meshRef.current.material.roughness =
          (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
        meshRef.current.material.metalness =
          (Math.sin(elapsedTime * 0.25) + 1) * 0.5;
      } else {
        meshRef.current.material = mutableMaterial;
      }

      if (autoRotate) {
        meshRef.current.rotation.set(
          0,
          Math.sin(Math.PI / 2) * elapsedTime * 0.3 * autoRotateSpeed,
          0,
        );
      }
    }
  });


const handleUpdateSelection = (x) => {
    if (!x) {
    //   select();
      resetSelection();
    } else {
        const obj = {
            ...data, 
            sceneData: {
                ...data.sceneData,
                ...x,
            }
        };

        console.log(
            "handleUpdateSelection", 
            obj
        )
        setSelection(obj);


    //   select(data);
    }
  };

  return (
    <>
        <mesh
        {...meshProps}
        ref={meshRef}
        onClick={(e) => {
            console.log("%c MESH OnClick", "color:blue; background:red;", e);
            handleUpdateSelection(meshProps);
            // setPointerTarget({
            //     eventObject: e.eventObject.name,
            //     name: e.object.name,
            //     position: e.object.position,
            // });
        }}
        onPointerOver={(e) => {
            console.log(
            "%cMESH OnpointerOver",
            "color:yellow; background:magenta;",
            e,
            );
            // if (e.pointerType === "mouse") {
            //     if (!currentSelection) {
            //         setPointerTarget({
            //         eventObject: e.eventObject.name,
            //         name: e.object.name,
            //         position: e.object.position,
            //         });
            //     }
            //     }
            //     else {
            //     //mobile
            //     handleUpdateSelection(groupProps);
            //     setPointerTarget({
            //         eventObject: e.eventObject.name,
            //         name: e.object.name,
            //         position: e.object.position,
            //     });
            // }
        }}
        onPointerMissed={(e) => {
            console.log(
            "%cMESH OnpointerMissed",
            "color:purple; background:orange;",
            e,
            );
            // setPointerTarget({});
            // handleUpdateSelection();
        }}
        // onPointerOut={(e) => {
        //     console.log("%cOnpointerOut", "color:green;", e)
        //   //don't handle this event on mobile devices.
        //   if (e.pointerType === "mouse") {
        //     if (!currentSelection) {
        //       setPointerTarget({});
        //     }
        //   }
        // }}
        
        />
        <Html
            transform
            scale={[10, 10, 10]}
            position={[
            position.x,
            position.y + 40,
            position.z,
            ]}
        >
            <div
                className={`flex grow cursor-pointer uppercase text-nowrap w-fit h-full text-center 
                    p-4 place-self-center place-items-center rounded-full bg-neutral-300 text-neutral-600
                    text-5xl transition-all duration-500 ease-in-out w-96 opacity-90 transition-all duration-500 ease-in-out hover:text-neutral-500 hover:bg-neutral-200`}

                // className={`flex grow cursor-pointer uppercase text-nowrap w-fit h-full text-center p-4 place-self-center place-items-center rounded-full bg-neutral-300 text-neutral-600 text-5xl transition-all duration-500 ease-in-out ${!!selection && pointerTarget?.eventObject === selection.name ? "w-96 opacity-90 transition-all duration-500 ease-in-out hover:text-neutral-500 hover:bg-neutral-200" : "w-0 opacity-0"}`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (selection) {
                    // setSelection(selection);
            handleUpdateSelection(meshProps);

                    router.push("/project");
                    }
                }}
            >
            See More
            </div>
        </Html>
    </>
  );
};

export default Model;
