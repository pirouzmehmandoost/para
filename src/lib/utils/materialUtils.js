import * as THREE from 'three';

export const getColorSpace = (property) => {
  switch (property) {
    case ('map'):
    case ('emissiveMap'):
    case ('specularColorMap'):
    case ('sheenColorMap'):
      return THREE.SRGBColorSpace
    case ('envMap'):
    case ('lightMap'):
      return THREE.LinearSRGBColorSpace
    case ('normalMap'):
    case ('roughnessMap'):
    case ('metalnessMap'):
    case ('aoMap'):
    case ('bumpMap'):
    case ('clearcoatRoughnessMap'):
    case ('displacementMap'):
    default:
      return THREE.NoColorSpace
  }
};
