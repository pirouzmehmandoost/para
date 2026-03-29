'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import useSelection from '@stores/selectionStore';
import { getSlugFromName } from '@utils/slug';
import { portfolio } from '@configs/globals';
import CommandPalette from '@ui/CommandPalette';

const EASE_OUT = [0.215, 0.61, 0.355, 1];
const EASE_IN_OUT = [0.76, 0, 0.24, 1];
const { projects } = portfolio;

const createVariants = (reduceMotion) => {
  const dur = (ms) => (reduceMotion ? 0 : ms);
  const delay = (ms) => (reduceMotion ? 0 : ms);

  return {
    overlay: {
      open: { opacity: 1, transition: { duration: dur(0.35), ease: EASE_IN_OUT } },
      closed: { opacity: 0, transition: { duration: dur(0.25), ease: EASE_IN_OUT } },
    },
    modal: {
      hidden: { opacity: 0, y: 6, transition: { duration: dur(0.2), ease: EASE_IN_OUT } },
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
      visible: { opacity: 1, rotateX: 0, y: 0, transition: { duration: dur(0.55), ease: EASE_OUT } },
    },
  };
};

const SelectionDisplayModal = () => {
  const isFocused = useSelection((state) => state.selection.isFocused);
  const setSelectionStore = useSelection((state) => state.setSelection);
  const shouldReduceMotion = useReducedMotion();
  const variants = createVariants(shouldReduceMotion);
  const focusedProject = projects.find(({ sceneData: { fileData: { nodeName = '' } = {} } = {} }) => nodeName === isFocused);
  const handleClick = () => { if (focusedProject) setSelectionStore({ ...focusedProject }) };

  const {
    displayName = '',
    productData: {
      shortDescription = '',
    } = {},
  } = focusedProject || {};

  const modal = Boolean(displayName.length);
  const route = `/projects/${getSlugFromName(displayName)}`;

  return (
    <div className={`fixed flex flex-col grow place-self-center justify-center h-1/5 w-full sm:w-full md:w-full lg:w-fit xl:w-fit 2xl:w-fit top-32 md:left-10 lg:left-10 xl:left-10 2xl:left-10 transition-all duration-500 ease-in-out 
        ${modal ? 'h-1/5' : 'h-fit'}`}
    >
      <div className='relative flex flex-row grow w-full h-full z-10 justify-center bg-neutral-500/0 pointer-events-none'>
        <AnimatePresence mode='wait'>
          {modal && (
            <motion.div
              id='modal-content'
              className='flex flex-col w-fit h-full text-neutral-800 place-items-start'
              animate='visible'
              exit='hidden'
              initial='hidden'
              variants={variants.modal}
            >
              <motion.div
                variants={variants.modalItem}
                className='place-self-center text-center text-4xl perspective-origin-bottom'
              >
                {displayName}
              </motion.div>
              <motion.div
                variants={variants.modalItem}
                className='text-2xl text-center text-pretty perspective-origin-bottom'
              >
                {shortDescription}
              </motion.div>
              <motion.div
                variants={variants.modalItem}
                className='place-self-center text-center text-3xl text-neutral-800 perspective-origin-bottom'
              >
                <Link
                  href={route}
                  rel='noopener noreferrer'
                  className='pointer-events-auto'
                  onClick={handleClick}
                >
                  <div className='cursor-pointer drop-shadow-xs drop-shadow-black/50'> View Details </div>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// `/projects/[slug]` is an intercepting route mounted over the home page. It renders ProjectOverlay.
// SelectionDisplayModal hides conditionally so the two don't overlap.
const MainDisplayModal = () => {
  const pathname = usePathname();

  return (
    <main className='flex flex-col w-full h-full'>
      <CommandPalette pathname={pathname} />
      {!pathname?.startsWith('/projects/') && <SelectionDisplayModal />}
    </main>
  );
};

export default MainDisplayModal;