"use client";

import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
import ProjectBanner from "./components/ProjectBanner";
import portfolio from "./../lib/globals";
import localFont from "next/font/local";
const myFont = localFont({
  src: "../../public/fonts/halibutSerif/web/HalibutSerif-Condensed.woff2",
  display: "swap",
});

export default function Home() {
  const { projects } = portfolio;
  const splideOptions = {
    type: "loop", // Loop back to the beginning when reaching the end
    perPage: 1, // Number of items visible per page
    perMove: 1, // Move one item at a time
    rewind: true, // Rewind to start when the end is reached
    pagination: false, // Enable pagination dots
    autoplay: true,
  };

  return (
    <main className="flex flex-col w-screen min-w-screen h-screen min-h-screen text-center text-clay_dark">
      <div
        id="top_section"
        className={`flex flex-col w-5/6 h-fit mt-36 self-center text-7xl sm:text-6xl md:text-6xl uppercase ${myFont.className}`}
      >
        <div className="w-full my-5">
          <p className="inline  mr-4">Hey There! I'm a</p>
          <p className="inline italic mr-4">software engineer and designer</p>
          <p className="inline mr-4">based out of</p>
          <p className="inline italic mr-4">the San Francisco Bay Area.</p>
          <p className="inline">
            I specialize in frontend development with JavaScript Frameworks. I'm
            also a designer with passions for responsive design and 3D computer
            graphics.
          </p>
          <p className="mt-10">
            This site is a work in progress. It's Next.js 14 based, using
            Zustand, React Three Fiber/three.js, and Tailwind CSS. Poke around,
            check the github repo and read my notes in the README☺
          </p>
        </div>
      </div>
      <h1
        className={`my-5 text-5xl sm:text-6xl md:text-7xl italic ${myFont.className}`}
      >
        Recent Projects
      </h1>

      <div className="flex flex-col-reverse">
        <Splide options={splideOptions} aria-label="Projects Carousel">
          {projects.map((item, index) => {
            const rotation = index % 2 === 0 ? -1.0 : 1.0;
            const props = {
              ...item,
              enableControls: false,
              cameraPosition: [0, 10, 100],
              rotate: true,
              rotation,
            };
            return (
              <SplideSlide key={index}>
                <div
                  key={index}
                  className={`flex w-4/5 h-5/6 my-40 place-self-center place-items-center self-center drop-shadow transition-all duration-500 ease-in-out hover:drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]`}
                >
                  <ProjectBanner key={index} data={props} />
                </div>
              </SplideSlide>
            );
          })}
        </Splide>
      </div>
    </main>
  );
}
