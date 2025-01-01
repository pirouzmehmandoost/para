export const storePolicy = {
  shipping:
    "UPS Express Saver delivery: 2-4 business days, 10 USD. When ordering outside US, taxes and duties are excluded in the product price and local custom fees may apply. Please contact your local customs office for further information.",
  payment:
    "All major payment methods are supported. Card information is encrypted using SSL encryption, which prevents unauthorized access to card details.",
  returns: "",
  customerSupport: {
    email: "pirouzmehmandoost@gmail.com",
    FAQ: {},
  },
};

const matteMaterial = {
  roughness: 1,
  metalness: 0.2,
  ior: 1.5,
  reflectivity: 0.0,
  sheen: 0.7,
  sheenColor: "#333333",
  sheenRoughness: 1,
  flatShading: true,
  specularIntensity: 1.5,
  specularColor: "#333333",
};

const glossMaterial = {
  roughness: 0.25,
  metalness: 1,
  ior: 1.5,
  reflectivity: 0.5,
  sheen: 0.0,
  flatShading: false,
};

export const colorCodes = {
  matte_black: {
    label: "Matte Black",
    hex: "#333333",
    tailwindColor: `bg-slate-900`,
    material: {
      color: "#333333",
      ...matteMaterial,
    },
  },
  gloss_black: {
    label: "Gloss Black",
    hex: "#000000",
    tailwindColor: `bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 to-slate-900`,
    material: {
      color: "#000000",
      ...glossMaterial,
    },
  },
};

