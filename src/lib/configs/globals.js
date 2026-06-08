export const envImageUrl = '/para_ground_glare_fog.hdr';
export const envColor = '#bcbcbc';
export const projects = [
  {
    UIData: {
      care: 'Hand wash with soap. Avoid contact with solvents containing acetone.',
      description: `Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy.`,
      dimensions: `21.5" x 5" x 14"`,
      displayName: 'Gerd',
      materialSpecs: 'Thermoplastic urethane',
      shortDescription: `A large 3D printed shoulder bag.`,
      weight: '1lb',
    },
    sceneData: {
      animateMaterial: true,
      animatePosition: false,
      animateRotation: true,
      defaultRotationAnimationActive: true,
      fileData: {
        nodeName: 'textured_bag_simplified001',
        url: '/textured_bag.glb'
      },
      groupName: 'Gerd',
      materials: {
        defaultMaterialID: 'stained_matte_black',
        materialIDs: ['stained_matte_black', 'matte_black', 'gloss_black'],
      },
      rotation: { x: 0, y: 0, z: 0 },
      rotationSpeed: 0.3,
      scale: 1,
    },
  },
  {
    UIData: {
      care: 'Hand wash with soap. Avoid contact with solvents containing acetone.',
      description: 'Large enough to fit essentials, small enough second as a table decoration. Lightweight and satisfyingly squishy.',
      dimensions: `16" x 4" x 12"`,
      displayName: 'Sang',
      materialSpecs: 'Thermoplastic urethane',
      shortDescription: 'A small 3D printed shoulder bag.',
      weight: '1lb',
    },
    sceneData: {
      animateMaterial: true,
      animatePosition: false,
      animateRotation: true,
      defaultRotationAnimationActive: true,
      fileData: {
        nodeName: 'sang',
        url: '/sang.glb'
      },
      groupName: 'Sang',
      materials: {
        defaultMaterialID: 'translucent_grey',
        materialIDs: ['translucent_grey', 'matte_black'],
      },
      rotation: { x: 0, y: 0, z: 0 },
      rotationSpeed: 0.45,
      scale: 1,
    },
  },
  {
    UIData: {
      care: 'Hand wash with soap. Avoid contact with solvents containing acetone.',
      description: `A Yoga mat holder with a large handle for easy carrying. Lightweight to allow sitting rolled mats upright, adding sculptural qualities to idle exercise equipment.`,
      dimensions: `21.5" x 5" x 14"`,
      displayName: 'Pí',
      materialSpecs: 'Thermoplastic urethane',
      shortDescription: `A yoga mat holder with a large handle.`,
      weight: '1lb',
    },
    sceneData: {
      animateMaterial: true,
      animatePosition: false,
      animateRotation: true,
      defaultRotationAnimationActive: true,
      fileData: {
        nodeName: 'Yoga_Mat_Strap',
        url: '/yoga_mat_strap.glb'
      },
      groupName: 'Pí',
      materials: {
        defaultMaterialID: 'gloss_black',
        materialIDs: ['gloss_black', 'matte_black'],
      },
      rotation: { x: 0, y: 1, z: 0 },
      rotationSpeed: 0.45,
      scale: 0.8,
    },
  },
];