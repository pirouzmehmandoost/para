'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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

  const [isActive, setIsActive] = useState(showMenu);

  useEffect(() => {
    if (showMenu) setIsActive(showMenu);
    else setIsActive(undefined);
  }, [showMenu]);

  // console.log('BottomMenu. showMenu: ', isActive?.name);

  const links = [
    {
      title: 'Close Me',
      callBack: true,
    },

    {
      title: `title is ${isActive?.name}`,
      callBack: false,
    },
  ];

  // const MenuLinks = ({ callBack }) => {
  //   return (
  //     <div className="flex flex-col w-full h-full justify-around text-center text-4xl uppercase text-neutral-900 bg-neutral-300">
  //       {/* Header */}
  //       <motion.div
  //         key={`b_0`}
  //         custom={0}
  //         variants={motionVariants.top}
  //         initial="initial"
  //         animate="enter"
  //         exit="exit"
  //         className="flex flex-row w-full h-fit justify-center text-nowrap perspective-origin-bottom bg-neutral-500/0"
  //         style={{
  //           maskImage:
  //             'radial-gradient(ellipse 80% 100% at 50% 50% , #a3a3a3 30%, #a3a3a300 90%)',
  //         }}
  //       >
  //         <div className="text-nowrap sm:text-4xl md:text-4xl lg:text:5xl xl:text-5xl 2xl:text-5xl md:px-1 xl:px-1 lg:px-1 2xl:px-1">
  //           Some Text
  //         </div>
  //       </motion.div>
  //       {/* top links */}
  //       <div
  //         className="flex flex-row w-full h-fit justify-between bg-neutral-500/0"
  //         style={{
  //           maskImage:
  //             'radial-gradient(ellipse 70% 80% at 50% 50% , #a3a3a3 30%, #a3a3a300 70%)',
  //         }}
  //       >
  //         {links.map((link, i) => {
  //           const { title, href } = link;
  //           return (
  //             <div
  //               key={`b_${i + 1}`}
  //               className="perspective-origin-bottom my-2"
  //             >
  //               <motion.div
  //                 custom={i + 1}
  //                 variants={motionVariants.top}
  //                 initial="initial"
  //                 animate="enter"
  //                 exit="exit"
  //               >
  //                 {link.callBack ? (
  //                   <div className="cursor-pointer" onClick={() => callBack()}>
  //                     {title}
  //                   </div>
  //                 ) : (
  //                   <p>{title} </p>
  //                 )}
  //               </motion.div>
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>
  //   );
  // };

  // const CloseButton = ({ isActive, callBack }) => {
  //   return (
  //     <div
  //       onClick={() => callBack()}
  //       className={`fixed w-fit h-fit inset-0 bottom-5 left-5 justify-center p-4 rounded-full cursor-pointer bg-red-500 backdrop-blur-xl transition-all duration-1000 ease-in-out text-neutral-700 hover:text-neutral-700  ${isActive ? 'opacity-0 w-1 h-1  bg-neutral-500/30' : 'opacity-100 w-fit h-fit'}`}
  //     >
  //       <MenuIcon fontSize="large" />
  //     </div>
  //   );
  // };

  return (
    <div
      className="relative flex flex-row grow w-full h-full z-1 justify-center bg-neutral-500/0"
      style={{
        maskImage:
          'radial-gradient(ellipse 70% 80% at 50% 50% , #a3a3a3 30%, #a3a3a300 70%)',
      }}
    >
      {/* menu/links container */}
      <motion.div
        variants={motionVariants.menu}
        animate={isActive ? 'open' : 'closed'}
        initial="open"
      >
        <AnimatePresence>
          {isActive && (
            <div className="bg-neutral-300/50 text-4xl uppercase text-neutral-900 backdrop-blur-xl ">
              {isActive ? isActive?.name : 'nothing selected'}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* overlay a blurry div */}
      {/* <motion.div
        className="absolute flex flex-col grow w-full h-1/2 -z-1 place-self-center justify-center bg-pink-400/100 backdrop-blur-xl"
        variants={variants.overlay}
        animate={isActive ? 'open' : 'closed'}
        initial="open"
      /> */}
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
      <div className="fixed bottom-0 flex flex-col grow w-full h-1/4 bg-yellow-400/0 ">
        <BottomMenu showMenu={visible} />
      </div>
    </main>
  );
};

export default Home;
