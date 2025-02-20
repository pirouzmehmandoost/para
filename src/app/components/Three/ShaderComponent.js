// "use client";

// import * as THREE from 'three';
// import fragmentShader from "../../../Shaders/fragment.glsl";
// import { Suspense, useEffect, useState, useMemo, useRef, } from "react";
// import { Canvas, useThree, useFrame } from "@react-three/fiber";
// import { Loader, ScrollControls, useScroll } from "@react-three/drei";


// const Box = () => {
//   const boxRef = useRef();
//   const { camera, clock, size, viewport, mouse } = useThree();
//   const [mousePos, setMousePos] = useState(mouse)
//   const data = useScroll();

//   console.log(viewport)
//   const vResolution = new THREE.Vector2(size.width * viewport.dpr, size.height * viewport.dpr);
//   // const scale = Math.max(viewport.width, viewport.height) / viewport.height

//   // Shader material creation
//   const mat = new THREE.ShaderMaterial({
//     vertexShader: /* glsl */`
//     varying vec2 v_texcoord;
//     void main() {
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         v_texcoord = uv;
//     }`,
//     fragmentShader, // most of the action happening in the fragment
//     uniforms: {
//       u_mouse: { value: mouse },
//       u_resolution: { value: vResolution },
//       u_pixelRatio: { value: viewport.dpr }
//     },
//     defines: {
//       VAR: 1
//     }
//   });

//   const geo = new THREE.SphereGeometry(90, 90);
//   const quad = new THREE.Mesh(geo, mat);

//   useEffect(() => {
//     if (boxRef?.current) {
//       boxRef.current.material = mat

//       console.log("boxRef is: ", boxRef.current)
//       console.log(" material is: ", boxRef?.current?.material)
//     }
//     camera.lookAt(0, 0, 0)
//   }, [])

//   const updateUniforms = () => {
//     // const x = (mousePos.x * size.width) 
//     // const y = (mousePos.y * size.height)
//     const x = (mouse.x * size.width)
//     const y = (mouse.y * size.height)
//     const currMouse = new THREE.Vector2(x, y)


//     // // // ease mouse motion with damping
//     // for (const k in mouse) {
//     //   if (k == 'x' || k == 'y') mouse[k] = THREE.MathUtils.damp(mousePos[k], currMouse[k], 8, 0.02);
//     // }


//     boxRef.current.material.uniforms.u_mouse.value.x = x
//     boxRef.current.material.uniforms.u_mouse.value.y = y
//     boxRef.current.material.uniforms.uTime = clock.getElapsedTime();


//     setMousePos(
//       {
//         x: x,
//         y: y
//       }
//     );


//   }










//   // useEffect(() => {
//   //   if (boxRef?.current) {
//   //     boxRef.current.material = mat

//   //     console.log("boxRef is: ", boxRef.current)
//   //     console.log(" material is: ", boxRef?.current?.material)
//   //   }
//   //   camera.lookAt(0, 0, 0)
//   // }, [])

//   // const updateUniforms = (delta) => {
//   //   // const x = (mousePos.x * size.width) 
//   //   // const y = (mousePos.y * size.height)
//   //   const x = (mouse.x * size.width)
//   //   const y = (mouse.y * size.height)
//   //   const currMouse = new THREE.Vector2(x, y)


//   //   // // ease mouse motion with damping
//   //   for (const k in mouse) {
//   //     if (k == 'x' || k == 'y') mouse[k] = THREE.MathUtils.damp(mousePos[k], currMouse[k], 8, delta);
//   //   }


//   //   boxRef.current.material.uniforms.u_mouse.value.x = x
//   //   boxRef.current.material.uniforms.u_mouse.value.y = y
//   //   boxRef.current.material.uniforms.uTime = clock.getElapsedTime();


//   //   setMousePos(
//   //     {
//   //       x: x,
//   //       y: y
//   //     }
//   //   );


//   // }


//   // const handlePointerMove = (e) => {
//   //   // console.log(mouse)
//   //   // console.log('Pointer move:', e)
//   //   // mouse.set(e.uv?.x, e.uv?.y);



//   //   const deltaX = (mouse.x - mousePos.x) * 0.01;
//   //   const deltaY = (mouse.y - mousePos.y) * 0.01;

//   //   if (boxRef?.current && boxRef?.current?.material) {

