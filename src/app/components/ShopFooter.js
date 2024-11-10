"use client";

import Link from "next/link";
import { useState } from "react";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import useSelection from "../store/selection";


export default function ShopFooter() {

    const [expanded, setExpanded] = useState(false);
    const selection = useSelection(state => state.selection);
    const toggleExpanded = () => setExpanded(current => !current);
    const { name, colors } = selection;


    const LeftContent = () => {

        return (
            <div className="flex flex-row text-center text-2xl text-clay_dark cursor-pointer justify-between" >

                <h2 className="mb-3 text-2xl">FOOTER</h2>
                <h2>Name is: {name}</h2>

            </div >
        )
    };


    const Menu = () => {

        return (
            <div
                className={`flex flex-col flex-grow grid text-center text-2xl`}
            >

                <h2>Name is: {name}</h2>
                <h2 className="mb-3 text-2xl">{colors}</h2>

            </div>
        );
    };



    const Wrapper = () => {

        return (
            <div
                className={`${expanded ? "backdrop-blur-3xl  backdrop-brightness-150" : ""}`}
            >
                <div className={`flex flex-row justify-between items-center`}>

                    <LeftContent />

                    <div
                        className="cursor-pointer"
                        onClick={toggleExpanded}
                    >
                        {
                            expanded ?
                                <div className=" mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                                :
                                <div className="mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                        }
                    </div>
                </div>

                <div
                    className={`flex flex-col px-6 pt-0 overflow-hidden transition-[max-height] duration-75 ease-in ${expanded ? "max-h-96" : "max-h-0"}`}
                >
                    <Menu />

                    <h1>test </h1>
                </div>
            </div>
        );
    };


    return (
        <div
            id="shop_footer"
            className=" ml-12 justify-between content-center items-center text-center "
        >
            <div className=" fixed z-20  bottom-0 right-0 border-solid border-2 border-clay_dark" >
                <Wrapper />
            </div>
        </div>
    );
}
