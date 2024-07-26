"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import "aframe";
import "mind-ar/dist/mindar-image-aframe.prod.js";
import { dumpObject } from "../../lib/modeling";

export const ImageTracker = () => {
  const containerRef = useRef(null);
  const url = "rock_bag_red.gltf";

    useLayoutEffect(() => {
        let root;

        const clock = new THREE.Clock();
        const light = new THREE.HemisphereLight(0xffffff, 0x080820, 5000);
        const light2 = new THREE.AmbientLight(0x404040, 5000); // soft white light
        const loader = new GLTFLoader();

        const mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: "/targets_1.mind",
        });

        const { renderer, scene, camera } = mindarThree;
        const anchor = mindarThree.addAnchor(0);

        scene.add(light);
        scene.add(light2);

        loader.load(url, (gltf) => {
            root = gltf.scene;
            root.scale.set(0.01, 0.01, 0.01);
        // root.userData.clickable = true;

            if (window) {
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(window.devicePixelRatio);
                const box = new THREE.Box3().setFromObject(root);
                // const boxSize = box.getSize(new THREE.Vector3()).length();
                const boxCenter = box.getCenter(new THREE.Vector3());

                root.position.set(boxCenter.x, boxCenter.y, 0);
                light2.position.set(boxCenter.x, boxCenter.y, 0);
            }
                
            renderer.outputColorSpace = THREE.SRGBColorSpace;

            scene.add(root);
            anchor.group.add(root);

            console.log(dumpObject(root).join("\n"));

        // gltf.parser.getDependencies( 'material' ).then( ( materials ) => {
        //   console.log( {materials} );
        //   console.log(materials[0].metalness)
        //   materials[0].metalness = 1
        //   console.log(materials[0].metalness)
        // });

        // root.traverse((child) => function () {
        //   if(child.isMesh) {
        //     child.geometry.computeVertexNormals();
        //     child.material = new THREE.MeshPhysicalMaterial({
        //       clearcoat: 1,
        //       clearcoatRoughness: 0.1,
        //       transmission: 1,
        //     });
        //     if (child?.material) console.log(child.material)

        //   }
        // }
        });

        mindarThree.start();

        renderer.setAnimationLoop(() => {
            const delta = clock.getDelta();

            if (root) root.rotation.set(0, root?.rotation.y + delta, 0);

            renderer.render(scene, camera);

            if (window) {
                document
                .getElementById(`model_viewer_container`)
                .appendChild(renderer.domElement);
            }
        });

        return () => {
            renderer.setAnimationLoop(null);
        };
    }, []);

  return (
    <div
      ref={containerRef}
      className="flex-column items-center justify-center  text-center min-w-screen min-h-screen "
    >
      <canvas className=" flex-column min-w-screen min-h-screen items-center justify-center text-center" />
    </div>
  );
};


// "use client";

// import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import {CSS3DObject} from "three/examples/jsm/renderers/CSS3DRenderer.js";
// import * as THREE from "three";

// import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
// import "aframe";
// import "mind-ar/dist/mindar-image-aframe.prod.js";
// import { dumpObject } from "../../lib/modeling"

// export const ImageTracker = () => {
//   const containerRef = useRef(null);
//   const url = "rock_bag_red.gltf";

//   useLayoutEffect(() => {
//     let root;
//     const clock = new THREE.Clock();
//     const light = new THREE.HemisphereLight(0xffffff, 0x080820, 25);
//     const loader = new GLTFLoader();
//     const light2 = new THREE.AmbientLight( 0x404040, 500 ); // soft white light

//     const mindarThree = new MindARThree({
//       container: containerRef.current,
//       imageTargetSrc: "/targets_1.mind",
//     });

//     const { renderer, cssRenderer, scene, cssScene, camera } = mindarThree;
//     scene.add(light);
//     scene.add(light2)

//     const anchor = mindarThree.addAnchor(0);

//     loader.load(url, (gltf) => {
//       const cssAnchor = mindarThree.addCSSAnchor((0))
//       const css3dObject = new CSS3DObject(document.querySelector(`testMe`))

//       cssAnchor.group.add(css3dObject)

//       root = gltf.scene
//       root.scale.set(0.01, 0.01, 0.01);
//       // root.userData.clickable = true;

