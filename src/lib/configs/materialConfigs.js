import * as THREE from 'three';
THREE.ColorManagement.enabled = true;

export const materialConfig = {
  bumpScale: 1,
  color: '#2f2f2f',
  flatShading: false,
  ior: 1.5,
  reflectivity: 0.3,
  roughness: 0.8,
  side: THREE.DoubleSide,
};