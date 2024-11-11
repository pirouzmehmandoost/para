"use client";

import useSelection from '../store/selection';
import Link from "next/link";
import Image from 'next/image'


const ProductCard = (props) => {

    const {
        data,
        data: {
            imgUrl: [mainImage, ...rest],
            name,
            price,
            productType,
            colors = [],
            modelUrl,
        }
    } = props;

    const setSelection = useSelection((state) => state.setSelection);

    const handleImageClick = (data) => {
        console.log("handleClick() data is: ", data)
        setSelection(data);
    };


    return (
        <div
            // maybe make bg-transparent and remove backdrop styling.
            //1920x1080 images (16:9) aspect ratio. 1920/2.5=768
            className="w-full h-full flex flex-col relative  backdrop-blur-3xl  backdrop-brightness-100 justify-between items-center text-center"
        >
            <div>
                <Link
                    onClick={() => handleImageClick(data)}
                    href="/shop/product"
                    rel="noopener noreferrer"
                // className="border-transparent pl-5 pr-20 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
                >
                    <Image
                        className="bg-cover overflow-auto w-auto h-auto "
                        loading="lazy"
                        src={mainImage}
                        width={768}
                        height={432}
                        quality={100}
                        alt={name}
                    />
                </Link>
            </div>

            <div className="z-10 w-full" >
                <p> {name} </p>
                <p> {colors?.map((color, index) => `${color}${colors?.length > 0 && index !== colors.length - 1 ? ',' : ''} `)} </p>
            </div>
        </div>
    );
};

export default ProductCard;