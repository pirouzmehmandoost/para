import { create } from 'zustand';
import * as THREE from 'three';
import { getColorSpace } from '@utils/materialUtils';

THREE.ColorManagement.enabled = true;

const createIdempotentFlag = (obj) => Object.keys(obj).sort().join('|');

// Uint8Arrays with pixel data (R, G, B, A for each pixel)
const width = 32;
const height = 32;
const size = width * height;
const bumpData = new Uint8Array(4 * size);
const clearcoatData = new Uint8Array(4 * size);
const clearcoatRoughnessData = new Uint8Array(4 * size);
const diffusedata = new Uint8Array(4 * size);
const roughnessData = new Uint8Array(4 * size);
const transmissionData = new Uint8Array(4 * size);

bumpData.fill(0);

for (let i = 0; i < size; i++) {
  const stride = i * 4;

  clearcoatData[stride] = 255;
  clearcoatData[stride + 1] = 255;
  clearcoatData[stride + 2] = 255;
  clearcoatData[stride + 3] = 255;

  clearcoatRoughnessData[stride] = 255;
  clearcoatRoughnessData[stride + 1] = 255;
  clearcoatRoughnessData[stride + 2] = 255;
  clearcoatRoughnessData[stride + 3] = 255;

  diffusedata[stride] = 255;
  diffusedata[stride + 1] = 255;
  diffusedata[stride + 2] = 255;
  diffusedata[stride + 3] = 255;

  roughnessData[stride] = 255;
  roughnessData[stride + 1] = 255;
  roughnessData[stride + 2] = 255;
  roughnessData[stride + 3] = 255;

  transmissionData[stride] = 255;
  transmissionData[stride + 1] = 255;
  transmissionData[stride + 2] = 255;
  transmissionData[stride + 3] = 255;
}

const _scratchBumpTexture = new THREE.DataTexture(bumpData, width, height);
_scratchBumpTexture.name = '_scratchBumpTexture';
_scratchBumpTexture.colorSpace = THREE.NoColorSpace;
_scratchBumpTexture.needsUpdate = true;

const _scratchClearcoatTexture = new THREE.DataTexture(clearcoatData, width, height);
_scratchClearcoatTexture.name = '_scratchClearcoatTexture';
_scratchClearcoatTexture.colorSpace = THREE.NoColorSpace;
_scratchClearcoatTexture.needsUpdate = true;

const _scratchClearcoatRoughnessTexture = new THREE.DataTexture(clearcoatRoughnessData, width, height);
_scratchClearcoatRoughnessTexture.name = '_scratchClearcoatRoughnessTexture';
_scratchClearcoatRoughnessTexture.colorSpace = THREE.NoColorSpace;
_scratchClearcoatRoughnessTexture.needsUpdate = true;

const _scratchDiffuseTexture = new THREE.DataTexture(diffusedata, width, height);
_scratchDiffuseTexture.name = '_scratchDiffuseTexture';
_scratchDiffuseTexture.colorSpace = THREE.SRGBColorSpace;
_scratchDiffuseTexture.needsUpdate = true;

const _scratchRoughnessTexture = new THREE.DataTexture(roughnessData, width, height);
_scratchRoughnessTexture.name = '_scratchRoughnessTexture';
_scratchRoughnessTexture.colorSpace = THREE.NoColorSpace;
_scratchRoughnessTexture.needsUpdate = true;

const _scratchTransmissionTexture = new THREE.DataTexture(transmissionData, width, height);
_scratchTransmissionTexture.name = '_scratchTransmissionTexture';
_scratchTransmissionTexture.colorSpace = THREE.NoColorSpace;
_scratchTransmissionTexture.needsUpdate = true;

export const defaultMeshPhysicalMaterialConfig = {
  color: '#2f2f2f',
  clearcoat: 0.1,
  clearcoatRoughness: 1,
  flatShading: false,
  transmission: 0,
  side: THREE.DoubleSide,
  thickness: 0,
  transparent: false,
  bumpMap: _scratchBumpTexture,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  transmissionMap: _scratchTransmissionTexture,
};

