"use client";

import Link from 'next/link'
import ProductCard from "../components/ProductCard"

const products = [
    {
        name: "Textured Mary Jane",
        url: "/textured_mary_jane_3_4_view_1400x1400_px.png",
        price: `$ ${450}`,
        productType: "footwear",
    },
    {
        name: "Rock Bag v2.0",
        url: "/rock_bag_v2_white_1400x1400_px.png",
        price: `$ ${100}`,
        productType: "bag",
    },
    {
        name: "Rock bag",
        url: "/bag.png",
        price: `$ ${100}`,
        productType: "bag",
    },
    {
        name: "Stiletto Heel",
        url: "/stiletto.png",
        price: `$ ${450}`,
        productType: "footwear",
    },
    {
        name: "Mary Jane",
        url: "/maryJane.png",
        price: `$ ${450}`,
        productType: "footwear",
    },
    {
        name: "Boot Harness",
        url: "/boot_harness_top.png",
        price: `$ ${100}`,
        productType: "accessory",
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
                            key={index} props={item} />
                    })
                }
            </div>
        </div>
    );
}
