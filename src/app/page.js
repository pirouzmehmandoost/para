'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlobalModelViewer } from '@/components/Three/GlobalModelViewer';
import MenuIcon from '@mui/icons-material/Menu';

const variants = {
  top: {
    initial: {
      filter: 'blur(100px)',
      opacity: 1,
      rotateX: 90,
      translateX: -20,
      translateY: 80,
    },
    enter: (i) => ({
      filter: 'blur(0px)',
      opacity: 1,
      rotateX: 0,
      translateX: 0,
      translateY: 0,
      transition: {
        duration: 0.65,
        delay: 0.5 + i * 0.1,
        ease: [0.215, 0.61, 0.355, 1],
        opacity: { duration: 0.35 },
      },
    }),
    exit: (i) => ({
      filter: 'blur(500px)',
      opacity: 0,
      transition: {
        duration: 0.5,
        delay: 0.5 - i * 0.1,
        type: 'easeInOut',
        ease: [0.76, 0, 0.24, 1],
      },
    }),
  },
  bottom: {
    initial: {
      filter: 'blur(100px)',
      opacity: 1,
      y: 20,
    },
    enter: (i) => ({
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.75 + i * 0.1,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
    exit: {
      filter: 'blur(100px)',
      opacity: 0,
      transition: { duration: 0.5, type: 'tween', ease: 'easeInOut' },
    },
  },
  menu: {
    open: {
      filter: 'blur(0px)',
      opacity: 1,
      width: 'auto',
      height: '100vh',
      // top: '-25px',
      // right: '-25px',
      // boxShadow: '0px -300px 80px 100px rgba(255,255,255,.3)',
      transition: {
        duration: 0.75,
        type: 'tween',
        ease: [0.76, 0, 0.24, 1],
        opacity: { delay: 0.5 },
      },
    },
    closed: {
      filter: 'blur(500px)',
      opacity: 0,
      width: '1vw',
      height: '1vh',
      // top: '0px',
      // right: '0px',
      // top: '50vh',
      // right: '50vw',
      transition: {
        delay: 0.5,
        duration: 0.75,
        type: 'easeInOut',
        ease: [0.76, 0, 0.24, 1],
        opacity: { delay: 0.5 },
      },
    },
  },
  overlay: {
    open: {
      // backdropFilter: 'blur(100px)',
      // filter: 'blur(10px)',
      opacity: 1,
      width: '100vw',
      height: '100vh',
      transition: {
        delay: 0,
        duration: 0.5,
        type: 'easeInOut',
        ease: [0.76, 0, 0.24, 1],
        opacity: { delay: 0.5 },
        // backdropFilter: { delay: 0 },
      },
    },
    closed: {
      // backdropFilter: 'blur(0px)',
      // filter: 'blur(0px)',
      opacity: 0,
      width: '1vw',
      height: '1vh',
      transition: {
        delay: 0.5,
        duration: 0.6,
        type: 'easeInOut',
        ease: [0.76, 0, 0.24, 1],
        opacity: { delay: 0.5 },
        // backdropFilter: { delay: 0 },
      },
    },
  },
};

const topLinks = [
  {
    title: 'Projects',
    callBack: true,
  },
  {
    href: '/resume',
    title: 'Resume',
  },
  {
    href: '/about',
    title: 'About',
  },
];

const bottomLinks = [
  {
    href: 'https://www.linkedin.com/in/pirouzmehmandoost/',
    title: 'LinkedIn',
  },
  {
    href: 'https://github.com/pirouzmehmandoost/para/blob/main/README.md',
    title: 'Github',
  },
];

const Links = ({ toggleMenu }) => {
  return (
    <div className="flex flex-col w-full h-full justify-evenly text-center text-4xl uppercase text-neutral-900 bg-neutral-300/0">
      {/* top items */}
      <div
        className="flex flex-col bg-neutral-500/0"
        style={{
          maskImage:
            'radial-gradient(ellipse 70% 80% at 50% 50% , #a3a3a3 30%, #a3a3a300 70%)',
        }}
      >
        {topLinks.map((link, i) => {
          const { title, href } = link;
          return (
            <div key={`b_${i}`} className="perspective-origin-bottom my-2">
              <motion.div
                custom={i}
                variants={variants.top}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                {link.callBack ? (
                  <div className="cursor-pointer" onClick={() => toggleMenu()}>
                    {title}
                  </div>
                ) : (
                  <Link
                    className="cursor-pointer"
                    rel="noopener noreferrer"
                    href={href}
                  >
                    {title}
                  </Link>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
      {/* bottom items */}
      <motion.div
        className="flex flex-row w-fit h-fit justify-center place-items-center"
        style={{
          maskImage:
            'radial-gradient(ellipse 80% 100% at 50% 50% , #a3a3a3 30%, #a3a3a300 90%)',
        }}
      >
        {bottomLinks.map((link, i) => {
          const { title, href } = link;

          return (
            <motion.div
              variants={variants.bottom}
              custom={i}
              initial="initial"
              animate="enter"
              exit="exit"
              key={`f_${i}`}
              className="mx-4"
            >
              <Link
                className="cursor-pointer"
                rel="noopener noreferrer"
                target="blank"
                href={href}
              >
                {title}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

const ToggleButton = ({ isActive, toggleMenu }) => {
  return (
    <div>
      <div className="fixed top-10 left-10 justify-center place-self-center bg-red-600 w-fit h-fit">
        <div onClick={() => toggleMenu()}>
          <div
            className={`absolute cursor-pointer p-4 rounded-full bg-neutral-500/10 backdrop-blur-xl transition-all duration-1000 ease-in-out text-neutral-700 hover:text-neutral-700  ${isActive ? 'opacity-0  bg-neutral-500/30' : 'opacity-100'}`}
          >
            <MenuIcon fontSize="large" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Menu = () => {
  const [isActive, setIsActive] = useState(true);
  return (
    <div className="relative flex flex-col grow w-fit h-fit z-1 place-items-center ">
      {/* menu/links container */}
      <motion.div
        variants={variants.menu}
        animate={isActive ? 'open' : 'closed'}
        initial="open"
      >
        <AnimatePresence>
          {isActive && (
            <Links
              toggleMenu={() => {
                setIsActive(!isActive);
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
      <ToggleButton
        isActive={isActive}
        toggleMenu={() => {
          setIsActive(!isActive);
        }}
      />
      {/* overlay a blurry div */}
      {/* <AnimatePresence> */}
      <motion.div
        className="absolute flex flex-col grow w-full h-full -z-1 place-self-center justify-center bg-neutral-400/0 "
        variants={variants.overlay}
        animate={isActive ? 'open' : 'closed'}
        initial="open"
      />
      {/* </AnimatePresence> */}
    </div>
  );
};

const Home = () => {
  return (
    <main className="flex flex-col w-full h-full">
      <div className="relative flex w-full h-full">
        <Menu />
      </div>
      <div className="fixed inset-0 bottom-10 flex-col grow w-full h-full">
        <GlobalModelViewer />
      </div>
    </main>
  );
};

export default Home;
