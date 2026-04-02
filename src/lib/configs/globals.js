export const envImageUrl = '/para_ground_glare_fog.hdr';
export const envColor = '#bcbcbc';
export const portfolio = {
  projects: [
    {
      displayName: 'Gerd',
      productData: {
        care: 'Hand wash with soap. Avoid contact with solvents containing acetone.',
        description:
        `Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy. 
          Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy.`,
        dimensions:  `21.5 x 5" x 14"`,
        imgUrls: {
          bannerUrl: '/oval_bag_v8.5_matte_white_5.png',
          matte_black: [
            '/oval_bag_matte_black_1.png',
            '/oval_bag_matte_black_2.png',
            '/oval_bag_matte_black_3.png',
            '/oval_bag_matte_black_4.png',
          ],
          matte_white: [
            '/oval_bag_matte_white_1.png',
            '/oval_bag_matte_white_2.png',
            '/oval_bag_matte_white_3.png',
            '/oval_bag_matte_white_4.png',
          ],
        },
        materialSpecs: 'Thermoplastic urethane',
        shortDescription: `A large 3D printed shoulder bag.`,
        weight: '1lb',
      },
      sceneData: {
        animateMaterial: true,
        animatePosition: false,
        animateRotation: true,
        fileData: {
          nodeName: 'textured_bag_simplified001',
          url: '/textured_bag.glb'
        },
        groupName: 'Gerd',
        materials: {
          defaultMaterialID: 'stained_matte_black',
          materialIDs: ['stained_matte_black', 'matte_black', 'gloss_black'],
        },
        rotation: 0,
        rotationSpeed: 0.3,
        scale: 1,
      },
    },
    {
      displayName: 'Sang',
      productData: {
        care: 'Hand wash with soap. Avoid contact with solvents containing acetone.',
        description: 'Large enough to fit essentials, small enough second as a table decoration. Lightweight and satisfyingly squishy.',
        dimensions:  `16 x 4" x 12"`,
        imgUrls: {
          bannerUrl: '/oval_bag_v8.5_matte_white_5.png',
          matte_black: [
            '/oval_bag_matte_black_1.png',
            '/oval_bag_matte_black_2.png',
            '/oval_bag_matte_black_3.png',
            '/oval_bag_matte_black_4.png',
          ],
          matte_white: [
            '/oval_bag_matte_white_1.png',
            '/oval_bag_matte_white_2.png',
            '/oval_bag_matte_white_3.png',
            '/oval_bag_matte_white_4.png',
          ],
        },
        materialSpecs: 'Thermoplastic urethane',
        shortDescription: 'A small 3D printed shoulder bag.',
        weight: '1lb',
      },
      sceneData: {
        animateMaterial: true,
        animatePosition: false,
        animateRotation: true,
        fileData: {
          nodeName: 'sang',
          url: '/sang.glb'
        },
        groupName: 'Sang',
        materials: {
          defaultMaterialID: 'matte_black',
          materialIDs: ['matte_black', 'translucent_grey'],
        },
        rotation: 0,
        rotationSpeed: 0.45,
        scale: 1,
      },
    },
    {
      displayName: 'Pí',
      productData: {
        care: 'Hand wash with soap. Avoid contact with solvents containing acetone.',
        description: `A Yoga mat holder with a large handle for easy carrying. Lightweight to allow sitting rolled mats upright, adding sculptural qualities to idle exercise equipment.`,
        dimensions:  `21.5 x 5" x 14"`,
        imgUrls: {
          bannerUrl: '/yoga_mat_strap_metallic_perspective_quarter.png',
          gloss_black: [
            '/yoga_mat_strap_metallic_perspective_side.png',
            '/yoga_mat_strap_metallic_perspective_top.png',
            '/yoga_mat_strap_metallic_perspective_front.png',
            '/yoga_mat_strap_metallic_perspective_quarter.png',
          ],
          matte_black: [
            '/yoga_mat_strap_top.png',
            '/yoga_mat_strap_front.png',
            '/yoga_mat_strap_side.png',
            '/yoga_mat_strap_quarter.png',
          ],
        },
        materialSpecs: 'Thermoplastic urethane',
        shortDescription: `A yoga mat holder with a large handle.`,
        weight: '1lb',
      },
      sceneData: {
        animateMaterial: true,
        animatePosition: false,
        animateRotation: true,
        fileData: {
          nodeName: 'Yoga_Mat_Strap',
          url: '/yoga_mat_strap.glb'
        },
        groupName: 'Pí',
        materials: {
          defaultMaterialID: 'translucent_grey',
          materialIDs: ['translucent_grey', 'gloss_black', 'matte_black'],
        },
        rotation: 1.0,
        rotationSpeed: 0.45,
        scale: 0.8,
      },
    },
  ],
};