import { create } from "zustand";
import { MeshPhysicalMaterial } from "three";

const matteMaterial = {
  clearcoat: 0,
  clearcoatRoughness: 0,
  flatShading: false,
  ior: 1.5,
  metalness: 0,
  reflectivity: 0.1,
  roughness: 0.7,
  sheen: 0.5,
  sheenColor: "#707070",
  sheenRoughness: 0.5,

};

const metallicMaterial = {
  clearcoat: 0,
  clearcoatRoughness: 0,
  flatShading: false,
  ior: 1.8,
  metalness: 1,
  roughness: 0.2,
  sheen: 0.15,
  sheenColor: "#707070",
  sheenRoughness: 1,
};

const glossMaterial = {
  clearcoat: 0.3,
  clearcoatRoughness: 0.9,
  flatShading: false,
  ior: 1.5,
  metalness: 0,
  reflectivity: 0,
  roughness: 0.4,
  sheen: 0,
  sheenRoughness: 0,
};

const initialState = {
  matte_black: {
    name: "Matte Black",
    tailwindColor: `bg-zinc-900`,
    material: new MeshPhysicalMaterial({
      ...matteMaterial,
      color: "black",
    }),
  },
  gloss_black: {
    name: "Gloss Black",
    tailwindColor: `bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-700 to-black`,
    material: new MeshPhysicalMaterial({
      ...glossMaterial,
      color: "black",
    }),
  },
  eggshell: {
    name: "Eggshell",
    tailwindColor: `bg-orange-100`,
    material: new MeshPhysicalMaterial({
      ...matteMaterial,
      color: "#ccc0a3",
      ior: 1.8,
      reflectivity: 0.4,
      roughness: 0.6,
      sheen: 1,
      sheenColor: "#ccc0a3",
      sheenRoughness: 1,
    }),
  },
  silver: {
    name: "Silver",
    tailwindColor: `bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-100 to-zinc-900`,
    material: new MeshPhysicalMaterial({
      ...metallicMaterial,
      color: "#444444",
    }),
  },
};

const materialStore = (set, get) => ({
  materials: initialState,

  getMaterials: () => get().materials,

  //possibly create new shadermaterial and apply when selection changes
//   setMaterial: (material) => {
//     set((state) => ({
//       materials: {
//         ...state.materials,
//         material,
//       },
//     }));
//   },

  getMaterial: (name) => get().materials[`${name}`],
});

const useMaterial = create(materialStore);

export default useMaterial;
