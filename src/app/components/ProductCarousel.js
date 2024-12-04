'use client';

import portfolio from "../../lib/globals"
import useSelection from '../store/selection';
import ProductCard from "./ProductCard"


const ProductCarousel = () => {
    const selection = useSelection(state => state.selection);
    const { products } = portfolio;
    const {
        name, 
        productType
    } = selection;

    const relatedProducts = products.filter(el=> el.productType === productType && el.name !== name );

    return (
        <div className="relative flex flex-col w-screen h-full bg-neutral-200 justify-between place-items-center">
            <p className="self-start ml-10 text-clay_dark text-3xl my-5"> 
                Related
            </p>
            <div className="flex flex-row w-full h-full text-clay_dark bg-transparent overflow-auto" >
            {
                relatedProducts.map((item, index) => {
                    return <ProductCard key={index} data={item} />
                })
            }
            </div>
        </div>
    );
};

export default ProductCarousel;