// const chippedStoneMaterial = {
//   color: '#ffffff',
//   dispersion: 1,
//   flatShading: false,
//   ior: 1.8,
//   name: 'chipped_stone',
//   normalScale: new THREE.Vector2(0,1),
//   opacity: 1,
//   roughness: 1,
//   side: THREE.DoubleSide,
//   thickness: 1,
//   transmission: 1,
//   transparent: true,
//   bumpMap: _scratchBumpTexture,
//   map: _scratchDiffuseTexture,
//   // normalMap: _scratchNormalTexture,
//   roughnessMap: _scratchRoughnessTexture,
//   transmissionMap: _scratchTransmissionTexture,
// };

const glossBlackMaterial = {
  bumpScale: 2,
  color: '#101010',
  flatShading: false,
  ior: 1.5,
  name: 'gloss_black',
  reflectivity: 0.35,
  roughness: 0.375,
  side: THREE.DoubleSide,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  bumpMap: _scratchBumpTexture,
  transmissionMap: _scratchTransmissionTexture,
};

const groundMaterial = {
  color: '#101010',
  flatShading: false,
  metalness: 0.8,
  opacity: 1,
  roughness: 1,
  side: THREE.DoubleSide,
  transparent: true,
  name: 'ground',
};

const matteBlackMaterial = {
  bumpScale: 3,
  color: '#2c2c2c',
  clearcoat: 0,
  clearcoatRoughness: 1,
  flatShading: false,
  ior: 1.5,
  name: 'matte_black',
  reflectivity: 0.35,
  roughness: 0.75,
  side: THREE.DoubleSide,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  bumpMap: _scratchBumpTexture,
  transmissionMap: _scratchTransmissionTexture,
};

const stainedMatteBlackMaterial = {
  bumpScale: -0.5,
  color: '#4f4f4f',
  clearcoatRoughness: 1,
  flatShading: false,
  name: 'stained_matte_black',
  reflectivity: 0.3,
  ior: 1.8,
  roughness: 1,
  side: THREE.DoubleSide,
  bumpMap: _scratchBumpTexture,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  transmissionMap: _scratchTransmissionTexture,
};

const translucentGreyMaterial = {
  bumpScale: 1,
  color: '#949994',
  clearcoat: 0.8,
  clearcoatRoughness: 0.3,
  flatShading: false,
  ior: 1.5,
  name: 'translucent_grey',
  reflectivity: 0.25,
  roughness: 0.3,
  thickness: 15,
  transmission: 1,
  transparent: true,
  side: THREE.DoubleSide,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  bumpMap: _scratchBumpTexture,
  transmissionMap: _scratchTransmissionTexture,
};

const materialState = {
  gloss_black: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new THREE.MeshPhysicalMaterial({ ...glossBlackMaterial }),
    textures: {
      bumpMap: '/gloss_material_roughness.jpg',
    },
  },

  ground: {
    displayName: 'Ground',
    tailwindColor: `bg-zinc-900`,
    material: new THREE.MeshStandardMaterial({ ...groundMaterial }),
  },

  matte_black: {
    displayName: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({ ...matteBlackMaterial }),
    textures: {
      bumpMap: '/gloss_material_roughness.jpg',
    },
  },

  stained_matte_black: {
    displayName: 'Stained Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({ ...stainedMatteBlackMaterial }),
    textures: {
      map: '/textured_bag_color.jpg',
      roughnessMap: '/textured_bag_roughness.jpg',
      bumpMap: '/textured_bag_bump.jpg',
    },
  },

  translucent_grey: {
    displayName: 'Translucent Grey',
    tailwindColor: `bg-radial-[at_45%_45%] from-orange-50 from-3% via-stone-600 via-55% to-slate-950 to-95%`,
    material: new THREE.MeshPhysicalMaterial({ ...translucentGreyMaterial }),
  },

  // chipped_stone: {
  //   displayName: 'Chipped Stone',
  //   tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-700 via-37% to-zinc-950 to-100%`,
  //   material: new THREE.MeshPhysicalMaterial({ ...chippedStoneMaterial }),
  //   materialProps: chippedStoneMaterial,
  //   textures: {
  //     map: '/chipped_stone_diffuse.jpg',
  //     normalMap: '/chipped_stone_normal.jpg',
  //     transmissionMap: '/chipped_stone_transmission.jpg',
  //   },
  // },
};

