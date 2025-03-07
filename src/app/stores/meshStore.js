import { create } from "zustand";
import { portfolio } from "@/lib/globals";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const initialState = {};
const { projects } = portfolio;


// projects.forEach(({ sceneData }) => {
//   useGLTF.preload(sceneData.modelUrls.map(({ url }) => url));
// });

const meshStore = (set, get) => ({
  meshes: initialState,

  getMeshes: () => get().meshes,

  getMesh: (name) => get().meshes[`${name}`],

  setMesh: (mesh) => {
    set((state) => ({
      meshes: {
        ...state.meshes,
        [`${mesh.name}`]: mesh,
      },
    }));
  },
});


// const modelUrls =   [
//         { name: "bag_9_for_web", url: "/oval_bag_3.glb" },
//         { name: "bag_88", url: "/bag_xl.glb" },
//         { name: "bag_85", url: "/oval_bag_xl_v2.glb" },
// ]


// const modelUrls2 =   [
//     "/oval_bag_3.glb" ,
//     "/bag_xl.glb" ,
//     "/oval_bag_xl_v2.glb" 
// ]



async function loadGLBModels(urls) {
    const loader = new GLTFLoader();
    const promises = urls.map(url => loader.loadAsync(url));
    return Promise.all(promises);
}

export async function initializeScene(glbUrls) {
    const models = await loadGLBModels(glbUrls);
    // Add loaded models to the scene
    models.forEach(gltf => {
        console.log(gltf.scene);
    });
}

export function asyncLoadGLTF(data) {

     data.map( ({sceneData: {modelUrls}}) => { 
            return async function () {
                    const models = await loadGLBModels(modelUrls.map(data=> data.url))
                    models.forEach(gltf => {
                        console.log("HERE WE ARE", gltf.scene);
                    });
            }
        })
    
        // models.forEach(scene => {
        //     console.log("scene: ", scene)
        //     // initialState[`${scene.children[0].name}`] = scene.children[0].geometry;
        // });
}


export function initializeStore(data) {
    const loader = new GLTFLoader();

    data.map( ({sceneData: {modelUrls}}) => { 
        modelUrls.map(({url, name} ) => {
            loader.load(url, (gltf) => {
                initialState[`${name}`] = gltf.scene.children[0].geometry;
            })
        })
    })
};


initializeStore(projects);
// asyncSInitializeStore(modelUrls2);

asyncLoadGLTF(projects)
const useMesh = create(meshStore);

export default useMesh;
