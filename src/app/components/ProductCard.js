"use client";

import  useSelection from '../store/selection';
import Link from "next/link";
import Image from 'next/image'


export default function ProductCard( props ) {

    const {
        data,
        data: {
            imgUrl: [mainImage, ...rest],
            name,
            price,
            productType,
            modelUrl,
        }
    } = props;

    const setSelection = useSelection((state) => state.setSelection);

    const handleClick = (data) => { 

        console.log("handleClick() data is: ", data)
        
        setSelection(data);
    
    };


    return (
        <div 
        className="w-full h-full flex flex-col relative  backdrop-blur-3xl  backdrop-brightness-100 justify-between items-center text-center"
        >
            <div>
                <Link
                onClick={() => handleClick(data)}
                href="/shop/product"
                rel="noopener noreferrer"
                // className="border-transparent pl-5 pr-20 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
                >
                    <Image
                    className="bg-cover overflow-auto w-auto h-auto "
                    loading="lazy"
                    src={mainImage}
                    width={400}
                    height={600}
                    alt={name}
                    />
                </Link>
            </div>
 
            <div className= "z-10 w-full" > 
                <p> {name} </p>
                <p> {price} </p>
            </div>
        </div>
    )
}