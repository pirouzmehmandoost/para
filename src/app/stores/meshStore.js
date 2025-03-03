import { create } from "zustand";
import { portfolio } from "@/lib/globals";
import { useGLTF } from "@react-three/drei";

const initialState = {};
const { projects } = portfolio;

projects.forEach(({ sceneData }) => {
  useGLTF.preload(sceneData.modelUrls.map(({ url }) => url));

  // for (const {name, url} of sceneData.modelUrls) {
  //     initialState[`${name}`] = useGLTF(url).nodes[`${name}`];
  // }
});

console.log("what is this", useGLTF);

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

const useMesh = create(meshStore);

export default useMesh;
