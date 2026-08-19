import { LinearSRGBColorSpace, NoColorSpace, SRGBColorSpace, DataTexture, RedFormat, UnsignedByteType } from 'three'

export function getColorSpace(property: string): string {
  switch (property) {
    case 'map':
    case 'emissiveMap':
    case 'specularColorMap':
    case 'sheenColorMap':
      return SRGBColorSpace
    case 'envMap':
    case 'lightMap':
      return LinearSRGBColorSpace
    case 'alphaMap':
    case 'aoMap':
    case 'bumpMap':
    case 'clearcoatMap':
    case 'clearcoatNormalMap':
    case 'clearcoatRoughnessMap':
    case 'displacementMap':
    case 'iridescenceMap':
    case 'iridescenceThicknessMap':
    case 'metalnessMap':
    case 'normalMap':
    case 'roughnessMap':
    case 'specularIntensityMap':
    case 'thicknessmap':
    case 'transmissionMap':
    default:
      return NoColorSpace
  }
}

function _fillBuffer(arrayBuffer: Uint8Array, r: number = 255, g: number = 255, b: number = 255, a: number = 255): void {
  for (let i = 0; i < arrayBuffer.length; i += 4) {
    arrayBuffer[i] = r
    arrayBuffer[i + 1] = g
    arrayBuffer[i + 2] = b
    arrayBuffer[i + 3] = a
  }
}

function _generateArrayBuffer(resolution: number = 1024, mapType: string = 'map'): Uint8Array | void {
  if (!mapType.length) return
  if (resolution < 1024 || resolution % 1024 !== 0) return

  const data = new Uint8Array(resolution)

  switch (mapType) {
    case 'bumpMap':
    case 'displacementMap':
      data.fill(0)
      break
    case 'clearcoatNormalMap':
    case 'normalMap':
      _fillBuffer(data, 128, 128, 255, 255)
      break
    case 'map':
    case 'clearcoatMap':
    case 'clearcoatRoughnessMap':
    case 'roughnessMap':
    case 'transmissionMap':
    default:
      _fillBuffer(data, 255, 255, 255, 255)
      break
  }
  return data
}

function _generateDataTexture(arrayBuffer: Uint8Array, mapType: string): DataTexture {
  let data = {} as DataTexture | null
  let size: number = Math.sqrt(arrayBuffer.length / 4)

  switch (mapType) {
    case 'displacementMap':
      size = Math.sqrt(arrayBuffer.length)
      data = new DataTexture(arrayBuffer, size, size, RedFormat, UnsignedByteType)
      break
    default:
      data = new DataTexture(arrayBuffer, size, size)
  }

  data.colorSpace = getColorSpace(mapType)
  data.name = `_${mapType}DataTexture`
  data.needsUpdate = true

  return data
}

const _bumpData = _generateArrayBuffer(1024, 'bumpMap')
const _diffuseData = _generateArrayBuffer(1024, 'map')
const _normalData = _generateArrayBuffer(4096, 'normalMap')
const _roughnessData = _generateArrayBuffer(1024, 'roughnessMap')

export const scratchDataTextures = {
  bumpMap: _generateDataTexture(_bumpData as Uint8Array, 'bumpMap'),
  map: _generateDataTexture(_diffuseData as Uint8Array, 'map'),
  normalMap: _generateDataTexture(_normalData as Uint8Array, 'normalMap'),
  roughnessMap: _generateDataTexture(_roughnessData as Uint8Array, 'roughnessMap'),
}

// function testGenerateDataTexture(mapType: string, resolution: number) {
//   return generateDataTexture(_generateArrayBuffer(resolution, mapType) as Uint8Array, mapType)
// }