import { create } from 'zustand'
import type { ExtractState } from 'zustand'
import { Side, DataTexture, DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial, Texture, Vector2 } from 'three'
import { EPSILON_1e7 } from '@utils/animationUtils'
import { getColorSpace, generateDataTexture, generateUint8ArrayBuffer } from '@utils/materialUtils'
import type { MaterialRecord } from '@/types/material'

type Ass<T, ValueType> = {
  [K in keyof T]: T[K] extends ValueType | null ? K : never
}[keyof T]

// export type TextureType = 'map' | 'bumpMap' | 'roughnessMap' | 'normalMap' | 'displacementMap' | 'aoMap'
type MeshStandardMaterialMaps = Ass<MeshStandardMaterial, Texture>
export type TextureType = NonNullable<MeshStandardMaterialMaps>

interface MaterialProperties {
  color: string
  flatShading: boolean
  name: string
  side: Side
  bumpMap?: DataTexture | Texture
  bumpScale?: number
  clearcoat?: number
  clearcoatRoughness?: number
  ior?: number
  map?: DataTexture | Texture
  metalness?: number
  normalMap?: DataTexture | Texture
  normalScale?: Vector2
  roughness?: number
  roughnessMap?: DataTexture | Texture
}

type MaterialKey = 'gloss_black' | 'matte_black' | 'stained_matte_black' | 'terrain'

interface Staged {
  target: MeshPhysicalMaterial | MeshStandardMaterial
  property: TextureType
  texture: Texture
}

// const _loader: TextureLoader = new TextureLoader()
// const _ktx2Loader: KTX2Loader = new KTX2Loader()
// _ktx2Loader.setTranscoderPath('examples/jsm/libs/basis/')

const _bumpData = generateUint8ArrayBuffer(1024, 'bumpMap') as Uint8Array
const _diffuseData = generateUint8ArrayBuffer(1024, 'map') as Uint8Array
const _normalData = generateUint8ArrayBuffer(1024, 'normalMap') as Uint8Array
const _roughnessData = generateUint8ArrayBuffer(1024, 'roughnessMap') as Uint8Array

const _bumpMap: DataTexture = generateDataTexture(_bumpData, 'bumpMap')
const _map: DataTexture = generateDataTexture(_diffuseData, 'map')
const _normalMap: DataTexture = generateDataTexture(_normalData, 'normalMap')
const _roughnessMap: DataTexture = generateDataTexture(_roughnessData, 'roughnessMap')

const _scratchDataTextures: Record<string, DataTexture> = {
  bumpMap: _bumpMap,
  map: _map,
  normalMap: _normalMap,
  roughnessMap: _roughnessMap,
}

const _bumpMap2: DataTexture = generateDataTexture(_bumpData, 'bumpMap')
const _map2: DataTexture = generateDataTexture(_diffuseData, 'map')
const _roughnessMap2: DataTexture = generateDataTexture(_roughnessData, 'roughnessMap')
const _normalMap2 = generateDataTexture(_normalData, 'normalMap')


export const defaultPhysicalMaterialProperties: MaterialProperties = {
  bumpMap: _bumpMap2,
  color: '#2f2f2f',
  clearcoat: EPSILON_1e7,
  clearcoatRoughness: 1,
  flatShading: false,
  ior: 1.5,
  map: _map2,
  name: 'materialstore_default',
  roughnessMap: _roughnessMap2,
  side: DoubleSide,
}

export const defaultMeshStandardMaterialProperties: MaterialProperties = {
  color: '#101010',
  flatShading: false,
  metalness: 0.8,
  name: 'terrain',
  normalScale: new Vector2(1, -1),
  roughness: 1,
  side: DoubleSide,
  normalMap: _normalMap2,
}


const storeMaterialProperties: Record<MaterialKey, MaterialProperties> = {
  [`gloss_black`]: {
    bumpScale: 2,
    clearcoat: EPSILON_1e7,
    clearcoatRoughness: 1,
    color: '#101010',
    flatShading: false,
    ior: 1.5,
    name: 'gloss_black' as MaterialKey,
    roughness: 0.45,
    side: DoubleSide,
    bumpMap: _scratchDataTextures.bumpMap,
    map: _scratchDataTextures.map,
    roughnessMap: _scratchDataTextures.roughnessMap,
  },
  [`matte_black`]: {
    bumpScale: 2,
    clearcoat: EPSILON_1e7,
    clearcoatRoughness: 1,
    color: '#101010',
    flatShading: false,
    ior: 1.6,
    name: 'matte_black' as MaterialKey,
    roughness: 0.85,
    side: DoubleSide,
    bumpMap: _scratchDataTextures.bumpMap,
    map: _scratchDataTextures.map,
    roughnessMap: _scratchDataTextures.roughnessMap,
  },
  [`stained_matte_black`]: {
    bumpScale: 0.25,
    clearcoat: EPSILON_1e7,
    clearcoatRoughness: 1,
    color: '#2c2c2c',
    flatShading: false,
    ior: 1.5,
    name: 'stained_matte_black' as MaterialKey,
    roughness: 0.8,
    side: DoubleSide,
    bumpMap: _scratchDataTextures.bumpMap,
    map: _scratchDataTextures.map,
    roughnessMap: _scratchDataTextures.roughnessMap,
  },
  [`terrain`]: {
    color: '#101010',
    flatShading: false,
    metalness: 0.8,
    name: 'terrain' as MaterialKey,
    normalScale: new Vector2(1.5, -1),
    roughness: 1,
    side: DoubleSide,
    normalMap: _scratchDataTextures.normalMap
  }
}

