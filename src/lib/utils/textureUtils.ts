import { DataTexture, LinearSRGBColorSpace, NoColorSpace, RedFormat, SRGBColorSpace, UnsignedByteType } from 'three'

// Returns the color space for a valid texture map type.
// Compares a string value against all known texture map types for all Materials.
// Defaults to NoColorSpace.
export function getColorSpace(property: string): string {
  switch (property) {
    case 'map':
    case 'emissiveMap':
    case 'sheenColorMap':
    case 'specularColorMap':
      return SRGBColorSpace
    case 'envMap':
    case 'lightMap':
      return LinearSRGBColorSpace
    case 'alphaMap':
    case 'anisotropyMap':
    case 'aoMap':
    case 'bumpMap':
    case 'clearcoatMap':
    case 'clearcoatNormalMap':
    case 'clearcoatRoughnessMap':
    case 'diffuseRoughnessMap':
    case 'displacementMap':
    case 'iridescenceMap':
    case 'iridescenceThicknessMap':
    case 'metalnessMap':
    case 'normalMap':
    case 'roughnessMap':
    case 'sheenRoughnessMap':
    case 'specularIntensityMap':
    case 'thicknessMap':
    case 'transmissionMap':
    default:
      return NoColorSpace
  }
}

// Texels that leave each texture map's shader formula unchanged.
// bumpMap and displacementMap only read R; their alpha is unused.
export const NEUTRAL_TEXELS = {
  map: [255, 255, 255, 255],
  roughnessMap: [255, 255, 255, 255],
  normalMap: [128, 128, 255, 255],
  bumpMap: [0, 0, 0, 255],
  displacementMap: [0, 0, 0, 255],
} as const

export type PlaceholderMapType = keyof typeof NEUTRAL_TEXELS


// Returns a 1x1 RGBA texture holding the neutral texel for mapType.
export function createPlaceholderTexture(mapType: PlaceholderMapType): DataTexture {
  const texture = new DataTexture(new Uint8Array(NEUTRAL_TEXELS[mapType]), 1, 1)
  texture.colorSpace = getColorSpace(mapType)
  texture.name = `_${mapType}Placeholder`
  texture.needsUpdate = true
  return texture
}

// export function generateDataTexture(arrayBuffer: Uint8Array, mapType: string): DataTexture {
//   let dataTexture: DataTexture | null = null
//   let resolution: number = 0

//   switch (mapType) {
//     case 'displacementMap':
//       resolution = Math.sqrt(arrayBuffer.length)
//       dataTexture = new DataTexture(arrayBuffer, resolution, resolution, RedFormat, UnsignedByteType)
//       break
//     default:
//       resolution = Math.sqrt(arrayBuffer.length / 4)
//       dataTexture = new DataTexture(arrayBuffer, resolution, resolution)
//   }

//   dataTexture.colorSpace = getColorSpace(mapType)
//   dataTexture.name = `_${mapType}DataTexture`
//   dataTexture.needsUpdate = true

//   return dataTexture
// }

// function _fillArrayBuffer(
//   uint8ArrayBuffer: Uint8Array,
//   r: number = 255,
//   g: number = 255,
//   b: number = 255,
//   a?: number
// ): void {
//   if (typeof a === 'number') {
//     for (let i = 0; i < uint8ArrayBuffer.length; i += 4) {
//       uint8ArrayBuffer[i] = r
//       uint8ArrayBuffer[i + 1] = g
//       uint8ArrayBuffer[i + 2] = b
//       uint8ArrayBuffer[i + 3] = a
//     }
//   }
//   else {
//     for (let i = 0; i < uint8ArrayBuffer.length; i += 3) {
//       uint8ArrayBuffer[i] = r
//       uint8ArrayBuffer[i + 1] = g
//       uint8ArrayBuffer[i + 2] = b
//     }
//   }
// }

// export function generateUint8ArrayBuffer(
//   resolution: number = 1024,
//   mapType: string = 'map'
// ): Uint8Array | null {
//   let uint8Array: Uint8Array | null = null

//   if (!mapType || !mapType.length) return uint8Array as null
//   if (
//     !Number.isInteger(resolution) ||
//     resolution <= 0 ||
//     (resolution & (resolution - 1)) !== 0
//   ) return null

//   uint8Array = new Uint8Array(resolution)

//   switch (mapType) {
//     case 'bumpMap':
//     case 'displacementMap':
//       uint8Array.fill(0)
//       break
//     case 'clearcoatNormalMap':
//     case 'normalMap':
//       _fillArrayBuffer(uint8Array, 128, 128, 255, 255)
//       break
//     case 'map':
//     case 'clearcoatMap':
//     case 'clearcoatRoughnessMap':
//     case 'roughnessMap':
//     case 'transmissionMap':
//     default:
//       _fillArrayBuffer(uint8Array, 255, 255, 255, 255)
//   }

//   return uint8Array as Uint8Array
// }