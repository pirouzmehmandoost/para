"use client";

import Link from "next/link";
import { useState } from "react";
import { AppBar, Box, Drawer, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ClearIcon from "@mui/icons-material/Clear";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchBar from "./SearchBar";

// import { ImageTracker } from "./components/ImageTracker";

export default function NavBar() {
  const [showNavigation, setShowNavigation] = useState("hidden");

  const setVisibility = () => {
    if (showNavigation === "hidden") {
      setShowNavigation("visible");
    } else setShowNavigation("hidden");
  };



function Accordion({ title, content }) {
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => setExpanded((current) => !current);

    return (
        <div
        className="my-2 sm:my-4 md:my-6 shadow-sm cursor-pointer bg-white"
        onClick={toggleExpanded}
        >
            <div className="px-6 text-left items-center h-20 select-none flex justify-between flex-row">
                <h5 className="flex-1">{title}</h5>
                
                <div className="flex-none pl-2">
                    {
                        expanded ? 
                            <ClearIcon className=" mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                        : 
                            <MenuIcon className="mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
                    }
                </div>
            </div>

            <div
            className={`px-6 pt-0 overflow-hidden transition-[max-height] duration-100 ease-in ${expanded ? "max-h-40" : "max-h-0"}`}
            >
                <p className="pb-4 text-left">


                <Link
          href="/shop"
          className="border border-transparent py-5 transition-colors hover:text-gray-500"
          rel="noopener noreferrer"
        //   onClick={setVisibility}
        >
          <h2>Bags</h2>
        </Link>
                </p>
            </div>
        </div>
    );
};

  


  return (
    <div
      id="navBar"
      className="flex flex-row justify-between items-center text-center grid border-solid border-4 border-clay_dark text-2xl text-clay_dark transition-all duration-300 ease-in-out overflow-hidden"
    >
      <div className="flex flex-row items-center px-10">
        <Link
          id="logoContainer"
          href="/"
          className="border-transparent px-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30"
          rel="noopener noreferrer"
        >
          <h2> Pirouz Mehmandoost</h2>
        </Link>

<Accordion/>
        <div id="buttonContainer" className="pl-32">
          <IconButton
            size="small"
            edge="start"
            aria-label="menu"
            onClick={setVisibility}
          >
            {showNavigation === "hidden" ? (
              <MenuIcon className="mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
            ) : (
              <ClearIcon className=" mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
            )}
          </IconButton>

          <IconButton
            size="small"
            edge="start"
            aria-label="menu"
            onClick={setVisibility}
            s
          >
            <ShoppingBagIcon className=" mx-5 transition-colors hover:text-gray-200 hover:text-gray-100 hover:dark:text-neutral-700 hover:dark:text-neutral-800/30" />
          </IconButton>
        </div>
      </div>

      <div
        id="dropDownContainer"
        className={`flex flex-col flex-grow grid mt-20 text-center text-2xl ${showNavigation}`}
      >
        <div className="mb-5">
          <SearchBar />
        </div>

        <Link
          href="/shop"
          className="border border-transparent py-5 transition-colors hover:text-gray-500"
          rel="noopener noreferrer"
          onClick={setVisibility}
        >
          <h2>Bags</h2>
        </Link>

        <Link
          href="/shop"
          className="border border-transparent py-5 transition-colors hover:text-gray-500"
          target="_blank"
          rel="noopener noreferrer"
          onClick={setVisibility}
        >
          <h2 className="mb-3 text-2xl">Footwear</h2>
        </Link>

        <Link
          href="/shop"
          className="border border-transparent py-5 transition-colors hover:text-gray-500"
          target="_blank"
          rel="noopener noreferrer"
          onClick={setVisibility}
        >
          <h2 className="mb-3 text-2xl ">Accessories</h2>
        </Link>

        <Link
          href="/shop"
          className="border border-transparent py-5 transition-colors hover:text-gray-500"
          target="_blank"
          rel="noopener noreferrer"
          onClick={setVisibility}
        >
          <h2 className="mb-3 text-2xl ">About</h2>
        </Link>
      </div>
    </div>
  );
}
