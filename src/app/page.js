"use client";

import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
import splideConfig from "./../lib/splideConfig";
import portfolio from "./../lib/globals";
import localFont from "next/font/local";
import ProjectBanner from "./components/ProjectBanner";

const myFont = localFont({
  src: "../../public/fonts/halibutSerif/web/HalibutSerif-Condensed.woff2",
  display: "swap",
});

export default function Home() {
  const { projects } = portfolio;

  return (
    <main className="flex flex-col w-screen min-w-screen h-screen min-h-screen text-center text-clay_dark">
      <div
        id="top_section"
        className={`flex flex-col w-5/6 h-fit mt-36 self-center text-7xl xs:text-4xl sm:text-5xl md:text-6xl uppercase ${myFont.className}`}
      >
        <div className="w-full my-5">
          <p className="inline  mr-4">Hey There! I&apos;m a</p>
          <p className="inline italic mr-4">software engineer and designer</p>
          <p className="inline mr-4">based out of</p>
          <p className="inline italic mr-4">the San Francisco Bay Area.</p>
          <p className="inline">
            I specialize in frontend development with JavaScript Frameworks. I&apos;m
            also a designer with passions for responsive design and 3D computer
            graphics.
          </p>
          <p className="mt-10">
            This site is a work in progress. It&apos;s Next.js 14 based, using
            Zustand, React Three Fiber/three.js, and Tailwind CSS. Poke around,
            check the github repo and read my notes in the README☺
          </p>
        </div>
      </div>
      <h1
        className={`my-5 text-7xl xs:text-4xl sm:text-5xl md:text-6xl italic ${myFont.className}`}
      >
        Recent Projects
      </h1>

      <div className="flex flex-col-reverse">
        <Splide options={splideConfig} aria-label="Projects Carousel">
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
                  className={`flex w-5/6 h-5/6 my-40 place-self-center place-items-center self-center drop-shadow transition-all duration-500 ease-in-out hover:drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]`}
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
