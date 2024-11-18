"use client";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import useSelection from '../store/selection';
import Link from "next/link";
import Image from 'next/image'
import { useState } from "react";

const ProductCard = (props) => {
    const {
        data,
        data: {
            imgUrl,
            name,
            price,
        },
    } = props;

    const [increment, setIncrement] = useState(0);
    const setSelection = useSelection((state) => state.setSelection);

    return (
        < div
            // maybe make bg-transparent and remove backdrop styling.
            //1920x1080 images (16:9) aspect ratio. 1920/2.5=768
            className="w-full h-full flex flex-col relative  backdrop-blur-3xl  backdrop-brightness-100 justify-between items-center text-center"
        >
            <div
                onMouseEnter={() => setIncrement(1)}
                onMouseLeave={() => setIncrement(0)}
            >
                <Link
                    onClick={() => setSelection(data)}
                    href="/shop/product"
                    rel="noopener noreferrer"
                >
                    <Image
                        priority
                        className="bg-cover overflow-auto w-auto h-auto "
                        // loading="lazy"
                        src={imgUrl[increment]}
                        width={768}
                        height={432}
                        quality={100}
                        alt={name}
                    />
                </Link>
            </div>

            <div className="flex flex-row justify-between items-center" >
                <KeyboardArrowLeftIcon onClick={() => { increment <= 0 ? setIncrement(imgUrl.length - 1) : setIncrement(increment - 1) }} />
                <KeyboardArrowRightIcon onClick={() => { increment < imgUrl.length - 1 ? setIncrement(increment + 1) : setIncrement(0) }} />
            </div>

            <div className="z-10 w-full" >
                <p> {name} </p>
                <p> {price} </p>
            </div>
        </div >
    );
};

export default ProductCard;