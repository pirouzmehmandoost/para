import { create } from 'zustand';
import * as THREE from 'three';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

const texturedBlackMaterial = {
  bumpScale: -0.5,
  color: '#4f4f4f',
  flatShading: false,
  reflectivity: 0.35,
  ior: 1.8,
  roughness: 1,
  side: THREE.DoubleSide,
};

const matteMaterial = {
  color: '#2f2f2f',
  flatShading: false,
  ior: 1.5,
  reflectivity: 0.35,
  roughness: 0.75,
  side: THREE.DoubleSide,
};

const glossBlackMaterial = {
  color: '#101010',
  flatShading: false,
  ior: 1.5,
  reflectivity: 0.35,
  roughness: 0.4,
  side: THREE.DoubleSide,
};

const eggshellMaterial = {
  color: '#ccc0a3',
  flatShading: false,
  ior: 1.5,
  reflectivity: 0.35,
  roughness: 0.75,
  side: THREE.DoubleSide,
};

const groundMaterial = {
  color: '#101010',
  flatShading: false,
  // ior: 1,
  opacity: 1,
  // reflectivity: 0.3,
  roughness: 1,
  metalness: 0.8,
  side: THREE.DoubleSide,
  // transmission: 1,
  transparent: true,
};

const materialState = {
  ground: {
    displayName: 'Ground',
    tailwindColor: `bg-zinc-900`,
    material: new THREE.MeshStandardMaterial({ ...groundMaterial }),
    materialProps: groundMaterial,
  },

  matte_black: {
    displayName: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({ ...matteMaterial }),
    materialProps: matteMaterial,
  },

  textured_black: {
    displayName: 'Textured Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({ ...texturedBlackMaterial }),
    textures: {
      map: '/textured_bag_color.jpg',
      roughnessMap: '/textured_bag_roughness.jpg',
      bumpMap: '/textured_bag_bump.jpg',
    },
    materialProps: {
      ...texturedBlackMaterial,
      map: '/textured_bag_color.jpg',
      roughnessMap: '/textured_bag_roughness.jpg',
      bumpMap: '/textured_bag_bump.jpg',
    },
  },

  gloss_black: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new THREE.MeshPhysicalMaterial({ ...glossBlackMaterial }),
    materialProps: glossBlackMaterial,
  },

  eggshell: {
    displayName: 'Eggshell',
    tailwindColor: `bg-radial-[at_35%_35%] from-white to-orange-100 to-30%`,
    material: new THREE.MeshPhysicalMaterial({ ...eggshellMaterial }),
    materialProps: eggshellMaterial,
  },
};

const textureState = {}

const materialStore = (set, get) => ({
  materials: materialState,
  textures: textureState,

  getMaterials: () => get().materials,

  getMaterial: (id) => {
    const materials = get().materials;
    if (materials[`${id}`]) return (materials[`${id}`]);
    else {
      console.warn(`getMaterial(${id}) => no material with id: ${id}. id must exist.`);
      return undefined;
    }
  },

  getTextures: () => get().textures,

  getTexture: (id, materialID) => {
    let textures = get().textures;
    const searchCondition = (texture) =>
      (texture.url === id) ||
      (texture.key === id) ||
      (texture.materialProperty === id);

      if (textures[`${id}`]) return textures[`${id}`]?.texture;
      if (id && materialID) return Object.values(textures).find(texture => (texture.materialIDs.includes(materialID) && texture.materialProperty === id))?.texture;
      return Object.values(textures).find(texture => searchCondition(texture))?.texture;
  },

  setMaterialTextures: (textures) => {
    const tempMaterials = get().materials;
    for (const texture in textures) {
      const materialIDs = textures[texture].materialIDs
      for (const materialID of materialIDs) {
        const materialProperty = textures[texture].materialProperty;
        tempMaterials[materialID].material[materialProperty] = textures[texture].texture
      }
    }

    set((state) => ({
      textures: {
        ...state.textures,
        ...textures
      },
      materials: {
        ...state.materials,
        ...tempMaterials
      },
    }));
  },
});

const useMaterial = create(materialStore);

export default useMaterial;

// old - preserved for person record
// setTextures: (textures) => {
//   const temp = get().materials;
//   for (const materialId in textures) {
//     for (const materialProperty in textures[materialId]) {
//       temp[materialId].material[materialProperty] = textures[materialId][materialProperty]
//     }
//   }

//   set((state) => ({
//     textures: {
//       ...state.textures,
//     },
//     materials: {
//       ...state.materials,
//       ...temp,
//     },
//   }));
// },