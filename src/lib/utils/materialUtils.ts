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

export function generateArrayBuffer(resolution: number = 1024, mapType: string = 'map'): Uint8Array | void {
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

export function generateDataTexture(arrayBuffer: Uint8Array, mapType: string): DataTexture {
  let data = {} as DataTexture | null
  let size: number = 0

  switch (mapType) {
    case 'displacementMap':
      size = Math.sqrt(arrayBuffer.length)
      data = new DataTexture(arrayBuffer, size, size, RedFormat, UnsignedByteType)
      break
    default:
      size = Math.sqrt(arrayBuffer.length / 4)
      data = new DataTexture(arrayBuffer, size, size)
  }

  data.colorSpace = getColorSpace(mapType)
  data.name = `_${mapType}DataTexture`
  data.needsUpdate = true

  return data
}

// export function _generateDataTexture(mapType: string, resolution: number) {
//   return generateDataTexture(generateArrayBuffer(resolution, mapType) as Uint8Array, mapType)
// }