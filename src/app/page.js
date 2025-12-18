'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useSelection from '@stores/selectionStore';
import { getSlugFromName } from '@utils/slug';
import { GlobalModelViewer } from '@three/scenes/GlobalModelViewer';

const EASE_OUT = [0.215, 0.61, 0.355, 1];
const EASE_IN_OUT = [0.76, 0, 0.24, 1];

const createVariants = (reduceMotion) => {
  const dur = (ms) => (reduceMotion ? 0 : ms);
  const delay = (ms) => (reduceMotion ? 0 : ms);

  return {
    top: {
      initial: {
        opacity: 0,
        rotateX: 90,
        x: -20,
        y: 80,
      },
      enter: (i) => ({
        opacity: 1,
        rotateX: 0,
        x: 0,
        y: 0,
        transition: {
          duration: dur(0.65),
          delay: delay(0.5 + i * 0.1),
          ease: EASE_OUT,
          opacity: { duration: dur(0.35) },
        },
      }),
      exit: (i) => ({
        opacity: 0,
        transition: {
          duration: dur(0.45),
          delay: delay(Math.max(0, 0.3 - i * 0.06)),
          ease: EASE_IN_OUT,
        },
      }),
    },

    bottom: {
      initial: { opacity: 0, y: 20 },
      enter: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
          duration: dur(0.5),
          delay: delay(0.75 + i * 0.1),
          ease: EASE_OUT,
        },
      }),
      exit: {
        opacity: 0,
        transition: { duration: dur(0.35), ease: EASE_IN_OUT },
      },
    },

    menu: {
      open: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: dur(0.55), ease: EASE_IN_OUT },
      },
      closed: {
        opacity: 0,
        scale: 0.98,
        y: -6,
        transition: { duration: dur(0.45), ease: EASE_IN_OUT },
      },
    },

    overlay: {
      open: { opacity: 1, transition: { duration: dur(0.35), ease: EASE_IN_OUT } },
      closed: { opacity: 0, transition: { duration: dur(0.25), ease: EASE_IN_OUT } },
    },

    modal: {
      hidden: {
        opacity: 0,
        y: 6,
        transition: { duration: dur(0.2), ease: EASE_IN_OUT },
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: dur(0.3),
          ease: EASE_OUT,
          staggerChildren: reduceMotion ? 0 : 0.1,
          delayChildren: delay(0.15),
        },
      },
    },

    modalItem: {
      hidden: { opacity: 0, rotateX: 80, y: 40 },
      visible: {
        opacity: 1,
        rotateX: 0,
        y: 0,
        transition: { duration: dur(0.55), ease: EASE_OUT },
      },
    },
  };
};

const mainMenuTopLinks = [
  { title: 'Redesign in progress', callBack: true },
  { title: 'Come back soon', callBack: false },
];

const mainMenuBottomLinks = [
  { href: 'https://www.linkedin.com/in/pirouzmehmandoost/', title: 'LinkedIn' },
  { href: 'https://github.com/pirouzmehmandoost/para/blob/main/README.md', title: 'Github' },
];

