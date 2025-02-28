import { create } from "zustand";

const initialState = {};

const meshStore = (set, get) => ({
  meshes: initialState,

  getMeshes: () => get().meshes,

  getMesh: (name) => get().meshes[`${name}`] ,

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