const portfolio = {
  products: [
    {
      name: "Oval Bag",
      price: `$${100}`,
      productType: "bag",
      imgUrls: {
        matte_black: [
          "/oval_bag_matte_black_1.png",
          "/oval_bag_matte_black_2.png",
          "/oval_bag_matte_black_3.png",
          "/oval_bag_matte_black_4.png",
        ],
        matte_white: [
          "/oval_bag_matte_white_1.png",
          "/oval_bag_matte_white_2.png",
          "/oval_bag_matte_white_3.png",
          "/oval_bag_matte_white_4.png",
        ],
      },
      autoUpdateMaterial: false,
      sceneData: {
        colorCodes: {
          ...colorCodes.gloss_black.material,
          colorWays: { ...colorCodes },
        },
      },
      modelUrl: "/oval_bag_1.glb",
      description:
        "Product description: Lorem ipsum odor amet, consectetuer adipiscing elit. Mi rhoncus in a class ac convallis pulvinar. Conubia netus tempor nisl euismod justo faucibus bibendum varius porttitor. Nascetur laoreet dolor congue commodo justo auctor id tortor quis. Per porta proin lobortis quam quis libero nec. Laoreet iaculis feugiat praesent cubilia maecenas nostra dolor. Eu dictum suscipit; nibh arcu sollicitudin fringilla aliquet curae arcu.Vulputate class facilisi sodales at ligula dignissim sagittis. Eleifend massa maecenas arcu euismod ante senectus. Nascetur tincidunt himenaeos risus justo consectetur. Inceptos semper ipsum leo donec sodales leo facilisis. Pharetra nisl dictum platea nam ipsum. Porta erat magna congue justo non velit semper elit. Tristique eget elit; gravida cursus sodales commodo nibh. Donec vulputate in et porta lectus convallis elementum posuere. Venenatis interdum lobortis luctus ridiculus mollis donec.Product description: Lorem ipsum odor amet, consectetuer adipiscing elit. Mi rhoncus in a class ac convallis pulvinar. Conubia netus tempor nisl euismod justo faucibus bibendum varius porttitor. Nascetur laoreet dolor congue commodo justo auctor id tortor quis. Per porta proin lobortis quam quis libero nec. Laoreet iaculis feugiat praesent cubilia maecenas nostra dolor. Eu dictum suscipit; nibh arcu sollicitudin fringilla aliquet curae arcu.Vulputate class facilisi sodales at ligula dignissim sagittis. Eleifend massa maecenas arcu euismod ante senectus. Nascetur tincidunt himenaeos risus justo consectetur. Inceptos semper ipsum leo donec sodales leo facilisis. Pharetra nisl dictum platea nam ipsum. Porta erat magna congue justo non velit semper elit. Tristique eget elit; gravida cursus sodales commodo nibh. Donec vulputate in et porta lectus convallis elementum posuere. Venenatis interdum lobortis luctus ridiculus mollis donec.Product description: Lorem ipsum odor amet, consectetuer adipiscing elit. Mi rhoncus in a class ac convallis pulvinar. Conubia netus tempor nisl euismod justo faucibus bibendum varius porttitor. Nascetur laoreet dolor congue commodo justo auctor id tortor quis. Per porta proin lobortis quam quis libero nec. Laoreet iaculis feugiat praesent cubilia maecenas nostra dolor. Eu dictum suscipit; nibh arcu sollicitudin fringilla aliquet curae arcu.Vulputate class facilisi sodales at ligula dignissim sagittis. Eleifend massa maecenas arcu euismod ante senectus. Nascetur tincidunt himenaeos risus justo consectetur. Inceptos semper ipsum leo donec sodales leo facilisis. Pharetra nisl dictum platea nam ipsum. Porta erat magna congue justo non velit semper elit. Tristique eget elit; gravida cursus sodales commodo nibh. Donec vulputate in et porta lectus convallis elementum posuere. Venenatis interdum lobortis luctus ridiculus mollis donec.",
    },
    {
      name: "XL Oval Bag",
      imgUrls: {
        matte_black: [
          "/oval_bag_v8.5_matte_black_1.png",
          "/oval_bag_v8.5_matte_black_2.png",
          "/oval_bag_v8.5_matte_black_3.png",
          "/oval_bag_v8.5_matte_black_4.png",
        ],
        matte_white: [
          "/oval_bag_v8.5_matte_white_1.png",
          "/oval_bag_v8.5_matte_white_2.png",
          "/oval_bag_v8.5_matte_white_3.png",
          "/oval_bag_v8.5_matte_white_4.png",
          "/oval_bag_v8.5_matte_white_5.png",
        ],
      },
      price: `$${100}`,
      productType: "bag",
      autoUpdateMaterial: false,
      sceneData: {
        colorCodes: {
          ...colorCodes.gloss_black.material,
          colorWays: { ...colorCodes },
        },
      },
      modelUrl: "/oval_bag_xl_v2.glb",
      description:
        "Product description: Lorem ipsum odor amet, consectetuer adipiscing elit. Mi rhoncus in a class ac convallis pulvinar. Conubia netus tempor nisl euismod justo faucibus bibendum varius porttitor. Nascetur laoreet dolor congue commodo justo auctor id tortor quis. Per porta proin lobortis quam quis libero nec. Laoreet iaculis feugiat praesent cubilia maecenas nostra dolor. Eu dictum suscipit; nibh arcu sollicitudin fringilla aliquet curae arcu.Vulputate class facilisi sodales at ligula dignissim sagittis. Eleifend massa maecenas arcu euismod ante senectus. Nascetur tincidunt himenaeos risus justo consectetur. Inceptos semper ipsum leo donec sodales leo facilisis. Pharetra nisl dictum platea nam ipsum. Porta erat magna congue justo non velit semper elit. Tristique eget elit; gravida cursus sodales commodo nibh. Donec vulputate in et porta lectus convallis elementum posuere. Venenatis interdum lobortis luctus ridiculus mollis donec.",
    },
    {
      name: "Yoga Mat Strap",
      imgUrls: {
        gunmetal: [
          "/yoga_mat_strap_metallic_perspective_side.png",
          "/yoga_mat_strap_metallic_perspective_top.png",
          "/yoga_mat_strap_metallic_perspective_front.png",
          "/yoga_mat_strap_metallic_perspective_quarter.png",
        ],
        matte_black: [
          "/yoga_mat_strap_top.png",
          "/yoga_mat_strap_front.png",
          "/yoga_mat_strap_side.png",
          "/yoga_mat_strap_quarter.png",
        ],
      },
      price: `$${100}`,
      productType: "fitness",
      autoUpdateMaterial: false,
      sceneData: {
        colorCodes: {
          ...colorCodes.gloss_black.material,
          colorWays: { ...colorCodes },
        },
      },
      modelUrl: "/yoga_mat_strap_for_web2.glb",
      description:
        "Product description: Lorem ipsum odor amet, consectetuer adipiscing elit. Mi rhoncus in a class ac convallis pulvinar. Conubia netus tempor nisl euismod justo faucibus bibendum varius porttitor. Nascetur laoreet dolor congue commodo justo auctor id tortor quis. Per porta proin lobortis quam quis libero nec. Laoreet iaculis feugiat praesent cubilia maecenas nostra dolor. Eu dictum suscipit; nibh arcu sollicitudin fringilla aliquet curae arcu.Vulputate class facilisi sodales at ligula dignissim sagittis. Eleifend massa maecenas arcu euismod ante senectus. Nascetur tincidunt himenaeos risus justo consectetur. Inceptos semper ipsum leo donec sodales leo facilisis. Pharetra nisl dictum platea nam ipsum. Porta erat magna congue justo non velit semper elit. Tristique eget elit; gravida cursus sodales commodo nibh. Donec vulputate in et porta lectus convallis elementum posuere. Venenatis interdum lobortis luctus ridiculus mollis donec.",
    },
    {
      name: "Oval Bag Copy 1",
      imgUrls: {
        matte_white: [
          "/oval_bag_v8.5_matte_white_1.png",
          "/oval_bag_v8.5_matte_white_2.png",
          "/oval_bag_v8.5_matte_white_3.png",
          "/oval_bag_v8.5_matte_white_4.png",
          "/oval_bag_v8.5_matte_white_5.png",
        ],
        matte_black: [
          "/oval_bag_v8.5_matte_black_1.png",
          "/oval_bag_v8.5_matte_black_2.png",
          "/oval_bag_v8.5_matte_black_3.png",
          "/oval_bag_v8.5_matte_black_4.png",
        ],
      },
      price: `$${100}`,
      productType: "bag",
      autoUpdateMaterial: false,
      sceneData: {
        colorCodes: {
          ...colorCodes.gloss_black.material,
          colorWays: { ...colorCodes },
        },
      },
      modelUrl: "/oval_bag_xl_v2.glb",
      description: "A SMALL BODY OF TEXT",
    },
    {
      name: "Oval Bag Copy 2",
      imgUrls: {
        matte_white: [
          "/oval_bag_v8.5_matte_white_1.png",
          "/oval_bag_v8.5_matte_white_2.png",
          "/oval_bag_v8.5_matte_white_3.png",
          "/oval_bag_v8.5_matte_white_4.png",
          "/oval_bag_v8.5_matte_white_5.png",
        ],
        matte_black: [
          "/oval_bag_v8.5_matte_black_1.png",
          "/oval_bag_v8.5_matte_black_2.png",
          "/oval_bag_v8.5_matte_black_3.png",
          "/oval_bag_v8.5_matte_black_4.png",
        ],
      },
      price: `$${100}`,
      productType: "bag",
      autoUpdateMaterial: false,
      sceneData: {
        colorCodes: {
          ...colorCodes.gloss_black.material,
          colorWays: { ...colorCodes },
        },
      },
      modelUrl: "/oval_bag_xl_v2.glb",
      description:
        "Product description: Lorem ipsum odor amet, consectetuer adipiscing elit. Mi rhoncus in a class ac convallis pulvinar. Conubia netus tempor nisl euismod justo faucibus bibendum varius porttitor. Nascetur laoreet dolor congue commodo justo auctor id tortor quis. Per porta proin lobortis quam quis libero nec. Laoreet iaculis feugiat praesent cubilia maecenas nostra dolor. Eu dictum suscipit; nibh arcu sollicitudin fringilla aliquet curae arcu.Vulputate class facilisi sodales at ligula dignissim sagittis. Eleifend massa maecenas arcu euismod ante senectus. Nascetur tincidunt himenaeos risus justo consectetur. Inceptos semper ipsum leo donec sodales leo facilisis. Pharetra nisl dictum platea nam ipsum. Porta erat magna congue justo non velit semper elit. Tristique eget elit; gravida cursus sodales commodo nibh. Donec vulputate in et porta lectus convallis elementum posuere. Venenatis interdum lobortis luctus ridiculus mollis donec.",
    },
  ],
  projects: [
    {
      name: "Gerd",
      bannerUrl: "/oval_bag_v8.5_matte_white_5.png",
      imgUrls: {
        matte_black: [
          "/oval_bag_matte_black_1.png",
          "/oval_bag_matte_black_2.png",
          "/oval_bag_matte_black_3.png",
          "/oval_bag_matte_black_4.png",
        ],
        matte_white: [
          "/oval_bag_matte_white_1.png",
          "/oval_bag_matte_white_2.png",
          "/oval_bag_matte_white_3.png",
          "/oval_bag_matte_white_4.png",
        ],
      },
      sceneData: {
        orthographic: false,
        autoUpdateMaterial: true,
        colorCodes: {
          ...colorCodes.gloss_black.material,
          colorWays: { ...colorCodes },
        },
        modelUrls: [
          "/oval_bag_xl_v2.glb",
          "/oval_bag_3.glb",
          "/oval_bag_1.glb",
        ],
      },
      shortDescription: "A small collection of 3D printed handbags.",
      description:
        "Product description: Lorem ipsum odor amet, consectetuer adipiscing elit. Mi rhoncus in a class ac convallis pulvinar. Conubia netus tempor nisl euismod justo faucibus bibendum varius porttitor. Nascetur laoreet dolor congue commodo justo auctor id tortor quis. Per porta proin lobortis quam quis libero nec. Laoreet iaculis feugiat praesent cubilia maecenas nostra dolor. Eu dictum suscipit; nibh arcu sollicitudin fringilla aliquet curae arcu.Vulputate class facilisi sodales at ligula dignissim sagittis. Eleifend massa maecenas arcu euismod ante senectus. Nascetur tincidunt himenaeos risus justo consectetur. Inceptos semper ipsum leo donec sodales leo facilisis. Pharetra nisl dictum platea nam ipsum. Porta erat magna congue justo non velit semper elit. Tristique eget elit; gravida cursus sodales commodo nibh. Donec vulputate in et porta lectus convallis elementum posuere. Venenatis interdum lobortis luctus ridiculus mollis donec.Product description: Lorem ipsum odor amet, consectetuer adipiscing elit. Mi rhoncus in a class ac convallis pulvinar. Conubia netus tempor nisl euismod justo faucibus bibendum varius porttitor. Nascetur laoreet dolor congue commodo justo auctor id tortor quis. Per porta proin lobortis quam quis libero nec. Laoreet iaculis feugiat praesent cubilia maecenas nostra dolor. Eu dictum suscipit; nibh arcu sollicitudin fringilla aliquet curae arcu.Vulputate class facilisi sodales at ligula dignissim sagittis. Eleifend massa maecenas arcu euismod ante senectus. Nascetur tincidunt himenaeos risus justo consectetur. Inceptos semper ipsum leo donec sodales leo facilisis. Pharetra nisl dictum platea nam ipsum. Porta erat magna congue justo non velit semper elit. Tristique eget elit; gravida cursus sodales commodo nibh. Donec vulputate in et porta lectus convallis elementum posuere. Venenatis interdum lobortis luctus ridiculus mollis donec.Product description: Lorem ipsum odor amet, consectetuer adipiscing elit. Mi rhoncus in a class ac convallis pulvinar. Conubia netus tempor nisl euismod justo faucibus bibendum varius porttitor. Nascetur laoreet dolor congue commodo justo auctor id tortor quis. Per porta proin lobortis quam quis libero nec. Laoreet iaculis feugiat praesent cubilia maecenas nostra dolor. Eu dictum suscipit; nibh arcu sollicitudin fringilla aliquet curae arcu.Vulputate class facilisi sodales at ligula dignissim sagittis. Eleifend massa maecenas arcu euismod ante senectus. Nascetur tincidunt himenaeos risus justo consectetur. Inceptos semper ipsum leo donec sodales leo facilisis. Pharetra nisl dictum platea nam ipsum. Porta erat magna congue justo non velit semper elit. Tristique eget elit; gravida cursus sodales commodo nibh. Donec vulputate in et porta lectus convallis elementum posuere. Venenatis interdum lobortis luctus ridiculus mollis donec.",
    },
    {
      name: "PÍ",
      bannerUrl: "/yoga_mat_strap_metallic_perspective_quarter.png",
      imgUrls: {
        gloss_black: [
          "/yoga_mat_strap_metallic_perspective_side.png",
          "/yoga_mat_strap_metallic_perspective_top.png",
          "/yoga_mat_strap_metallic_perspective_front.png",
          "/yoga_mat_strap_metallic_perspective_quarter.png",
        ],
        matte_black: [
          "/yoga_mat_strap_top.png",
          "/yoga_mat_strap_front.png",
          "/yoga_mat_strap_side.png",
          "/yoga_mat_strap_quarter.png",
        ],
      },
      sceneData: {
        orthographic: false,
        autoUpdateMaterial: true,
        colorCodes: {
          ...colorCodes.gloss_black.material,
          colorWays: { ...colorCodes },
        },
        modelUrls: ["/yoga_mat_strap_for_web2.glb"],
      },
      shortDescription:
        "Connecting my experiences teaching Yoga to product design",
      description:
        "I began teaching Yoga at 19 years old. I quit a year and a half later to focus an internip with a master printmaker during college. I resumed teaching in 2023, 15 years since my last class. My passions tend to project onto one another, and with a growing interest in 3D printing I decided to design a line of fitness accessories beginnng with a strap for carrying my Yoga mat",
    },
  ],
};

export default portfolio;
