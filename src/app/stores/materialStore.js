import { create } from 'zustand';
import * as THREE from 'three';
import { getColorSpace } from '@utils/materialUtils';
import { EPSILON_1e7 } from '@utils/animationUtils';

const _buildCacheKey = (obj) => {
  if (Array.isArray(obj)) return obj.join('|');

  return Object.keys(obj).sort().join('|');
};

// Uint8Arrays with pixel data (R, G, B, A for each pixel)
const width = 32;
const height = 32;
const size = width * height;
const bumpData = new Uint8Array(4 * size);
const diffuseData = new Uint8Array(4 * size);
const roughnessData = new Uint8Array(4 * size);
const transmissionData = new Uint8Array(4 * size);

bumpData.fill(0);

for (let i = 0; i < size; i++) {
  const stride = i * 4;

  diffuseData[stride] = 255;
  diffuseData[stride + 1] = 255;
  diffuseData[stride + 2] = 255;
  diffuseData[stride + 3] = 255;

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

const _scratchDiffuseTexture = new THREE.DataTexture(diffuseData, width, height);
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
  clearcoat: EPSILON_1e7,
  clearcoatRoughness: 1,
  flatShading: false,
  side: THREE.DoubleSide,
  thickness: 0,
  transmission: EPSILON_1e7,
  transparent: false,
  bumpMap: _scratchBumpTexture,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  transmissionMap: _scratchTransmissionTexture,
};

const defaultMeshStandardMaterialConfig = {
  color: '#101010',
  flatShading: false,
  metalness: 0.8,
  opacity: 1,
  roughness: 1,
  side: THREE.DoubleSide,
  transparent: true,
};

const meshPhysicalMaterialConfigs = {
  glossBlackMaterial: {
    bumpScale: 2,
    color: '#101010',
    flatShading: false,
    ior: 1.5,
    name: 'gloss_black',
    reflectivity: 0.35,
    roughness: 0.375,
    side: THREE.DoubleSide,
  },

  matteBlackMaterial: {
    bumpScale: 3,
    color: '#2c2c2c',
    flatShading: false,
    ior: 1.5,
    name: 'matte_black',
    reflectivity: 0.35,
    roughness: 0.75,
    side: THREE.DoubleSide,
  },

  stainedMatteBlackMaterial: {
    bumpScale: -0.5,
    color: '#4f4f4f',
    flatShading: false,
    name: 'stained_matte_black',
    reflectivity: 0.3,
    ior: 1.8,
    roughness: 1,
    side: THREE.DoubleSide,
  },

  translucentGreyMaterial: {
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
  },
};

for (const materialConfig in meshPhysicalMaterialConfigs) {

  // set clearcoat, clearcoatRoughness, and transmission if undefined or 0. 
  if (!meshPhysicalMaterialConfigs[materialConfig]?.clearcoat) { 
    meshPhysicalMaterialConfigs[materialConfig].clearcoat = defaultMeshPhysicalMaterialConfig.clearcoat;
  }

  if (!meshPhysicalMaterialConfigs[materialConfig]?.transmission) {
    meshPhysicalMaterialConfigs[materialConfig].transmission = defaultMeshPhysicalMaterialConfig.transmission;
  }

  if (!meshPhysicalMaterialConfigs[materialConfig]?.clearcoatRoughness) {
    meshPhysicalMaterialConfigs[materialConfig].clearcoatRoughness = defaultMeshPhysicalMaterialConfig.clearcoatRoughness;
  }

  meshPhysicalMaterialConfigs[materialConfig].bumpMap = new THREE.DataTexture(bumpData, width, height);
  meshPhysicalMaterialConfigs[materialConfig].bumpMap.name = '_scratchBumpTexture';
  meshPhysicalMaterialConfigs[materialConfig].bumpMap.colorSpace = THREE.NoColorSpace;
  meshPhysicalMaterialConfigs[materialConfig].bumpMap.needsUpdate = true;

  meshPhysicalMaterialConfigs[materialConfig].map = new THREE.DataTexture(diffuseData, width, height);
  meshPhysicalMaterialConfigs[materialConfig].map.name = '_scratchDiffuseTexture';
  meshPhysicalMaterialConfigs[materialConfig].map.colorSpace = THREE.SRGBColorSpace;
  meshPhysicalMaterialConfigs[materialConfig].map.needsUpdate = true;

  meshPhysicalMaterialConfigs[materialConfig].roughnessMap = new THREE.DataTexture(roughnessData, width, height);
  meshPhysicalMaterialConfigs[materialConfig].roughnessMap.name = '_scratchRoughnessTexture';
  meshPhysicalMaterialConfigs[materialConfig].roughnessMap.colorSpace = THREE.NoColorSpace;
  meshPhysicalMaterialConfigs[materialConfig].roughnessMap.needsUpdate = true;

  meshPhysicalMaterialConfigs[materialConfig].transmissionMap = new THREE.DataTexture(transmissionData, width, height);
  meshPhysicalMaterialConfigs[materialConfig].transmissionMap.name = '_scratchTransmissionTexture';
  meshPhysicalMaterialConfigs[materialConfig].transmissionMap.colorSpace = THREE.NoColorSpace;
  meshPhysicalMaterialConfigs[materialConfig].transmissionMap.needsUpdate = true;
}

