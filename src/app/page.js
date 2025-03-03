"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion';


const myFont = localFont({
  src: "../../public/fonts/halibutSerif/web/HalibutSerif-Condensed.woff2",
  display: "swap",
});

const links = [
    {
        href: "/projects",
        title: "Projects",
    },
    {
        href:"/resume",
        title: "Resume/CV",
    },
    {
        href: "/about",
        title: "About",
    },
];

const footerLinks = [
    {
        href:"https://www.linkedin.com/in/pirouzmehmandoost/",
        title: "LinkedIn",
    },
    {
        href:"https://github.com/pirouzmehmandoost/para/blob/main/README.md",
        title:"Github"
    },
];

const perspective = {
    initial: {
        opacity: 0,
        rotateX: 90,
        translateY: 80,
        translateX: -20,
    },
    enter: (i) => ({
        opacity: 1,
        rotateX: 0,
        translateY: 0,
        translateX: 0,
        transition: {
            duration: 0.65, 
            delay: 0.5 + (i * 0.1), 
            ease: [.215,.61,.355,1],
            opacity: { duration: 0.35}
        }
    }),
    exit: {
        opacity: 0,
        transition: { duration: 0.5, type: "linear", ease: [0.76, 0, 0.24, 1]}
    }
}

export const slideIn = {
    initial: {
        opacity: 0,
        y: 20
    },
    enter: (i) => ({
        opacity: 1,
        y: 0,
        transition: { 
            duration: 0.5,
            delay: 0.75 + (i * 0.1), 
            ease: [.215,.61,.355,1]
        }
    }),
    exit: {
        opacity: 0,
        transition: { duration: 0.5, type: "tween", ease: "easeInOut"}
    }
}

const menu = {
    open: {
        width: "480px",
        height: "650px",
        top: "-25px",
        right: "-25px",
        transition: { duration: 0.75, type: "tween", ease: [0.76, 0, 0.24, 1]}
    },
    closed: {
        width: "80px",
        height: "40px",
        top: "0px",
        right: "0px",
        transition: { duration: 0.75, delay: 0.35, type: "tween", ease: [0.76, 0, 0.24, 1]}
    }
}

function ToggleButton({isActive, toggleMenu}) {
    return (
        <div className = "absolute top-0 left-0 w-20 h-10 rounded-xl bg-red-400">
            <ButtonText handler={() => toggleMenu()} label="Menu" isActive={isActive}/>
            <ButtonText handler={() => toggleMenu()} label="Close" isActive={!isActive}/>
        </div>
    )
}

function ButtonText({handler, label, isActive}) {
    return (    
        <div 
            className={`absolute w-full h-full rounded-xl transition-all duration-1000 ease-in-out ${isActive ? "opacity-0 text-neutral-500" : "opacity-100 text-neutral-600 "}`}
            onClick={handler}
        >
            <div className="flex flex-col w-full h-full cursor-pointer text-center px-2 bg-green-500 rounded-xl">
                {label}
            </div>
        </div>
    )
}

const Links = () => {
    return (
        <div className="flex flex-col w-full h-full justify-between p-10 text-4xl">
            <div className="flex flex-col">
            {
                links.map( (link, i) => {
                    const { title, href } = link;
                    return (
                        <div key={`b_${i}`} className = "perspective-origin-bottom">
                            <motion.div
                                custom={i}
                                variants={perspective}
                                initial="initial"
                                animate="enter"
                                exit="exit"
                            >
                                <Link 
                                    className="border-transparent cursor-pointer"
                                    rel="noopener noreferrer"
                                    href={href}
                                >
                                    {title}
                                </Link>
                            </motion.div>
                        </div>
                    )
                })
            }
            </div>
            <motion.div className="flex flex-row w-full justify-between">
            {
                footerLinks.map( (link, i) => {
                    const { title, href } = link;
                    return (
                        <motion.div
                            variants={slideIn}
                            custom={i} 
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            key={`f_${i}`}
                        >
                            <Link
                                className="border-transparent cursor-pointer"
                                rel="noopener noreferrer"
                                target="blank"
                                href={href}
                                >
                                    {title}
                            </Link>
                        </motion.div>
                    )
                })
            }
            </motion.div>
        </div>
    )
}

 function Menu() {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="absolute">
            <motion.div 
                className="relative w-96 h-96 bg-neutral-300 rounded-xl"
                variants={menu}
                animate={isActive ? "open" : "closed"}
                initial="closed"
            >
                <AnimatePresence>
                    {isActive && <Links />}
                </AnimatePresence>
            
            <ToggleButton isActive={isActive} toggleMenu={() => {setIsActive(!isActive)}} /> 
        </motion.div>
        </div>
    )
};


export default function Home() {
  return (
    <main className="flex flex-col w-screen h-full text-center text-neutral-600">
      <div
        id="top_section"
        className={`z-10 flex flex-col w-full h-1/2 place-self-center place-items-center mt-28 ${myFont.className} uppercase text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-3xl`}
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
                  className="pl-1 cursor-pointer text-neutral-500 italic transition-colors ease-in-out duration-300 hover:text-neutral-400"
                >
                  Github repo
                </span>
                <span className="italic">.</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="w-5/6">
                  <Menu/>
        </div>
      </div>


      {/* <div
        id="bottom_section"
        className="absolute w-full h-1/2 min-h-96 bottom-0"
      >
        <GlobalModelViewer className="flex flex-row w-full h-full place-self-center" />
      </div> */}
    </main>
  );
}
