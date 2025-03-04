"use client";

import { useRef } from "react";
import { Vector3, 
    // Color, MeshPhysicalMaterial
} from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import useMaterial from "../../stores/materialStore";
import useMesh from "../../stores/meshStore";

const Model = (data) => {
    const getMaterial = useMaterial((state) => state.getMaterial);
    // const getMesh = useMesh((state) => state.getMesh);
    // const setMesh = useMesh((state) => state.setMesh);
    const meshRef = useRef(undefined);

    console.log("Model. Data: ",  data)

    const {
        autoRotate = true,
        autoRotateSpeed = 1,
        materialId,
        modelUrl: { name = "", url = "" } = {},
        position = new Vector3(0, -25, 0),
        scale,
    } = data;

    let mesh = null;

    // if (name.length) {
    //     if (getMesh(name)) {
    //         mesh = getMesh(name);
    //     } 
    //     else {
            mesh = useGLTF(url).nodes[`${name}`];
            // setMesh(mesh);
    //     }
    // }

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
    // const mutableMaterial = new MeshPhysicalMaterial();
    // mutableMaterial.copy(getMaterial(materialId).material);
    // const c = new Color();
    // c.copy(mutableMaterial.color);

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        if (meshRef?.current) {
            // if (
            //     selection.sceneData.isPointerOver === name &&
            //     isPointerOver === name
            // ) {
            //     const color = c.lerp(
            //         new Color("red"),
            //         (Math.sin(elapsedTime * 0.5) + 1) * 0.2,
            //     );
            //     meshRef.current.material.color = color;
            //     // meshRef.current.material.roughness = (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
            //     // meshRef.current.material.metalness = (Math.sin(elapsedTime * 0.25) + 1) * 0.5;
            // } 
            // else {
            //     meshRef.current.material = mutableMaterial;
            // }

            if (autoRotate) {
                meshRef.current.rotation.set(
                    0,
                    Math.sin(Math.PI / 2) * elapsedTime * 0.3 * autoRotateSpeed,
                    0,
                );
            }
        }
    });

    // const handleUpdateSelection = (x) => {
    //     if (!x) {
    //         resetSelection();
    //     }
    //     else {
    //         const obj = {
    //             ...data, 
    //             ...x,
    //             sceneData: {
    //                 ...data,
    //                 ...x,
    //             },
    //         };

    //         console.log("handleUpdateSelection\n", "data is :" , data, "\nobj is ", obj, "\n");
    //         setSelection(obj);
    //     }
    // };
    return <mesh ref={meshRef} {...meshProps} />
};

export default Model;
