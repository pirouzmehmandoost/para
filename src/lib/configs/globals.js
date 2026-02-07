export const portfolio = {
  projects: [
    {
      name: 'Gerd',
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
      shortDescription: `A large 3D printed shoulder bag.`,
      description: `Large enough to fit over your shoulder and thin enough to carry with comfort. Lightweight and satisfyingly squishy.`,
      details: '',
      dimensions: '',
      sceneData: {
        autoRotate: true,
        autoRotateSpeed: 0.3,
        rotation: 0,
        autoUpdateMaterial: true,
        groupName: 'Gerd',
        materials: {
          defaultMaterialID: 'matte_black',
          materialIDs: ['matte_black', 'gloss_black'],
        },
        fileData: {
          nodeName: 'textured_bag_simplified001',
          url: '/textured_bag.glb'
          // url: '/bag_9_BAT-transformed.glb'
        },
        scale: 0.55,
      },
    },
    // {
    //   name: 'Sang',
    //   imgUrls: {
    //     bannerUrl: '/oval_bag_v8.5_matte_white_5.png',
    //     matte_black: [
    //       '/oval_bag_matte_black_1.png',
    //       '/oval_bag_matte_black_2.png',
    //       '/oval_bag_matte_black_3.png',
    //       '/oval_bag_matte_black_4.png',
    //     ],
    //     matte_white: [
    //       '/oval_bag_matte_white_1.png',
    //       '/oval_bag_matte_white_2.png',
    //       '/oval_bag_matte_white_3.png',
    //       '/oval_bag_matte_white_4.png',
    //     ],
    //   },
    //   shortDescription: 'A textured 3D printed handbag.',
    //   description: 'Large enough to fit essentials, small enough second as a table decoration',
    //   details: '',
    //   dimensions: '',
    //   sceneData: {
    //     autoRotate: true,
    //     autoRotateSpeed: 0.5,
    //     rotation: 0,
    //     autoUpdateMaterial: false,
    //     groupName: 'Sang',
    //     materials: {
    //       defaultMaterialID: 'matte_black',
    //       materialIDs: ['matte_black'],
    //     },
    //     fileData: {
    //       nodeName: 'bag_v3_for_web001',
    //       url: '/bag_v3.5-transformed.glb'
    //     },
    //     scale: 0.6,
    //   },
    // },
    {
      name: 'PÍ',
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
      shortDescription: `A yoga mat holder with a large handle.`,
      description: `A Yoga mat holder with a large handle for easy carrying. Lightweight to allow sitting rolled mats upright, adding sculptural qualities to idle exercise equipment.`,
      details: '',
      dimensions: '',
      sceneData: {
        autoRotate: true,
        autoRotateSpeed: 0.5,
        rotation: 1.0,
        autoUpdateMaterial: false,
        groupName: 'PÍ',
        materials: {
          defaultMaterialID: 'gloss_black',
          materialIDs: ['gloss_black', 'matte_black', 'eggshell'],
        },
        fileData: {
          nodeName: 'Yoga_Mat_Strap',
          url: '/yoga_mat_strap_for_web2.glb'
        },
        scale: 1.05,
      },
    },
  ],
};

export const envImageUrl = '/para_ground_glare_fog.hdr' // kloofendal_misty_morning_puresky_4k.hdr';
export const envColor = '#bcbcbc'; // '#e2e2e2';