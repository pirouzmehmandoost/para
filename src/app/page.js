'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import useSelection from '@stores/selectionStore';
import { getSlugFromName } from '@utils/slug';
import { portfolio } from '@configs/globals';

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
  const shouldReduceMotion = useReducedMotion();
  const variants = createVariants(shouldReduceMotion);
  // new code
  const isFocused = useSelection((state) => state.selection.isFocused);
  const focusedProject = projects.find(({ sceneData: { fileData: { nodeName = ''} = {} } = {} }) => nodeName === isFocused);
  const setSelectionStore = useSelection((state) => state.setSelection);
  const modal = Boolean(focusedProject?.name?.length);
  //old code
  // const selection = useSelection((state) => state.selection);
  // const modal = Boolean(selection?.name?.length);

  const handleClick = () => { if (focusedProject) setSelectionStore({ ...focusedProject }) }; //new code

  return (
    <main className='flex flex-col w-full h-full'>
      <div className={`fixed flex flex-col grow h-1/5 w-full sm:w-full md:w-full lg:w-fit xl:w-fit 2xl:w-fit place-self-center justify-center top-12 md:left-10 lg:left-10 xl:left-10 2xl:left-10 transition-all duration-500 ease-in-out 
        ${modal
          ? 'h-1/5'
          : 'h-fit'}`}
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
                  {focusedProject?.name}
                </motion.div>

                <motion.div
                  variants={variants.modalItem}
                  className='text-2xl text-center text-pretty perspective-origin-bottom'
                >
                  {focusedProject?.shortDescription}
                </motion.div>

                <motion.div
                  variants={variants.modalItem}
                  className='place-self-center text-center text-3xl text-neutral-800 perspective-origin-bottom'
                >
                  <Link
                    href={`/projects/${getSlugFromName(focusedProject?.name)}`}
                    rel='noopener noreferrer'
                    className='pointer-events-auto'
                    onClick = {handleClick}
                  >
                    View Details
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Backdrop overlay */}
          {/* <motion.div
            className='pointer-events-none'
            variants={variants.overlay}
            animate={modal === true ? 'open' : 'closed'}
            initial='closed'
          >
            <motion.div 
              className={`absolute w-1/2 h-full inset-0 -top-8 -z-10 m-auto bg-neutral-300/50 blur-xl drop-shadow-xl drop-shadow-neutral-300 shadow-xl shadow-neutral-300 contrast-150 pointer-events-none`}/>
          </motion.div> */}
        </div>
      </div>
    </main>
  );
};

export default SelectionDisplayModal;

// style={{ maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #a3a3a3 30%, #a3a3a300 70%)' }}
            //   ${modal
            //     ? 'animate-morph'
            //     : ''}`}
            // />