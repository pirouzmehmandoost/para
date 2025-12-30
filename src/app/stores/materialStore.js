import { create } from 'zustand';
import * as THREE from 'three';
import { envColor } from '@configs/globals';
import { Wireframe } from '@react-three/drei';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

const matteMaterial = {
  flatShading: false,
  ior: 1.4,
  metalness: 0,
  reflectivity: 0.3,
  roughness: 0.8,
  sheen: 0.05,
  sheenColor: envColor,
  sheenRoughness: 0.1,
  side: THREE.DoubleSide,
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
  sheenColor: envColor,
  sheenRoughness: 0,
  side: THREE.DoubleSide,
};

const groundMaterial = {
  color: '#101010',
  flatShading: false,
  ior: 1.5,
  reflectivity: 0.3,
  metalness: 0.5,
  roughness: 0.9,
  sheen: 0.05,
  sheenColor: envColor,
  sheenRoughness: 0.5,
  side: THREE.DoubleSide,
};

const initialState = {
  ground: {
    name: 'ground',
    tailwindColor: `bg-zinc-900`,
    material: new THREE.MeshPhysicalMaterial({...groundMaterial }),
  },

  matte_black: {
    name: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-600 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({
      ...matteMaterial,
      color: '#282828',
    }),
  },
  gloss_black: {
    name: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-600 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new THREE.MeshPhysicalMaterial({
      ...glossMaterial,
      color: '#101010',
    }),
  },
  eggshell: {
    name: 'Eggshell',
    tailwindColor: `bg-radial-[at_35%_35%] from-white to-orange-100 to-30%`,
    material: new THREE.MeshPhysicalMaterial({
      ...matteMaterial,
      color: '#ccc0a3',
      ior: 1.6,
      reflectivity: 0.4,
      roughness: 0.6,
      sheen: 1,
      sheenColor: '#ccc0a3',
      sheenRoughness: 1,
    }),
  },
};

const materialStore = (set, get) => ({
  materials: initialState,

  getMaterials: () => get().materials,

  getMaterial: (name) => get().materials[`${name}`],
});

const useMaterial = create(materialStore);

export default useMaterial;