//   //     mouse.x = (e.clientX / size.width) * 2 - 1;
//   //     mouse.y = -(e.clientY / size.height) * 2 + 1;



//   //     boxRef.current.material.uniforms.u_mouse.value.x = mouse.x
//   //     boxRef.current.material.uniforms.u_mouse.value.y = mouse.y
//   //     setMousePos(
//   //       {
//   //         x: mouse.x,
//   //         y: mouse.y,
//   //       }
//   //     );
//   //     boxRef.current.material.uniforms.uTime = clock.getElapsedTime();
//   //   };
//   // };

//   // useFrame((state, delta) => {
//   //   if (boxRef?.current && boxRef?.current?.material) {

//   //     // mouse.lerp(mousePos, mouse);

//   //     // // // ease mouse motion with damping
//   //     // for (const k in mouse) {
//   //     //   if (k == 'x' || k == 'y') mouse[k] = THREE.MathUtils.damp(boxRef.current.material.uniforms.u_mouse.value[k], mouse[k], 8, delta);
//   //     // }

//   //     updateUniforms(delta);
//   //   }
//   // });


















//   const handlePointerMove = (e) => {
//     // console.log(mouse)
//     // console.log('Pointer move:', e)
//     // mouse.set(e.uv?.x, e.uv?.y);

//     if (boxRef?.current && boxRef?.current?.material) {
//       boxRef.current.material.uniforms.u_mouse.value.x = e.uv?.x
//       boxRef.current.material.uniforms.u_mouse.value.y = e.uv?.y
//       setMousePos(
//         {
//           x: e.uv?.x,
//           y: e.uv?.y
//         }
//       );
//       boxRef.current.material.uniforms.uTime = clock.getElapsedTime();
//     };
//   };

//   useFrame((state, delta) => {
//     if (boxRef?.current && boxRef?.current?.material) {

//       // mouse.lerp(mousePos, mouse);

//       // // // ease mouse motion with damping
//       // for (const k in mouse) {
//       //   if (k == 'x' || k == 'y') mouse[k] = THREE.MathUtils.damp(boxRef.current.material.uniforms.u_mouse.value[k], mouse[k], 8, delta);
//       // }

//       updateUniforms();
//     }
//   });


//   return (
//     <mesh
//       scale={[5, 5, 5]}
//       onPointerMove={(e) => handlePointerMove(e)}
//       onPointerOver={(e) => handlePointerMove(e)}
//       ref={boxRef}
//     >
//       <primitive
//         object={quad}
//         resolution={[vResolution.x, vResolution.y]}
//         render={0}
//       />
//       {/* <shaderMaterial attach="material" {...mat} /> */}
//     </mesh>
//   )
// };
// //end Box



// export const ShaderComponent = () => {
//   const cameraPosition = [0, 10, 180];
//   const orthographic = false;
//   const near = orthographic ? -100 : 1;
//   const fov = orthographic ? 500 : 50;
//   return (
//     <Suspense fallback={<Loader />}>
//       <Canvas
//         camera={{ position: cameraPosition, near: near, far: 500, fov: fov }}
//         fallback={<div>Sorry no WebGL supported!</div>}
//         orthographic={orthographic}
//         shadows
//       >

//         <directionalLight
//           castShadow={true}
//           position={[0, 100, 0]}
//           shadow-mapSize-width={2048}
//           shadow-mapSize-height={2048}
//           intensity={7}
//           angle={0.45}
//           shadow-camera-near={0.5}
//           shadow-camera-far={1000}
//           shadow-bias={-0.001}
//           shadow-camera-top={1500}
//           shadow-camera-bottom={-1500}
//           shadow-camera-left={-1500}
//           shadow-camera-right={1500}
//         />
//         <directionalLight
//           castShadow={true}
//           position={[0, 200, 0]}
//           shadow-mapSize-width={2048}
//           shadow-mapSize-height={2048}
//           intensity={5}
//           angle={0.45}
//           shadow-camera-near={0.5}
//           shadow-camera-far={1000}
//           shadow-bias={-0.001}
//           shadow-camera-top={1500}
//           shadow-camera-bottom={-1500}
//           shadow-camera-left={-1500}
//           shadow-camera-right={1500}
//         />
//         <ScrollControls damping={2} pages={1} >

//           <Box />
//         </ScrollControls>
//       </Canvas>
//     </Suspense>
//   );
// };

// export default ShaderComponent;
