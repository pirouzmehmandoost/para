"use client";

import { useState } from 'react';

import Image from 'next/image'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import useSelection from '../../store/selection';
import ShopFooter from "./../../components/ShopFooter"

export default function ProductViewer() {

    const selection = useSelection(state => state.selection)

    const [increment, setIncrement] = useState(0)

    const {
        imgUrl,
        imgUrl: [mainImage, ...rest],
        name,
        price,
        modelUrl,
    } = selection

    return (
        <div
            id="product_viewer"
            className="w-full h-full flex flex-col relative  bg-transparent justify-between items-center text-center"
        >

            <div>
                <Image
                    className="bg-cover overflow-auto"
                    loading="lazy"
                    src={imgUrl[increment]}
                    width={1920}
                    height={1080}
                    alt={name}
                    quality={100}

                // onClick={ () => { increment == imgUrl.length? setIncrement(0) : setIncrement(increment+1) }}
                />
            </div>

            <div className="flex flex-row justify-between items-center text-center" >
                <KeyboardArrowLeftIcon
                    onClick={() => { increment <= 0 ? setIncrement(imgUrl.length - 1) : setIncrement(increment - 1) }}
                />

                <ThreeDRotationIcon />

                <KeyboardArrowRightIcon
                    onClick={() => { increment < imgUrl.length - 1 ? setIncrement(increment + 1) : setIncrement(0) }}
                />
            </div>

            <div className=" flex flex-column justify-around items-center text-center" >
                <ul>
                    <li><p> Name: {name} </p></li>
                    <li><p> Price: {price} </p></li>
                    <li><p> Model Url: {modelUrl} </p></li>
                    <li><p> Description: This is where a product description will go. </p></li>
                </ul>
            </div>
            <ShopFooter />

        </div>
    )
}