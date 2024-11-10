"use client";

import { useRef } from 'react';
import * as THREE from "three";
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import useSelection from '../store/selection';

THREE.ColorManagement.enabled = true;

export function Model(props) {

    const setSelection = useSelection((state) => state.setSelection);
    const { animations, scene, ...rest } = props;
    // const { actions } = useAnimations(animations, scene);
    const modelRef = useRef(null);

    console.log("Model commponent. current ref (modelRef) is: ", modelRef);

    return <primitive object={scene} ref={modelRef} {...rest} />
}



// function RenderComponent() {
//     useFrame((state, delta) => {
//     //   state.gl.render(state.scene, state.camera)
//     }, 1)
//     return null
// };

export default function ModelViewer(props) {

    const { modelUrl } = props
    const { scene, animations } = useGLTF(modelUrl);


    // function RenderComponent() {
    //     useFrame((state, delta) => {
    //         state.gl.render(state.scene, state.camera)
    //         console.log("what is this: ", state)
    //     }, 1);

    //     return null;
    // };

    return (
        <Canvas
            fallback={<div>Sorry no WebGL supported!</div>}
            camera={{ fov: 50, near: 1, far: 1000, position: [0, 15, 100] }}
        >
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            <Model scene={scene} animations={animations} position={[0, 0, 0]} scale={.2} />
            <ContactShadows position={[0, -1, 0]} scale={10} far={4} blur={1.75} />
            <Environment preset="city" />
            <OrbitControls autoRotate autoRotateSpeed={12.0} enableZoom={false} />
        </Canvas>
    )
};
