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
            imgUrls = {},
            name,
            price,
            colors,
        } = {},
    } = props;

    const [increment, setIncrement] = useState(0);
    const setSelection = useSelection((state) => state.setSelection);
    const flattenedUrls = Object.values(imgUrls).flat();
    const imgColorKeys = Object.keys(imgUrls).flat();

    // console.log("hoverImgUrls")
    // console.table(colorKeys)

    const tailWindColor = (col) => {
        const cssColor = col.toLowerCase();

        if (cssColor.includes("white")) return "bg-slate-100";
        if (cssColor.includes("black")) return "bg-slate-950";
        else return "bg-lime-200"
    };

    return (
        < div
            // maybe make bg-transparent and remove backdrop styling.
            //1920x1080 images (16:9) aspect ratio. 1920/2.5=768
            className="w-full h-full flex flex-col backdrop-blur-3xl backdrop-brightness-100"
        >
            <div className="flex items-end">

                <div className="relative flex flex-row justify-center items-center">
                    <KeyboardArrowLeftIcon
                        className="absolute left-1 z-10 self-center"
                        onClick={() => { increment <= 0 ? setIncrement(flattenedUrls.length - 1) : setIncrement(increment - 1) }}
                    />
                    <Link
                        onMouseEnter={() => setIncrement(1)}
                        onMouseLeave={() => setIncrement(0)}
                        onClick={() => setSelection(data)}
                        href="/shop/product"
                        rel="noopener noreferrer"
                    >
                        <Image
                            priority
                            className="bg-cover overflow-auto w-auto h-auto "
                            // loading="lazy"
                            // src={imgUrls[`${hoverImgUrls[increment % 2]}`][0]}
                            src={flattenedUrls[increment]}
                            width={768}
                            height={432}
                            quality={100}
                            alt={name}
                        />
                    </Link>
                    <KeyboardArrowRightIcon
                        className="absolute right-1 z-10 self-center"
                        onClick={() => { increment < flattenedUrls.length - 1 ? setIncrement(increment + 1) : setIncrement(0) }}
                    />
                </div>

                <div className="absolute w-full flex flex-row items-center justify-evenly items-end mb-3">
                    {
                        colors.map((c) => {
                            return (
                                <div
                                    key={c}
                                    className={`${tailWindColor(c)} w-3 h-3 border-solid border-clay_dark border-2 rounded-full`} >
                                </div>
                            )
                        })
                    }
                </div>

            </div>

            <div className="w-full text-center" >
                <p> {name} </p>
                <p> {price} </p>
            </div>
        </div >
    );
};

export default ProductCard;