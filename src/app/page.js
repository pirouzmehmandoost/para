"use client";

import ProjectBanner from "./components/ProjectBanner";
import portfolio from "./../lib/globals";
import localFont from "next/font/local";
import ModelPreview from "./components/ModelPreview";
import { colorCodes } from "./../lib/globals";
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
        className={`flex flex-col w-5/6 h-fit mt-36 self-center text-7xl sm:text-6xl md:text-6xl uppercase ${myFont.className}`}
      >
        <div className="w-full my-5">
          {/* <div className="fixed w-96 h-96 z-20 opacity-50">
            <ModelPreview data={{
              colorCodes: { ...colorCodes },
              enableControls: false,
              modelUrl: "/logo_for_web.glb",
              orthographic: true,
              position: [0, 45, 100],
              rotate: false,
              rotation: 0,
            }} />
          </div> */}
          <h1 className="inline">Hey There! I am a</h1>
          <h1 className="inline italic mr-4">
            {" "}
            software engineer and designer
          </h1>
          <h1 className="inline mr-4">based out of</h1>
          <h1 className="inline italic mr-4">the San Francisco Bay Area.</h1>
          <h1 className="inline">
            I specialize in frontend development with JavaScript Frameworks. I'm
            also a designer with passions for responsive design and 3D computer
            graphics. This site is a work in progress but poke around! At the moment clicking on
            projects will direct you to a very barebones shop UI.
          </h1>
        </div>
      </div>
      <h1
        className={`my-5 text-5xl sm:text-6xl md:text-7xl italic ${myFont.className}`}
      >
        Recent Projects
      </h1>

      <div className="flex flex-col-reverse">
        {projects.map((item, index) => {
          const rotation = index % 2 === 0 ? -1.0 : 1.0;
          const props = {
            ...item,
            enableControls: false,
            orthographic: false,
            position: [0, 10, 100],
            rotate: true,
            rotation,
          };
          return (
            <div
              key={index}
              className={`flex z-10 w-4/5 h-5/6 my-40 place-self-center place-items-center self-center drop-shadow transition-all duration-500 ease-in-out hover:drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]`}
            >
              <ProjectBanner key={index} data={props} />
            </div>
          );
        })}
      </div>
    </main>
  );
};

{/* <div
  id="round_border_section"
  className="relative w-full h-72 place-self-center overflow-auto"
>
  <div className=" w-full h-full inset-0 border border-8 border-none rounded-[100%] bg-breadfruit bg-breadfruit">
    <div className="absolute  w-full h-fit w-full h-fit -mt-6 inset-0 place-self-center place-items-center items-center ">
      <p> Hey There!</p>
      <div className=" flex flex-nowrap text-nowrap">
        <p>My name is</p>
        <p className="ml-3 inline">Pirouz</p>
      </div>
    </div>
  </div>
</div>  */}
