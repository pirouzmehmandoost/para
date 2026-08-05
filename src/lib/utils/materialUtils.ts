import { LinearSRGBColorSpace, NoColorSpace, SRGBColorSpace } from 'three';

export function getColorSpace(property: string): string {
  switch (property) {
    case 'map':
    case 'emissiveMap':
    case 'specularColorMap':
    case 'sheenColorMap':
      return SRGBColorSpace;
    case 'envMap':
    case 'lightMap':
      return LinearSRGBColorSpace;
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
    default:
      return NoColorSpace;
  }
}
