'use client'

import Link from 'next/link'
import { memo, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion, Variants } from 'framer-motion'
import framerMotionConfigs from '@configs/framerMotionConfigs'
import type { Project } from '@/types/project'
import useProjectStore from '@/app/stores/projectStore'
import useSelection from '@stores/selectionStore'

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
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  const variants = useMemo(() => createVariants(shouldReduceMotion), [shouldReduceMotion])
  const focusedName = useSelection((state) => state.selection.focusedName)
  const focusedProject = useProjectStore((state) => (focusedName ? state.projectsByNodeName[focusedName] ?? null : null)) as Project

  // const focusedProject = focusedName ? useProjectStore.getState().getProjectByNodeName(focusedName) : null

  const {
    UIData: {
      displayName = '',
      shortDescription = '',
      slug = '',
    } = {},
  } = focusedProject || ({} as Project)

  const showModal: boolean = slug.length > 0 && !pathname.startsWith('/projects/') ? true : false
  const url = `/projects/${slug}`

  return (
    <div className={`fixed flex flex-col grow w-full sm:w-full md:w-full lg:w-fit xl:w-fit 2xl:w-fit h-1/5 top-32 md:left-10 lg:left-10 xl:left-10 2xl:left-10 place-self-center-safe justify-center-safe text-neutral-800 transition-all duration-500 ease-in-out ${showModal ? 'h-1/5' : 'h-fit'}`}>
      {/* <div className='relative flex flex-row grow w-full h-full z-10 justify-center-safe'> */}
        <AnimatePresence mode='wait'>
          {showModal && (
            <motion.div
              id='modal-content'
              className='flex flex-col grow w-fit h-fit place-self-center-safe'
              initial='hidden'
              animate='visible'
              exit='hidden'
              variants={variants.modalContainer}
            >
              <motion.div variants={variants.modalItem} className='w-fit h-fit place-self-center-safe text-center text-5xl perspective-origin-bottom select-none'>
                {displayName}
              </motion.div>
              <motion.div variants={variants.modalItem} className='w-fit max-w-4/5 h-fit place-self-center-safe text-center text-2xl text-wrap perspective-origin-bottom select-none'>
                {shortDescription}
              </motion.div>
              <motion.div variants={variants.modalItem} className='w-fit h-fit place-self-center perspective-origin-bottom'>
                <Link href={url} rel='noopener noreferrer'>
                  <div className='w-fit h-fit place-self-center-safe text-center text-3xl text-neutral-700 cursor-pointer animate-pulse'>
                    View Details
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      {/* </div> */}
    </div>
  )
}

export default memo(SelectionDisplayModal)
