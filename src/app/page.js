"use client";

import localFont from "next/font/local";
import GlobalScene from "./components/Three/GlobalModelViewer";

const myFont = localFont({
  src: "../../public/fonts/halibutSerif/web/HalibutSerif-Condensed.woff2",
  display: "swap",
});

export default function Home() {
  return (
    <main className="flex flex-col w-screen min-w-screen h-full min-h-screen text-center text-clay_dark">
      <div
        id="top_section"
        className={`z-10 flex flex-col w-5/6 h-fit place-self-center mt-28 sm:mt-24 md:mt-36 lg:mt-36 xl:mt-36 2xl:mt-36 ${myFont.className} uppercase text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl 2xl:text-4xl`}
      >
        <div className="w-full my-4">
          <p>Hey! I&apos;m a software engineer based in the San Francisco Bay Area. I specialize in frontend development, interaction design, and rendering 3D graphics on the web.</p>
          <p className="italic"> I&apos;m also a big giant 3D printing nerd and love to utilize what I design. </p>
          <p className={`mt-12 sm:mt-12 md:mt-14 lg:mt-14 xl:mt-14 text-4xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl`}>
            Recent Design Projects
          </p>
        </div>
      </div>
      <div
        id="bottom_section"
        className="absolute w-full h-1/2 min-h-96 bottom-0"
      >
        <GlobalScene className="flex-row w-full h-full place-self-center" />
      </div>
    </main>
  );
};
