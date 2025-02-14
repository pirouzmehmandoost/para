"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { usePathname } from 'next/navigation';

const myFont = localFont({
  src: "./../../../public/fonts/halibutSerif/web/HalibutSerif-Condensed.woff2",
  display: "swap",
});

const Header = () => {
  const pathname = usePathname();

  return (
    <div
      id="header"
      className={`fixed z-50 w-full min-w-full h-fit min-h-fit inset-0 top-0 pt-4 ${pathname.length > 1 ? 'text-2xl pb-1 ' : 'text-4xl pb-3'} text-clay_dark uppercase ${myFont.className}  bg-gradient-to-b from-[#bcbcbc] from-85% to-transparent`}
    >
      <div className={`flex flex-col flex-nowrap`}>
        <div className={`text-center ${pathname.length > 1 ? 'mb-1' : 'mb-2'}`}>
          <Link
            className="transition-colors duration-200 ease-in-out hover:text-zinc-500"
            href="/"
            rel="noopener noreferrer"
          >
            <h1 className="cursor-pointer text-nowrap">Pirouz Mehmandoost</h1>
          </Link>
        </div>

        <div
          className={`flex flex-nowrap flex-row justify-evenly w-full ${pathname.length > 1 ? 'text-lg' : 'text-2xl'}`}
        >
          <Link
            className="border-transparent transition-colors hover:text-zinc-500"
            href="/resume"
            rel="noopener noreferrer"
          >
            <p className="text-nowrap cursor-pointer">Resume</p>
          </Link>
          <Link
            href="https://github.com/pirouzmehmandoost/"
            className=" border-transparent transition-colors hover:text-zinc-500"
            rel="noopener noreferrer"
            target="blank"
          >
            <p className="text-nowrap cursor-pointer">Github</p>
          </Link>
          <Link
            href="/shop"
            className="border-transparent transition-colors hover:text-zinc-500"
            rel="noopener noreferrer"
          >
            <p className="text-nowrap cursor-pointer line-through	decoration-wavy decoration-stone-700/80 decoration-4">
              Shop
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
