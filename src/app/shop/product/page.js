"use client";

import { useState } from 'react';

import Image from 'next/image'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import useSelection from '../../store/selection';

export default function ProductViewer(  ) {

    const selection = useSelection((state) => state.selection)

    const [ increment, setIncrement] = useState(0)
    
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
        className="w-full h-full flex flex-col relative  backdrop-blur-3xl  backdrop-brightness-100 justify-between items-center text-center"
        >
            <div>
                <Image
                className="bg-cover overflow-auto"
                loading="lazy"
                src={imgUrl[increment]}
                // src={mainImage}
                width={800}
                height={800}
                alt={name}
                // onClick={ () => { increment == imgUrl.length? setIncrement(0) : setIncrement(increment+1) }}
                />
            </div>

            <div className= "flex flex-row items-center text-center" > 
                <KeyboardArrowLeftIcon
                onClick={ () => { increment <= 0 ? setIncrement(imgUrl.length-1) : setIncrement(increment-1) }}
                />

                <ThreeDRotationIcon/>

                <KeyboardArrowRightIcon
                onClick={ () => { increment < imgUrl.length-1? setIncrement(increment+1) : setIncrement(0) }}
                />
            </div>

            <div className= " flex flex-row justify-around items-center text-center" > 
            <p> {increment} </p>
                <p> {name} </p>
                <p> {price} </p>
                <p>Model Url: { modelUrl} </p>
                <p> Description: This is where a descriptin will go. </p>
            </div>
        </div>
    )
}