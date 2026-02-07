import * as THREE from 'three';
THREE.ColorManagement.enabled = true;

export const materialConfig = {
  color: '#2f2f2f',
  flatShading: false,
  reflectivity: 0.3,
  roughness: 0.8,
  side: THREE.DoubleSide,
  specularIntensity: 1,
  specularColor: '#ffffff',
  clearcoat: 0, 
  clearcoatRoughness: 0, 
};