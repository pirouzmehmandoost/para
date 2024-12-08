"use client";

import Image from 'next/image'
import { useState } from "react";
import useSelection from '../../store/selection';
import ProductCarousel from "../../components/ProductCarousel";
import Menu from "../../components/Menu"
 
const ProductViewer = () => {
    let count = 0;
    let numRows = 1;

    const imageGrid = [];
    const selection = useSelection(state => state.selection);
    const [expanded, setExpanded] = useState(false);
    const {
        imgUrls = {},
        name,
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

    return (
// product images
        <div
            id="product_viewer"
            className={`relative flex flex-col w-full bg-neutral-200 h-screen transition-all duration-1000 ease-in-out ${expanded? "overflow-hidden ": "overflow-auto"}`}  
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
            <Menu
                expanded={expanded}
                setExpanded={()=> {setExpanded(current => !current)}}
            />
        
{/* Related products */}
            <ProductCarousel />
        </div >
    );
};

export default ProductViewer;