"use client";

import { useRef } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
// import { useGLTF } from "@react-three/drei";
import useMaterial from "@/stores/materialStore";
import useMesh, {asyncLoadGLTF} from "@/stores/meshStore";

const Model = (props) => {
    const meshRef = useRef(undefined);
    const getMaterial = useMaterial((state) => state.getMaterial);
    const getMesh = useMesh((state) => state.getMesh);
    const {
        autoRotate = true,
        autoRotateSpeed = 1,
        materialId,
        modelUrl: { name = "", url = "" } = {},
        position = new Vector3(0, -25, 0),
        scale,
    } = props;

    let mesh = null;

    if (name.length) {
        if (getMesh(name)) {
            mesh = getMesh(name);
        }

        if (!getMesh(name)) {
            asyncLoadGLTF(url)
            mesh = getMesh(name)
        }
        // mesh = useGLTF(url).nodes[`${name}`]
        // setMesh(mesh)
    }

    console.log('mesh: ', mesh)

    const meshProps = {
        name,
        geometry: mesh,
        material: getMaterial(materialId).material,
        position,
        scale,
        castShadow: true, 
        receiveShadow: true,
    };

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        if (meshRef?.current) {
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
    return <>mesh && <mesh castShadow={true} recieveShadow={true} ref={meshRef} {...meshProps} /></>
};

export default Model;
