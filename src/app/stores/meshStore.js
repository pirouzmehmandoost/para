// import { create } from 'zustand';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { portfolio } from '@configs/globals';
// const { projects } = portfolio;
// import { Cache } from 'three';

// Cache.enabled = true;
// // async function loadGLBModels(urls) {
// //     const loader = new GLTFLoader();
// //     const promises = urls.map(url => loader.loadAsync(url));
// //     return Promise.all(promises);
// // }

// // export async function initializeScene(glbUrls) {
// //     const models = await loadGLBModels(glbUrls);

// //     models.forEach(gltf => {
// //         console.log(gltf.scene);
// //     });
// // }

// // export function asyncLoadGLTF(url) {
// //     const loader = new GLTFLoader();

// //     const load = async (url) => {
// //         const promise =  loader.loadAsync(url);
// //         return Promise.resolve(promise);
// //     }

// //     return async function () {
// //             const gltf = await load(url)
// //             initialState[`${gltf.scene.children[0].name}`] = gltf.scene.children[0].geometry;
// //             return gltf.scene.children[0].geometry;
// //     }.call();
// // };
// const loader = new GLTFLoader();

// export function asyncLoadGLTF(url, callBack) {
//   const load = async (url) => {
//     const promise = loader.loadAsync(url);
//     return Promise.resolve(promise);
//   };

//   return async function () {
//     const gltf = await load(url);
//     if (typeof callBack === 'function') {
//       callBack(gltf.scene.children[0]);
//     } else {
//       initialState[`${gltf.scene.children[0].name}`] =
//         gltf.scene.children[0].geometry;
//       return gltf.scene.children[0].geometry;
//     }
//   }.call();
// }

// export function asyncInitializeStore(callBack) {
//   const load = async (url) => {
//     const promise = loader.loadAsync(url);
//     return Promise.resolve(promise);
//   };

//   return projects.map(({ sceneData: { modelUrls } }) => {
//     return async function () {
//       modelUrls.forEach(async ({ url }) => {
//         const gltf = await load(url);
//         if (typeof callBack === 'function') {
//           callBack(gltf.scene.children[0]);
//         } else
//           initialState[`${gltf.scene.children[0].name}`] =
//             gltf.scene.children[0].geometry;
//       });
//     }.call();
//   });
// }

// // export function asyncInitializeStore(callBack) {
// //     const loader = new GLTFLoader();

// //      const load = async (urls) => {
// //                     console.log("urls are ", urls)

// //         const promises = urls.map(url => loader.loadAsync(url));
// //         return Promise.all(promises);
// //     }

// //     return projects.map( ({sceneData: {modelUrls}}) => {
// //         return async function () {
// //             const models = await load(modelUrls.map(data=> data.url))
// //             models.forEach(gltf => {
// //                 if (typeof callBack === 'function') { callBack(gltf.scene.children[0])}
// //                 else initialState[`${gltf.scene.children[0].name}`] = gltf.scene.children[0].geometry;
// //             });
// //         }.call();
// //     });
// // };

// // export function asyncInitializeStore(callBack) {
// //     return projects.map( ({sceneData: {modelUrls}}) => {
// //         return async function () {
// //             const models = await loadGLBModels(modelUrls.map(data=> data.url))
// //             models.forEach(gltf => {
// //                 if (typeof callBack === 'function') { callBack(gltf.scene.children[0])}
// //                 else initialState[`${gltf.scene.children[0].name}`] = gltf.scene.children[0].geometry;
// //             });
// //         }.call();
// //     });
// // };

// // export function initializeStore() {
// //     const loader = new GLTFLoader();
// //     projects.map( ({sceneData: {modelUrls}}) => {
// //         modelUrls.map(({url, name} ) => {
// //             loader.load(url, (gltf) => {
// //                 initialState[`${name}`] = gltf.scene.children[0].geometry;
// //             });
// //         });
// //     });
// // };


// const initialState = {
//   position: {},
//   time: 0.0
// };

// const meshStore = (set, get) => ({
//   animationState: initialState,

//   getAnimationState: () => get().animationState,
//   getAnimationPosition: () => get().animationState.position,
//   getAnimationTime: () => get().animationState.time,

//   setAnimationTime: (newTime) => {
//     set({
//       animationState: {
//         ...animationState.position,
//         time: newTime,
//       },
//     });
//   },

//   setAnimationPosition: (newPosition) => {
//     set({
//       animationState: {
//         ...animationState.time,
//         position: newPosition
//       },
//     });
//   },

//   reset: () => { set({ animationState: { ...initialState } }) },

// });

// const useMesh = create(meshStore);

// export default useMesh;
