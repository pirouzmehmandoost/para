"use client";

import { useLayoutEffect } from 'react'
import * as THREE from "three";
import { Canvas } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from '@react-three/drei'


function Model(props) {
    const { animations, scene, ...rest } = props;
    const { actions } = useAnimations(animations, scene);

    // useLayoutEffect(() => {
    //     // actions.Animation.play()
    // }, []);

    return <primitive object={scene} {...rest} />
}


function ModelViewer() {
    const { scene, animations } = useGLTF('/rock_tote_for_web.glb');

    return (
        <Canvas camera={{ fov: 50, near: 1, far: 1000, position: [0, 15, 100] }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Model scene={scene} animations={animations} position={[0, 0, 0]} />
        <ContactShadows position={[0, -1, 0]} scale={10} far={4} blur={1.75} />
        <Environment preset="city" />
        <OrbitControls autoRotate autoRotateSpeed={12.0} enableZoom={false} />
        </Canvas>
    )
}


export default function Home() {
    return (
        <main
        className="flex flex-col place-items-center items-center w-screen h-screen"
        >
            <p className="text-5xl my-20">
                This is the Home Page
            </p>
            
           <div className=" w-4/5 h-4/5" > <ModelViewer/> </div>
        </main>
    );
};
