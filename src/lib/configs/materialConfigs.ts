import { DoubleSide, Vector2 } from 'three'
import type { MaterialProperties } from '../../types/material'
import { createPlaceholderTexture } from '@utils/textureUtils'
import { EPSILON_1e7 } from '@utils/validation'

const _defaultTextures = {
  bumpMap: createPlaceholderTexture('bumpMap'),
  map: createPlaceholderTexture('map'),
  normalMap: createPlaceholderTexture('normalMap'),
  roughnessMap: createPlaceholderTexture('roughnessMap')
}

export const defaultPhysicalMaterialProperties: MaterialProperties = {
  bumpMap: _defaultTextures.bumpMap,
  color: '#2f2f2f',
  clearcoat: EPSILON_1e7,
  clearcoatRoughness: 1,
  flatShading: false,
  ior: 1.5,
  map: _defaultTextures.map,
  name: 'default_physical_material',
  roughnessMap: _defaultTextures.roughnessMap,
  side: DoubleSide,
}

export const defaultMeshStandardMaterialProperties: MaterialProperties = {
  color: '#101010',
  flatShading: false,
  metalness: 0.8,
  name: 'default_standard_material',
  normalScale: new Vector2(1, -1),
  roughness: 1,
  side: DoubleSide,
  normalMap: _defaultTextures.normalMap,
}

