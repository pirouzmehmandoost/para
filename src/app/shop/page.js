"use client";

import ProductCard from "../components/ProductCard"

const products = [
    {
        name: "oval bag",
        imgUrl: [
            '/oval_bag_blender_matte_white_front.png',
            '/oval_bag_blender_glossy_white_front.png',
            '/oval_bag_blender_matte_black_front.png',
            '/oval_bag_blender_matte_black_quarter.png',
            '/oval_bag_blender_matte_black_top.png',
            '/oval_bag_blender_matte_black_side.png',

        ],
        price: `$ ${100}`,
        productType: "bag",
        styles: ['Matte White', 'Glossy White', 'Matte Black'],
        modelUrl: "/oval_bag_glossy_black.glb"
    },
    {
        name: "XL oval bag",
        imgUrl: [
            '/oval_bag_xl_blender_front.png',
            '/oval_bag_xl_blender_quarter.png',
            '/oval_bag_xl_blender_side.png',
            '/oval_bag_xl_blender_top.png'
        ],
        price: `$ ${100}`,
        productType: "bag",
        styles: 'black',
        modelUrl: "/oval_bag_glossy_black.glb"
    },
    {
        name: "Blob Platform Mary Jane",
        imgUrl: [
            '/poo.png',
            '/textured_mary_jane_front_1400x1400_px.png',
            '/textured_mary_jane_medial_1400x1400_px.png',
            '/textured_mary_jane_top_1400x1400_px.png',
        ],
        price: `$ ${450}`,
        productType: "footwear",
        styles: 'black',
        modelUrl: "/rocky_sandal_web.glb"
    },
    {
        name: "Mary Jane",
        imgUrl: ["/maryJane.png"],
        price: `$ ${450}`,
        productType: "footwear",
        styles: 'black',
        modelUrl: "/rocky_sandal_web.glb"
    },
    {
        name: "Boot Harness",
        imgUrl: ["/boot_harness_top.png"],
        price: `$ ${100}`,
        productType: "accessory",
        styles: 'black',
        modelUrl: ""
    },

];

export default function Shop() {
    return (
        <div
            className="flex flex-col w-full h-full place-items-center items-center justify-around text-center text-clay_dark"
        >
            <p className="text-5xl mb-10">
                Shop.
            </p>

            <div className="grid grid-cols-2 gap 2">
                {
                    products.map((item, index) => {
                        return <ProductCard
                            key={index} data={item} />
                    })
                }
            </div>
        </div>
    );
}