//       if (window) {
//           renderer.setSize(window.innerWidth, window.innerHeight);
//           renderer.setPixelRatio(window.devicePixelRatio);
//           const box = new THREE.Box3().setFromObject(root);
//           // const boxSize = box.getSize(new THREE.Vector3()).length();
//           const boxCenter = box.getCenter(new THREE.Vector3());

//           root.position.set(boxCenter.x,boxCenter.y, 0);
//           light2.position.set(boxCenter.x, boxCenter.y, 0)
//       }
//       renderer.outputColorSpace = THREE.SRGBColorSpace;

//       scene.add(root)
//       anchor.group.add(root);

//       console.log(dumpObject(root).join("\n"));

//     // gltf.parser.getDependencies( 'material' ).then( ( materials ) => {
//     //   console.log( {materials} );
//     //   console.log(materials[0].metalness)
//     //   materials[0].metalness = 1
//     //   console.log(materials[0].metalness)
//     // });

//       // root.traverse((child) => function () {
//       //   if(child.isMesh) {
//       //     child.geometry.computeVertexNormals();
//       //     child.material = new THREE.MeshPhysicalMaterial({
//       //       clearcoat: 1,
//       //       clearcoatRoughness: 0.1,
//       //       transmission: 1,
//       //     });
//       //     if (child?.material) console.log(child.material)

//       //   }
//       // }
//     });

//     mindarThree.start();
//     renderer.setAnimationLoop(() => {
//       const delta = clock.getDelta();

//       if (root) root.rotation.set(0, root?.rotation.y + delta, 0);
//       cssRenderer.render(cssScene, camera);

//       if (window) {
//         document
//         .getElementById(`model_viewer_container`)
//         .appendChild(renderer.domElement);
//       }

//     });

//     return () => {
//       renderer.setAnimationLoop(null);
//     };
//   }, []);

//   return (
//     <div className=" flex-column items-center justify-center  text-center min-w-screen min-h-screen "
//     ref={containerRef}>
//       <p>Pirouz Mehmandoost</p>

//       <canvas className=" min-w-screen min-h-screen items-center justify-center"></canvas>
//     </div>
//   );
// };

// const startUp = async ( ) => {
//   root = await loadGLTF(url, anchor)
//   console.log(root.scene)
//   console.log(root)

//   return root
//  }

// document.addEventListener("click", (e) => {
//   const mouseX = (e.clientX/window.innerWidth) * 2 - 1;
//   const mouseY = (e.clientY/window.innerHeight) * -2 + 1;
//   const mouse = new THREE.Vector2(mouseX, mouseY);
//   const rayCaster = new THREE.Raycaster();
//   rayCaster.setFromCamera(mouse, camera)

//   console.log( "root.children = ", root.children)
//   const intersections = rayCaster.intersectObjects(sroot.children, true);
//   console.log(intersections.length)

//   if (intersections.length > 0) {
//     let obj = intersections[0].object;
//     console.log(intersections.length)
//     while(obj.parent && !obj.userData.clickable) {
//       if (obj === root) break;
//       obj = obj.parent;
//     }
//     if (obj.userData.clickable) {
//       if (obj == root) {
//         root.rotation.z = 90
//         scene.background = new THREE.Color('skyblue')
//       }
//     }
//   }
// })

// const startUp = async ( ) => {
//   root = await loadGLTF(url, anchor)
//   console.log(root.scene)
//   console.log(root)

//   return root
//  }

// document.addEventListener("click", (e) => {
//   const mouseX = (e.clientX/window.innerWidth) * 2 - 1;
//   const mouseY = (e.clientY/window.innerHeight) * -2 + 1;
//   const mouse = new THREE.Vector2(mouseX, mouseY);
//   const rayCaster = new THREE.Raycaster();
//   rayCaster.setFromCamera(mouse, camera)

//   console.log( "root.children = ", root.children)
//   const intersections = rayCaster.intersectObjects(sroot.children, true);
//   console.log(intersections.length)

//   if (intersections.length > 0) {
//     let obj = intersections[0].object;
//     console.log(intersections.length)
//     while(obj.parent && !obj.userData.clickable) {
//       if (obj === root) break;
//       obj = obj.parent;
//     }
//     if (obj.userData.clickable) {
//       if (obj == root) {
//         root.rotation.z = 90
//         scene.background = new THREE.Color('skyblue')
//       }
//     }
//   }
// })
