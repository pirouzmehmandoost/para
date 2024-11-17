"use client";

import { useState } from "react";
import Image from 'next/image'
import MenuIcon from "@mui/icons-material/Menu";
import ClearIcon from "@mui/icons-material/Clear";

import useSelection from "../store/selection";


const ShopMenu = () => {

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
        description,
    } = selection;

    const tailWindColor = (col) => {
        const cssColor = col.toLowerCase();

        if (cssColor.includes("white")) return "bg-slate-100";
        if (cssColor.includes("black")) return "bg-slate-950";
        else return "bg-lime-200"
    }


    const descriptionSection = (
        <div
            className={`flex flex-col flex-grow mb-3 text-xl text-clay_dark `}
        >
            <div className=" flex flex-col mb-3">
                <ul>
                    <li><p> {description} </p></li>
                </ul>
            </div>
        </div>
    )


    const colorSelection = (
        <div className=" flex flex-row" >
            <p>quantity:</p>
            {
                colors.map((c, index) => {
                    return (
                        <div
                            key={index}
                            className={`${tailWindColor(c)} w-5 h-5  mx-5 border-solid border-4 rounded-full border-clay_dark`} >
                        </div>
                    )
                })
            }
        </div>
    )

    const wrapper = (
        <div className={`${expanded ? "backdrop-blur-3xl  backdrop-brightness-150" : ""}`} >
            <div className={`flex flex-row justify-between items-center text-center text-clay_dark "cursor-pointer`}>
                <div
                >
                    <div className={`flex flex-col px-6 pt-0 overflow-hidden transition duration-0 ${expanded ? "max-h-full" : "max-h-0"}`} >
                        {descriptionSection}
                    </div>

                    {
                        expanded ?
                            <ClearIcon className=" mx-5 text-clay_dark" onClick={toggleExpanded}
                            />
                            :
                            <MenuIcon className="mx-5 text-clay_dark" onClick={toggleExpanded}
                            />
                    }
                </div>

                <p> {name} </p>
                <p> {price} </p>
                {colorSelection}


            </div>
        </div>
    );

    return (
        <div
            id="shop_menu"
            className="w-full ml-12 mt-6 justify-between content-center items-center text-center"
        >
            <div className=" fixed z-20  bottom-0 right-0 border-solid border-2 border-clay_dark" >
                {wrapper}
            </div>
        </div>
    );
}

export default ShopMenu;