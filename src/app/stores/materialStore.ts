import { create } from 'zustand'
import type { ExtractState } from 'zustand'
import { DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial, Texture, Vector2 } from 'three'
import type { MaterialProperties, MaterialRecord, TextureType } from '../../types/material'
import { EPSILON_1e7, validateTextureMapType } from '@utils/validation'
import { getColorSpace, createPlaceholderTexture } from '@utils/textureUtils'

// materialRecords[record].material is of type MeshPhyiscalMaterial or MeshStandardMaterial.
// materialRecords[record].textures is of type TextureRecords.

// TextureRecords maps a key to a string URL. Its keys are of type TextureType.
// - Its purpose is to state types and the location of texture maps required to provision a material associated with a MaterialRecord, i.e. " the bumpMap for this material is located at "//...example.com"
// - TextureType is the union of the keys of type Texture on MeshPhysicalMaterial.
// - The string URL points to a .ktx2 file located in Blob storage. The file is a texture map. the key specifies which type of texture it is. 

// MaterialRecord models the relationship between a Material and .ktx2 files - it is the bill of materials for provisioning a Three.js Material.
// - It states thats whether a material requires a texture map and specifies the file path URL passed to a texture loader.

// materialRecord.material -> the material
// materialRecord.textures -> texture maps for the materialA
// materialRecord.tailwindColor -> A string used for styling any React JSX specific to the material
// materialRecord.displayName -> text to display in any React JSX specific to the material

// value of an entry of MaterialRecord.textures matches a key of an entry in the argument passed to setMaterialTextures().

// TextureInitializer handles the texture loading. It reads MaterialRecords from the store.
// - Depending on the file type (determined by whether the URL ends with .ktx2) it passes those URLs to a correct loader via a Drei hook.
// - It maps those URLs to the loaded Textures by declaring an object and using the URLs as object keys, and the Textures as values.
// - TextureInitializer then calls setMaterialTextures to pass that object to the store

// setMaterialTextures iterates over MaterialRecords in order to assign Textures to the materials that require them.
// - It compares a value of MaterialRecord.textures to a key of textures. 
// - MaterialRecord.material[key] is assigned a clone of textures[value]. 
// - It clones the Texture which it sets as the appropriate property on a material
// - It sets .flipY and .colorSpace of the texture
// - It sets .needsUpdate of the material.
// - It sets the store's texturesInitialized value to defend against redundant calls.

// The union of all keys of material records in the store.
type MaterialKey = 'gloss_black' | 'matte_black' | 'stained_matte_black' | 'terrain'

type SelectedMaterials = Record<string, MeshPhysicalMaterial | MeshStandardMaterial>

interface StagedUpdate {
  material: MeshPhysicalMaterial | MeshStandardMaterial
  key: TextureType
  texture: Texture
}

const _placeholderTextures = {//: Record<string, DataTexture> = {
  bumpMap: createPlaceholderTexture('bumpMap'),
  map: createPlaceholderTexture('map'),
  normalMap: createPlaceholderTexture('normalMap'),
  roughnessMap: createPlaceholderTexture('roughnessMap')
}

const _storeMaterialProperties: Record<MaterialKey, MaterialProperties> = {
  [`gloss_black`]: {
    bumpScale: 2,
    clearcoat: EPSILON_1e7,
    clearcoatRoughness: 1,
    color: '#101010',
    flatShading: false,
    ior: 1.5,
    name: 'gloss_black',
    roughness: 0.45,
    side: DoubleSide,
    bumpMap: _placeholderTextures.bumpMap,
    map: _placeholderTextures.map,
    roughnessMap: _placeholderTextures.roughnessMap,
  },
  [`matte_black`]: {
    bumpScale: 2,
    clearcoat: EPSILON_1e7,
    clearcoatRoughness: 1,
    color: '#101010',
    flatShading: false,
    ior: 1.6,
    name: 'matte_black',
    roughness: 0.85,
    side: DoubleSide,
    bumpMap: _placeholderTextures.bumpMap,
    map: _placeholderTextures.map,
    roughnessMap: _placeholderTextures.roughnessMap,
  },
  [`stained_matte_black`]: {
    bumpScale: 0.25,
    clearcoat: EPSILON_1e7,
    clearcoatRoughness: 1,
    color: '#2c2c2c',
    flatShading: false,
    ior: 1.45,
    name: 'stained_matte_black',
    roughness: 0.7,
    side: DoubleSide,
    bumpMap: _placeholderTextures.bumpMap,
    map: _placeholderTextures.map,
    roughnessMap: _placeholderTextures.roughnessMap,
  },
  [`terrain`]: {
    color: '#101010',
    flatShading: false,
    metalness: 0.8,
    name: 'terrain',
    normalScale: new Vector2(1.5, -1),
    roughness: 1,
    side: DoubleSide,
    normalMap: _placeholderTextures.normalMap
  }
}

