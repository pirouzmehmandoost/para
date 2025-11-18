'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

const perspective = {
  initial: {
    filter: 'blur(100px)',
    opacity: 0,
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
  })
};

export const slideIn = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      delay: 0.75 + i * 0.1,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
  exit: {
    opacity: 0,
    filter: 'blur(100px)',
    transition: { duration: 0.5, type: 'tween', ease: 'easeInOut' },
  },
};

const menu = {
  open: {
    width: '480px',
    height: '650px',
    top: '0px',
    right: '0px',
    translateX: '0px',
    translateY: '0px',
    transition: { duration: 0.75, type: 'tween', ease: [0.76, 0, 0.24, 1] },
  },
  closed: {
    width: '0px',
    height: '0px',
    top: '0px',
    right: '0px',
    translateX: '40px',
    translateY: '40px',
    transition: {
      duration: 0.75,
      delay: 0.35,
      type: 'tween',
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const Links = ({ topLinks, bottomLinks }) => {
  return (
    <div className="flex flex-col w-full h-full justify-between p-10 text-4xl ">
      <div className="flex flex-col items-center">
        {topLinks.map((link, index) => 
          <div key={`b_${index}`}>
            <motion.div
              animate="enter"
              custom={index}
              exit="exit"
              initial="initial"
              variants={perspective}
            >
              <Link className="cursor-pointer" href={link?.href} rel="noopener noreferrer" >
                {link?.title}
              </Link>
            </motion.div>
          </div>
        )}
      </div>
      <motion.div className="flex flex-row w-full justify-between">
        {bottomLinks.map((link, index) => 
          <motion.div
            animate="enter"
            custom={index}
            exit="exit"
            initial="initial"
            key={`f_${index}`}
            variants={slideIn}
          >
            <Link
              className="border-transparent cursor-pointer"
              href={link?.href}
              rel="noopener noreferrer"
              target="blank"
            >
              {link?.title}
            </Link>
          </motion.div>
        )}
      </motion.div>
      <div className=" absolute flex w-full h-full bg-neutral-200/80 rounded-3xl -z-1 inset-0 scale-100 blur-xl" />
      <div
        className="absolute flex w-full h-full"
        style={{ maskImage: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,00,0,1) 100%)` }}
      />
    </div>
  );
};

const ButtonContainer = ({ isActive, toggleMenu }) => {
  return (
    <div>
      <div className="flex grow w-full h-full">
        <div onClick={() => toggleMenu()}>
          <div className={`absolute cursor-pointer p-4 rounded-full bg-neutral-500/10 backdrop-blur-xl transition-all duration-1000 ease-in-out text-neutral-700 hover:text-neutral-700 ${isActive ? 'opacity-100' : 'opacity-0 bg-neutral-500/30'}`} >
            <CloseFullscreenIcon fontSize="large" />
          </div>
          <div className={`absolute cursor-pointer p-4 rounded-full bg-neutral-500/10 backdrop-blur-xl transition-all duration-1000 ease-in-out text-neutral-700 hover:text-neutral-700  ${isActive ? 'opacity-0  bg-neutral-500/30' : 'opacity-100'}`} >
            <MenuIcon fontSize="large" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MainMenu = (props) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="relative flex flex-col grow w-fit min-w-18 h-fit min-h-18">
      <div>
        <motion.div
          className={`absolute flex flex-col inset-0 bottom-0 w-fit h-fit bg-neutral-200/0 rounded-3xl`}
          animate={isActive ? 'open' : 'closed'}
          initial="closed"
          variants={menu}
        >
          <AnimatePresence>
            { isActive && <Links {...props} /> }
          </AnimatePresence>
        </motion.div>

        <div className="absolute flex flex-row">
          <ButtonContainer
            isActive={isActive}
            toggleMenu={() => { setIsActive(!isActive); }}
          />
        </div>
      </div>
    </div>
  );
};

export default MainMenu;