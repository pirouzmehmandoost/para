export const EPSILON_10e2: number = 10e-2 // 0.1
export const EPSILON_10e3: number = 10e-3 // 0.01
export const EPSILON_3e3: number = 3e-3 // 0.003
export const EPSILON_10e4: number = 10e-4 // 0.001
export const EPSILON_1e7: number = 1e-7 // 0.0000001 

export function validateNumberArray(value: unknown): value is number[] {
  if (!Array.isArray(value) || value.length !== 3) return false
  for (let i = 0; i < 3; i++) {
    const item = value[i]
    if (
      typeof item !== 'number' ||
      Number.isNaN(item) ||
      item === Infinity ||
      item === -Infinity
    ) return false
  }
  return true
}

// Returns true if a string is a valid texture map type.
// Compared against all known texture map types for all Materials.
export function validateTextureMapType(mapType: string): boolean {
  switch (mapType) {
    case 'alphaMap':
    case 'anisotropyMap':
    case 'aoMap':
    case 'bumpMap':
    case 'clearcoatMap':
    case 'clearcoatNormalMap':
    case 'clearcoatRoughnessMap':
    case 'diffuseRoughnessMap':
    case 'displacementMap':
    case 'emissiveMap':
    case 'envMap':
    case 'iridescenceMap':
    case 'iridescenceThicknessMap':
    case 'lightMap':
    case 'map':
    case 'metalnessMap':
    case 'normalMap':
    case 'roughnessMap':
    case 'sheenColorMap':
    case 'sheenRoughnessMap':
    case 'specularColorMap':
    case 'specularIntensityMap':
    case 'thicknessMap':
    case 'transmissionMap':
      return true
  }
  return false
}

// Returns true if a number is a valid integer between 0 and 255.
// Used to validate color channel values before modifying elements of a Uint8Array.
export const validate8BitChannelValue = (value: number): boolean =>
  (Number.isInteger(value) && (value >= 0 && value <= 255))

// Returns true for integer values 512, 1024, 2048, or 4096.
export const validateTextureResolution = (value: number): boolean => {
  if (!Number.isInteger(value)) return false
  switch(value) {
    case 512:
    case 1024:
    case 2048:
    case 4096:
      return true
    default:
      return false
  }
}