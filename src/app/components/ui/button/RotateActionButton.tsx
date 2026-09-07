import { memo } from 'react'
import type { EulerValue } from './types'
import AutoModeIcon from '@mui/icons-material/AutoMode'

interface RotateButtonProps {
  callback: () => void
  active: boolean
}

export const AutoRotateButton = memo(({ callback, active }: RotateButtonProps) => {
  return (
    <button
      id='auto-rotate-button'
      aria-label='Toggle auto rotation'
      className={`appearance-none group flex w-fit h-fit rounded-full backdrop-blur-xl cursor-pointer transition-all duration-500 ease-in-out ${active ? 'bg-neutral-300 hover:bg-neutral-400 animate-pulse' : 'bg-neutral-500 hover:bg-neutral-400 animate-none'}`}
      onClick={callback}
      type='button'
    >
      <div className='relative flex p-2 items-center justify-center transition-all transition-discrete duration-500 ease-in-out text-header group-hover:text-link'>
        <div className='relative flex w-4 h-4 items-center justify-center'>
          <AutoModeIcon className={`transform-3d perspective-origin-center rotate-x-50 ${active ? 'animate-pulse' : 'animate-none'}`} fontSize='medium' />
          {!active && (
            <svg viewBox='0 0 1 1' preserveAspectRatio='none' className='absolute inset-0 w-full h-full pointer-events-none'>
              <line x1='0' y1='1' x2='1' y2='0' vectorEffect='non-scaling-stroke' className='stroke-2 stroke-current transition-all transition-discrete duration-500 ease-in-out' />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
})
AutoRotateButton.displayName = 'AutoRotateButton'


interface ManualRotationButtonProps extends RotateButtonProps {
  injectStyle: string
  text: string
  id: string
}
const ManualRotationButton = memo(({ id, callback, active, injectStyle, text }: ManualRotationButtonProps) => {
  return (
    <button
      id={id}
      className={`absolute appearance-none w-10 h-10 z-100 text-center text-xs sm:text-xs md:text-sm lg:text-sm xl:text-md 2xl:text-md transform-3d perspective-origin-top-left scale-[78.5%] backface-visible  ${injectStyle} transition-all transition-discrete duration-500 ease-in-out ${active ? 'bg-container hover:bg-neutral-400 text-header' : 'bg-neutral-400/50 hover:bg-container/50 text-link'}`}
      onClick={callback}
      type='button'
    >
      {text}
    </button>
  )
})
ManualRotationButton.displayName = 'ManualRotationButton'

interface ManualRotateButtonGroupProps {
  handleManualRotate: (rotation: EulerValue) => void
  autoRotateActive: boolean
  rotation: EulerValue
}
export const ManualRotateButtonGroup = memo(({ handleManualRotate, autoRotateActive, rotation }: ManualRotateButtonGroupProps) => {
  const rotateActionButtonValues = {
    TOP: {
      text: 'TOP',
      rotation: { x: rotation.x+Math.PI/2, y: rotation.y, z: rotation.z },
      injectStyle: `translate-x-0 -translate-y-3.25 rotate-x-60 rotate-y-0 rotate-z-45 contrast-200`,
    },
    FRONT: {
      text: 'FRONT',
      rotation: { x: rotation.x, y: rotation.y+Math.PI/2, z: rotation.z },
      injectStyle: `translate-x-2.75 translate-y-1.5 -rotate-x-30 rotate-y-45 rotate-z-0 contrast-125`,
    },
    SIDE: {
      text: 'SIDE',
      rotation: { x: 0, y: 0, z: 0 },
      injectStyle: `-translate-x-2.75 translate-y-1.5 -rotate-x-30 -rotate-y-45 rotate-z-0 contrast-150`,
    }
  }

  return (
    <div className='relative flex flex-row min-w-10 max-w-fit min-h-10 h-full justify-center-safe items-center-safe'>
      {Object.entries(rotateActionButtonValues).map(([key, { rotation, injectStyle, text }]) => (
        <ManualRotationButton
          key={`rotation_button_${key}`}
          id={`rotation_button_${key}`}
          callback={() => { handleManualRotate(rotation) }}
          active={autoRotateActive}
          injectStyle={injectStyle}
          text={text}
        />
      ))}
    </div>
  )
})
ManualRotateButtonGroup.displayName = 'ManualRotateButtonGroup'
