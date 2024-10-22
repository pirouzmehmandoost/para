"use client";

import { useRef } from 'react';
import * as THREE from "three";
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, useFrame, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
THREE.ColorManagement.enabled = true;

export function Model(props) {
    const { animations, scene, ...rest } = props;
    // const { actions } = useAnimations(animations, scene);
    const modelRef = useRef();

    // useLayoutEffect(() => {
    //     // actions.Animation.play()
    // }, []);

    return <primitive object={scene} ref = {modelRef} {...rest} />
}


export default function ModelViewer(props) {

    const { modelUrl } = props
    const { scene, animations } = useGLTF(modelUrl);

    return (   
        <Canvas 
        fallback={<div>Sorry no WebGL supported!</div>}
        camera={{ fov: 50, near: 1, far: 1000, position: [0, 15, 100] }}
        >
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            <Model scene={scene} animations={animations} position={[0, 0, 0]} />
            <ContactShadows position={[0, -1, 0]} scale={10} far={4} blur={1.75} />
            <Environment preset="city" />
            <OrbitControls autoRotate autoRotateSpeed={12.0} enableZoom={false} />
        </Canvas>
    )
};