const textureState = {};

const materialStore = (set, get) => ({
  materials: materialState,
  textures: textureState,
  texturesInitialized: '',

  getMaterials: () => get().materials,

  getSelectedMaterials: (materialIDs = []) => {
    let invalidIDCount = 0;
    let invalidIDs = [];
    let selectedMaterials = {};
    const warnText = "Warning: getSelectedMaterials() => ";
    const texturesInitialized = get().texturesInitialized;
    const materials = get().materials;

    if (!texturesInitialized?.length) {
      console.warn(warnText + "accessing materials before textures have loaded. Returning {}.");
      return {};
    }
    if (!Array.isArray(materialIDs) || !materialIDs?.length) {
      console.warn(warnText + "materialIDs should not be an empty array. Returning {}.");
      return {};
    }

    for (let i = 0; i < materialIDs.length; i++) {
      if (materials[materialIDs[i]]?.material) {
        selectedMaterials[materialIDs[i]] = materials[materialIDs[i]].material;
      }
      else {
        invalidIDCount++;
        invalidIDs[i] = materialIDs[i];
      }
    }

    if (invalidIDCount) console.warn(warnText + invalidIDCount + " invalid material IDs: ", invalidIDs)

    return selectedMaterials;
  },

  getMaterial: (id) => {
    const materials = get().materials;
    if (materials[`${id}`]) return (materials[`${id}`]);
    else {
      console.warn(`getMaterial(${id}) => no material with id: ${id}. id must exist.`);
      return undefined;
    }
  },

  getTextures: () => get().textures,

  getTexture: (id) => get().textures[`${id}`],

  setMaterialTextures: (textures) => {
    const materials = get().materials;
    const texturesInitialized = get().texturesInitialized;
    const initialized = createIdempotentFlag(textures);

    if (texturesInitialized === initialized) return;

    for (const material in materials) {
      const designatedTextures = materials[material]?.textures;
      if (designatedTextures) {
        const materialToUpdate = materials[material].material;
        for (const materialProperty in designatedTextures) {
          const textureToAssign = textures[designatedTextures[materialProperty]];
          materialToUpdate[materialProperty] = textureToAssign.clone();
          materialToUpdate[materialProperty].flipY = false;
          materialToUpdate[materialProperty].colorSpace = getColorSpace(materialProperty);
        }
      }
    }

    set((state) => ({
      texturesInitialized: initialized,
      textures: {
        ...state.textures,
        ...textures
      },
      materials: {
        ...state.materials,
        ...materials
      },
    }));
  },
});

const useMaterial = create(materialStore);

export default useMaterial;

// setMeshTransmissionMaterial: (meshTransmissionMaterialObject) => {
//   const meshTransitionMaterialInitialized = get().meshTransitionMaterialInitialized;
//   if (meshTransitionMaterialInitialized) return;

//   const clone = meshTransmissionMaterialObject.clone();
//   set((state) => ({
//     texturesInitialized: state.texturesInitialized,
//     meshTransitionMaterialInitialized: true,
//     textures: {
//       ...state.textures,
//     },
//     materials: {
//       ...state.materials,
//       "translucent": {
//         ...state.materials.translucent,
//         material: clone,
//       }
//     },
//   }));
// },