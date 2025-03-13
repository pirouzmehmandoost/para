'use client';

import Link from 'next/link';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const AboutPage = () => {
  return (
    <div className="flex flex-col w-full h-full mt-10">
      <div className="flex flex-row w-full h-fit justify-center my-10 ">
        <Link href="/" rel="noopener noreferrer">
          <div className="cursor-pointer rounded-full w-fit h-fit p-6 text-neutral-600 bg-neutral-500/40 transition-all duration-500 ease-in-out hover:bg-neutral-500/20">
            <ArrowBackIosNewIcon fontSize="large" />
          </div>
        </Link>
      </div>
      <div
        className={`flex flex-col w-full h-full place-items-center text-center text-neutral-600 uppercase text-3xl`}
      >
        <div className="flex flex-col justify-between h-full w-4/5">
          <p>
            Hey! I&apos;m a software engineer based in the San Francisco Bay
            Area. I specialize in frontend development and rendering interactive
            graphics and virtual experiences.
          </p>
          <p className="mt-4">
            I also love to 3D print and design wearable objects after my 9-5.
            About 6 months ago I started playing around Three.js and fell off
            the deep end- I became obsessed with learning how to develop 3D
            experiences in apps, getting familiar with computer graphics beyond
            WebGL, learning about shaders, and trying to get friends on this
            same tip. This app displays 3D models of some recent 3D printing
            projects.
          </p>
          <p className="mt-4">
            The app is built with the latest versions of Next.JS, Tailwind CSS,
            React, and Three.js. I use Zustand to manage app State, React Three
            Fiber for caching 3D assets, optimizing animations, and for
            post-processing effects.
          </p>
          <div>
            <div className="mt-4">
              WIP, Read my latest dev notes in the
              <Link
                href="https://github.com/pirouzmehmandoost/para/blob/main/README.md"
                className="border-transparent"
                rel="noopener noreferrer"
                target="blank"
              >
                <span
                  className={`pl-1 cursor-pointer text-neutral-500 italic transition-colors ease-in-out duration-300 hover:text-neutral-400`}
                >
                  Github repo
                </span>
                <span className="italic">!</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
