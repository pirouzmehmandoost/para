'use client';

import Link from 'next/link';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Easing,
  type Variants
} from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useMenu from '@stores/menuStore';

const EASE_OUT: Easing = [0.215, 0.61, 0.355, 1];
const EASE_IN_OUT: Easing = [0.76, 0, 0.24, 1];

type MenuVariants = {
  menu: Variants;
  overlay: Variants;
  topLinks: Variants;
  bottomLinks: Variants;
};

type MainMenuTopLink = { title: string; disabled?: boolean; href: string };

const mainMenuTopLinks: MainMenuTopLink[] = [
  { title: 'Redesign in progress', disabled: true, href: '/' },
  { title: 'Come back tomorrow', href: '/' },
];

type MainMenuBottomLink = { title: string; href: string };

const mainMenuBottomLinks: MainMenuBottomLink[] = [
  { title: 'LinkedIn', href: 'https://www.linkedin.com/in/pirouzmehmandoost/' },
  { title: 'Github', href: 'https://github.com/pirouzmehmandoost/para/blob/main/README.md' },
];

const createVariants = (reduceMotion: boolean): MenuVariants => {
  const dur = (seconds: number) => (reduceMotion ? 0 : seconds);
  const delay = (seconds: number) => (reduceMotion ? 0 : seconds);

  return {
    topLinks: {
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
    bottomLinks: {
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
  };
};

const MainMenu = () => {
  const shouldReduceMotion = useReducedMotion();
  const variants = createVariants(shouldReduceMotion);
  const menuVisible = useMenu(state => state.menuState.visible);
  const setVisible = useMenu(state => state.setVisible);

  return (
    <div className='flex flex-col w-full h-full'>
      <div className='relative flex w-full h-fit'>
        <div className='relative flex flex-col grow w-fit h-fit z-10 place-items-center'>
          <button
            aria-label='Toggle menu'
            className='fixed w-fit h-fit z-20 inset-0 top-5 left-5 justify-center p-4 rounded-full cursor-pointer bg-neutral-500/10 backdrop-blur-md md:backdrop-blur-xl transition-all duration-1000 ease-in-out text-neutral-700 hover:text-neutral-700'
            onClick={() => setVisible(!menuVisible)}
            type='button'
          >
            {!menuVisible ? <MenuIcon fontSize='large' /> : <CloseIcon fontSize='large' />}
          </button>
          <motion.div
            animate={menuVisible ? 'open' : 'closed'}
            className={`fixed inset-0 z-10 flex justify-center origin-center ${menuVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
            initial='open'
            variants={variants.menu}
          >
            <AnimatePresence>
              {menuVisible && (
                <div className='flex flex-col w-full h-full justify-around text-center text-4xl uppercase text-neutral-900 bg-neutral-300/0'>
                  {/* Header */}
                  <motion.div
                    key='b_0'
                    animate='enter'
                    className='flex flex-row w-full h-fit justify-center text-nowrap perspective-origin-bottom bg-neutral-500/0'
                    custom={0}
                    exit='exit'
                    initial='initial'
                    style={{ maskImage: 'radial-gradient(ellipse 80% 100% at 50% 50% , #a3a3a3 30%, #a3a3a300 90%)', }}
                    variants={variants.topLinks}
                  >
                    <div className='text-nowrap sm:text-4xl md:text-4xl lg:text-5xl xl:text-5xl 2xl:text-5xl md:px-1 xl:px-1 lg:px-1 2xl:px-1'>
                      Pirouz Mehmandoost
                    </div>
                  </motion.div>
                  {/* top links */}
                  <div
                    className='flex flex-col justify-evenly bg-neutral-500/0'
                    style={{ maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50% , #a3a3a3 30%, #a3a3a300 70%)', }}
                  >
                    {mainMenuTopLinks.map(({ title, href, disabled }, index) => {
                      const i = index + 1;
                      return (
                        <div key={`b_${i}`} className='perspective-origin-bottom my-2'>
                          <motion.div
                            animate='enter'
                            custom={i}
                            exit='exit'
                            initial='initial'
                            variants={variants.topLinks}
                          >
                            <Link
                              className='cursor-pointer'
                              href={href}
                              onClick={(e) => {
                                setVisible(false);
                                if (disabled) e.preventDefault();
                              }}
                            >
                              {title}
                            </Link>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                  {/* bottom links */}
                  <motion.div
                    className='flex flex-row w-full h-fit justify-between'
                    style={{ maskImage: 'radial-gradient(ellipse 80% 100% at 50% 50% , #a3a3a3 30%, #a3a3a300 90%)', }}
                  >
                    {mainMenuBottomLinks.map(({ title, href }, index) => {
                      return (
                        <motion.div
                          key={`f_${index}`}
                          animate='enter'
                          className='flex flex-row w-full h-fit justify-center'
                          custom={index}
                          exit='exit'
                          initial='initial'
                          variants={variants.bottomLinks}
                        >
                          <Link className='cursor-pointer' href={href} rel='noopener noreferrer' target='_blank'> {title} </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.div
            animate={menuVisible ? 'open' : 'closed'}
            className='fixed inset-0 -z-10 bg-neutral-400/0 backdrop-blur-md md:backdrop-blur-xl pointer-events-none'
            initial='open'
            variants={variants.overlay}
          />
        </div>
      </div>
    </div>
  );
};

export default MainMenu;