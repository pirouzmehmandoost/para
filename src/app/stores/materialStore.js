import { create } from 'zustand';
import * as THREE from 'three';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

// const loader = new THREE.TextureLoader();

const texturedBlackMaterial = {
  bumpScale: -0.5,
  color: '#4f4f4f',
  flatShading: false,
  reflectivity: 0.35,
  roughness: 1,
  side: THREE.DoubleSide,
};

const matteMaterial = {
  color: '#2f2f2f',
  flatShading: false,
  reflectivity: 0.35,
  roughness: 0.75,
  side: THREE.DoubleSide,
};

const glossBlackMaterial = {
  color: '#101010',
  flatShading: false,
  reflectivity: 0.35,
  roughness: 0.4,
  side: THREE.DoubleSide,
};

const eggshellMaterial = {
  color: '#ccc0a3',
  flatShading: false,
  reflectivity: 0.35,
  roughness: 0.75,
  side: THREE.DoubleSide,
};

const groundMaterial = {
  color: '#101010',
  flatShading: false,
  opacity: 1,
  reflectivity: 0.3,
  roughness: 1,
  side: THREE.DoubleSide,
  transmission: 1,
  transparent: true,
};

const initialState = {
  ground: {
    displayName: 'Ground',
    tailwindColor: `bg-zinc-900`,
    material: new THREE.MeshPhysicalMaterial({ ...groundMaterial }),
  },

  matte_black: {
    displayName: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({ ...matteMaterial }),
  },

  textured_black: {
    displayName: 'Textured Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({ ...texturedBlackMaterial }),
    textures: {
      textured_black_color_map: '/textured_bag_roughness.jpg',
      textured_black_roughnessMap: '/textured_bag_roughness.jpg',
      textured_black_bumpMap: '/textured_bag_roughness.jpg',
    },
  },

  gloss_black: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new THREE.MeshPhysicalMaterial({ ...glossBlackMaterial }),
  },

  eggshell: {
    displayName: 'Eggshell',
    tailwindColor: `bg-radial-[at_35%_35%] from-white to-orange-100 to-30%`,
    material: new THREE.MeshPhysicalMaterial({ ...eggshellMaterial }),
  },
};

const materialStore = (set, get) => ({
  materials: initialState,

  getMaterials: () => get().materials,
  getMaterial: (id) => get().materials[`${id}`],

  // this is a tentative rough draft for new setter which will be called once from 
  // a top-level r3F component in order to load and assign all textures for all materials
  // that have a textures property in this store. If is NOT set in stone. 
  // loadTextures: () => {
  //   const temp = get().materials;

  //   for (const materialID in temp) {
  //     const textureUrls = temp[materialID]?.textures;
  //     if (textureUrls) {
  //       for (const url in textureUrls) {
  //         const texture = loader.load(textureUrls[url])
  //         texture.name = url;
  //         texture.flipY = false;
  //         if (url === 'map' || textureUrls[url].includes('color')) {
  //           texture.colorSpace = THREE.SRGBColorSpace;
  //         };
  //         temp[materialID].material[url] = texture;
  //       }

  //       set((state) => ({
  //         materials: {
  //           ...state.materials,
  //           [materialID]: {
  //             ...temp[materialID],
  //             textures: { ...textureUrls },
  //             material: temp[materialID].material,
  //           },
  //         },
  //       }));
  //     }
  //     else {
  //       continue;
  //     }
  //   }
  // },

    setTextures: (textures) => {
      const temp = get().materials;
      for (const materialId in textures) {
        for (const materialProperty in textures[materialId]) {
          temp[materialId].material[materialProperty] = textures[materialId][materialProperty]
        }
      }

      set((state) => ({
        materials: {
          ...state.materials,
          ...temp
        },
      }));
    }


});

const useMaterial = create(materialStore);

export default useMaterial;
