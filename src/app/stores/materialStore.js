import { create } from 'zustand';
import * as THREE from 'three';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

const matteMaterial = {
  flatShading: false,
  reflectivity: 0.35,
  roughness: 0.75,
  side: THREE.DoubleSide,
};

const glossMaterial = {
  flatShading: false,
  reflectivity: 0.35,
  roughness: 0.4,
  side: THREE.DoubleSide,
};

const groundMaterial = {
  flatShading: false,
  reflectivity: 0.4,
  roughness: 1,
  side: THREE.DoubleSide,
  opacity: 1,
  transmission: 1,
  transparent: true,
};

const initialState = {
  ground: {
    displayName: 'Ground',
    tailwindColor: `bg-zinc-900`,
    material: new THREE.MeshPhysicalMaterial({
        ...groundMaterial,
        color: '#101010',
      }),
  },

  matte_black: {
    displayName: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({
      ...matteMaterial,
      color: '#2f2f2f',
      // color: '#333333',

    }),
    textures: {
      roughnessMap: '/textured_bag_roughness.jpg',
      colorMap: '/textured_bag_color.jpg' 
    }
  },

  gloss_black: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new THREE.MeshPhysicalMaterial({
      ...glossMaterial,
      color: '#101010',
    }),
  },

  eggshell: {
    displayName: 'Eggshell',
    tailwindColor: `bg-radial-[at_35%_35%] from-white to-orange-100 to-30%`,
    material: new THREE.MeshPhysicalMaterial({
      ...glossMaterial,
      color: '#ccc0a3',
    }),
  },
};

const materialStore = (set, get) => ({
  materials: initialState,

  getMaterials: () => get().materials,
  getMaterial: (id) => get().materials[`${id}`],
});

const useMaterial = create(materialStore);

export default useMaterial;
