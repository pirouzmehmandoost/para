import { create } from 'zustand';
import * as THREE from 'three';
import { getColorSpace } from '@utils/materialUtils';
import { EPSILON_1e7 } from '@utils/animationUtils';

const _buildCacheKey = (obj) => {
  if (Array.isArray(obj)) return obj.join('|');

  return Object.keys(obj).sort().join('|');
};

/** See materialStore.md §4 **/
const width1K = 32;
const height1K = 32;
const size1K = width1K * height1K;

const width4K = 64;
const height4K = 64;

const bumpData = new Uint8Array(4 * size1K);
const diffuseData = new Uint8Array(4 * size1K);
const normalData = new Uint8Array(4 * size1K);
const roughnessData = new Uint8Array(4 * size1K);
// const transmissionData = new Uint8Array(4 * size1K);
const displacementData = new Uint8Array(4 * size1K);

bumpData.fill(0);
displacementData.fill(0);

for (let i = 0; i < size1K; i++) {
  const stride = i * 4;

  diffuseData[stride] = 255;
  diffuseData[stride + 1] = 255;
  diffuseData[stride + 2] = 255;
  diffuseData[stride + 3] = 255;

  roughnessData[stride] = 255;
  roughnessData[stride + 1] = 255;
  roughnessData[stride + 2] = 255;
  roughnessData[stride + 3] = 255;

  // transmissionData[stride] = 255;
  // transmissionData[stride + 1] = 255;
  // transmissionData[stride + 2] = 255;
  // transmissionData[stride + 3] = 255;

  normalData[stride] = 128;
  normalData[stride + 1] = 128;
  normalData[stride + 2] = 255;
  normalData[stride + 3] = 255;
}


// function _generateDataTextures() {
//   const bumpDataTexture = new THREE.DataTexture(bumpData, width1K, height1K);
//   bumpDataTexture.name = '_scratchBumpTexture';
//   bumpDataTexture.colorSpace = THREE.NoColorSpace;
//   bumpDataTexture.needsUpdate = true;

//   const diffuseDataTexture = new THREE.DataTexture(diffuseData, width1K, height1K);
//   diffuseDataTexture.name = '_scratchDiffuseTexture';
//   diffuseDataTexture.colorSpace = THREE.SRGBColorSpace;
//   diffuseDataTexture.needsUpdate = true;

//   const roughnessDataTexture = new THREE.DataTexture(roughnessData, width1K, height1K);
//   roughnessDataTexture.name = '_scratchRoughnessTexture';
//   roughnessDataTexture.colorSpace = THREE.NoColorSpace;
//   roughnessDataTexture.needsUpdate = true;

//   // const transmissionDataTexture = new THREE.DataTexture(transmissionData, width1K, height1K);
//   // transmissionDataTexture.name = '_scratchTransmissionTexture';
//   // transmissionDataTexture.colorSpace = THREE.NoColorSpace;
//   // transmissionDataTexture.needsUpdate = true;

//   return { bumpDataTexture, diffuseDataTexture, roughnessDataTexture };
//   // return { bumpDataTexture, diffuseDataTexture, roughnessDataTexture, transmissionDataTexture };
// };

// scratchTextures[`${normalDataTexture.name }`] = normalDataTexture;

