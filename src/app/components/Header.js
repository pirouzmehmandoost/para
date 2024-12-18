"use client";

import Link from "next/link";

const Header = () => {
  return (
    <div id="header" className="fixed inset-0 top-0 z-10 min-w-screen">
      <div
        className={`flex flex-col flex-nowrap pt-5 min-w-fit max-w-full text-center text-nowrap text-clay_dark bg-[url("/background.png")]`}
      >
        <div className="self-center">
          <Link
            className="transition-colors duration-200 ease-in-out hover:text-gray-500"
            href="/"
            rel="noopener noreferrer"
            onClick={() => setExpanded(false)}
          >
            <h2 className="text-3xl cursor-pointer">Pirouz Mehmandoost</h2>
          </Link>

          <div className={`flex flex-nowrap flex-row justify-evenly w-full`}>
            <Link
              className="border-transparent transition-colors hover:text-gray-500"
              href="/resume"
              rel="noopener noreferrer"
              onClick={() => setExpanded(false)}
            >
              <h2 className="text-nowrap cursor-pointer">Resume</h2>
            </Link>

            <Link
              href="https://github.com/pirouzmehmandoost/"
              className=" border-transparent transition-colors hover:text-gray-500"
              rel="noopener noreferrer"
            >
              <h2 className="text-nowrap cursor-pointer">Github</h2>
            </Link>

            <Link
              href="/shop"
              className="border-transparent transition-colors hover:text-gray-500"
              rel="noopener noreferrer"
            >
              <h2 className="text-nowrap cursor-pointer">Shop</h2>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
