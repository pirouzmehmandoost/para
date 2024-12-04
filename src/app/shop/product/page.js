"use client";

import Image from 'next/image'
import { useState } from "react";
import useSelection from '../../store/selection';
import ProductCarousel from "../../components/ProductCarousel";
 
const ProductViewer = () => {
    let count = 0;
    let numRows = 1;

    const imageGrid = [];
    const selection = useSelection(state => state.selection);
    const [expanded, setExpanded] = useState(false);
    const {
        colors,
        description,
        imgUrls = {},
        name,
        price,
    } = selection;    

    const flattenedUrls = Object.values(imgUrls).flat();

    while (count < flattenedUrls.length) {
        const subArr = [];
        if (numRows % 2 === 0 && flattenedUrls[count]) {
            subArr.push(flattenedUrls[count]);
            count++;
            numRows++;
        }
        else {
            numRows--;
        };

        if (flattenedUrls[count]) {
            subArr.push(flattenedUrls[count]);
            count++;
        };
        imageGrid.push(subArr);
    };


    const tailWindColor = (col) => {
        const cssColor = col.toLowerCase();

        if (cssColor.includes("white")) return "bg-slate-100";
        if (cssColor.includes("black")) return "bg-slate-950"
        else return "bg-lime-200";
    };


    const colorSelectButtons = (
        <div className="flex flex-row">
        {
            colors.map((c) => {
                return (
                    <div
                        key={c}
                        className={`${tailWindColor(c)} w-6 h-6 mx-3 border-solid border-4 rounded-full border-clay_dark cursor-pointer`} >
                    </div>
                )
            })
        }
        </div>
    );


    return (
        // product images
        <div
            id="product_viewer"
            className={`relative flex flex-col w-full bg-neutral-200 h-screen transition-all duration-1000 ease-in-out ${expanded? " translate-y-screen overflow-hidden ": "overflow-auto translate-y-0"}`}  
        >
            <div className="place-self-center" >
            {
                imageGrid.map((images, index) => {
                    return (
                        <div 
                            key={"image_row_" + index} 
                            className="flex flex-row"
                        >
                        {
                            images.map((image, imageIndex) => {
                                return (
                                    <Image
                                        priority
                                        key={`${imageIndex}_${image}`}
                                        className="bg-cover overflow-auto"
                                        src={image}
                                        width={1920}
                                        height={1080}
                                        alt={name}
                                        quality={100}
                                    />
                                )
                            })
                        }
                        </div >
                    )
                })
            }
            </div>

            {/* product menu */}
            < div 
                id="shop_menu"
                className="sticky bottom-0 right-0 w-1/2 place-self-end"
            >
                <div className="flex w-full bottom-0 right-0" >
                    <div className={`w-full z-20 bottom-0 right-0 border-solid border-2 border-clay_dark`} >
                        <div className={`flex flex-col text-clay_dark backdrop-blur-xl backdrop-brightness-150 transition-all duration-500 ease-in-out ${expanded ? "backdrop-opacity-100" : "backdrop-opacity-0"}`} >
                            <div className={`px-6 pt-0 justify-items-center transition-all duration-700 ease-in-out ${expanded ? "overflow-auto max-h-96" : "overflow-hidden max-h-0"}`} >
                                <p  className={`transition-all duration-700 ease-in-out delay-75 ${expanded ? "opacity-100" : "opacity-0"}`} >
                                    {description}
                                    </p>
                            </div>
                            <div className="flex flex-row my-3 max-w-full" >
                                <div
                                    className="justify-items-center basis-1/4 cursor-pointer" >
                                    <p onClick={() => {setExpanded(current => !current)}} >
                                        {name}
                                    </p>
                                </div>
                                <div className=" justify-items-center basis-1/4" >
                                    <p>{price}</p>
                                </div>
                                <div className="justify-items-center basis-1/2" >
                                    {colorSelectButtons}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
            {/* Related products */}
            <ProductCarousel />
        </div >
    );
};

export default ProductViewer;