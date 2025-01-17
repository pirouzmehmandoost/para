"use client";

import Link from "next/link";
import localFont from "next/font/local";

const myFont = localFont({
  src: "./../../../public/fonts/halibutSerif/web/HalibutSerif-Condensed.woff2",
  display: "swap",
});

const Header = () => {
  return (
    <div
      id="header"
      className={`fixed z-50 w-full min-w-screen h-fit min-h-fit inset-0 top-0 pt-4 bg-[url("/background.png")] text-4xl text-clay_dark uppercase ${myFont.className} `}
    >
      <div className={`flex flex-col flex-nowrap`}>
        <div className="text-center mb-2">
          <Link
            className="transition-colors duration-200 ease-in-out hover:text-gray-500"
            href="/"
            rel="noopener noreferrer"
          >
            <p className="cursor-pointer text-nowrap">Pirouz Mehmandoost</p>
          </Link>
        </div>

        <div
          className={`flex flex-nowrap flex-row justify-evenly w-full text-3xl`}
        >
          <Link
            className="border-transparent transition-colors hover:text-gray-500"
            href="/resume"
            rel="noopener noreferrer"
          >
            <p className="text-nowrap cursor-pointer">Resume</p>
          </Link>
          <Link
            href="https://github.com/pirouzmehmandoost/"
            className=" border-transparent transition-colors hover:text-gray-500"
            rel="noopener noreferrer"
            target="blank"
          >
            <p className="text-nowrap cursor-pointer">Github</p>
          </Link>
          <Link
            href="/shop"
            className="border-transparent transition-colors hover:text-gray-500"
            rel="noopener noreferrer"
          >
            <p className="text-nowrap cursor-pointer line-through	decoration-wavy decoration-red-500/90 decoration-2">
              Shop
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
