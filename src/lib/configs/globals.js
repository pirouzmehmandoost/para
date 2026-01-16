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
      care: '',
      sceneData: {
        autoRotate: true,
        autoRotateSpeed: 0.6,
        autoUpdateMaterial: true,
        groupName: 'Gerd',
        materials: {
          defaultMaterialID: 'matte_black',
          materialIDs: ['matte_black', 'gloss_black'],
        },
        fileData: {
          nodeName: 'gerd',
          url: '/bag_9_BAT-transformed.glb'
        },
        rotation: 0,
        scale: 0.6,
      },
    },
    {
      name: 'Sang',
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
      shortDescription: 'A textured 3D printed handbag.',
      description: 'Large enough to fit essentials, small enough second as a table decoration',
      details: '',
      dimensions: '',
      care: '',
      sceneData: {
        autoRotate: true,
        autoRotateSpeed: 1,
        autoUpdateMaterial: false,
        groupName: 'Sang',
        materials: {
          defaultMaterialID: 'matte_black',
          materialIDs: ['matte_black'],
        },
        fileData: {
          nodeName: 'bag_v3_for_web001',
          url: '/bag_v3.5-transformed.glb'
        },
        rotation: 0,
        scale: 0.6,
      },
    },
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
      care: '',
      sceneData: {
        autoRotate: true,
        autoRotateSpeed: 1,
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
        rotation: 1,
        scale: 1,
      },
    },
  ],
};

export const envImageUrl = '/kloofendal_misty_morning_puresky_4k.hdr';
export const envColor = '#bcbcbc';
export const groundConfig = {
  POSITION: [-50, -85, 20],
  ROTATION: [Math.PI / 7, 0, 0],
  SCALE: [1.4, 1, 1.4],
};