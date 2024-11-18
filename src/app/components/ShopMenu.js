"use client";

import { useState } from "react";
import useSelection from "../store/selection";
// import useCartStore from "../store/cart";

const ShopMenu = () => {

    const [expanded, setExpanded] = useState(false);
    const selection = useSelection(state => state.selection);

    const toggleExpanded = () => setExpanded(current => !current);

    const {
        name,
        price,
        colors,
        description,
    } = selection;

    const tailWindColor = (col) => {
        const cssColor = col.toLowerCase();

        if (cssColor.includes("white")) return "bg-slate-100";
        if (cssColor.includes("black")) return "bg-slate-950";
        else return "bg-lime-200"
    };


    const colorSelection = (
        <div className="flex flex-row">
            {
                colors.map((c) => {
                    return (
                        <div
                            key={c}
                            className={`${tailWindColor(c)} w-6 h-6 mx-3 border-solid border-4 rounded-full border-clay_dark cursor-pointer`} >
                        </div>
                    )
                })
            }
        </div>
    );


    const wrapper = (
        <div className={` flex flex-col text-clay_dark backdrop-blur-xl backdrop-brightness-150 ${expanded ? "bg-slate-100" : ""}`} >
            <div className={`px-6 pt-0 items-start overflow-hidden transition duration-100 ease-in-out ${expanded ? "max-h-full" : "max-h-0"}`} >
                {description}
            </div>

            <div className=" flex flex-row place-content-around my-3 max-w-full" >
                <div
                    className=" basis-1/4 cursor-pointer"
                    onClick={toggleExpanded}>
                    <p>{name}</p>
                </div>
                <div className="basis-1/4">
                    <p>{price}</p>
                </div>
                <div className="basis-1/2">
                    {colorSelection}
                </div>
            </div>
        </div>
    );


    return (
        <div
            id="shop_menu"
            className=" max-w-full ml-12 mb-10 justify-between content-center items-center text-center"
        >
            <div className=" w-1/2 fixed z-20  bottom-0 right-0 border-solid border-2 border-clay_dark" >
                {wrapper}
            </div>
        </div>
    );
}

export default ShopMenu;