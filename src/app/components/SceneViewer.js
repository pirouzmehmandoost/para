"use client";

import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
    useGLTF,
    OrbitControls,
    Environment,
    Loader,
    CameraShake,
} from "@react-three/drei";
import { Color } from "three";

THREE.ColorManagement.enabled = true;

const Model = (data) => {
    const { material: materialProps, modelUrl, autoUpdateMaterial, position, scale: scaleRatio } = data;
    // const modelRef = useRef();
    const { scene } = useGLTF(modelUrl);
    const { viewport } = useThree();
    let material = new THREE.MeshPhysicalMaterial(materialProps);
    let scale = scaleRatio * (viewport.getCurrentViewport().aspect / 6);

    scene.traverse((child) => {
        if (!!child.isMesh) {
            child.material = material;
            child.castShadow = true;
            child.receiveShadow = true;
            child.scale.set(scale, scale, scale);
        }
    });

    if (position) {
        scene.position.set(position[0], position[1], position[2]);
    } else {
        scene.position.set(0, -25, 0);
    };


    if (autoUpdateMaterial) {
        useFrame((state) => {
            const elapsedTime = state.clock.getElapsedTime();

            // Calculate color based on time
            const color = new Color("white").lerp(
                new Color("black"),
                Math.sin(elapsedTime) * 0.5 + 0.5,
            );

            scene.traverse((child) => {
                if (!!child?.material) {
                    // Update material color and roughness
                    child.material.color = color;
                    child.material.roughness = (Math.sin(elapsedTime * 0.5) + 1) * 0.25;
                    child.material.metalness = (Math.sin(elapsedTime * 0.25) + 1) * 0.5;
                    child.rotation.set(0, ((Math.sin(Math.PI / 4) * elapsedTime * 0.25)), 0)

                };
            });
        });
    } else {
        const color = new Color("black");
        scene.traverse((child) => {
            if (!!child.isMesh) {
                child.material.ior = 1.5;
                child.material.color = color;
                child.material.roughness = 0.0;
                child.material.reflectivity = 0.0;
                child.material.clearcoat = 0.5;
                child.material.clearcoatRoughness = 0.0;
                child.material.specularIntensity = 0.03
                child.material.specularColor = "#ffffff"
                child.material.transmission = 1;
                child.material.metalness = 0.0;
            };
        });
    };
    return <primitive castShadow receiveShadow object={scene} />;
};

const Group = (data) => {
    const {
        autoUpdateMaterial,
        colorCodes,
        modelUrls,
        cameraPosition,
        enableRotate,
        autoRotate,
        autoRotateSpeed,
        orthographic,
    } = data;

    const { camera, get } = useThree();
    const groupRef = useRef();

    useEffect(() => {
        if (groupRef.current) {
            const boundingBox = new THREE.Box3().setFromObject(groupRef.current);
            const center = boundingBox.getCenter(new THREE.Vector3());

            // Update camera position
            camera.position.copy(center);
            camera.position.y += cameraPosition[1];
            camera.position.z += cameraPosition[2];

            const controls = get().controls;
            if (controls) {
                controls.target.copy(center)
                controls.update();
            }
        }
    }, [groupRef]);


    return (
        <>
            <group castShadow receiveShadow ref={groupRef}>
                {
                    modelUrls.map((url, index) => {
                        const newProps = {
                            modelUrl: url,
                            material: { ...colorCodes },
                            scale: 0.9,
                            autoUpdateMaterial,
                            position: [(index * 150), -25, -50]
                        };
                        return <Model key={index}{...newProps} />
                    })
                }
            </group>
            <OrbitControls
                target={groupRef}
                makeDefault
                enablePan={false}
                enableZoom={false}
                autoRotate={autoRotate}
                autoRotateSpeed={autoRotateSpeed}
                enableRotate={enableRotate}
                orthographic={orthographic}
            />
        </>
    );
}


export const SceneViewer = ({ data }) => {
    const { sceneData: { autoUpdateMaterial = true, colorCodes, modelUrls, autoRotate = false, autoRotateSpeed = 3, enableRotate = true, orthographic = false, cameraPosition = [0, 10, 150] } } = data;
    const sceneProps = {
        material: { ...colorCodes },
        modelUrls,
        autoUpdateMaterial,
        cameraPosition,
        enableRotate,
        autoRotate,
        autoRotateSpeed,
        orthographic
    };
    const near = orthographic ? -100 : 1;
    const fov = orthographic ? 500 : 50;

    return (
        <Suspense fallback={<Loader />}>
            <Canvas
                camera={{ position: cameraPosition, near: near, far: 500, fov: fov }}
                fallback={<div>Sorry no WebGL supported!</div>}
                orthographic={orthographic}
                shadows
            >
                <Group {...sceneProps} />
                <CameraShake
                    maxYaw={0.1}
                    maxPitch={0.1}
                    yawFrequency={0.1}
                    pitchFrequency={0.1}
                    intensity={0.5}
                    decay
                    decayRate={0.65}
                />
                <Environment shadows files="./studio_small_08_4k.exr" />
            </Canvas>
        </Suspense >
    );
};

export default SceneViewer;