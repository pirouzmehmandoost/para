"use client";

import ProductCard from "../components/ProductCard"
import portfolio from "../../lib/globals"


const Shop = () => {
    const { products } = portfolio;

    return (
        <div className="flex flex-col w-full h-full place-items-center items-center justify-around text-center text-clay_dark bg-transparent" >
            <h2 className="text-5xl mb-10">
                This is the Shop
            </h2>
            <div className="grid grid-cols-2 gap 2">
                {
                    products.map((item, index) => {
                        return <ProductCard key={index} data={item} />
                    })
                }
            </div>
        </div>
    );
};

export default Shop;
