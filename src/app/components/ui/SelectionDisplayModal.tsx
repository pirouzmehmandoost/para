'use client'

import Link from 'next/link'
import { memo } from 'react'
import { AnimatePresence, motion, useReducedMotion, Variants } from 'framer-motion'
import useProjectStore from '@/app/stores/projectStore'
import useSelection from '@stores/selectionStore'
import framerMotionConfigs from '@configs/framerMotionConfigs'
import type { Project } from '@/types/project'

const { EASE_OUT, EASE_IN_OUT } = framerMotionConfigs

interface FramerMotionVariants {
  modalContainer: Variants
  overlay: Variants
  modalItem: Variants
}

const createVariants = (reduceMotion: boolean): FramerMotionVariants => {
  const dur = (ms: number) => (reduceMotion ? 0 : ms)
  const delay = (ms: number) => (reduceMotion ? 0 : ms)

  return {
    overlay: {
      open: { opacity: 1, transition: { duration: dur(0.35), ease: EASE_IN_OUT } },
      closed: { opacity: 0, transition: { duration: dur(0.25), ease: EASE_IN_OUT } },
    },
    modalContainer: {
      hidden: { opacity: 0, y: 6, transition: { duration: dur(0.2), ease: EASE_IN_OUT } },
      visible: { opacity: 1, y: 0, transition: { delayChildren: delay(0.15), staggerChildren: reduceMotion ? 0 : 0.1, duration: dur(0.3), ease: EASE_OUT } },
    },
    modalItem: {
      hidden: { opacity: 0, rotateX: 80, y: 40 },
      visible: { opacity: 1, rotateX: 0, y: 0, transition: { duration: dur(0.55), ease: EASE_OUT } },
    },
  }
}

// NOTE: the route /projects/[slug] is an intercepting route that mounts over HomePage and renders ProjectDataModal.
// SelectionDisplayModal conditionally renders and showModal is false on routes starting with '/projects/'
const SelectionDisplayModal = () => {
  const shouldReduceMotion = useReducedMotion()
  const variants = createVariants(shouldReduceMotion)
  const focusedName = useSelection((state) => state.selection.focusedName)

  const focusedProject = focusedName ? useProjectStore.getState().getProjectByNodeName(focusedName) : null

  const {
    UIData: {
      displayName = '',
      shortDescription = '',
      slug = '',
    } = {},
  } = focusedProject || ({} as Project)

  const showModal: boolean = slug.length ? true : false
  const url = `/projects/${slug}`

  return (
    <div className={`fixed flex flex-col grow w-full h-1/5 sm:w-full md:w-full lg:w-fit xl:w-fit 2xl:w-fit top-32 md:left-10 lg:left-10 xl:left-10 2xl:left-10 place-self-center justify-center transition-all duration-500 ease-in-out ${showModal ? 'h-1/5' : 'h-fit'}`}>
      <div className='relative flex flex-row grow w-full h-full z-10 justify-center bg-neutral-500/0 pointer-events-none'>
        <AnimatePresence mode='wait'>
          {showModal && (
            <motion.div
              id='modal-content'
              className='flex flex-col w-fit h-full text-neutral-800 place-items-start'
              initial='hidden'
              animate='visible'
              exit='hidden'
              variants={variants.modalContainer}
            >
              <motion.div variants={variants.modalItem} className='text-4xl place-self-center text-center perspective-origin-bottom'>
                {displayName}
              </motion.div>
              <motion.div variants={variants.modalItem} className='text-2xl text-center text-pretty perspective-origin-bottom'>
                {shortDescription}
              </motion.div>
              <motion.div variants={variants.modalItem} className='text-3xl place-self-center text-center perspective-origin-bottom text-neutral-800'>
                <Link href={url} rel='noopener noreferrer' className='pointer-events-auto'>
                  <div className='cursor-pointer animate-pulse'> View Details </div>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* <div className='transition-all duration-900 transition-discrete will-change-opacity text-9xl delay-500 text-blue-800 ease-in-out starting:opacity-0 opacity-100 select-none touch-none'>
      </div> */}
    </div>
  )
}

export default memo(SelectionDisplayModal)
