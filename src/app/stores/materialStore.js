import { create } from "zustand";
import { MeshPhysicalMaterial } from "three";

const matteMaterial = {
  //   clearcoat: 0,
  //   clearcoatRoughness: 0,
  flatShading: false,
  ior: 1.5,
  metalness: 0,
  reflectivity: 0.1,
  roughness: 0.7,
  sheen: 0.6,
  sheenColor: "#707070",
  sheenRoughness: 0.7,
};

const metallicMaterial = {
  clearcoat: 0,
  clearcoatRoughness: 0,
  flatShading: false,
  ior: 1.8,
  metalness: 1,
  roughness: 0.2,
  sheen: 0.2,
  sheenColor: "#707070",
  sheenRoughness: 1,
};

const glossMaterial = {
  clearcoat: 0.3,
  clearcoatRoughness: 0.9,
  flatShading: false,
  ior: 1.5,
  metalness: 0,
  reflectivity: 0.1,
  roughness: 0.4,
  sheen: 0.1,
  sheenColor: "#bcbcbc",
  sheenRoughness: 0,
};

const initialState = {
  ground: {
    name: "ground",
    tailwindColor: `bg-zinc-900`,
    material: new MeshPhysicalMaterial({
      color: "#101010",
      flatShading: false,
      ior: 1.5,
      metalness: 0.8,
      roughness: 1,
    }),
  },

  matte_black: {
    name: "Matte Black",
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-600 to-zinc-900 to-65%`,
    material: new MeshPhysicalMaterial({
      ...matteMaterial,
      color: "#101010",
    }),
  },
  gloss_black: {
    name: "Gloss Black",
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-600 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new MeshPhysicalMaterial({
      ...glossMaterial,
      color: "#101010",
    }),
  },
  eggshell: {
    name: "Eggshell",
    tailwindColor: `bg-radial-[at_35%_35%] from-white to-orange-100 to-30%`,
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
