import { DataTexture, MeshStandardMaterial, MeshPhysicalMaterial, Side, Texture, Vector2 } from 'three'
import type { KeysOfType } from './genericTypes'

// Union of all keys of type Texture on MeshStandardMaterial and MeshPhysicalMaterial
// // 'map' | 'lightMap' | 'aoMap' | 'emissiveMap' | 'bumpMap' | 'normalMap' | 'displacementMap' | 'roughnessMap' | 'metalnessMap' | 'alphaMap' | 'envMap' | 'anisotropyMap' | 'clearcoatMap' | 'clearcoatRoughnessMap' | 'clearcoatNormalMap' | 'diffuseRoughnessMap' | 'iridescenceMap' | 'iridescenceThicknessMap' | 'sheenColorMap' | 'sheenRoughnessMap' | 'transmissionMap' | 'thicknessMap' | 'specularIntensityMap' | 'specularColorMap'
export type TextureType = KeysOfType<MeshPhysicalMaterial, Texture>

export type TextureRecords = Partial<Record<TextureType, string>>;

export interface MaterialRecord {
  tailwindColor: string
  displayName: string
  material: MeshStandardMaterial | MeshPhysicalMaterial
  textures?:TextureRecords
 // textures?: Record<string, string>
}

export interface MaterialProperties {
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