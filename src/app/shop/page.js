"use client";

import ProductCard from "../components/ProductCard"
import portfolio from "../../lib/globals"


const Shop = () => {
    const { products } = portfolio;

    return (
        // <div className="flex flex-col" >
            <div className="w-full grid grid-cols-2 bg-neutral-200 ">
                {
                    products.map((item, index) => {
                        return <ProductCard key={index} data={item} />
                    })
                }
            </div>
        // </div>
    );
};

export default Shop;
