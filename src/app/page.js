"use client";

import ProjectBanner from "./components/ProjectBanner";
import portfolio from "./../lib/globals";

export default function Home() {
  const { projects } = portfolio;
  return (
    <main className="flex flex-col w-screen min-w-screen h-screen min-h-screen text-center text-clay_dark text-xl">
      <div className="mt-36 flex flex-col self-center">
        <h1 className="text-3xl mb-5"> Hi! My name is Pirouz.</h1>
        <h1 className="mb-5 ">
          I'm a software engineer with experience building front ends with
          JavaScript frameworks. I'm currently open for hire!
        </h1>
        <h2 className="mb-2 ">
          I'm sharing my experience learning about Next.js, Tailwind CSS,
          Three.js by developing a portfolio for my design projects.
        </h2>
        <h2 className="mb-5 ">Keep tuned as I continue developing this app!</h2>
      </div>

      <h1 className="text-2xl mt-5"> Recent Projects</h1>

      <div className="flex flex-col-reverse">
        {projects.map((item, index) => {
          const rotation = index % 2 === 0 ? -1.0 : 1.0;
          const props = { ...item, rotation };
          return (
            <div
              key={index}
              className={`relative flex z-10 place-self-center place-items-center self-center my-36 w-4/5 h-5/6 transition-all rounded-2xl duration-500 ease-in-out drop-shadow bg-blue-100 hover:bg-blue-50 hover:drop-shadow-2xl`}
            >
              <ProjectBanner data={props} />
            </div>
          );
        })}
      </div>
    </main>
  );
}
