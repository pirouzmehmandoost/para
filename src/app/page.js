// "use client";
import Link from 'next/link'

import { ImageTracker } from "./components/ImageTracker";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-5 bg-[radial-gradient(ellipse_at_50%_100%,var(--tw-gradient-stops))] from-clay_dark via-tahiti via-40% to-clay_dark to-100% backdrop-filter backdrop-contrast-125" >
      
      <div id="navbar" className="flex flex-row mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        
        <Link
        href="/shop"
        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        target="_blank"
        rel="noopener noreferrer"
        >
          {/*<h2 className={`mb-3 text-2xl font-semibold`}>
             Docs{" "} 
            {/* <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2> */}
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Shop
          </p>
        </Link>

        <Link
        href="/shop"
        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        target="_blank"
        rel="noopener noreferrer"
        >
          {/*<h2 className={`mb-3 text-2xl }>
             Docs{" "} 
            {/* <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2> */}
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            About
          </p>
        </Link>


        {/* <div id="model_viewer_container" className="flex flex-col place-items-center justify-between mix-w-screen min-h-screen" >
          <ImageTracker className="min-w-screen min-h-screen" />
        </div> */}

      </div>

      <p>Pirouz Mehmandoost</p>
    </main>
  );
}
