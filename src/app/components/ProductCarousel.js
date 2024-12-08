'use client';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useState } from "react";
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

    const offset = 10;

    const [increment, setIncrement] = useState(0);
    let relatedProducts = products.filter(el=> el.productType === productType && el.name !== name );
    let header = "Related"

    if (!relatedProducts.length)  {
        relatedProducts = products.filter(el=> el.name !== name );
        header = "See Also"
    }

    const arrowClick = (num) => {
        if (num+increment < 0) setIncrement(offset)
        else if (num+increment > offset) setIncrement(0)
        else setIncrement(num+increment);    
    }

    let translation = `translate-x-${increment}`

    return (
        <div className="relative flex flex-col w-screen h-full bg-neutral-200 justify-between place-items-center">
            <p className="self-start ml-10 text-clay_dark text-3xl my-5"> 
               {header}
            </p>
            <div className="relative flex flex-row w-full h-full text-clay_dark bg-transparent overflow-auto" >
                <KeyboardArrowLeftIcon
                    className="absolute left-1 z-10 self-center cursor-pointer"
                    onClick={()=> arrowClick(-1)}
                />
                <div className={`flex flex-row flex-nowrap overflow-none transition-all duration-1000 ease-in-out ${translation}`}>
                {
                    relatedProducts.map((item, index) => {
                        return <ProductCard key={index} data={item} />
                    })
                }
                </div>
                <KeyboardArrowRightIcon
                    className="absolute right-1 z-10 self-center cursor-pointer"
                    onClick={()=> arrowClick(1)}
                />
            </div>
        </div>
    );
};

export default ProductCarousel;