const materialState = {
  gloss_black: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new THREE.MeshPhysicalMaterial({ ...meshPhysicalMaterialConfigs.glossBlackMaterial }),
    textures: {
      bumpMap: '/gloss_material_roughness.jpg',
    },
  },

  ground: {
    displayName: 'Ground',
    tailwindColor: `bg-zinc-900`,
    material: new THREE.MeshStandardMaterial({ ...defaultMeshStandardMaterialConfig, name: 'ground', }),
  },

  matte_black: {
    displayName: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({ ...meshPhysicalMaterialConfigs.matteBlackMaterial }),
    textures: {
      bumpMap: '/gloss_material_roughness.jpg',
    },
  },

  stained_matte_black: {
    displayName: 'Stained Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({ ...meshPhysicalMaterialConfigs.stainedMatteBlackMaterial }),
    textures: {
      map: '/textured_bag_color.jpg',
      roughnessMap: '/textured_bag_roughness.jpg',
      bumpMap: '/textured_bag_bump.jpg',
    },
  },

  translucent_grey: {
    displayName: 'Translucent Grey',
    tailwindColor: `bg-radial-[at_45%_45%] from-orange-50 from-3% via-stone-600 via-55% to-slate-950 to-95%`,
    material: new THREE.MeshPhysicalMaterial({ ...meshPhysicalMaterialConfigs.translucentGreyMaterial }),
  },
};

const _selectedMaterialsCache = new Map();

const materialStore = (set, get) => ({
  materials: materialState,
  texturesInitialized: '',

  getSelectedMaterials: (materialIDs = []) => {
    const texturesInitialized = get().texturesInitialized;

    if (!texturesInitialized?.length) {
      console.warn("Warning: getSelectedMaterials() => Accessing materials before textures have loaded. Returning {}.");
      return {};
    }

    if (!Array.isArray(materialIDs) || !materialIDs.length) {
      console.warn("Warning: getSelectedMaterials() => materialIDs should not be an empty array. Returning {}.");
      return {};
    }

    const cacheKey = _buildCacheKey(materialIDs);

    if (_selectedMaterialsCache.has(cacheKey)) return _selectedMaterialsCache.get(cacheKey);

    let invalidIDCount = 0;
    const invalidIDs = [];
    const selectedMaterials = {};
    const materials = get().materials;

    for (let i = 0; i < materialIDs.length; i++) {
      if (materials[materialIDs[i]]?.material) {
        selectedMaterials[materialIDs[i]] = materials[materialIDs[i]].material;
      }
      else {
        invalidIDCount++;
        invalidIDs.push(materialIDs[i]);
      }
    }

    if (invalidIDCount) console.warn("Warning: getSelectedMaterials() => " + invalidIDCount + " invalid material IDs: ", invalidIDs);

    _selectedMaterialsCache.set(cacheKey, selectedMaterials);
    return selectedMaterials;
  },

  setMaterialTextures: (textures) => {
    const staged = [];
    const materials = get().materials;
    const texturesInitialized = get().texturesInitialized;
    const initialized = _buildCacheKey(textures);

    if (texturesInitialized === initialized) return;

    for (const material in materials) {
      const designatedTextures = materials[material]?.textures;
      if (!designatedTextures) continue;
      for (const materialProperty in designatedTextures) {
        const textureToAssign = textures[designatedTextures[materialProperty]] ?? null;
        if (!textureToAssign || !textureToAssign.isTexture) {
          console.warn(`Warning: setMaterialTextures() => Missing or invalid texture for material "${material}", property "${materialProperty}". Got:`, textureToAssign);
          return;
        }
        staged.push({
          target: materials[material].material,
          property: materialProperty,
          texture: textureToAssign
        });
      }
    }

    for (const { target, property, texture } of staged) {
      target[property] = texture.clone();
      target[property].flipY = false;
      target[property].colorSpace = getColorSpace(property);
    }

    set(() => ({
      texturesInitialized: initialized,
      materials: { ...materials },
    }));
  },
});

const useMaterial = create(materialStore);

export default useMaterial;