const MainMenuContent = ({ toggleMenu, variants }) => {
  return (
    <div className='flex flex-col w-full h-full justify-around text-center text-4xl uppercase text-neutral-900 bg-neutral-300/0'>
      {/* Header */}
      <motion.div
        key='b_0'
        custom={0}
        variants={variants.top}
        initial='initial'
        animate='enter'
        exit='exit'
        className='flex flex-row w-full h-fit justify-center text-nowrap perspective-origin-bottom bg-neutral-500/0'
        style={{
          maskImage: 'radial-gradient(ellipse 80% 100% at 50% 50% , #a3a3a3 30%, #a3a3a300 90%)',
        }}
      >
        <div className='text-nowrap sm:text-4xl md:text-4xl lg:text-5xl xl:text-5xl 2xl:text-5xl md:px-1 xl:px-1 lg:px-1 2xl:px-1'>
          Pirouz Mehmandoost
        </div>
      </motion.div>

      {/* top links */}
      <div
        className='flex flex-col justify-evenly bg-neutral-500/0'
        style={{
          maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50% , #a3a3a3 30%, #a3a3a300 70%)',
        }}
      >
        {mainMenuTopLinks.map(({ title, href, callBack }, index) => {
          const i = index + 1;
          return (
            <div key={`b_${i}`} className='perspective-origin-bottom my-2'>
              <motion.div
                custom={i}
                variants={variants.top}
                initial='initial'
                animate='enter'
                exit='exit'
              >
                {callBack ? (
                  <button
                    type='button'
                    className='uppercase cursor-pointer'
                    onClick={() => toggleMenu()}
                  >
                    {title}
                  </button>
                ) : (
                  <Link
                    className='cursor-pointer'
                    href={href ? href : '/'}
                    rel='noopener noreferrer'
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
        className='flex flex-row w-full h-fit justify-between'
        style={{
          maskImage: 'radial-gradient(ellipse 80% 100% at 50% 50% , #a3a3a3 30%, #a3a3a300 90%)',
        }}
      >
        {mainMenuBottomLinks.map(({ title, href }, index) => {
          return (
            <motion.div
              variants={variants.bottom}
              custom={index}
              initial='initial'
              animate='enter'
              exit='exit'
              key={`f_${index}`}
              className='flex flex-row w-full h-fit justify-center'
            >
              <Link
                className='cursor-pointer'
                href={href}
                rel='noopener noreferrer'
                target='_blank'
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

{/*
  * Displays the currently selected project's name/description and a link when a scene object is selected (visible is set from a clicked Three.js object).
  * The modal shows when visible is truthy: showMenu(e.object: Object3D)
  * Flow: 
  *  HomePage(reads state from Zustand store) -> 
  *  GlobalModelViewer.js (renders Canvas and SceneBuilder) -> 
  *  SceneBuilder.js (click events trigger Zustand state updates) -> 
  *  Group.js (child of SceneBuilder) -> 
  *  Model.js (child of Group, renders selectable Object3D).
*/}
const SelectionDisplayModal = ({ visible, variants }) => {
  const selection = useSelection((state) => state.selection);
  const isActive = Boolean(visible);

  return (
    <div className='relative flex flex-row grow w-full h-full z-10 justify-center bg-neutral-500/0 pointer-events-none'>
      <AnimatePresence mode='wait'>
        {isActive && (
          <motion.div
            key='menu-content'
            className='flex flex-col w-fit h-full text-neutral-800 place-items-start'
            animate='visible'
            exit='hidden'
            initial='hidden'
            variants={variants.modal}
          >
            <motion.div variants={variants.modalItem} className='text-4xl perspective-origin-bottom'>
              {selection?.name}
            </motion.div>

            <motion.div variants={variants.modalItem} className='text-2xl text-pretty perspective-origin-bottom'>
              {selection?.shortDescription}
            </motion.div>

            <motion.div variants={variants.modalItem} className='place-self-center text-3xl text-neutral-800 perspective-origin-bottom'>
              <Link
                href={`/projects/${getSlugFromName(selection?.name)}`}
                rel='noopener noreferrer'
                className='pointer-events-auto'
              >
                <div
                  className='rounded-full bg-radial-[at_50%_50%] from-neutral-500/35 from-20% to-neutral-500/0 to-70%'
                  style={{
                    maskImage:
                      'radial-gradient(ellipse 90% 90% at 50% 50%, #a3a3a3 10%, #a3a3a300 90%)',
                  }}
                >
                  Click to see more
                </div>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop overlay: fade only (no blur animation, no width/height animation) */}
      <motion.div
        className='absolute inset-0 -z-10 bg-neutral-300/0 backdrop-blur-md md:backdrop-blur-xl contrast-150 hue-rotate-30 pointer-events-none'
        style={{
          maskImage:
            'radial-gradient(ellipse 50% 50% at 50% 50%, #a3a3a3 30%, #a3a3a300 70%)',
        }}
        variants={variants.overlay}
        animate={isActive ? 'open' : 'closed'}
        initial='closed'
      />
    </div>
  );
};

const HomePage = () => {
  const shouldReduceMotion = useReducedMotion();
  const variants = createVariants(shouldReduceMotion);
  const [modal, showModal] = useState(null);
  const [menu, showMenu] = useState(true);

  return (
    <main className='flex flex-col w-full h-full'>
      <div className='relative flex w-full h-fit'>
        {/* Homepage menu */}
        <div className='relative flex flex-col grow w-fit h-fit z-10 place-items-center'>
          {/* Toggle button */}
          <button
            type='button'
            aria-label='Toggle menu'
            className='fixed w-fit h-fit z-20 inset-0 top-5 left-5 justify-center p-4 rounded-full cursor-pointer bg-neutral-500/10 backdrop-blur-md md:backdrop-blur-xl transition-all duration-1000 ease-in-out text-neutral-700 hover:text-neutral-700'
            onClick={() => {
              showModal(false);
              showMenu((x) => !x);
            }}
          >
           {!menu ? <MenuIcon fontSize='large' /> : <CloseIcon fontSize='large' /> } 
          </button>

          <motion.div
            variants={variants.menu}
            animate={menu ? 'open' : 'closed'}
            initial='open'
            className={`fixed inset-0 z-10 flex justify-center origin-center ${menu? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            <AnimatePresence>
              {menu && (
                <MainMenuContent
                  variants={variants}
                  toggleMenu={() => showMenu((x) => !x)}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Backdrop blur over the rest of the page while menu is open */}
          <motion.div
            className='fixed inset-0 -z-10 bg-neutral-400/0 backdrop-blur-md md:backdrop-blur-xl pointer-events-none'
            variants={variants.overlay}
            animate={menu ? 'open' : 'closed'}
            initial='open'
          />
        </div>
      </div>

      <div className='fixed inset-0 bottom-10 flex flex-col grow w-full h-full'>
        <GlobalModelViewer showMenu={showModal} />
      </div>

      {/* Modal wrapper */}
      <div
        className={`fixed flex flex-col grow top-[30px] md:left-10 lg:left-10 xl:left-10 2xl:left-10 w-full sm:w-full md:w-fit lg:w-fit xl:w-fit 2xl:w-fit h-1/5 place-self-center justify-center transition-all duration-500 ease-in-out ${
          modal ? 'h-1/5' : 'h-fit'
        }`}
      >
        <SelectionDisplayModal visible={modal} variants={variants} />
      </div>
    </main>
  );
};

export default HomePage;