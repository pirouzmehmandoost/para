'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import useSelection from '@stores/selectionStore';
import { GlobalModelViewer } from '@three/scenes/GlobalModelViewer';

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
      opacity: 1,
      width: '100vw',
      height: '100vh',
      transition: {
        delay: 0,
        duration: 0.5,
        type: 'easeInOut',
        ease: [0.76, 0, 0.24, 1],
        opacity: { delay: 0.5 },
      },
    },
    closed: {
      opacity: 0,
      width: '1vw',
      height: '1vh',
      transition: {
        delay: 0.5,
        duration: 0.6,
        type: 'easeInOut',
        ease: [0.76, 0, 0.24, 1],
        opacity: { delay: 0.5 },
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
    <div className="flex flex-col w-full h-full justify-around text-center text-4xl uppercase text-neutral-900 bg-neutral-300/0">
      {/* Header */}
      <motion.div
        key={`b_0`}
        custom={0}
        variants={variants.top}
        initial="initial"
        animate="enter"
        exit="exit"
        className="flex flex-row w-full h-fit justify-center text-nowrap perspective-origin-bottom bg-neutral-500/0"
        style={{
          maskImage:
            'radial-gradient(ellipse 80% 100% at 50% 50% , #a3a3a3 30%, #a3a3a300 90%)',
        }}
      >
        <div className="text-nowrap sm:text-4xl md:text-4xl lg:text:5xl xl:text-5xl 2xl:text-5xl md:px-1 xl:px-1 lg:px-1 2xl:px-1">
          Pirouz Mehmandoost
        </div>
      </motion.div>
      {/* top links */}
      <div
        className="flex flex-col justify-evenly bg-neutral-500/0"
        style={{
          maskImage:
            'radial-gradient(ellipse 70% 80% at 50% 50% , #a3a3a3 30%, #a3a3a300 70%)',
        }}
      >
        {topLinks.map((link, i) => {
          const { title, href } = link;
          return (
            <div key={`b_${i + 1}`} className="perspective-origin-bottom my-2">
              <motion.div
                custom={i + 1}
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
      {/* bottom links */}
      <motion.div
        className="flex flex-row w-full h-fit justify-between"
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
              className="mx-5"
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
    <div
      onClick={() => toggleMenu()}
      className={`fixed w-fit h-fit inset-0 top-5 left-5 justify-center p-4 rounded-full cursor-pointer bg-neutral-500/10 backdrop-blur-xl transition-all duration-1000 ease-in-out text-neutral-700 hover:text-neutral-700  ${isActive ? 'opacity-0 w-1 h-1  bg-neutral-500/30' : 'opacity-100 w-fit h-fit'}`}
    >
      <MenuIcon fontSize="large" />
    </div>
  );
};

const Menu = () => {
  const [isActive, setIsActive] = useState(true);
  return (
    <div className="relative flex flex-col grow w-fit h-fit z-1 place-items-center ">
      <ToggleButton
        isActive={isActive}
        toggleMenu={() => {
          setIsActive(!isActive);
        }}
      />
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
      {/* overlay a blurry div */}
      <motion.div
        className="absolute flex flex-col grow w-full h-full -z-1 place-self-center justify-center bg-neutral-400/0 backdrop-blur-xl"
        variants={variants.overlay}
        animate={isActive ? 'open' : 'closed'}
        initial="open"
      />
    </div>
  );
};

const BottomMenu = ({ showMenu }) => {
  const motionVariants = {
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
        height: '25vh',
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

  const [isActive, setIsActive] = useState(showMenu);

  useEffect(() => {
    if (showMenu) setIsActive(showMenu);
    else setIsActive(undefined);
  }, [showMenu]);
  const selection = useSelection((state) => state.selection);

  const links = [
    {
      title: `${selection?.shortDescription}`,
      callBack: false,
    },
    {
      title: 'Click to See More',
      callBack: true,
    },
  ];

  const MenuLinks = ({ callBack }) => {
    return (
      <div className="flex flex-col w-fit h-full text-neutral-800 bg-pink-500/0 place-items-start">
        <div className="text-4xl perspective-origin-bottom">
          <motion.div
            custom={0}
            variants={motionVariants.top}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            {selection?.name}
          </motion.div>
        </div>
        <div className="text-2xl text-pretty perspective-origin-bottom ">
          <motion.div
            custom={1}
            variants={motionVariants.top}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <div>{selection?.shortDescription}</div>
          </motion.div>
        </div>
        <div className="place-self-center text-3xl  text-neutral-800 perspective-origin-bottom">
          <motion.div
            custom={1}
            variants={motionVariants.top}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <Link href="/projects/project" rel="noopener noreferrer">
              <div
                className="rounded-full bg-radial-[at_50%_50%] from-neutral-500/35 from-20% to-neutral-500/0 to-70%"
                style={{
                  maskImage:
                    'radial-gradient(ellipse 90% 90% at 50% 50% , #a3a3a3 10%, #a3a3a300 90%)',
                }}
              >
                Click to see more
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-row grow w-full h-full z-1 justify-center bg-neutral-500/0">
      <motion.div
        variants={motionVariants.menu}
        animate={isActive ? 'open' : 'closed'}
        initial="open"
      >
        <AnimatePresence>{isActive && <MenuLinks />}</AnimatePresence>
      </motion.div>
      {/* overlay a blurry div */}
      <motion.div
        className="absolute flex flex-col grow w-full h-full -z-1 place-self-center justify-center bg-neutral-300/0  backdrop-blur-xl contrast-150 hue-rotate-30 "
        style={{
          maskImage:
            'radial-gradient(ellipse 50% 50% at 50% 50%, #a3a3a3 30%, #a3a3a300 70%)',
        }}
        variants={motionVariants.overlay}
        animate={isActive ? 'open' : 'closed'}
        initial="open"
      />
    </div>
  );
};

const Home = () => {
  const [visible, setVisible] = useState(null);

  return (
    <main className="flex flex-col w-full h-full">
      <div className="relative flex w-full h-fit">
        <Menu />
      </div>
      <div className="fixed inset-0 bottom-10 flex flex-col grow w-full h-full">
        <GlobalModelViewer showMenu={setVisible} />
      </div>
      <div
        className={`fixed place-self-center justify-center top-30  md:left-10 lg:left-10 xl:left-10 2xl:left-10 flex flex-col grow w-full sm:w-full md:w-fit lg:w-fit xl:w-fit 2xl:w-fit h-1/5 transition-all duration 500 ease-in-out ${visible ? 'h-1/5' : 'h-fit'}`}
      >
        <BottomMenu showMenu={visible} />
      </div>
    </main>
  );
};

export default Home;
