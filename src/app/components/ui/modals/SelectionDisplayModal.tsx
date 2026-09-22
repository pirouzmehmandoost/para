'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion, Variants } from 'framer-motion'
import { type Easing } from 'framer-motion'
import useProjectStore from '@/app/stores/projectStore'
import useSelection from '@stores/selectionStore'

const EASE_OUT: Easing = [0.215, 0.61, 0.355, 1]
const EASE_IN_OUT: Easing = [0.76, 0, 0.24, 1]

interface FramerMotionVariants {
  container: Variants
  item: Variants
}
const createVariants = (reduceMotion: boolean): FramerMotionVariants => {
  const dur = (ms: number) => (reduceMotion ? 0 : ms)
  const delay = (ms: number) => (reduceMotion ? 0 : ms)

  return {
    container: {
      hidden: { opacity: 0, y: 6, transition: { duration: dur(0.2), ease: EASE_IN_OUT } },
      visible: { opacity: 1, y: 0, transition: { delayChildren: delay(0.15), staggerChildren: reduceMotion ? 0 : 0.1, duration: dur(0.3), ease: EASE_OUT } },
    },
    item: {
      hidden: { opacity: 0, rotateX: 80, y: 40 },
      visible: { opacity: 1, rotateX: 0, y: 0, transition: { duration: dur(0.55), ease: EASE_OUT } },
    },
  }
}

const SelectionDisplayModal = () => {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  const variants = useMemo(() => createVariants(shouldReduceMotion), [shouldReduceMotion])
  const focusedName = useSelection((state) => state.focusedName)
  const focusedProject = useProjectStore((state) => (focusedName ? state.projectsByNodeName[focusedName] ?? null : null))

  const displayName = focusedProject?.UIData.displayName ?? ''
  const shortDescription = focusedProject?.UIData.shortDescription ?? ''
  const slug = focusedProject?.UIData.slug ?? ''
  const showModal: boolean = slug.length > 0 && pathname === '/'
  const url = `/projects/${slug}`

  return (
    <div
      id='selection-display-modal'
      className={`fixed inset-y-1/8 inset-x-6 sm:inset-x-6 md:inset-x-12 z-30 flex shrink flex-col w-fit h-fit justify-center items-center text-header transition-all transition-discrete duration-700 ease-in-out ${showModal ? 'opacity-100' : 'opacity-0'}`}
    >
      <AnimatePresence mode='wait'>
        {showModal && (
          <motion.div
            key={slug}
            id='modal-content'
            className='flex flex-col w-fit h-fit place-self-center justify-center items-center gap-y-1'
            initial='hidden'
            animate='visible'
            exit='hidden'
            variants={variants.container}
          >
            <motion.div variants={variants.item} className='w-fit h-fit text-3xl sm:text-3xl md:text-4xl lg:text-5xl'>
              {displayName}
            </motion.div>
            <motion.div variants={variants.item} className='w-fit h-fit text-xl sm:text-xl md:text-2xl lg:text-3xl text-nowrap'>
              {shortDescription}
            </motion.div>
            <motion.div variants={variants.item} className='w-fit h-fit'>
              <Link href={url}>
                <div className='appearance-none w-fit h-fit text-2xl sm:text-2xl md:text-3xl lg4:text-4xl text-neutral-600 cursor-pointer animate-pulse'>
                  View Details
                </div>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SelectionDisplayModal
