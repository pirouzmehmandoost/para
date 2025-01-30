"use client";

// import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
// import splideConfig from "./../lib/splideConfig";
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
        className={`flex flex-col basis-7/12 w-5/6 h-fit mt-36 place-self-center text-3xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl uppercase ${myFont.className}`}
      >
        <div className="w-full my-4">
          <p>Hey There! I&apos;m a software engineer based in the San Francisco Bay Area. I specialize in frontend development with JavaScript Frameworks.
            I&apos;m also a designer with passions for interactive design, 3D computer graphics and 3D printing.
          </p>
        </div>
      </div>
      <div
        id="bottom_section"
        className="flex flex-col basis-5/12"
      >
        <h1
          className={`mt-12 mb-16 text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl italic ${myFont.className}`}
        >
          Recent Projects
        </h1>
        <div className="mb-20">
          <div className="flex flex-col-reverse w-full h-full place-self-center">
            <ProjectBanner />
            {/* <Splide options={splideConfig} aria-label="Projects Carousel">
              {projects.map((item, index) => {
                const props = {
                  name: item.name,
                  autoRotateSpeed: index % 2 === 0 ? -1.0 : 1.0
                };

                return (
                  <SplideSlide key={index} data-splide-interval="10000"
                  >
                    <div
                      key={index}
                      className="relative flex w-full h-full place-self-center "
                    >
                      <ProjectBanner key={index} data={props} />
                    </div>
                  </SplideSlide>
                );
              })}
            </Splide> */}
          </div>
        </div>
      </div>
    </main>
  );
}