const storeMaterials: Record<MaterialKey, MaterialRecord> = {
  [`gloss_black`]: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new MeshPhysicalMaterial({ ..._storeMaterialProperties.gloss_black }),
  },
  [`matte_black`]: {
    displayName: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new MeshPhysicalMaterial({ ..._storeMaterialProperties.matte_black }),
  },
  [`stained_matte_black`]: {
    displayName: 'Stained Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new MeshPhysicalMaterial({ ..._storeMaterialProperties.stained_matte_black }),
    textures: {
      [`map`]: 'https://5aihfmsahakbuihc.public.blob.vercel-storage.com/images/materials/stained_matte_black/stained_black_diffuse.ktx2',
      [`bumpMap`]: 'https://5aihfmsahakbuihc.public.blob.vercel-storage.com/images/materials/stained_matte_black/stained_black_roughness.ktx2',
      [`roughnessMap`]: 'https://5aihfmsahakbuihc.public.blob.vercel-storage.com/images/materials/stained_matte_black/stained_black_roughness.ktx2',
    },
  },
  [`terrain`]: {
    displayName: 'terrain',
    tailwindColor: ``, // no need for a tailwind color, terrain material never gets exposed to users 
    material: new MeshStandardMaterial({ ..._storeMaterialProperties.terrain }),
    textures: {
      [`normalMap`]: 'https://5aihfmsahakbuihc.public.blob.vercel-storage.com/images/materials/terrain/terrain_normal_2_2k.ktx2',
    }
  },
}

const _buildCacheKey = (obj: string[] | Record<string, any>): string => {
  return (Array.isArray(obj)) ? obj.join('|') : Object.keys(obj).sort().join('|')
}

type MaterialStoreValues = {
  materials: Record<string, MaterialRecord>
  texturesInitialized: string
}

type MaterialStoreActions = {
  getSelectedMaterials: (materialIDs: string[]) => SelectedMaterials
  setMaterialTextures: (textures: Record<string, Texture>) => void
}

type MaterialState = MaterialStoreValues & MaterialStoreActions

const initialState: MaterialStoreValues = {
  materials: storeMaterials,
  texturesInitialized: ''
}
const _selectedMaterialsCache: Map<string, SelectedMaterials> = new Map()

const useMaterial = create<MaterialState>()((set, get) => ({
  ...initialState,

  getSelectedMaterials: (materialIDs): SelectedMaterials => {
    const texturesInitialized = get().texturesInitialized
    const selectedMaterials: SelectedMaterials = {}
    let revoke: boolean = false

    if (!texturesInitialized.length) {
      console.warn('Warning: getSelectedMaterials() => Accessing materials before textures have loaded.')
      revoke = true
    }

    if (!materialIDs.length) {
      console.warn('Warning: getSelectedMaterials(materialIDs) must receive a nonempty array of type string[].')
      revoke = true
    }

    if (revoke) return selectedMaterials

    const cacheKey = _buildCacheKey(materialIDs)
    const cached = _selectedMaterialsCache.get(cacheKey)
    if (cached) return cached

    let invalidIDCount: number = 0
    const invalidIDs: string[] = []
    const materials = get().materials

    for (let i = 0; i < materialIDs.length; i++) {
      if (materials[materialIDs[i]]?.material) {
        selectedMaterials[materialIDs[i]] = materials[materialIDs[i]]?.material
      }
      else {
        invalidIDCount++
        invalidIDs.push(materialIDs[i])
      }
    }

    if (invalidIDCount) console.warn('Warning: getSelectedMaterials(materialIDs) was provided ' + invalidIDCount + ' invalid material IDs: ', invalidIDs)

    _selectedMaterialsCache.set(cacheKey, selectedMaterials)
    return selectedMaterials
  },

  setMaterialTextures: (textures: Record<string, Texture>): void => {
    const stagedUpdates: StagedUpdate[] = []
    const materialRecords = get().materials
    const texturesInitialized = get().texturesInitialized
    const initialized = _buildCacheKey(textures)

    if (texturesInitialized === initialized) return

    // iterate over material records, skip those without a .textures property
    for (const record of Object.values(materialRecords)) {
      if (!record?.textures) continue

      // iterate over MaterialRecord.textures
      for (const [key, url] of Object.entries(record.textures)) {
        const loadedTexture = textures[url] ?? null

        if (!validateTextureMapType(key)) {
          console.warn('setMaterialTextures: Property: ', key, ' is invalid.')
          continue
        }
        if (!loadedTexture || !loadedTexture.isTexture) {
          console.warn('setMaterialTextures: Invalid value:', { url, loadedTexture })
          continue
        }
        if (!(key in record.material)) {
          console.warn('setMaterialTextures: Property: ', key, ' does not exist on ', record.material)
          continue
        }

        const stagedUpdate: StagedUpdate = {
          key,
          material: record.material,
          texture: loadedTexture
        }
        stagedUpdates.push(stagedUpdate)
      }
    }

    if (!stagedUpdates.length) {
      console.warn('setMaterialTextures: Nothing to set.')
      return
    }

    for (const { material, key, texture } of stagedUpdates) {
      const clone = texture.clone()
      clone.flipY = false
      clone.colorSpace = getColorSpace(key)
      material.setValues({ [key]: clone })
      material.needsUpdate = true
    }

    set(() => ({
      texturesInitialized: initialized,
      materials: { ...materialRecords },
    }))
  },
}))

export type MaterialStoreState = ExtractState<typeof useMaterial>

export default useMaterial