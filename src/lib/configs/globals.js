import { getSlugFromName } from '@utils/slug';

export const projects = [
  {
    UIData: {
      care: 'Hand wash with soap, air dry. Avoid contact with solvents containing acetone.',
      description: `Gerd can be worn over a shoulder or held by the handle. It's slim profile and elastic properties conform to your body. To open the bag, press your fingers through the opening crease and spread them wide. The closure returns to its original form upon removal.`,
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
        nodeName: 'closed_bag_for_web',
        url: '/closed_bag.glb'
      },
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
      care: 'Hand wash with soap, air dry. Avoid contact with solvents containing acetone.',
      description: `Uglúk u bagronk sha pushdug Saruman-glob búb-hosh skai.`,
      dimensions: `14" x 3" x 8"`,
      displayName: 'Glob',
      materialSpecs: 'Thermoplastic urethane',
      shortDescription: `A handbag for stowing the essentials.`,
      weight: '0.25lb',
    },
    sceneData: {
      animateMaterial: true,
      animatePosition: false,
      animateRotation: true,
      defaultRotationAnimationActive: true,
      fileData: {
        nodeName: 'bean_bag_for_web',
        url: '/bean_bag.glb'
      },
      materials: {
        defaultMaterialID: 'gloss_black',
        materialIDs: ['gloss_black', 'matte_black', 'translucent_grey'],
      },
      rotation: { x: 0, y: 0, z: 0 },
      rotationSpeed: 0.3,
      scale: 0.8,
    },
  },
  {
    UIData: {
      care: 'Hand wash with soap, air dry. Avoid contact with solvents containing acetone.',
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

const _projectsByNodeName = Object.fromEntries(
  projects.map((project) => [project.sceneData.fileData.nodeName, project])
);

const _projectsBySlug = Object.fromEntries(
  projects.map((project) => [getSlugFromName(project.UIData.displayName), project])
);

export const getProjectByNodeName = (nodeName) => _projectsByNodeName[nodeName] ?? null;
export const getProjectBySlug = (slug) => _projectsBySlug[slug] ?? null;
