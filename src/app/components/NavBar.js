"use client";

import Link from "next/link";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ClearIcon from "@mui/icons-material/Clear";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchBar from "./SearchBar";


export default function NavBar() {
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => setExpanded((current) => !current);

    function NavBarHeader({ onClickLogo, onClickShop }) {
        return (
            <div id="nav_bar_header"
            className="flex flex-row text-center text-2xl text-clay_dark cursor-pointer"
            >
                <Link
                href="/"
                className="border-transparent pl-5 pr-20 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
                rel="noopener noreferrer"
                onClick={onClickLogo}
                >
                    <h2> Pirouz Mehmandoost</h2>
                </Link>

                <Link
                href="/shop"
                className="border-transparent transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
                rel="noopener noreferrer"
                onClick={onClickShop}
                >
                    <ShoppingBagIcon className=" mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                </Link>
            </div>
        )
    };


    const NavBarContent = ({ onClick }) => { 
        return (
            <div
            id="nav_bar_contents"
            className={`flex flex-col flex-grow grid text-center text-2xl`}
            >
                <div className="mt-5 mb-3">
                    <SearchBar />
                </div>

                <Link
                href="/shop"
                className="border border-transparent py-5 transition-colors hover:text-gray-500"
                rel="noopener noreferrer"
                onClick={onClick}
                >
                    <h2>Bags</h2>
                </Link>

                <Link
                href="/shop"
                className="border border-transparent py-5 transition-colors hover:text-gray-500"
                rel="noopener noreferrer"
                onClick={onClick}
                >
                    <h2 className="mb-3 text-2xl">Footwear </h2>
                </Link>
            </div>
        );
    };


    const NavContent = ({ header, content, expanded }) => {
        // const [expanded, setExpanded] = useState(expand);
        // const toggleExpanded = () => setExpanded((current) => !current);

        return (
            <div
            className={`${expanded? "backdrop-blur-3xl  backdrop-brightness-150" : ""}`} 
            >
                <div className={`flex flex-row  justify-between items-center`}>
                    
                    {header}
                    
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
                    {content}
                </div>
            </div>
        );
    };


    return (
        <div className = "w-full ml-12 mt-6 justify-between content-center items-center text-center ">
            <div
            id="nav_bar"
            className="fixed z-10 items-center text-center border-solid border-2 border-clay_dark text-2xl text-clay_dark"
            >
                <NavContent

                    expanded={expanded}
                    header={NavBarHeader({
                        onClickLogo:()=> setExpanded(false),
                        onClickShop:()=> setExpanded(false)
                    })}
                    content={NavBarContent({
                        onClick:toggleExpanded
                    })} 
                />
            </div>
        </div>
    );
}
