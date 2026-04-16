import { create } from 'zustand';
import * as THREE from 'three';
import { getColorSpace } from '@utils/materialUtils';
import { EPSILON_1e7 } from '@utils/animationUtils';

/*
NOTES:

Point 1: Disposal must include scratch DataTextures. 
  Every THREE.DataTexture instance — whether loaded or scratch — allocates a GPU texture object when first rendered.
  dispose() releases that GPU-side allocation. If translucent_grey's scratch DataTextures are never disposed, those four GPU textures leak for the lifetime of the application.
  The disposal strategy must cover all texture instances on all materials, not only the loaded ones.

Point 2: Unique references are a prerequisite for safe disposal.
  texture.dispose() releases the GPU resources for that specific THREE.Texture instance.
  If two materials shared the same THREE.Texture object (same reference, same UUID), disposing it via one material would invalidate the GPU texture for the other material.
  The other material's slot would still hold a reference to the disposed JavaScript object, but any subsequent render using it would either produce a black/missing texture or trigger a re-upload.

The current implementation already satisfies this prerequisite (unique references). 
_generateDataTextures() is called separately for each material config (line 182) and once for defaultMeshPhysicalMaterialConfig (line 86). 
Each call constructs four new THREE.DataTexture instances via new THREE.DataTexture(...). Each instance is a distinct JavaScript object with its own UUID. 
No two materials share a texture reference.

The shared Uint8Array buffers (bumpData, diffuseData, etc.) are CPU-side data. 
texture.dispose() does NOT free or affect the Uint8Array — it only releases the GPU-side WebGLTexture. 
So multiple DataTexture instances can safely share the same Uint8Array buffer and be disposed independently without affecting each other.

After setMaterialTextures() runs, the situation is:
  - Materials WITH loaded textures (e.g., gloss_black, matte_black, stained_matte_black): their slots hold cloned loaded textures (from texture.clone() at line 322). The original scratch DataTextures that were in those slots are now unreferenced — they are already candidates for disposal at that point, though nothing currently disposes them.
  - Materials WITHOUT loaded textures (e.g., translucent_grey): their slots still hold the scratch DataTextures from _generateDataTextures().
  - defaultMeshPhysicalMaterialConfig: holds its own set of scratch DataTextures (from line 86). These are referenced by animateMaterialRef in Model.js only until the one-shot .copy(mat) overwrites them.

So the disposal strategy will need to track three categories: 
  1- scratch DataTextures that were replaced by loaded textures and are now unreferenced,

  2- scratch DataTextures that remain in use on materials without loaded textures, and (3) loaded texture clones on materials with loaded textures. 
    All three categories need disposal when the store or application tears down.
*/

const _buildCacheKey = (obj) => {
  if (Array.isArray(obj)) return obj.join('|');

  return Object.keys(obj).sort().join('|');
};

// Uint8Arrays buffers with pixel data (R, G, B, A for each pixel)
// Buffer data is shared among scratch instances of DataTexture, references are stored on the CPU.
// Disposing any DataTexture via .dispose() (releasing GPU-side WebGLTexture).
// will release memory GPU-side with no affect buffer data, shared or otherwise.
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

function _generateDataTextures() {
  const bumpDataTexture = new THREE.DataTexture(bumpData, width, height);
  bumpDataTexture.name = '_scratchBumpTexture';
  bumpDataTexture.colorSpace = THREE.NoColorSpace;
  bumpDataTexture.needsUpdate = true;

  const diffuseDataTexture = new THREE.DataTexture(diffuseData, width, height);
  diffuseDataTexture.name = '_scratchDiffuseTexture';
  diffuseDataTexture.colorSpace = THREE.SRGBColorSpace;
  diffuseDataTexture.needsUpdate = true;

  const roughnessDataTexture = new THREE.DataTexture(roughnessData, width, height);
  roughnessDataTexture.name = '_scratchRoughnessTexture';
  roughnessDataTexture.colorSpace = THREE.NoColorSpace;
  roughnessDataTexture.needsUpdate = true;

  const transmissionDataTexture = new THREE.DataTexture(transmissionData, width, height);
  transmissionDataTexture.name = '_scratchTransmissionTexture';
  transmissionDataTexture.colorSpace = THREE.NoColorSpace;
  transmissionDataTexture.needsUpdate = true;

  return { bumpDataTexture, diffuseDataTexture, roughnessDataTexture, transmissionDataTexture };
};

