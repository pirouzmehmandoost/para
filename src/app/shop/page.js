// "use client";
import Link from 'next/link'

import { ModelViewer } from "../components/ModelViewer";

export default function Shop() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24 bg-[radial-gradient(ellipse_at_50%_100%,var(--tw-gradient-stops))] from-clay_dark via-tahiti via-40% to-clay_dark to-100% backdrop-filter backdrop-contrast-125" >
      
      <div id="model_container" className="flex flex-col place-items-center justify-between mix-w-screen min-h-screen" >

        <ModelViewer className="min-w-screen min-h-screen" />

      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        
        <Link
        href="/"
        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        target="_blank"
        rel="noopener noreferrer"
        >
          {/* <h1 className={`m-0 max-w-[30ch] text-sm opacity-50`}> */}
            Return Home
          {/* </h1> */}
        </Link>
      </div>
    </div>
  );
}
