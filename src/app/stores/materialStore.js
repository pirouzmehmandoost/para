import { create } from 'zustand';
import * as THREE from 'three';
import { envColor } from '@configs/globals';
// import { FlakesTexture } from 'three/addons/textures/FlakesTexture.js';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

// const normalMap3 = new THREE.CanvasTexture(new FlakesTexture());
// normalMap3.wrapS = THREE.RepeatWrapping;
// normalMap3.wrapT = THREE.RepeatWrapping;
// normalMap3.repeat.x = 10;
// normalMap3.repeat.y = 6;
// normalMap3.anisotropy = 16;

// function createFlakesMaterial() {
//   const flakesImage = new FlakesTexture(); // Generates a canvas element
//   const texture = new THREE.CanvasTexture(flakesImage);
  
//   // Optional: configure texture wrapping and color space
//   texture.wrapS = THREE.RepeatWrapping;
//   texture.wrapT = THREE.RepeatWrapping;
//   texture.repeat.x = 10;
//   texture.repeat.y = 10;
//   // texture.colorSpace = THREE.SRGBColorSpace; // May be needed depending on three.js version and renderer settings

//   const material = new THREE.MeshPhysicalMaterial({
//       clearcoat: 1.0,
//       clearcoatRoughness: 0.1,
//       metalness: 0.9,
//       roughness: 0.5,
//       color: 0x8418ca, // Example color
//       normalMap: texture, // Use the generated texture as a normal map
//       normalScale: new THREE.Vector2(0.15, 0.15),
//   });

//   return material;
// }

// const iridescentMaterial = createFlakesMaterial();

//used for
  // color: 0x0000ff,
  // color: '#ebe2c3',

const matteMaterial = {
  clearcoat: 0,
  clearcoatRoughness: 1,
  flatShading: false,
  ior: 1.5,
  metalness: 0,
  reflectivity: 0.3,
  roughness: 0.8,
  sheen: 0.05,
  sheenColor: envColor,
  sheenRoughness: 0.5,
  side: THREE.DoubleSide,
};

const glossMaterial = {
  clearcoat: 0.3,
  clearcoatRoughness: 0.8,
  flatShading: false,
  ior: 1.5,
  metalness: 0,
  reflectivity: 0.3,
  roughness: 0.4,
  sheen: 0.05,
  sheenColor: envColor,
  sheenRoughness: 0,
  side: THREE.DoubleSide,
};

const groundMaterial = {
  flatShading: false,
  ior: 1.5,
  metalness: 0,
  reflectivity: 0.3,
  roughness: 1,
  sheen: 0.05,
  sheenColor: envColor,
  sheenRoughness: 0.5,
  side: THREE.DoubleSide,
  transmission: 1,
};

const iridescentMaterial = {
  // clearcoat: 1,
  // clearcoatRoughness: 0.4,
  flatShading: true,
  ior: 1.3,
  iridescence: 1,
  iridescenceIOR: 1.33,
  iridescenceThicknessRange: [10,400],
  metalness: 0.1,
  reflectivity: 0.5,
  roughness: 0.3,
  sheen: 0,
  sheenColor: envColor,
  sheenRoughness: 0,
  side: THREE.DoubleSide,
  // specularColor: '#ffffff',
  // specularIntensity: 1,
};

const initialState = {
  ground: {
    displayName: 'Ground',
    tailwindColor: `bg-zinc-900`,
    material: new THREE.MeshPhysicalMaterial(
      {
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
    }),
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
      ...iridescentMaterial,
      color: '#ccc0a3',
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