/*
 * returns an object with properties of type THREE.DataTexture.
 * These are assigned to the bumpMap, map, roughnessMap, transmissionMap properties of material config objects:
 *  - The properties of private constant _meshPhysicalMaterialConfigs
 *    (e.g. _meshPhysicalMaterialConfigs.glossBlackMaterial, _meshPhysicalMaterialConfigs.stainedMatteBlackMaterial, etc.).
 *  - The exported constant defaultMeshPhysicalMaterialConfig (imported in Model.js).
*/
function _generateDataTextures({
  bumpMap = false,
  map = false,
  displacementMap = false,
  normalMap = false,
  roughnessMap = false,
  transmissionMap = false
}) {
  let scratchTextures = {};

  if (bumpMap) {
    const bumpDataTexture = new THREE.DataTexture(bumpData, width1K, height1K);
    bumpDataTexture.name = '_scratchBumpTexture';
    bumpDataTexture.colorSpace = THREE.NoColorSpace;
    bumpDataTexture.needsUpdate = true;
    scratchTextures = { ...scratchTextures, bumpDataTexture };
  };

  if (map) {
    const diffuseDataTexture = new THREE.DataTexture(diffuseData, width1K, height1K);
    diffuseDataTexture.name = '_scratchDiffuseTexture';
    diffuseDataTexture.colorSpace = THREE.SRGBColorSpace;
    diffuseDataTexture.needsUpdate = true;
    scratchTextures = { ...scratchTextures, diffuseDataTexture };
  };

  if (displacementMap) {
    const displacementDataTexture = new THREE.DataTexture(displacementData, width4K, height4K, THREE.RedFormat, THREE.UnsignedByteType);
    displacementDataTexture.name = '_scratchDisplacementTexture';
    displacementDataTexture.colorSpace = THREE.NoColorSpace;
    displacementDataTexture.needsUpdate = true;
    scratchTextures = { ...scratchTextures, displacementDataTexture };
  };

  if (normalMap) {
    const normalDataTexture = new THREE.DataTexture(normalData, width1K, height1K);
    normalDataTexture.name = '_scratchNormalTexture';
    normalDataTexture.colorSpace = THREE.NoColorSpace;
    normalDataTexture.needsUpdate = true;
    scratchTextures = { ...scratchTextures, normalDataTexture };
  };

  if (roughnessMap) {
    const roughnessDataTexture = new THREE.DataTexture(roughnessData, width1K, height1K);
    roughnessDataTexture.name = '_scratchRoughnessTexture';
    roughnessDataTexture.colorSpace = THREE.NoColorSpace;
    roughnessDataTexture.needsUpdate = true;
    scratchTextures = { ...scratchTextures, roughnessDataTexture };
  };

  if (transmissionMap) {
    const transmissionDataTexture = new THREE.DataTexture(transmissionData, width1K, height1K);
    transmissionDataTexture.name = '_scratchTransmissionTexture';
    transmissionDataTexture.colorSpace = THREE.NoColorSpace;
    transmissionDataTexture.needsUpdate = true;
    scratchTextures = { ...scratchTextures, transmissionDataTexture };
  };

  return scratchTextures;
};

const _defaultMeshPhysicalMaterialConfigMaps = _generateDataTextures({ bumpMap: true, map: true, roughnessMap: true, });

// const _groundGridMeshPhysicalMaterialConfigMaps = _generateDataTextures({normalMap: true, displacementMap: true });

export const defaultMeshPhysicalMaterialConfig = {
  bumpMap: _defaultMeshPhysicalMaterialConfigMaps.bumpDataTexture,
  color: '#2f2f2f',
  clearcoat: EPSILON_1e7,
  clearcoatRoughness: 1,
  flatShading: false,
  map: _defaultMeshPhysicalMaterialConfigMaps.diffuseDataTexture,
  roughnessMap: _defaultMeshPhysicalMaterialConfigMaps.roughnessDataTexture,
  side: THREE.DoubleSide,
  // thickness: 0,
  // transmission: EPSILON_1e7,
  // transmissionMap: _defaultMeshPhysicalMaterialConfigMaps.transmissionDataTexture,
  // transparent: true, // true for all MeshPysicalMaterials in store
};

// export const groundGridMeshPhysicalMaterialConfig = {
//   color: '#2f2f2f',
//   clearcoat: EPSILON_1e7,
//   clearcoatRoughness: 1,
//   flatShading: false,
//   side: THREE.DoubleSide,
//   map: _defaultMeshPhysicalMaterialConfigMaps.diffuseDataTexture,
//   normalMap: _groundGridMeshPhysicalMaterialConfigMaps.normalDataTexture,
//   displacementMap: _groundGridMeshPhysicalMaterialConfigMaps.displacementDataTexture,
// };

export const defaultMeshStandardMaterialConfig = {
  color: '#101010',
  flatShading: false,
  metalness: 0.8,
  name: 'ground',
  opacity: 1,
  roughness: 1,
  side: THREE.DoubleSide,
  transparent: true,
};

const _meshPhysicalMaterialConfigs = {
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
    bumpScale: -10,
    color: '#6f6f6f',
    flatShading: false,
    name: 'stained_matte_black',
    reflectivity: 0.3,
    ior: 1.8,
    roughness: 0.8,
    side: THREE.DoubleSide,
  },
  // translucentGreyMaterial: {
  //   bumpScale: 1,
  //   color: '#949994',
  //   clearcoat: 0.8,
  //   clearcoatRoughness: 0.3,
  //   flatShading: false,
  //   ior: 1.5,
  //   name: 'translucent_grey',
  //   reflectivity: 0.25,
  //   roughness: 0.3,
  //   thickness: 20,
  //   transmission: 1,
  //   transparent: true,
  //   side: THREE.DoubleSide,
  // },
  // groundGridMaterial: {
  //   ...groundGridMeshPhysicalMaterialConfig,
  //   bumpScale: 1,
  //   color: '#949994',
  //   displacementBias: -0.05,
  //   displacementScale: 18,
  //   flatShading: false,
  //   ior: 1.8,
  //   name: 'ground_grid',
  //   normalScale: new THREE.Vector2(0, 0.5),
  //   reflectivity: 0.35,
  //   roughness: 1,
  //   side: THREE.DoubleSide,
  // },
}

