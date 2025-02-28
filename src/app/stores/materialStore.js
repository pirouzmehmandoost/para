import { create } from "zustand";
import { MeshPhysicalMaterial } from "three";

const matteMaterial = {
  roughness: 1,
  metalness: 0.1,
  ior: 1.8,
  reflectivity: 0.05,
  sheen: 0.5,
  sheenColor: "#707070",
  sheenRoughness: 0.9,
  flatShading: false,
};

const metallicMaterial = {
  roughness: 0.2,
  metalness: 1,
  ior: 1.8,
  sheen: 0.15,
  sheenColor: "#707070",
  sheenRoughness: 1,
  flatShading: false,
};

const glossMaterial = {
  roughness: 0.4,
  metalness: 0,
  ior: 1.5,
  reflectivity: 0,
  sheen: 0,
  sheenRoughness: 0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.9,
  flatShading: false,
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
      ior: 1.5,
      roughness: 0.6,
      metalness: 0,
      sheen: 1,
      sheenRoughness: 0.5,
      sheenColor: "#ccc0a3",
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
