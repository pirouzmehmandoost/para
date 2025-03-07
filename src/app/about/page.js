'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col w-screen h-full text-center text-neutral-600">
      <div
        id="top_section"
        className={`z-10 flex flex-col w-full h-1/2 place-self-center place-items-center mt-28 uppercase text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-3xl`}
      >
        <div className="w-4/5">
          <p>
            Hey! I&apos;m a software engineer based in the San Francisco Bay
            Area. I specialize in frontend development and rendering interactive
            graphics on the web.
          </p>
          <p>
            I also love to 3D print and design wearable objects after my 9-5.
          </p>
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
                  className={`pl-1 cursor-pointer text-neutral-500 italic transition-colors ease-in-out duration-300 hover:text-neutral-400`}
                >
                  Github repo
                </span>
                <span className="italic">.</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