for (const materialConfig in _meshPhysicalMaterialConfigs) {
  // set clearcoat, clearcoatRoughness, and transmission if undefined or 0. 
  if (!_meshPhysicalMaterialConfigs[materialConfig]?.clearcoat) {
    _meshPhysicalMaterialConfigs[materialConfig].clearcoat = defaultMeshPhysicalMaterialConfig.clearcoat;
  }

  // if (!_meshPhysicalMaterialConfigs[materialConfig]?.transmission) {
  //   _meshPhysicalMaterialConfigs[materialConfig].transmission = defaultMeshPhysicalMaterialConfig.transmission;
  // }

  // set clearcoatRoughness to 1 if undefined or 0. 
  // Transitioning from 0 will produces an undesirable, highly concentrated specular highlights.
  // Materials with intentionally imperceptible clearcoat have clearcoat = 1e-7 and clearcoatRoughness = 1.
  if (!_meshPhysicalMaterialConfigs[materialConfig]?.clearcoatRoughness) {
    _meshPhysicalMaterialConfigs[materialConfig].clearcoatRoughness = defaultMeshPhysicalMaterialConfig.clearcoatRoughness;
  }

  // if (!_meshPhysicalMaterialConfigs[materialConfig]?.transparent) {
  //   _meshPhysicalMaterialConfigs[materialConfig].transparent = defaultMeshPhysicalMaterialConfig.transparent;
  // }

  const dataTextures = _generateDataTextures({ bumpMap: true, map: true, roughnessMap: true });

  _meshPhysicalMaterialConfigs[materialConfig].bumpMap = dataTextures.bumpDataTexture;
  _meshPhysicalMaterialConfigs[materialConfig].map = dataTextures.diffuseDataTexture;
  _meshPhysicalMaterialConfigs[materialConfig].roughnessMap = dataTextures.roughnessDataTexture;
  // _meshPhysicalMaterialConfigs[materialConfig].transmissionMap = dataTextures.transmissionDataTexture;
}

// const groundGridDataTextures = _generateDataTextures({ normalMap: true, displacementMap: true });
// _meshPhysicalMaterialConfigs.groundGridMaterial.normalMap = groundGridDataTextures.normalDataTexture;
// _meshPhysicalMaterialConfigs.groundGridMaterial.displacementMap = groundGridDataTextures.displacementDataTexture;

const materialState = {
  gloss_black: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new THREE.MeshPhysicalMaterial({ ..._meshPhysicalMaterialConfigs.glossBlackMaterial }),
    textures: {
      bumpMap: '/gloss_material_roughness.jpg',
    },
  },
  ground: {
    displayName: 'Ground',
    tailwindColor: `bg-zinc-900`,
    material: new THREE.MeshStandardMaterial({ ...defaultMeshStandardMaterialConfig }),
  },
  // ground_grid: {
  //   displayName: 'ground_grid',
  //   tailwindColor: `bg-zinc-900`,
  //   material: new THREE.MeshPhysicalMaterial({ ..._meshPhysicalMaterialConfigs.groundGridMaterial}),
  //   textures: {
  //     // map: '/ground_diffuse_map.jpg',
  //     normalMap: '/ground_normal_map.jpg',
  //     displacementMap: '/ground_displacement_map_3.png',
  //   },
  // },
  matte_black: {
    displayName: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({ ..._meshPhysicalMaterialConfigs.matteBlackMaterial }),
    textures: {
      bumpMap: '/gloss_material_roughness.jpg',
    },
  },
  stained_matte_black: {
    displayName: 'Stained Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new THREE.MeshPhysicalMaterial({ ..._meshPhysicalMaterialConfigs.stainedMatteBlackMaterial }),
    textures: {
      map: '/stained_matte_black_diffuse_closed_bag.jpg',
      roughnessMap: '/stained_matte_black_roughness_closed_bag.jpg',
      bumpMap: '/stained_matte_black_bump_closed_bag.jpg',
    },
  },
  // translucent_grey: {
  //   displayName: 'Translucent Grey',
  //   tailwindColor: `bg-radial-[at_45%_45%] from-orange-50 from-3% via-stone-600 via-55% to-slate-950 to-95%`,
  //   material: new THREE.MeshPhysicalMaterial({ ..._meshPhysicalMaterialConfigs.translucentGreyMaterial }),
  // },
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