const storeMaterials: Record<MaterialKey, MaterialRecord> = {
  [`gloss_black`]: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new MeshPhysicalMaterial({ ...storeMaterialProperties.gloss_black }),
  },
  [`matte_black`]: {
    displayName: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new MeshPhysicalMaterial({ ...storeMaterialProperties.matte_black }),
  },
  [`stained_matte_black`]: {
    displayName: 'Stained Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new MeshPhysicalMaterial({ ...storeMaterialProperties.stained_matte_black }),
    textures: {
      [`map`]: 'https://5aihfmsahakbuihc.public.blob.vercel-storage.com/images/materials/stained_matte_black/stained_black_diffuse.ktx2',
      [`bumpMap`]: 'https://5aihfmsahakbuihc.public.blob.vercel-storage.com/images/materials/stained_matte_black/stained_black_roughness.ktx2',
      [`roughnessMap`]: 'https://5aihfmsahakbuihc.public.blob.vercel-storage.com/images/materials/stained_matte_black/stained_black_roughness.ktx2',
    },
  },
  [`terrain`]: {
    displayName: 'terrain',
    tailwindColor: ``,
    material: new MeshStandardMaterial({ ...storeMaterialProperties.terrain }),
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
  getSelectedMaterials: (materialIDs: string[]) => Record<string, MeshStandardMaterial | MeshPhysicalMaterial>
  // setTextures: (textures: string[], renderer: WebGLRenderer) => void
  setMaterialTextures: (textures: Record<string, Texture>) => void
}

type MaterialState = MaterialStoreValues & MaterialStoreActions

const initialState: MaterialStoreValues = {
  materials: storeMaterials,
  texturesInitialized: ''
}

const _selectedMaterialsCache = new Map()

const useMaterial = create<MaterialState>()((set, get) => ({
  ...initialState,

  getSelectedMaterials: (materialIDs): Record<string, MeshPhysicalMaterial | MeshStandardMaterial> => {
    const texturesInitialized = get().texturesInitialized
    const selectedMaterials: Record<string, MeshPhysicalMaterial | MeshStandardMaterial> = {}
    let revoke: boolean = false

    if (!texturesInitialized?.length) {
      console.warn('Warning: getSelectedMaterials() => Accessing materials before textures have loaded.')
      revoke = true
    }

    if (!materialIDs.length) {
      console.warn('Warning: getSelectedMaterials(materialIDs) must receive a nonempty array of type string[].')
      revoke = true
    }

    if (revoke) return selectedMaterials

    const cacheKey = _buildCacheKey(materialIDs)

    if (_selectedMaterialsCache.has(cacheKey)) return _selectedMaterialsCache.get(cacheKey)

    let invalidIDCount: number = 0
    const invalidIDs: string[] = []
    const materials = get().materials

    for (let i = 0; i < materialIDs.length; i++) {
      if (materials[materialIDs[i]]?.material) {
        selectedMaterials[materialIDs[i]] = materials[materialIDs[i]].material
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
    const staged: Staged[] = []
    const materials = get().materials
    const texturesInitialized = get().texturesInitialized
    const initialized = _buildCacheKey(textures)

    if (texturesInitialized === initialized) return

    for (const material in materials) {
      const designatedTextures: Record<string, string> | undefined = materials[material]?.textures
      if (!designatedTextures) continue

      for (const materialProperty in designatedTextures) {
        const textureToAssign = textures[designatedTextures[materialProperty]] ?? null
        if (!textureToAssign || !textureToAssign.isTexture) {
          return
        }
        staged.push({
          target: materials[material].material,
          property: materialProperty as TextureType,
          texture: textureToAssign
        })
      }
    }

    for (const { target, property, texture } of staged as Staged[]) {
      target[property] = texture.clone()
      target[property].flipY = false
      target[property].colorSpace = getColorSpace(property)
    }

    set(() => ({
      texturesInitialized: initialized,
      materials: { ...materials },
    }))
  },

  // setTextures: async (textures: string[], renderer: WebGLRenderer) => {
  //   const staged: Staged[] = []
  //   const materials = get().materials
  //   const texturesInitialized = get().texturesInitialized
  //   const initialized = _buildCacheKey(textures)

  //   if (texturesInitialized === initialized) return

  //   try {
  //     if (textures.find(str => str.endsWith('.ktx2'))) _ktx2Loader.detectSupport(renderer)

  //     for (const entry in materials) {
  //       const textureUrls: Record<string, string> | undefined = materials[entry]?.textures

  //       if (!textureUrls) continue

  //       for (const textureMapType in textureUrls) {
  //         let textureObject: Texture | null
  //         const textureUrl: string = textureUrls[textureMapType]

  //         if (textureUrl.endsWith('.ktx2')) {
  //           textureObject = await _ktx2Loader.loadAsync(textureUrl)
  //         }
  //         else {
  //           textureObject = await _loader.loadAsync(textureUrl)
  //         }

  //         if (!textureObject || !textureObject.isTexture) {
  //           console.warn(`Warning: setMaterialTextures() => Missing or invalid texture for material '${entry}', property '${textureMapType}'. Got:`, textureObject)
  //           continue
  //         }
  //         else {
  //           staged.push({
  //             target: materials[entry].material,
  //             property: textureMapType,
  //             texture: textureObject
  //           } as Staged)
  //         }
  //       }
  //     }

  //     if (!staged.length) {
  //       console.warn('failed to load all textures.')
  //       return
  //     }

  //     for (const { target, property, texture } of staged) {
  //       target[property] = texture.clone()
  //       target[property].flipY = false
  //       target[property].colorSpace = getColorSpace(property)
  //     }

  //     set(() => ({
  //       texturesInitialized: initialized,
  //       materials: { ...materials },
  //     }))
  //   }
  //   catch (e) {
  //     console.error(`Error: setTextures() `, e)
  //   }
  // },
}))

export type MaterialStoreState = ExtractState<typeof useMaterial>

export default useMaterial

