// import React, { useEffect, useRef } from "react";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import * as THREE from "three";
// import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
// import "aframe";
// import "mind-ar/dist/mindar-image-aframe.prod.js";
// import "@tensorflow/tfjs-backend-webgl";
// import {
//   createDetector,
//   SupportedModels,
// } from "@tensorflow-models/hand-pose-detection";
// import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";

// tfjsWasm.setWasmPaths(
//   `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm`,
// );

// const setupVideo = async () => {
//   const video = document.getElementById("video");
//   const stream = await window.navigator.mediaDevices.getUserMedia({
//     video: true,
//   });

//   video.srcObject = stream;
//   await new Promise((resolve) => {
//     video.onloadedmetadata = () => {
//       resolve();
//     };
//   });
//   video.play();

//   video.width = video.videoWidth;
//   video.height = video.videoHeight;

//   return video;
// };

// const setDetector = async () => {
//   const model = SupportedModels.MediaPipeHands;

//   const detector = await createDetector(model, {
//     runtime: "mediapipe",
//     maxHands: 2,
//     solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
//   });

//   return detector;
// };

// async function setupCanvas(video) {
//   const canvas = document.getElementById('canvas');
//   const ctx = canvas.getContext('2d');

//   canvas.width = video.width;
//   canvas.height = video.height;

//   return ctx;
// }

// export const HandGestureTracker = () => {
//   const url = "/bag_for_web2.gltf";
//   const containerRef = useRef(null);



//   useEffect(() => {
//     let root;
//     let mixer;
//     const mindarThree = new MindARThree({
//       container: containerRef.current,
//       imageTargetSrc: "/targets_1.mind",
//     });

//     const { renderer, scene, camera } = mindarThree;
//     const light = new THREE.HemisphereLight(0xffffff, 0x080820, 5);
//     const anchor = mindarThree.addAnchor(0);
//     const loader = new GLTFLoader();

//     scene.add(light);
    
//     loader.load(url, (gltf) => {
//       root = gltf.scene;
//       root.scale.set(0.01, 0.01, 0.01);
//       root.rotation.y = 90
//       root.position.set(-1, 0, 0);
      
//       anchor.group.add(root);

//       action.play();
//     });

//     mindarThree.start();

//     renderer.setAnimationLoop(() => {
//       renderer.render(scene, camera);

//       document
//         .getElementById(`model_viewer_container`)
//         .appendChild(renderer.domElement);
//     });

//     return () => {
//       renderer.setAnimationLoop(null);
//     };
//   }, []);

//   return (
//     <div
//       className=" flex-column items-center justify-center  text-center min-w-screen min-h-screen "
//       ref={containerRef}
//     >
//       <p>Pirouz Mehmandoost</p>
//       <canvas className=" min-w-screen min-h-screen items-center justify-center"></canvas>
//     </div>
//   );
// };
