"use client";

import Link from "next/link";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";


function NavBarHeader({ onClickLogo, onClickShop }) {

    console.log(callBack())
    return (
        <div id="nav_bar_header"
        className="flex flex-row text-center text-2xl text-clay_dark cursor-pointer"
        >
            <Link
            href="/"
            className="border-transparent pl-5 pr-32 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
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

export default NavBarHeader;