import { memo } from 'react'
import AutoModeIcon from '@mui/icons-material/AutoMode'
import type { RotateButtonProps } from './types'

// active controls whether AutoModeIcon should pulse.
// active is true on click and is also true upon navigation to projects/[slug]. It's false when a ManualRotateButton is clicked.
const AutoRotateButton = memo(({ callback, active }: RotateButtonProps) => {
  return (
    <button
      id='auto-rotate-button'
      aria-label='Toggle auto rotation'
      className={`appearance-none group flex w-fit h-fit rounded-full backdrop-blur-xl cursor-pointer transition-all transition-discrete duration-500 ease-in-out ${active ? 'bg-container contrast-200 text-header animate-pulse' : 'bg-inactive contrast-50 text-link hover:bg-container opacity-75 animate-none'}`}
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

export default AutoRotateButton