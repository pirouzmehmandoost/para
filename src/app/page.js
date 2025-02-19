"use client";
import Link from "next/link";
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
        className={`z-10 flex flex-col w-full min-h-fit place-self-center place-items-center mt-28 ${myFont.className} uppercase text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-3xl`}
      >
        <div className="w-4/5">
          <p>
            Hey! I&apos;m a software engineer based in the San Francisco Bay
            Area. I specialize in frontend development and rendering interactive
            graphics on the web.
          </p>
          <p>I love to 3D print and design wearable objects after my 9-5.</p>
          <div>
            <div className="mt-4 sm:mt-8 md:mt-8 lg:mt-8 xl:mt-8 2xl:mt-8">
              WIP- read my latest dev notes in the
              <Link
                href="https://github.com/pirouzmehmandoost/para/blob/main/README.md"
                className="border-transparent"
                rel="noopener noreferrer"
                target="blank"
              >
                <span
                  className={`pl-1 cursor-pointer text-zinc-500 italic transition-colors ease-in-out duration-300 hover:text-zinc-400`}
                >
                  Github repo
                </span>
                <span className="italic">.</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="w-5/6">
          <p
            className={`mt-4 sm:mt-8 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10 text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-5xl`}
          >
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
}
