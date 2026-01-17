import { create } from 'zustand';
import { DoubleSide, MeshPhysicalMaterial, Color, Vector2, ColorManagement, Cache } from 'three';
// import { FlakesTexture } from 'three/addons/textures/FlakesTexture.js';

ColorManagement.enabled = true;
Cache.enabled = true;

// const normalMap3 = new CanvasTexture(new FlakesTexture());
// normalMap3.wrapS = RepeatWrapping;
// normalMap3.wrapT = RepeatWrapping;
// normalMap3.repeat.x = 10;
// normalMap3.repeat.y = 6;
// normalMap3.anisotropy = 16;

// function createFlakesMaterial() {
//   const flakesImage = new FlakesTexture(); // Generates a canvas element
//   const texture = new CanvasTexture(flakesImage);
  
//   // Optional: configure texture wrapping and color space
//   texture.wrapS = RepeatWrapping;
//   texture.wrapT = RepeatWrapping;
//   texture.repeat.x = 10;
//   texture.repeat.y = 10;
//   // texture.colorSpace = SRGBColorSpace; // May be needed depending on three.js version and renderer settings

//   const material = new MeshPhysicalMaterial({
//       clearcoat: 1.0,
//       clearcoatRoughness: 0.1,
//       metalness: 0.9,
//       roughness: 0.5,
//       color: 0x8418ca, // Example color
//       normalMap: texture, // Use the generated texture as a normal map
//       normalScale: new Vector2(0.15, 0.15),
//   });

//   return material;
// }

// const iridescentMaterial = createFlakesMaterial();

//used for
  // color: 0x0000ff,
  // color: '#ebe2c3',

const matteMaterial = {
  clearcoat: 0,
  clearcoatRoughness: 0.5,
  flatShading: false,
  // ior: 1.5,
  // metalness: 0,
  reflectivity: 0.35,
  roughness: 0.75,
  sheen: 0.1,
  sheenColor: '#000000',
  sheenRoughness: 0.5,
  side: DoubleSide,
  // specularColor: '#ffffff',
  // specularIntensity: 1,
};

const glossMaterial = {
  clearcoat: 0.3,
  clearcoatRoughness: 0.5,
  flatShading: false,
  // ior: 1.5,
  // metalness: 0,
  reflectivity: 0.3,
  roughness: 0.4,
  sheen: 0,
  sheenColor: '#000000',
  sheenRoughness: 0,
  side: DoubleSide,
  // thickness: 10,
};

const groundMaterial = {
  clearcoat: 0,
  clearcoatRoughness: 0,
  flatShading: false,
  // ior: 1.5,
  // metalness: 0,
  reflectivity: 0.4,
  roughness: 1,
  sheen: 0, //0.05,
  sheenColor: '#000000', // envColor,
  sheenRoughness: 0, // 0.5,
  side: DoubleSide,
  // transmission: 0,
  // transparent: false,
  // thickness: 10,
  // opacity: 1,
};

const iridescentMaterial = {
  clearcoat: 0.3,
  clearcoatRoughness: 0.3,
  flatShading: false,
  // ior: 1,
  // iridescence: 1,
  // iridescenceIOR: 2.0,
  // iridescenceThicknessRange: [100,900],
  // metalness: 0.1,
  reflectivity: 0.5,
  roughness: 0.35,
  sheen: 0,
  sheenColor: '#000000',
  sheenRoughness: 0,
  side: DoubleSide,
  // specularColor: '#ffffff',
  // specularIntensity: 0.9,
  // thickness: 10.0,
  // transmission: 1,
  // transparent: true,
  // opacity: 1,
};

const initialState = {
  ground: {
    displayName: 'Ground',
    tailwindColor: `bg-zinc-900`,
    material: new MeshPhysicalMaterial({
        ...groundMaterial,
        color: new Color('#000000'),
        //color: '#101010',
      }),
  },

  matte_black: {
    displayName: 'Matte Black',
    tailwindColor: `bg-radial-[at_35%_35%] from-zinc-500 to-zinc-900 to-65%`,
    material: new MeshPhysicalMaterial({
      ...matteMaterial,
      color: new Color(0x2f2f2f),
      //color: '#2f2f2f',
    }),
  },

  gloss_black: {
    displayName: 'Gloss Black',
    tailwindColor: `bg-radial-[at_40%_35%] from-zinc-500 via-zinc-950 via-37% to-zinc-500 to-100%`,
    material: new MeshPhysicalMaterial({
      ...glossMaterial,
      color: new Color('#000000'),
      // color: '#101010',
    }),
  },

  eggshell: {
    displayName: 'Eggshell',
    tailwindColor: `bg-radial-[at_35%_35%] from-white to-orange-100 to-30%`,
    material: new MeshPhysicalMaterial({
      ...iridescentMaterial,
      color: new Color('#ccc0a3'),
      // color: '#ccc0a3',
    }),
  },
};

const materialStore = (set, get) => ({
  materials: initialState,

  getMaterials: () => get().materials,
  getMaterial: (name) => get().materials[`${name}`],
});

const useMaterial = create(materialStore);

export default useMaterial;
