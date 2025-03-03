"use client";
import Link from "next/link";
import GlobalModelViewer from "../components/Three/GlobalModelViewer";


export default function Projects() {
  return (
    <div className="flex flex-col w-screen h-full text-center text-neutral-600">
        <div className="w-5/6">
            <h1
            className={`mt-4 sm:mt-8 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10 text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-5xl`}
            >
            Recent Design Projects
            </h1>
        </div>

        <div
        className="absolute w-full h-full min-h-96 bottom-0"
        >
            <GlobalModelViewer className="flex flex-row w-full h-full place-self-center" />
        </div>
    </div>
  );
}
