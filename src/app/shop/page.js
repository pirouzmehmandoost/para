"use client";

import Link from 'next/link'
import ProductCard from "../components/ProductCard"

const products = [
    {
        name: "Textured Mary Jane",
        imgUrl:[
            '/poo.png',
            '/textured_mary_jane_front_1400x1400_px.png',
            '/textured_mary_jane_medial_1400x1400_px.png',
            '/textured_mary_jane_top_1400x1400_px.png',
        ],
        price: `$ ${450}`,
        productType: "footwear",
        modelUrl: "/rocky_sandal_web.glb"
    },
    {
        name: "Rock Bag v3.0",
        imgUrl: ["/rock_tote.png"],
        price: `$ ${100}`,
        productType: "bag",
        modelUrl: '/rock_tote_for_web.glb',
    },

    {
        name: "Rock Bag v2.0",
        imgUrl: ['/rock_bag_v2_white_1400x1400_px.png'],
        price: `$ ${100}`,
        productType: "bag",
        modelUrl: ""
    },
    {
        name: "Rock bag",
        imgUrl: ['/bag.png'],
        price: `$ ${100}`,
        productType: "bag",
        modelUrl: ""
    },
    {
        name: "Stiletto Heel",
        imgUrl: ['/stiletto.png'],
        price: `$ ${450}`,
        productType: "footwear",
        modelUrl: ""
    },
    {
        name: "Mary Jane",
        imgUrl:[ "/maryJane.png"],
        price: `$ ${450}`,
        productType: "footwear",
        modelUrl: "/rocky_sandal_web.glb"
    },
    {
        name: "Boot Harness",
        imgUrl: ["/boot_harness_top.png"],
        price: `$ ${100}`,
        productType: "accessory",
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
