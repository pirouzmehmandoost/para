"use client";

import useSelection from '../store/selection';
import Link from "next/link";
import Image from 'next/image'
import { useState } from "react";


const ProductCard = (props) => {
    const {
        data,
        data: {
            imgUrl: [mainImage, ...rest],
            name,
            price,
        }
    } = props;

    const [isHovered, setIsHovered] = useState(false);
    const setSelection = useSelection((state) => state.setSelection);

    console.log("render ProductCard");

    return (
        < div
            // maybe make bg-transparent and remove backdrop styling.
            //1920x1080 images (16:9) aspect ratio. 1920/2.5=768
            className="w-full h-full flex flex-col relative  backdrop-blur-3xl  backdrop-brightness-100 justify-between items-center text-center"
        >
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Link
                    onClick={() => setSelection(data)}
                    href="/shop/product"
                    rel="noopener noreferrer"
                >
                    <Image
                        className="bg-cover overflow-auto w-auto h-auto "
                        loading="lazy"
                        src={!isHovered ? mainImage : rest[0]}
                        width={768}
                        height={432}
                        quality={100}
                        alt={name}
                    />
                </Link>
            </div>

            <div className="z-10 w-full" >
                <p> {name} </p>
                <p> {price} </p>
            </div>
        </div >
    );
};

export default ProductCard;