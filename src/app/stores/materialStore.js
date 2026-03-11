import { create } from 'zustand';
import * as THREE from 'three';
import { getColorSpace } from '@utils/materialUtils';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

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

export const _scratchTransmissionTexture = new THREE.DataTexture(transmissionData, width, height);
_scratchTransmissionTexture.name = '_scratchTransmissionTexture';
_scratchTransmissionTexture.colorSpace = THREE.NoColorSpace;
_scratchTransmissionTexture.needsUpdate = true;

export const defaultMeshTransmissionMaterialConfig = {
  anisotropy: 1,
  anisotropicBlur: 1,
  attenuationDistance: 10,
  attenuationColor: '#ffffff',
  backside: false,
  thickness: 20,
  backsideThickness: 0,
  chromaticAberration: 0,
  clearcoat: 0,
  clearcoatRoughness: 0,
  color: '#ccc0a3',
  distortion: 0,
  distortionScale: 0,
  flatShading: false,
  name: 'translucent',
  reflectivity: 0.4,
  resolution: 80,
  roughness: 0.75,
  samples: 12,
  side: THREE.DoubleSide,
  temporalDistortion: 0,
  toneMapped: false,
  transmission: 1,
  bumpMap: _scratchBumpTexture,
  clearcoatMap: _scratchClearcoatTexture,
  clearcoatRoughnessMap: _scratchClearcoatRoughnessTexture,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  transmissionMap: _scratchTransmissionTexture,
};

export const defaultMeshPhysicalMaterialConfig = {
  color: '#2f2f2f',
  flatShading: false,
  ior: 1.5,
  reflectivity: 0.3,
  roughness: 0.8,
  side: THREE.DoubleSide,
  bumpMap: _scratchBumpTexture,
  clearcoatMap: _scratchClearcoatTexture,
  clearcoatRoughnessMap: _scratchClearcoatRoughnessTexture,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  transmissionMap: _scratchTransmissionTexture,
};

const texturedBlackMaterial = {
  bumpScale: -1,
  color: '#4f4f4f',
  flatShading: false,
  name: 'textured_black',
  reflectivity: 0.35,
  ior: 1.8,
  roughness: 1,
  side: THREE.DoubleSide,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  bumpMap: _scratchBumpTexture,
};

const matteBlackMaterial = {
  bumpScale: 10,
  color: '#2f2f2f',
  flatShading: false,
  ior: 1.5,
  name: 'matte_black',
  reflectivity: 0.35,
  roughness: 0.75,
  side: THREE.DoubleSide,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  bumpMap: _scratchBumpTexture,
};

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
};

const eggshellMaterial = {
  color: '#ccc0a3',
  dispersion: 1,
  flatShading: false,
  ior: 1.5,
  iridescence: 1,
  iridescenceIOR: 1.5,
  name: 'eggshell',
  reflectivity: 0.4,
  roughness: 0.4,
  side: THREE.DoubleSide,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  bumpMap: _scratchBumpTexture,
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
    material: new THREE.MeshPhysicalMaterial({ ...matteBlackMaterial }),
    materialProps: matteBlackMaterial,
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
    materialProps: texturedBlackMaterial,
  },

  gloss_black: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new THREE.MeshPhysicalMaterial({ ...glossBlackMaterial }),
    materialProps: glossBlackMaterial,
    textures: {
      bumpMap: '/gloss_material_roughness.jpg',
    },
  },

  eggshell: {
    displayName: 'Eggshell',
    tailwindColor: `bg-radial-[at_35%_35%] from-white to-orange-100 to-30%`,
    material: new THREE.MeshPhysicalMaterial({ ...eggshellMaterial }),
    materialProps: eggshellMaterial,
  },
};

const textureState = {};

const materialStore = (set, get) => ({
  materials: materialState,
  textures: textureState,
  texturesInitialized: '',
  materialsInitialized: false,

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
        const materialPropsToUpdate = materials[material].materialProps;
        for (const materialProperty in designatedTextures) {
          const textureToAssign = textures[designatedTextures[materialProperty]];
          materialToUpdate[materialProperty] = textureToAssign.clone();
          materialToUpdate[materialProperty].flipY = false;
          materialToUpdate[materialProperty].colorSpace = getColorSpace(materialProperty);
          materialPropsToUpdate[materialProperty] = materialToUpdate[materialProperty];
        }
      }
    }

    set((state) => ({
      texturesInitialized: initialized,
      materialsInitialized: state.materialsInitialized,
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

  setMeshTransmissionMaterial: (meshTransmissionMaterialObject) => {
    const materialsInitialized = get().materialsInitialized;

    if (materialsInitialized) return;

    const clone = meshTransmissionMaterialObject.clone();
    set((state) => ({
      texturesInitialized: state.texturesInitialized,
      materialsInitialized: true,
      textures: {
        ...state.textures,
      },
      materials: {
        ...state.materials,
        "translucent": {
          displayName: 'Translucent',
          tailwindColor: `bg-radial-[at_35%_35%] from-white to-orange-100 to-30%`,
          material: clone,
          materialProps: defaultMeshTransmissionMaterialConfig
        }
      },
    }));
  },
});

const useMaterial = create(materialStore);

export default useMaterial;