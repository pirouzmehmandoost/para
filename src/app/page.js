"use client";

import ModelViewer from "./components/ModelViewer";

export default function Home() {
  return (
    <main className="flex flex-col place-items-center w-screen max-w-screen h-screen max-h-screen">
      <div className="mt-24 w-2/3 flex flex-col self-center text-center">
        <h1 className="text-2xl mb-5"> Hi! My name is Pirouz Mehmandoost</h1>
        <h2 className="text-xl mb-5 ">
          I'm a software engineer with experience building front ends with
          JavaScript frameworks. I'm also a designer with a passion for 3D
          printing.
        </h2>
        <h1 className="text-xl mb-2">
          {" "}
          This page tests viewing 3D models. Tap the bottom buttons to change
          the color.
        </h1>
      </div>

      <div className="w-4/5 max-w-4/5 h-4/5 max-h-4/5">
        <ModelViewer />
      </div>
    </main>
  );
}