const _defaultMeshPhysicalMaterialConfigMaps = _generateDataTextures();

export const defaultMeshPhysicalMaterialConfig = {
  color: '#2f2f2f',
  clearcoat: EPSILON_1e7,
  clearcoatRoughness: 1,
  flatShading: false,
  side: THREE.DoubleSide,
  thickness: 0,
  transmission: EPSILON_1e7,
  transparent: false,
  bumpMap: _defaultMeshPhysicalMaterialConfigMaps.bumpDataTexture,
  map: _defaultMeshPhysicalMaterialConfigMaps.diffuseDataTexture,
  roughnessMap: _defaultMeshPhysicalMaterialConfigMaps.roughnessDataTexture,
  transmissionMap: _defaultMeshPhysicalMaterialConfigMaps.transmissionDataTexture,
};

export const defaultMeshStandardMaterialConfig = {
  color: '#101010',
  flatShading: false,
  metalness: 0.8,
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
    thickness: 10,
    transmission: 1,
    transparent: true,
    side: THREE.DoubleSide,
  },
};

for (const materialConfig in _meshPhysicalMaterialConfigs) {

  // set clearcoat, clearcoatRoughness, and transmission if undefined or 0. 
  if (!_meshPhysicalMaterialConfigs[materialConfig]?.clearcoat) {
    _meshPhysicalMaterialConfigs[materialConfig].clearcoat = defaultMeshPhysicalMaterialConfig.clearcoat;
  }

  if (!_meshPhysicalMaterialConfigs[materialConfig]?.transmission) {
    _meshPhysicalMaterialConfigs[materialConfig].transmission = defaultMeshPhysicalMaterialConfig.transmission;
  }

  // set clearcoatRoughness to 1 if undefined or 0. 
  // If eased, transitioning from 0 will produce undesirable, highly concentrated specular highlights.
  // Materials that should have no perceivable clearcoat will have clearcoat=1e-7 and clearcoatRoughness=1.
  if (!_meshPhysicalMaterialConfigs[materialConfig]?.clearcoatRoughness) {
    _meshPhysicalMaterialConfigs[materialConfig].clearcoatRoughness = defaultMeshPhysicalMaterialConfig.clearcoatRoughness;
  }

  const dataTextures = _generateDataTextures();
  _meshPhysicalMaterialConfigs[materialConfig].bumpMap = dataTextures.bumpDataTexture;
  _meshPhysicalMaterialConfigs[materialConfig].map = dataTextures.diffuseDataTexture;
  _meshPhysicalMaterialConfigs[materialConfig].roughnessMap = dataTextures.roughnessDataTexture;
  _meshPhysicalMaterialConfigs[materialConfig].transmissionMap = dataTextures.transmissionDataTexture;
}

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
    material: new THREE.MeshStandardMaterial({ ...defaultMeshStandardMaterialConfig, name: 'ground', }),
  },

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
      map: '/textured_bag_color.jpg',
      roughnessMap: '/textured_bag_roughness.jpg',
      bumpMap: '/textured_bag_bump.jpg',
    },
  },

  translucent_grey: {
    displayName: 'Translucent Grey',
    tailwindColor: `bg-radial-[at_45%_45%] from-orange-50 from-3% via-stone-600 via-55% to-slate-950 to-95%`,
    material: new THREE.MeshPhysicalMaterial({ ..._meshPhysicalMaterialConfigs.translucentGreyMaterial }),
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