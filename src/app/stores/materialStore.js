import { create } from 'zustand';
import {  MeshStandardMaterial, MeshPhysicalMaterial, DoubleSide } from 'three';
import { EPSILON_1e7 } from '@utils/animationUtils';
import { getColorSpace, generateDataTexture, generateArrayBuffer} from '@utils/materialUtils'

const _buildCacheKey = (obj) => {
  if (Array.isArray(obj)) return obj.join('|');

  return Object.keys(obj).sort().join('|');
};

const _bumpData = generateArrayBuffer(1024, 'bumpMap')
const _diffuseData = generateArrayBuffer(1024, 'map') 
const _normalData = generateArrayBuffer(1024, 'normalMap') 
const _roughnessData = generateArrayBuffer(1024, 'roughnessMap')

const _bumpMap  =  generateDataTexture(_bumpData, 'bumpMap')
const _map =  generateDataTexture(_diffuseData, 'map')
const _normalMap  =  generateDataTexture(_normalData, 'normalMap')
const _roughnessMap =  generateDataTexture(_roughnessData, 'roughnessMap')

const _scratchDataTextures = {
  bumpMap: _bumpMap,
  map: _map, 
  normalMap: _normalMap,
  roughnessMap: _roughnessMap,
}

const _bumpMap2 = generateDataTexture(_bumpData, 'bumpMap')
const _map2 =  generateDataTexture(_diffuseData, 'map')
const _roughnessMap2 =  generateDataTexture(_roughnessData, 'roughnessMap')

export const defaultMeshPhysicalMaterialConfig = {
  bumpMap:  _bumpMap2,
  color: '#2f2f2f',
  clearcoat: EPSILON_1e7,
  clearcoatRoughness: 1,
  flatShading: false,
  ior: 1.5,
  map: _map2,
  roughnessMap: _roughnessMap2,
  side: DoubleSide,
};

const materialConfigs = {
  gloss_black: {
    bumpScale: 2,
    clearcoat: EPSILON_1e7,
    clearcoatRoughness: 1,
    color: '#101010',
    flatShading: false,
    ior: 1.5,
    name: 'gloss_black',
    roughness: 0.45,
    side: DoubleSide,
    bumpMap: _scratchDataTextures.bumpMap,
    map: _scratchDataTextures.map,
    roughnessMap: _scratchDataTextures.roughnessMap,
  },
  matte_black: {
    bumpScale: 2,
    clearcoat: EPSILON_1e7,
    clearcoatRoughness: 1,
    color: '#101010',
    flatShading: false,
    ior: 1.7,
    name: 'matte_black',
    roughness: 0.75,
    side: DoubleSide,
    bumpMap: _scratchDataTextures.bumpMap,
    map: _scratchDataTextures.map,
    roughnessMap: _scratchDataTextures.roughnessMap,
  },
  stained_matte_black: {
    bumpScale: 0.25,
    clearcoat: EPSILON_1e7,
    clearcoatRoughness: 1,
    color: '#2c2c2c',
    flatShading: false,
    ior: 1.5,
    name: 'stained_matte_black',
    roughness: 0.8,
    side: DoubleSide,
    bumpMap: _scratchDataTextures.bumpMap,
    map: _scratchDataTextures.map,
    roughnessMap: _scratchDataTextures.roughnessMap,
  },
  ground: {
    color: '#101010',
    flatShading: false,
    metalness: 0.8,
    name: 'ground',
    // normalScale: new Vector2(1, -1),
    roughness: 1,
    side: DoubleSide,
    // normalMap: _scratchDataTextures.normalMap
  }
}

const materialState = {
  gloss_black: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new MeshPhysicalMaterial({ ...materialConfigs.gloss_black }),
  },
  ground: {
    displayName: 'Ground',
    tailwindColor: `bg-zinc-900`,
    material: new MeshStandardMaterial({ ...materialConfigs.ground }),
  },
  matte_black: {
    displayName: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new MeshPhysicalMaterial({...materialConfigs.matte_black }),
  },
  stained_matte_black: {
    displayName: 'Stained Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new MeshPhysicalMaterial({ ...materialConfigs.stained_matte_black }),
    textures: {
      map: '/stained_black_diffuse.ktx2',
      roughnessMap: '/stained_black_roughness.ktx2',
    },
  },
};

const _selectedMaterialsCache = new Map();

const materialStore = (set, get) => ({
  materials: materialState,
  texturesInitialized: '',

  getSelectedMaterials: (materialIDs = []) => {
    const texturesInitialized = get().texturesInitialized;

    if (!texturesInitialized?.length) {
      console.warn('Warning: getSelectedMaterials() => Accessing materials before textures have loaded. Returning {}.');
      return {};
    }

    if (!Array.isArray(materialIDs) || !materialIDs.length) {
      console.warn('Warning: getSelectedMaterials() => materialIDs should not be an empty array. Returning {}.');
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

    if (invalidIDCount) console.warn('Warning: getSelectedMaterials() => ' + invalidIDCount + ' invalid material IDs: ', invalidIDs);

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
          console.warn(`Warning: setMaterialTextures() => Missing or invalid texture for material '${material}', property '${materialProperty}'. Got:`, textureToAssign);
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

  setTextures: (textures) => {
    const staged = [];
    const materials = get().materials;
    const texturesInitialized = get().texturesInitialized;
    const initialized = _buildCacheKey(textures);

    if (texturesInitialized === initialized) return;

    for (const entry in materials) {
      // object mapping material property names to a image urls
      const textureUrls = materials[entry]?.textures; 

      if (!textureUrls) continue;

      for (const slot in textureUrls) {
        // check if arg has a Texture with matching url 
        const textureObject = textures[textureUrls[slot]] ?? null;


        if (!textureObject || !textureToAssign.isTexture) {
          console.warn(`Warning: setMaterialTextures() => Missing or invalid texture for material '${entry}', property '${slot}'. Got:`, textureObject);
          return;
        }
        staged.push({
          target: materials[entry].material,
          property: slot,
          texture: textureObject
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