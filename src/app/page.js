"use client";

import ModelViewer from "./components/ModelViewer";

export default function Home() {
  return (
    <main className="flex flex-col place-items-center w-screen max-w-screen h-screen max-h-screen">
      {/* <div className="flex flex-col mt-40 self-center text-center">
        <h1 className="text-3xl"> Hi! My name is Pirouz Mehmandoost</h1>
        <h2 className="text-xl">
          I'm a software engineer with experience building front ends with
          JavaScript frameworks. I'm also a designer with a passion for 3D
          printing.
        </h2>
      </div> */}

      <div className="w-4/5 max-w-4/5 h-4/5 max-h-4/5">
        <ModelViewer />
      </div>
    </main>
  );
}
