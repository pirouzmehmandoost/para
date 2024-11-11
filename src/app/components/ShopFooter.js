"use client";

import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ClearIcon from "@mui/icons-material/Clear";

import useSelection from "../store/selection";

const ShopFooter = () => {

    const [expanded, setExpanded] = useState(false);
    const selection = useSelection(state => state.selection);
    const toggleExpanded = () => setExpanded(current => !current);

    const {
        imgUrl,
        imgUrl: [mainImage, ...rest],
        name,
        price,
        modelUrl,
        colors,
    } = selection;


    const menu = (
        <div
            className={`flex flex-row flex-grow grid text-center  mb-3 text-2xl text-clay_dark `}
        >
            <div className=" flex flex-col justify-around items-center text-center mb-s3 text-2xl">
                <ul>
                    <li><p> {name} </p></li>
                    <li><p> Price: {price} </p></li>
                    <li><p> Model Url: {modelUrl} </p></li>
                    <li><p> Description: This is where a product description will go. </p></li>
                </ul>
            </div>

            <div className=" flex flex-col justify-around items-center text-center" >
                <ul>
                {
                    colors?.map((color) => { <li><p> {color}</p></li> })
                }
                </ul>
            </div> 

        </div>
    );


    const wrapper = (
        <div className={`${expanded ? "backdrop-blur-3xl  backdrop-brightness-150" : ""}`} >
            <div className={`flex flex-row justify-between items-center`}>
                <div
                    className="cursor-pointer"
                    onClick={toggleExpanded}
                >
                    {
                        expanded ?
                            <ClearIcon className=" mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                            :
                            <MenuIcon className="mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                    }
                </div>

                <div className={`flex flex-col px-6 pt-0 overflow-hidden transition duration-0 ${expanded ? "max-h-96" : "max-h-0"}`} >
                    {menu}
                </div>
            </div>
        </div>
    );

    return (
        <div
            id="shop_footer"
            className="w-full ml-12 mt-6 justify-between content-center items-center text-center"
        >
            <div className=" fixed z-20  bottom-0 right-0 border-solid border-2 border-clay_dark" >
               {wrapper}
            </div>
        </div>
    );
}

export default ShopFooter;