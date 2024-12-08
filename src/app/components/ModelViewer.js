"use client";

import { useRef, useState } from 'react';
import * as THREE from "three";
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import useSelection from '../store/selection';

THREE.ColorManagement.enabled = true;

const Model = ({ props }) => {

    const { color } = props;
    const modelRef = useRef();
    const selection = useSelection((state) => state.selection);
    const { modelUrl } = selection;
    const { scene } = useGLTF(modelUrl)

    console.log("modelRef should be the same as scene.children: ", modelRef)

    let newMaterial = new THREE.MeshPhysicalMaterial({
        color: color,
        roughness: .7,
        metalness: 0,
        ior: 2,
        reflectivity: .1,
        sheen: .3,
        sheenColor: "#ffffff",
        sheenRoughness: 1,
        flatShading: false,
        // clearcoat: 1,
        // clearcoatRoughness: .5,
        specularIntensity: 1,
        specularColor: "#ffffff",
    });

    // let whiteMaterial = new THREE.MeshPhysicalMaterial({
    //     color: color,
    //     roughness: 1,
    //     metalness: 0.6,
    //     ior: 1.5,
    //     reflectivity: .1,
    //     sheen: 1,
    //     sheenColor: "#e2c7c0",
    //     sheenRoughness: 1,
    //     flatShading: false,
    //     clearcoat: 1,
    //     clearcoatRoughness: 1,
    //     specularIntensity: 1,
    //     specularColor: "#ffffff",
    // });

    if (scene?.children?.length) {
        scene.children[0].material = newMaterial;
    }

    return (
        <primitive
            object={scene}
            ref={modelRef}
            position={[0, -20, 0]}
            scale={.3}
        />
    );
};

const tailWindColor = (col) => {
    const cssColor = col.toLowerCase();

    if (cssColor.includes("white")) return "bg-slate-100"
    else return "bg-slate-950";
};


const setMaterialColor = (col) => {
    const cssColor = col.toLowerCase();

    if (cssColor.includes("white")) return "white"
    else return "black";
};


// const Buttons = () => {
//     const selection = useSelection((state) => state.selection);
//     const [material, setMaterial] = useState();
//     const {
//         colors,
//     } = selection;

//     return (
//         <div className="absolute w-full flex flex-row items-center justify-evenly items-end mb-3">
//             {
//                 colors.map((c) => {
//                     return (
//                         <div
//                             onClick={() => { setMaterial(setMaterialColor(c)); }}
//                             key={c}
//                             className={`${tailWindColor(c)} w-3 h-3 border-solid border-clay_dark border-2 rounded-full cursor-pointer`} >
//                         </div>
//                     )
//                 })
//             }
//         </div >
//     );
// };


const ModelViewPort = (props) => {
    return (
        <div className="w-full h-full">
            <Canvas
                fallback={<div>Sorry no WebGL supported!</div>}
                camera={{ fov: 50, near: 1, far: 1000, position: [0, 15, 100] }}
            >
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <Model {...props} />
                <ContactShadows position={[0, -1, 0]} scale={10} far={4} blur={1.75} />
                <Environment files="./studio_small_08_4k.exr" />
                <OrbitControls autoRotate autoRotateSpeed={12.0} enableZoom={false} />
            </Canvas>
        </div>
    )
};


export const ModelViewer = () => {
    const [material, setMaterial] = useState(null);
    const selection = useSelection((state) => state.selection);
    const {
        colors,
    } = selection;

    return (
        <div className="relative flex w-full h-full flex-column items-end justify-stretch content-stretch" >
            <ModelViewPort props={{ color: material }} />
            <div className="absolute w-full flex flex-row items-center justify-evenly items-end mb-3" >
            {
                colors.map((c) => {
                    return (
                        <div
                            onClick={() => { setMaterial(setMaterialColor(c)) } }
                            key={c}
                            className={`${tailWindColor(c)} w-3 h-3 border-solid border-clay_dark border-2 rounded-full cursor-pointer`} >
                        </div>
                    )
                })
            }
            </div>
            {/* <Buttons /> */}
        </div>
    )
};

export default ModelViewer;