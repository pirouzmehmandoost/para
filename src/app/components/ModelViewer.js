"use client";

import { UnifrakturCook } from "next/font/google"

import * as THREE from "three";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import React, { useLayoutEffect, useRef } from "react";
import { dumpObject } from "../../lib/modeling";

// const url = "bag_for_web_v2.gltf";
// const url = "bag_for_web2.gltf";
// const url = "rock_bag_red.gltf";
const url = "rock_bag_v2_web_display_2.glb";
let text = ""
const loader = new GLTFLoader();
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const cook =  UnifrakturCook({ weight: '700', subsets: ["latin"], });


export const frameArea = (sizeToFitOnScreen, boxSize, boxCenter, camera) => {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = new THREE.Vector3()
    .subVectors(camera.position, boxCenter)
    .multiply(new THREE.Vector3(1, 0, 1))
    .normalize();
    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
    camera.updateProjectionMatrix();
    
    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
};

export const ModelViewer = () => {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        loader.load( url,(gltf) => {
            gltf.scene.scale.set(0.00001, 0.00001, 0.00001)
            const root = gltf.scene;
            let requestId = null;
            //warm white lighting
            // const light = new THREE.HemisphereLight(0xF8F7F7, 0xF8F7F7, .1);
            // scene.add(light);

            // top lighting
            const pointLight1 = new THREE.PointLight(0xFFFFFF , 5);
            pointLight1.position.x = -1;
            pointLight1.position.y = 5;
            pointLight1.position.z = 0;
            pointLight1.intensity = 40;
            scene.add(pointLight1);

            //bottom lighting
            const pointLight2 = new THREE.PointLight(0xFFFFFF , 15);
            pointLight2.position.x = 1;
            pointLight2.position.y = -5;
            pointLight2.position.z = 0;
            pointLight2.intensity = 40;
            scene.add(pointLight2);

            const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1, 1000);
            
            camera.position.set(-30, 0, 0.1);
            camera.lookAt(new THREE.Vector3());
            scene.add(camera);

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.setAnimationLoop(() => {
                // renderer.render(scene, camera);
                start
            });

            document
                .getElementById(`model_viewer_container`)
                .appendChild(renderer.domElement);

            const box = new THREE.Box3().setFromObject(root);
            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());

            frameArea(boxSize * 1.2, boxSize, boxCenter, camera);

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.enableZoom = true;
            controls.maxDistance = boxSize * 10;
            controls.target.copy(boxCenter);
            controls.update();
            scene.add(root);

            console.log("ModelViewer -> dumpObject(): ", dumpObject(root).join("\n"))


            // document.querySelectorAll(`#model_viewer_container`).forEach(elem => intersectionObserver.observe(renderer.domElement));

            
            function start() {
                requestId = requestAnimationFrame(start);
                console.log("start() invoked. requestID is: ", requestId )

                controls.update();
                renderer.render(scene, camera);
            };

            function stop() {
                console.log("stop() invoked. requestID is: ", requestId )
                cancelAnimationFrame(requestId);
                console.log("stop() invoked. ")

            };

            start();

            console.table("containerRef: ", containerRef) 

            const onScreen = new Set();
            const intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    console.log("intersection entry: ") 
                    console.table(entry) 
                    console.log("_________________") 

                    if (entry.isIntersecting) {
                        onScreen.add(entry.target);
                        start();
                    console.log('render has been started');
                    } else {
                        console("\n else statement: stop. isIntersecting is false. entry.target: ")

                        console.table(entry.target)
                        stop();
                        onScreen.delete(entry.target);
                        console.log('stop() innvoked and obScrene.delete() invoked');
                        }     
                });

            // document.getElementById("").innerHTML = onScreen.size
            //     ? `on screen: ${[...onScreen].map(e => e.innerHTML).join(', ')}`
            //     : 'none';
            });

            // document.querySelectorAll(`#model_viewer_container`).forEach(elem => intersectionObserver.observe(elem));
            document.querySelectorAll(`#model_viewer_container`).forEach(elem => intersectionObserver.observe(elem));
            intersectionObserver.observe(renderer.domElement);

        }, undefined, function (error) { console.error(error); });
    }, []);

    return (
        <div
        ref={containerRef}
        id="model_viewer_container"
        className="flex align-center items-center justify-around text-center border border-color-black"
        />
       
    );
};
