import { create } from 'zustand';
import * as THREE from 'three';
import { getColorSpace } from '@utils/materialUtils';

THREE.ColorManagement.enabled = true;
THREE.Cache.enabled = true;

// Uint8Array with pixel data (R, G, B, A for each pixel)
const width = 32;
const height = 32;
const size = width * height;
const diffusedata = new Uint8Array(4 * size);
const roughnessData = new Uint8Array(4 * size);
const bumpData = new Uint8Array(4 * size);
bumpData.fill(0);

for (let i = 0; i < size; i++) {
  const stride = i * 4;
  diffusedata[stride] = 255; // red
  diffusedata[stride + 1] = 255; // green
  diffusedata[stride + 2] = 255; // blue
  diffusedata[stride + 3] = 255; // alpha (opacity)

  roughnessData[stride] = 255; // red
  roughnessData[stride + 1] = 255; // greenread
  roughnessData[stride + 2] = 255; // blue
  roughnessData[stride + 3] = 255; // alpha (opacity)
}
const _scratchDiffuseTexture = new THREE.DataTexture(diffusedata, width, height);
_scratchDiffuseTexture.name = '_scratchDiffuseTexture';
_scratchDiffuseTexture.colorSpace = THREE.SRGBColorSpace;
_scratchDiffuseTexture.needsUpdate = true;

const _scratchRoughnessTexture = new THREE.DataTexture(roughnessData, width, height);
_scratchRoughnessTexture.name = '_scratchRoughnessTexture';
_scratchRoughnessTexture.colorSpace = THREE.NoColorSpace;
_scratchRoughnessTexture.needsUpdate = true;

const _scratchBumpTexture = new THREE.DataTexture(bumpData, width, height);
_scratchBumpTexture.name = '_scratchBumpTexture';
_scratchBumpTexture.colorSpace = THREE.NoColorSpace;
_scratchBumpTexture.needsUpdate = true;

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
    const searchCondition = (texture) => (texture.url === id) || (texture.materialProperty === id);

    if (textures[`${id}`]) return textures[`${id}`]?.texture;
    if (id && materialID) return Object.values(textures).find(texture => (texture.materialIDs.includes(materialID) && texture.materialProperty === id))?.texture;
    return Object.values(textures).find(texture => searchCondition(texture))?.texture;
  },

  setMaterialTextures: (textures) => {
    const materials = get().materials;

    for (const material in materials) {
      const designatedTextures = materials[material]?.textures;
      if (designatedTextures) {
        const materialToUpdate = materials[material].material;
        for (const materialProperty in designatedTextures) {
          const textureToAssign = textures[designatedTextures[materialProperty]];
          textureToAssign.flipY = false;
          materialToUpdate[materialProperty] = textureToAssign.clone();
          materialToUpdate[materialProperty].colorSpace = getColorSpace(materialProperty);
        }
      }
    }

    set((state) => ({
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