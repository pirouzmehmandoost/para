
"use client";

import { useRef } from "react";
import { ColorManagement, MeshPhysicalMaterial, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import { Select } from "@react-three/postprocessing";

ColorManagement.enabled = true;

const Model = (data) => {
  const meshRef = useRef();
  const {
    material: materialProps,
    modelUrl: { name = "", url = "" },
    autoRotate,
    autoRotateSpeed,
    scale,
    position = new Vector3(0, -25, 0),
    isPointerOver = "",
  } = data;

  if (!name.length) {
    return (
      <Html transform scale={[4, 4, 4]} position={[0, 0, 0]}>
        <div className="w-full h-full inset-0 left-0 uppercase place-self-center place-items-center text-5xl text-nowrap text-clay_dark">
          <p>⚒️ Please navigate back to the home page ⚒️</p>
        </div>
      </Html>
    )
  }

  const node = useGLTF(url).nodes[`${name}`];

  const newData = {
    name: name,
    ref: meshRef,
    scale: scale,
    geometry: node.geometry,
    castShadow: true,
    receiveShadow: true,
    material: new MeshPhysicalMaterial(materialProps),
    position: position,
  };

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    if (autoRotate && meshRef?.current) {
      meshRef.current.rotation.set(
        0,
        Math.sin(Math.PI / 2) * elapsedTime * 0.3 * autoRotateSpeed,
        0,
      );
    }
  });

  return name ? (
    <Select name={node.name} enabled={isPointerOver === node.name}>
      <mesh castShadow receiveShadow ref={meshRef} {...newData} />
    </Select>
  ) : (
    <Html transform scale={[4, 4, 4]} position={[0, 0, 0]}>
      <div className="w-full h-full inset-0 left-0 uppercase place-self-center place-items-center text-5xl text-nowrap text-clay_dark">
        <p>⚒️ Please navigate back to the home page ⚒️</p>
      </div>
    </Html>
  );
};

export default Model;

// "use client";

// import { useRef } from "react";
// import { ColorManagement, MeshPhysicalMaterial, Vector3 } from "three";
// import { useFrame } from "@react-three/fiber";
// import { useGLTF } from "@react-three/drei";
// import { Select } from "@react-three/postprocessing";

// ColorManagement.enabled = true;

// const Model = (data) => {
//   const ref = useRef();
//   const {
//     material: materialProps,
//     modelUrl: { name = "", url = "" },
//     autoRotate,
//     autoRotateSpeed,
//     scale,
//     position = new Vector3(0, -25, 0),
//     isPointerOver = "",
//   } = data;

//   const { nodes, scene } = useGLTF(url);

//   console.log("node is: ", nodes[`${name}`]);

//   scene.traverse((child) => {
//     if (!!child.isMesh) {
//       child.material = new MeshPhysicalMaterial(materialProps);
//       child.castShadow = true;
//       child.receiveShadow = true;
//       child.position.copy(position);
//       child.scale.set(scale, scale, scale);
//     }
//   });

//   useFrame(({ clock }) => {
//     const elapsedTime = clock.getElapsedTime();

//     scene.traverse((child) => {
//       if (!!child?.isMesh && autoRotate) {
//         child.rotation.set(
//           0,
//           Math.sin(Math.PI / 2) * elapsedTime * 0.3 * autoRotateSpeed,
//           0,
//         );
//       }
//     });
//   });

//   return (
//     <Select
//       name={scene.name}
//       enabled={isPointerOver === scene.children[0].name}
//     >
//       <primitive castShadow receiveShadow object={scene} />
//     </Select>
//   );
// };

// export default Model;

