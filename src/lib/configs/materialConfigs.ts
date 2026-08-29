// import * as THREE from 'three'
// import { EPSILON_1e7 } from '@utils/animationUtils'
// import { generateDataTexture, generateArrayBuffer } from '@utils/materialUtils'

// const _bumpData = generateArrayBuffer(1024, 'bumpMap') as Uint8Array
// const _diffuseData = generateArrayBuffer(1024, 'map') as Uint8Array
// const _normalData = generateArrayBuffer(1024, 'normalMap') as Uint8Array
// const _roughnessData = generateArrayBuffer(1024, 'roughnessMap') as Uint8Array

// const _bumpMap: THREE.DataTexture = generateDataTexture(_bumpData, 'bumpMap')
// const _map: THREE.DataTexture = generateDataTexture(_diffuseData, 'map')
// const _normalMap: THREE.DataTexture = generateDataTexture(_normalData, 'normalMap')
// const _roughnessMap: THREE.DataTexture = generateDataTexture(_roughnessData, 'roughnessMap')

// const _bumpMap2: THREE.DataTexture = generateDataTexture(_bumpData, 'bumpMap')
// const _map2: THREE.DataTexture = generateDataTexture(_diffuseData, 'map')
// const _roughnessMap2: THREE.DataTexture = generateDataTexture(_roughnessData, 'roughnessMap')

// export const defaultMeshPhysicalMaterialConfig = {
//   bumpMap: _bumpMap2,
//   color: '#2f2f2f',
//   clearcoat: EPSILON_1e7,
//   clearcoatRoughness: 1,
//   flatShading: false,
//   ior: 1.5,
//   map: _map2,
//   roughnessMap: _roughnessMap2,
//   side: THREE.DoubleSide,
// }

// export const materialConfigs = {
//   gloss_black: {
//     bumpScale: 2,
//     clearcoat: EPSILON_1e7,
//     clearcoatRoughness: 1,
//     color: '#101010',
//     flatShading: false,
//     ior: 1.5,
//     name: 'gloss_black',
//     reflectivity: 0.35,
//     roughness: 0.375,
//     side: THREE.DoubleSide,
//     bumpMap: _bumpMap,
//     map: _map,
//     roughnessMap: _roughnessMap,
//   },
//   matte_black: {
//     bumpScale: 2,
//     clearcoat: EPSILON_1e7,
//     clearcoatRoughness: 1,
//     color: '#2c2c2c',
//     flatShading: false,
//     ior: 1.5,
//     name: 'matte_black',
//     reflectivity: 0.35,
//     roughness: 0.75,
//     side: THREE.DoubleSide,
//     bumpMap: _bumpMap,
//     map: _map,
//     roughnessMap: _roughnessMap,
//   },
//   stained_matte_black: {
//     bumpScale: 0.25,
//     clearcoat: EPSILON_1e7,
//     clearcoatRoughness: 1,
//     color: '#2c2c2c',
//     flatShading: false,
//     ior: 1.5,
//     name: 'stained_matte_black',
//     roughness: 0.8,
//     side: THREE.DoubleSide,
//     bumpMap: _bumpMap,
//     map: _map,
//     roughnessMap: _roughnessMap,
//   },
//   ground: {
//     color: '#202020',
//     flatShading: false,
//     name: 'ground',
//     normalScale: new THREE.Vector2(1, -1),
//     roughness: 1,
//     side: THREE.DoubleSide,
//     normalMap: _normalMap
//   }
// }