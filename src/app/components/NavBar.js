"use client";

import Link from "next/link";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ClearIcon from "@mui/icons-material/Clear";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
// import useSelection from "../store/selection";


const NavBar = () => {

    const [searchQuery, setsearchQuery] = useState("invisible");
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => setExpanded(current => !current);

    const menu = (
        <div className="flex flex-col flex-grow" >

            <div className="self-center mt-6" >
                <input
                    type="text"
                    id="search_input"
                    className="w-full text-center bg-transparent border-b border-clay_dark focus:outline-none placeholder-clay_dark"
                    placeholder="Search Products"
                    required
                />
            </div>

            <div
                className="mb-3"
                onClick={toggleExpanded}
            >
                <Link
                    href="/shop"
                    className="border border-transparent py-4 transition-colors hover:text-gray-500"
                    rel="noopener noreferrer"
                >
                    <h2>Projects</h2>
                </Link>

                <Link
                    href="/shop"
                    className="border border-transparent py-4 transition-colors hover:text-gray-500"
                    rel="noopener noreferrer"
                >
                    <h2>Shop</h2>
                </Link>
            </div>
        </div>
    );


    return (
        <div
            id="nav_bar"
            className="fixed ml-5 my-5 z-10 top-0 left-0 w-1/4 "
        >
            <div className= "flex min-w-fit flex-nowrap max-w-full justify-evenly items-center text-center text-xl text-clay_dark border-solid border-2 border-clay_dark" >
                <div className={`flex flex-col w-full transition-all duration-700 ease-in-out ${expanded ? "backdrop-blur-3xl  backdrop-brightness-150" : ""}`} >
                    <div className={`flex flex-nowrap flex-row justify-between`}>
                        <div className="self-center ml-5 mr-10">
                            <Link
                                className="border-transparent transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
                                href="/"
                                rel="noopener noreferrer"
                                onClick={() => setExpanded(false)}
                            >
                                <h2 className="text-2xl text-nowrap cursor-pointer"> Pirouz Mehmandoost</h2>
                            </Link>
                        </div >
                        <div className="self-center">
                            <Link
                                className="flex self-center align-items-center border-transparent"
                                href="/shop"
                                rel="noopener noreferrer"
                                onClick={() => setExpanded(false)}
                            >
                                <ShoppingBagIcon className=" self-center cursor-pointer mx-5 transition-colors duration-700 ease-in-out hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                            </Link>
                        </div>
                        <div
                            className="flex self-center mr-5 transition-colors duration-700 ease-in-out hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
                            onClick={toggleExpanded}
                        >
                        {
                            expanded ? <ClearIcon className="cursor-pointer" /> : <MenuIcon className="cursor-pointer" />
                        }
                        </div>
                    </div>
                    <div className={`flex flex-col self-center px-6 pt-0 overflow-hidden transition-all duration-700 ease-in-out ${expanded ? "max-h-96" : "max-h-0"}`} >
                        {menu}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;