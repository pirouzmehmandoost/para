"use client";

import { useRef } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import useMaterial from "@/stores/materialStore";
import useMesh from "@/stores/meshStore";

const Model = (props) => {
    const meshRef = useRef(undefined);
    const getMaterial = useMaterial((state) => state.getMaterial);
    const getMesh = useMesh((state) => state.getMesh);
    const setMesh = useMesh(state=>state.setMesh)
    const {
        autoRotate = true,
        autoRotateSpeed = 1,
        materialId,
        modelUrl: { name = "", url = "" } = {},
        position = new Vector3(0, -25, 0),
        scale,
    } = props;

    let mesh = null;

    // console.log("Model. name: ",name , "does it exist in store? ", getMesh(name))
    if (name.length) {
        if (getMesh(name)) {
            mesh = getMesh(name);
        } 
        // else {
        //     mesh = useGLTF(url).nodes[`${name}`];
        //     setMesh(mesh);
        // }
    }

    // useEffect(()=> {
    //     if ( !getMesh(name)) {
    //     projects.forEach(({ sceneData }) => {
    //         // useGLTF.preload(sceneData.modelUrls.map(({ url }) => url));
        
    //         for (const {name, url} of sceneData.modelUrls) {
    //         //   initialState[`${name}`] = useGLTF(url).nodes[`${name}`];
    //              setMesh(useGLTF(url).nodes[`${name}`])
    //         }
    //     });
    // }
    // }, []);

    const meshProps = {
        name,
        // geometry: mesh.geometry,
        geometry: mesh,
        material: getMaterial(materialId).material,
        position,
        scale,
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
    return <mesh castShadow={true} recieveShadow={true} ref={meshRef} {...meshProps} />
};

export default Model;
