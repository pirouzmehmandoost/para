"use client";

import Link from "next/link";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ClearIcon from "@mui/icons-material/Clear";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
// import useSelection from "../store/selection";


const NavBar = () => {

    const [searchQuery, setsearchQuery] = useState("invisible");


    const searchBar = (
        <div className="flex flex-row flex-grow grid text-center text-2xl text-clay_dark mt-5 mb-0" >
            <input
                type="text"
                id="search_input"
                className="text-center bg-transparent border-b border-clay_dark focus:outline-none placeholder-clay_dark"
                placeholder="Search Products"
                required
            />
        </div>
    );

    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => setExpanded(current => !current);

    const leftContent = (
        <div className="flex flex-row">
            <Link
                className="cursor-pointer border-transparent pl-5 pr-20 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
                href="/"
                rel="noopener noreferrer"
                onClick={() => setExpanded(false)}
            >
                <h2>Pirouz Mehmandoost</h2>
            </Link>

            <Link
                className=" self-center border-transparent transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
                href="/shop"
                rel="noopener noreferrer"
                onClick={() => setExpanded(false)}
            >
                <ShoppingBagIcon className="cursor-pointer mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
            </Link>
        </div >
    );

    const menu = (
        <div className="flex flex-col flex-grow grid text-center" >
            {/* <div className="mt-5 mb-0"> */}
            {searchBar}
            {/* </div> */}

            <div
                className="mb-3"
                onClick={toggleExpanded}
            >
                <Link
                    href="/shop"
                    className="border border-transparent py-5 transition-colors hover:text-gray-500"
                    rel="noopener noreferrer"
                >
                    <h2 >Projects</h2>
                </Link>

                <Link
                    href="/shop"
                    className="border border-transparent py-5 transition-colors hover:text-gray-500"
                    rel="noopener noreferrer"
                >
                    <h2>Shop</h2>
                </Link>
            </div>
        </div>
    );


    const wrapper = (
        // const reset = useSelection((state) => state.reset)
        <div
            className={`${expanded ? "backdrop-blur-3xl  backdrop-brightness-150" : ""}`}
        >
            <div className={`flex flex-row justify-between`}>

                {leftContent}

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
            </div>

            <div className={`flex flex-col px-6 pt-0 overflow-hidden transition-[max-height] duration-0 ease-in ${expanded ? "max-h-96" : "max-h-0"}  self-center`}>
                {menu}
            </div>
        </div>
    );


    return (
        <div
            id="nav_bar"
            className="relative h-full w-full justify-between content-center items-center text-center self-center text-2xl text-clay_dark"
        >
            <div className="fixed ml-5 my-5 z-10 border-solid border-2 border-clay_dark">
                {wrapper}
            </div>
        </div>
    );
}

export default NavBar;