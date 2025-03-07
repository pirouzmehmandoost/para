"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';


const variants = {
    top: {
        initial: {
            filter: "blur(100px)",
            opacity: 0,
            rotateX: 90,
            translateY: 80,
            translateX: -20,
        },
        enter: (i) => ({
            filter: "blur(0px)",
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
        exit: (i) => ({
            filter: "blur(500px)",
            opacity: 0,
            transition: { 
                duration: 0.5, 
                delay: 0.5 - (i * 0.1),
                type: "easeInOut",
                ease: [0.76, 0, 0.24, 1],

            }
        })
    },
    bottom: {
        initial: {
            filter: "blur(100px)",
            opacity: 0,
            y: 20
        },
        enter: (i) => ({
            filter: "blur(0px)",
            opacity: 1,
            y: 0,
            transition: { 
                duration: 0.5,
                delay: 0.75 + (i * 0.1), 
                ease: [.215,.61,.355,1]
            }
        }),
        exit: {
            filter: "blur(100px)",
            opacity: 0,
            transition: { duration: 0.5, type: "tween", ease: "easeInOut"}
        }
    },
    menu: {
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
}

const topLinks = [
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

const bottomLinks = [
    {
        href:"https://www.linkedin.com/in/pirouzmehmandoost/",
        title: "LinkedIn",
    },
    {
        href:"https://github.com/pirouzmehmandoost/para/blob/main/README.md",
        title:"Github"
    },
];

const Links = () => {
    return (
        <div className="flex flex-col w-full h-full justify-between p-10 text-4xl" >
            <div className="flex flex-col" >
            {
                topLinks.map( (link, i) => {
                    const { title, href } = link;
                    return (
                        <div key={`b_${i}`} className = "perspective-origin-bottom" >
                            <motion.div
                            custom={i}
                            variants={variants.top}
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
            <motion.div className="flex flex-row w-full justify-between" >
            {
                bottomLinks.map( (link, i) => {
                    const { title, href } = link;

                    return (
                        <motion.div
                        variants={variants.bottom}
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
            <div className="absolute flex w-full h-full bg-neutral-200/0 rounded-3xl -z-1 inset-0 scale-100 backdrop-blur-xl" />
            <div className="absolute w-full h-full bg-neutral-200/0 inset-0 -z-10 scale-120 backdrop-blur blur" />
        </div>
    )
};

const ButtonText = ({handler, label, isActive}) => {
    return (    
        <div 
        className={`absolute w-full h-full rounded-xl transition-all duration-1000 ease-in-out ${isActive ? "opacity-0 text-neutral-500" : "opacity-100 text-neutral-600 "}`}
        onClick={handler}
        >
            <div className="flex flex-col w-full h-full cursor-pointer text-center px-2 bg-neutral-400 rounded-xl"
            >
                {label}
            </div>
        </div>
    )
};

const ToggleButton = ({isActive, toggleMenu}) => {
    return (
        <div className = "absolute top-0 left-0 w-20 h-10 rounded-xl" >
            <ButtonText handler={() => toggleMenu()} label="Menu" isActive={isActive} />
            <ButtonText handler={() => toggleMenu()} label="Close" isActive={!isActive} />
        </div>
    )
};

 const  Menu = () => {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="absolute">
            <motion.div 
            className="relative w-96 h-96 bg-neutral-300 rounded-xl"
            variants={variants.menu}
            animate={isActive ? "open" : "closed"}
            initial="closed"
            >
                <AnimatePresence>
                    { isActive && <Links /> }
                </AnimatePresence>   
                <ToggleButton isActive={isActive} toggleMenu={() => {setIsActive(!isActive)}} /> 

            </motion.div>
        </div>
    )
};



const Home = () => {
    return (
        <main className="flex flex-col w-screen h-full" >
            <div
            className={`z-10 flex flex-col place-self-center place-items-center mt-32 uppercase text-center text-neutral-600 text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-3xl`}
            >
                <Menu />
        
                <Image
                    priority
                    className=" -z-100 w-auto h-auto bg-cover overflow-auto"
                    src={"/oval_bag_hero_1.png"}
                    width={768}
                    height={432}
                    quality={100}
                    alt={"poop"}
                />               

            </div>
        </main>
    );
}

export default Home;


