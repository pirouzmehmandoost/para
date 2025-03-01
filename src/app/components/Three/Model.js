"use client";

import { useRef } from "react";
import { Vector3,  Color,  MeshPhysicalMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import useMaterial from "../../stores/materialStore";
import useMesh from "../../stores/meshStore";
import useSelection from "../../stores/selectionStore";

const Model = (data) => {
  const selection = useSelection((state) => state.getSelection());
  const getMaterial = useMaterial((state) => state.getMaterial);
  const getMesh = useMesh((state) => state.getMesh);
  const setMesh = useMesh((state)=> state.setMesh)
  const meshRef = useRef(undefined);
  const {
    autoRotate,
    autoRotateSpeed,
    isPointerOver = "",
    materialId,
    modelUrl: { name = "", url = "" },
    position = new Vector3(0, -25, 0),
    scale,
  } = data;

  let mesh = null;

  if (name.length){
  if (getMesh(name)) {
    mesh = getMesh(name);
  } else {
    mesh = useGLTF(url).nodes[`${name}`];
    setMesh(mesh);
  }
} else {
    return (
    <Html transform scale={[4, 4, 4]} position={[0, 0, 0]}>
      <div className="w-full h-full inset-0 left-0 uppercase place-self-center place-items-center text-5xl text-nowrap text-clay_dark">
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
    const mutableMaterial = new MeshPhysicalMaterial()
    mutableMaterial.copy(getMaterial(materialId).material)
    const c = new Color()
    c.copy(mutableMaterial.color)

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if(meshRef?.current) {

      if (selection.sceneData.isPointerOver=== name && isPointerOver===name ) {
          const color = c.lerp( new Color("red"), (Math.sin(elapsedTime * 0.5) + 1) * 0.2);
          meshRef.current.material.color = color;
          meshRef.current.material.roughness = (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
          meshRef.current.material.metalness = (Math.sin(elapsedTime * 0.25) + 1) * 0.5;
        }
        else{
            meshRef.current.material = mutableMaterial;
        }

        if (autoRotate ) {
            meshRef.current.rotation.set(
                0,
                Math.sin(Math.PI / 2) * elapsedTime * 0.3 * autoRotateSpeed,
                0,
            );
        }
    }
  });

  return <mesh ref={meshRef} {...meshProps}/>
};

export default Model;