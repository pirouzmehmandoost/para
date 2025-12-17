'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import useSelection from '@stores/selectionStore';
import { getSlugFromName } from '@utils/slug';
import { GlobalModelViewer } from '@three/scenes/GlobalModelViewer';
// import useMenu from '@stores/menuStore';

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

const mainMenuTopLinks = [
  {
    title: 'Redesign in progress',
    callBack: true,
  },
  {
    title: 'Come back soon',
    callBack: false,
  },
  // {
  //   href: '/resume',
  //   title: 'Resume',
  // },
  // {
  //   href: '/about',
  //   title: 'About',
  // },
];

const mainMenuBottomLinks = [
  {
    href: 'https://www.linkedin.com/in/pirouzmehmandoost/',
    title: 'LinkedIn',
  },
  {
    href: 'https://github.com/pirouzmehmandoost/para/blob/main/README.md',
    title: 'Github',
  },
];

const MainMenuLinks = ({ toggleMenu }) => {
  return (
    <div className='flex flex-col w-full h-full justify-around text-center text-4xl uppercase text-neutral-900 bg-neutral-300/0'>
      {/* Header */}
      <motion.div
        key={`b_0`}
        custom={0}
        variants={variants.top}
        initial='initial'
        animate='enter'
        exit='exit'
        className='flex flex-row w-full h-fit justify-center text-nowrap perspective-origin-bottom bg-neutral-500/0'
        style={{ maskImage: 'radial-gradient(ellipse 80% 100% at 50% 50% , #a3a3a3 30%, #a3a3a300 90%)', }}
      >
        <div className='text-nowrap sm:text-4xl md:text-4xl lg:text:5xl xl:text-5xl 2xl:text-5xl md:px-1 xl:px-1 lg:px-1 2xl:px-1'>
          Pirouz Mehmandoost
        </div>
      </motion.div>

      {/* top links */}
      <div className='flex flex-col justify-evenly bg-neutral-500/0' style={{ maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50% , #a3a3a3 30%, #a3a3a300 70%)', }}>
        {mainMenuTopLinks.map(({ title, href, callBack }, index) => {
          return (
            <div key={`b_${index+1}`} className='perspective-origin-bottom my-2'>
              <motion.div
                custom={index+1}
                variants={variants.top}
                initial='initial'
                animate='enter'
                exit='exit'
              >
                {callBack
                  ? ( <div className='cursor-pointer' onClick={() => toggleMenu()}>
                        {title}
                      </div>
                    ) 
                  : ( <Link className='cursor-pointer' href={href? href : '/'} rel='noopener noreferrer'>
                        {title}
                      </Link>
                    )
                }
              </motion.div>
            </div>
          )
        })}
      </div>
      {/* bottom links */}
      <motion.div className='flex flex-row w-full h-fit justify-between' style={{ maskImage: 'radial-gradient(ellipse 80% 100% at 50% 50% , #a3a3a3 30%, #a3a3a300 90%)', }}>
        {mainMenuBottomLinks.map(({ title, href }, index) => {
          return (
            <motion.div
              variants={variants.bottom}
              custom={index}
              initial='initial'
              animate='enter'
              exit='exit'
              key={`f_${index}`}
              className='mx-5'
            >
              <Link className='cursor-pointer' href={href} rel='noopener noreferrer' target='blank'>
                {title}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

// this Modal displays a selected model/project's name, description, and a link  when a Model is selected.
const DisplayModal = ({ visible }) => {
  const [isActive, setIsActive] = useState(visible);
  const selection = useSelection((state) => state.selection);

  useEffect(() => {
    if (visible) setIsActive(visible);
    else setIsActive(undefined);
  }, [visible]);
  

  const menuVariants = {
    hidden: {
      opacity: 0,
      filter: 'blur(100px)',
      transition: {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
      }
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.75,
        ease: [0.215, 0.61, 0.355, 1],
        staggerChildren: 0.1,
        delayChildren: 0.5,
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      rotateX: 90,
      translateY: 80,
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      translateY: 0,
      transition: {
        duration: 0.65,
        ease: [0.215, 0.61, 0.355, 1],
      }
    }
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
      width: '1vw',
      height: '1vh',
      transition: {
        delay: 0.5,
        duration: 0.6,
      }
    },
    visible: {
      opacity: 1,
      width: '100vw',
      height: '100vh',
      transition: {
        duration: 0.5,
        delay: 0.5,
      }
    }
  };

  return (
    <div className='relative flex flex-row grow w-full h-full z-1 justify-center bg-neutral-500/0 pointer-events-none'>
      <AnimatePresence mode='wait'>
        { isActive && (
          <motion.div
            key='menu-content'
            className='flex flex-col w-fit h-full text-neutral-800 place-items-start'
            animate='visible'
            exit='hidden'
            initial='hidden'
            variants={menuVariants}
          >
            <motion.div variants={itemVariants} className='text-4xl perspective-origin-bottom'>
              {selection?.name}
            </motion.div>
            <motion.div variants={itemVariants} className='text-2xl text-pretty perspective-origin-bottom'>
              {selection?.shortDescription}
            </motion.div>
            <motion.div variants={itemVariants} className='place-self-center text-3xl text-neutral-800 perspective-origin-bottom'>
              <Link href={`/projects/${getSlugFromName(selection?.name)}`} rel='noopener noreferrer' className='pointer-events-auto'>
                <div className='rounded-full bg-radial-[at_50%_50%] from-neutral-500/35 from-20% to-neutral-500/0 to-70%' style={{ maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, #a3a3a3 10%, #a3a3a300 90%)', }}>
                  Click to see more
                </div>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Backdrop overlay */}
      <motion.div
        className='absolute flex flex-col grow w-full h-full -z-1 place-self-center justify-center bg-neutral-300/0 backdrop-blur-xl contrast-150 hue-rotate-30 pointer-events-none'
        style={{ maskImage:'radial-gradient(ellipse 50% 50% at 50% 50%, #a3a3a3 30%, #a3a3a300 70%)', }}
        animate={isActive ? 'visible' : 'hidden'}
        initial='hidden'
        variants={overlayVariants}
      />
    </div>
  );
};


const HomePage = () => {
  const [modal, showModal] = useState(null);
  const [menu, showMenu] = useState(true);

  return (
    <main className='flex flex-col w-full h-full'>
      <div className='relative flex w-full h-fit'>
        {/* Homepage menu */}
        <div className='relative flex flex-col grow w-fit h-fit z-1 place-items-center'>
          {/* Menu toggle button */}
          <div 
            className={`fixed w-fit h-fit inset-0 top-5 left-5 justify-center p-4 rounded-full cursor-pointer bg-neutral-500/10 backdrop-blur-xl transition-all duration-1000 ease-in-out text-neutral-700 hover:text-neutral-700  ${menu ? 'opacity-0 w-1 h-1  bg-neutral-500/30' : 'opacity-100 w-fit h-fit'}`}
            onClick={() => {
              showModal(false);
              showMenu(x => !x)
            }}
          >
            <MenuIcon fontSize='large' />
          </div>
          {/* Main Menu Contents */}
          <motion.div
            variants={variants.menu}
            animate={menu ? 'open' : 'closed'}
            initial='open'
          >
            <AnimatePresence>
              {menu && ( <MainMenuLinks toggleMenu={() => { showMenu(x => !x) }} /> )}
            </AnimatePresence>
          </motion.div>
          {/* div with backdrop blur lays over the rest of the elements (GlobalModelViewer and DisplayModal)*/}
          <motion.div
            className='absolute flex flex-col grow w-full h-full -z-1 place-self-center justify-center bg-neutral-400/0 backdrop-blur-xl'
            variants={variants.overlay}
            animate={menu ? 'open' : 'closed'}
            initial='open'
          />
        </div>
      </div>
      <div className='fixed inset-0 bottom-10 flex flex-col grow w-full h-full'>
        <GlobalModelViewer showMenu={showModal} />
      </div>
      <div className={`fixed place-self-center justify-center top-30  md:left-10 lg:left-10 xl:left-10 2xl:left-10 flex flex-col grow w-full sm:w-full md:w-fit lg:w-fit xl:w-fit 2xl:w-fit h-1/5 transition-all duration 500 ease-in-out ${modal ? 'h-1/5' : 'h-fit'}`}>
        <DisplayModal visible={modal} />
      </div>
    </main>
  );
};

export default HomePage;
