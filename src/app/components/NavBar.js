"use client";

import Link from "next/link";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ClearIcon from "@mui/icons-material/Clear";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchBar from "./SearchBar";
// import useSelection from "../store/selection";


export default function NavBar() {
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => setExpanded(current => !current);

    const LeftContent = () => {
        return (
            <div className="flex flex-row cursor-pointer items-baseline">
                <Link
                    href="/"
                    className="border-transparent pl-5 pr-20 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
                    rel="noopener noreferrer"
                    onClick={() => setExpanded(false)}
                >
                    <h2>Pirouz Mehmandoost</h2>
                </Link>

                <Link
                    href="/shop"
                    className="border-transparent transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
                    rel="noopener noreferrer"
                    onClick={() => setExpanded(false)}
                >
                    <ShoppingBagIcon className=" mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                </Link>
            </div >
        )
    };

    const Menu = () => {
        return (
            <div className="flex flex-col flex-grow grid text-center" >
                <div className="mt-5 mb-0">
                    <SearchBar />
                </div>
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
    };


    const Wrapper = () => {
        // const reset = useSelection((state) => state.reset)

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
                                <ClearIcon className=" mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                                :
                                <MenuIcon className="mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                        }
                    </div>
                </div>

                <div
                    className={`flex flex-col px-6 pt-0 overflow-hidden transition-[max-height] duration-75 ease-in ${expanded ? "max-h-96" : "max-h-0"}`}
                >
                    <Menu />
                </div>
            </div>
        );
    };


    return (
        <div
            id="nav_bar"
            className="w-full ml-12 mt-6 justify-between content-center items-center text-center text-2xl text-clay_dark "
        >
            <div className="fixed z-10 border-solid border-2 border-clay_dark">
                <Wrapper />
            </div>
        </div>
    );
}
