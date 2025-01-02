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
        "An exploration of branding and product design as a Yoga instructor.",
      description: `I began teaching Yoga at 19, back in 2008. I had started taking classes shortly after graduating from high school, and like many of my interests it became a short lived obsession. 
        I quit a year and a half later after transferring colleges and leaving my hometown. I didn't return to practicing or teaching until 2023, some 15 years later. Ironically enough I got back into it much in the same way I began, while recovering from an injury.
        I resumed teaching part-time in 2023, 15 years since my last class. About 8 months in I suffered a knee injury that I still have a hard time describing... one day my leg just shot out of its knee joint and nobody, no matter how many emergency room visits I made or MRI's that specialists ordered could tell me why...
        The scans did reveal arthritis in my back and neck though, which doctors 15 years prior said would likely occur subsequent to a car accident that led to discovering Yoga in the first place. 
        Anyway, two months afterward I was crossing a street in Oakland when my knee did it's thing again, except this time I heard a loud snap and fell to the ground. Cars waited for me to crawl out of the way, and I asked a stranger to helped me up. I was in shock, frankly I would't expect anyone to hoist a stranger upright and keep an eye on me until a friend got to the scene. In the past I could jerk my femur back in place and endure a day of pain, but dislocations were occuring more frequently and this time it was stuck. I put in my leave from work in July and was taken to an emergency room for the second time. 
        X-rays in the didn't identify issues, but a third MRI revealed that my meniscus had snapped in multiple spots and flipped itself over. I spent the next month consulting with different surgeons and by great chance one performed a full repair. 
        If you're unfamiliar with meniscus injuries, full repairs aren't common- roughly 3 in 4 meniscus surgeries involve removal of cartilage- the recovery time is longer than removal, and though not guaranteed the procedure does increase your chance of resuming a physically active lifestyle as before.
        
        Anyway, while on leave from work I decided to focus on 3D modeling, printing, and learning about computer graphics by way of WebGL, three.js, and React Three Fiber. My passions tend to project onto one another, and with a growing interest in 3D printing
        I started a designing a line of fitness accessories beginning with a strap for carrying my Yoga mat (I had originally started my project off with a simple handbag design, but decided they belong in their own collection ). While testing aesthetics and printability of various TPU's I started yieldign consistent quality prints with a foaming TPU. 
        Given acceptable levels of hygroscopy, elasticity, abrasion resistance and skin-safeness a printable foam-like material would be perfect for prototyping fitness accessories. At the moment my prototypes are printed witth Colorfabb VarioShore TPU filament, which is intended for prototyping prothetics and orthotics.  
        With the proper print settings the material can achieve the visual likeness and shore-hardness of EVA foam or cork like that of a Yoga support block. As the shore-harness can be controlled to yield prints varying from shore 92A to 82A, from hard plastic to a gel insert. 
        Once I printed the second prototype of a handbag with a pleasing matte-black finish, I turned focus to the Yoga mat holder. 

        I've returned to teaching yoga in the meantime and intend to put this product to work once it's done. The shape is overt yet sleek, denoting my first name initials- branding this is where my skills fall very short. However I based the model on a typographic element in order to extend over the breadth of flat, utilitarian, and pattern-reliant product designs which most fitnesswear brands afford their consumers. 
        Keep eyeing this project, and check out my instagram as I post updates on the design and prototyping process.`,
    },
  ],
};

export default portfolio;
