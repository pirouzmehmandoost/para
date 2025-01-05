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
        className={`flex flex-col w-5/6 h-fit mt-36 self-center text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl uppercase ${myFont.className}`}
      >
        <div className="w-full my-5">
          <p>Hey There! I&apos;m a software engineer based out of the San Francisco Bay Area.</p>
          <p>
            I specialize in frontend development with JavaScript Frameworks. I&apos;m
            also a designer with passions for 3D computer
            graphics, responsive design, and additive manufacturing.
          </p>
          <p className="mt-10">
            Check the github repo and my development notes while I continue working on this app ☺
          </p>
          <p>
            It&apos;s Next.js 14 based, using Zustand, three.js/React Three Fiber/drei, and Tailwind CSS.
          </p>
        </div>
      </div>
      <h1
        className={`my-5 text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl italic ${myFont.className}`}
      >
        Recent Projects
      </h1>

      <div className=" plsce-self-center flex flex-col-reverse">
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
