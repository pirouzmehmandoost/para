import * as THREE from 'three';
THREE.ColorManagement.enabled = true;


// Uint8Array with pixel data (R, G, B, A for each pixel)
const width = 32;
const height = 32;
const size = width * height;
const diffusedata = new Uint8Array(4 * size);
const roughnessData = new Uint8Array(4 * size);
const bumpData = new Uint8Array(4 * size);
bumpData.fill(0);

for (let i = 0; i < size; i++) {
  const stride = i * 4;
  diffusedata[stride] = 255; // red
  diffusedata[stride + 1] = 255; // green
  diffusedata[stride + 2] = 255; // blue
  diffusedata[stride + 3] = 255; // alpha (opacity)

  roughnessData[stride] = 255; // red
  roughnessData[stride + 1] = 255; // green
  roughnessData[stride + 2] = 255; // blue
  roughnessData[stride + 3] = 255; // alpha (opacity)
}
const _scratchDiffuseTexture = new THREE.DataTexture(diffusedata, width, height);
_scratchDiffuseTexture.name = '_scratchDiffuseTexture';
_scratchDiffuseTexture.colorSpace = THREE.SRGBColorSpace;
_scratchDiffuseTexture.needsUpdate = true;

const _scratchRoughnessTexture = new THREE.DataTexture(roughnessData, width, height);
_scratchRoughnessTexture.name = '_scratchRoughnessTexture';
_scratchRoughnessTexture.colorSpace = THREE.NoColorSpace;
_scratchRoughnessTexture.needsUpdate = true;

const _scratchBumpTexture = new THREE.DataTexture(bumpData, width, height);
_scratchBumpTexture.name = '_scratchBumpTexture';
_scratchBumpTexture.colorSpace = THREE.NoColorSpace;
_scratchBumpTexture.needsUpdate = true;

export const materialConfig = {
  color: '#2f2f2f',
  flatShading: false,
  ior: 1.5,
  reflectivity: 0.3,
  roughness: 0.8,
  side: THREE.DoubleSide,
  map: _scratchDiffuseTexture,
  roughnessMap: _scratchRoughnessTexture,
  bumpMap: _scratchBumpTexture,
};