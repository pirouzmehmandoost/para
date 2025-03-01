"use client";

import React, { useRef } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
 import { useGLTF } from "@react-three/drei";
 import {Color} from  'three';
// import { Select } from "@react-three/postprocessing";
import useMaterial from "../../stores/materialStore";
import useMesh from "../../stores/meshStore";

const Model = (data) => {
  const getMaterial = useMaterial((state) => state.getMaterial);
  const getMesh = useMesh((state) => state.getMesh);
  const setMesh = useMesh((state)=> state.setMesh)
  const meshRef = useRef(undefined);
  const {
    materialId,
    modelUrl: { name = "", url = "" },
    autoRotate,
    autoRotateSpeed,
    scale,
    position = new Vector3(0, -25, 0),
    isPointerOver = "",
  } = data;

  let mesh = null;
  if (getMesh(name)) {
    mesh = getMesh(name);
  } else {
    mesh = useGLTF(url).nodes[`${name}`];
    setMesh(mesh);
  }
  const newData = {
    name: name,
    scale: scale,
    castShadow: true,
    receiveShadow: true,
    position: position,
    geometry: mesh.geometry,
    material: getMaterial(materialId).material,
  };

             const c = new Color(...newData.material.color)


  console.log("material color: ", newData.material.color, "vs", c)
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if(meshRef?.current) {

        // if (isPointerOver=== name) {
        //     // meshRef.current.rotation.set(
        //     //     0,
        //     //     Math.sin(Math.PI / 2) * elapsedTime * 0.3 * autoRotateSpeed,
        //     //     0,
        //     // );

        //   // Calculate color based on time
        //   const color = new Color(...newData.material.color).lerp(
        //     new Color("white"),
        //     Math.sin( elapsedTime * 0.5),
        //   );
        //     meshRef.current.material.color=color;
        //     // meshRef.current.material.color.lerp()
        // }
        // else  meshRef.current.material.color =  c



        if (autoRotate ) {
            meshRef.current.rotation.set(
                0,
                Math.sin(Math.PI / 2) * elapsedTime * 0.3 * autoRotateSpeed,
                0,
            );
        }
    }
  });

  return (
    // <Select name={name} enabled={isPointerOver === name}>
      <mesh ref={meshRef} {...newData}></mesh>
   // {/* </Select> */}
  );
};

export default Model;

//   return node ? (
//     <Select name={node.name} enabled={isPointerOver === node.name}>
//       <mesh ref={meshRef} {...newData}>
//         {/* <meshStandardMaterial color={"black"} /> */}
//       </mesh>
//     </Select>
//   ) : (
//     <Html transform scale={[4, 4, 4]} position={[0, 0, 0]}>
//       <div className="w-full h-full inset-0 left-0 uppercase place-self-center place-items-center text-5xl text-nowrap text-clay_dark">
//         <p>⚒️ Please navigate back to the home page ⚒️</p>
//       </div>
//     </Html>
//   );
// };