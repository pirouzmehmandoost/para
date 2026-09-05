import { memo } from 'react'
import AutoModeIcon from '@mui/icons-material/AutoMode'

interface RotateButtonProps {
  callback: () => void
  active: boolean
}

export const AutoRotateButton = memo(({ callback, active }: RotateButtonProps) => {
  return (
    <div className='flex flex-col w-full items-center-safe justify-center-safe'>
      <button
        id='auto-rotate-button'
        aria-label='Toggle automatic rotation'
        className={`appearance-none group flex flex-row  w-fit h-fit rounded-full backdrop-blur-xl cursor-pointer transition-all duration-500 ease-in-out ${active ? 'bg-neutral-300 hover:bg-neutral-400 animate-pulse' : 'bg-neutral-500 hover:bg-neutral-400 animate-none'}`}
        onClick={callback}
        type='button'
      >
        <div className='relative flex p-2 items-center justify-center transition-all duration-500 ease-in-out text-header group-hover:text-link'>
          <div className='relative flex w-4 h-4 items-center justify-center '>
            <AutoModeIcon className={`transform-3d perspective-origin-center rotate-x-50 ${active ? 'animate-pulse' : 'animate-none'}`} fontSize='medium' />
            {!active && (
              <svg viewBox='0 0 1 1' preserveAspectRatio='none' className='absolute inset-0 w-full h-full pointer-events-none'>
                <line x1='0' y1='1' x2='1' y2='0' vectorEffect='non-scaling-stroke' className='stroke-2 stroke-current transition-all transition-discrete duration-500 ease-in-out' />
              </svg>
            )}
          </div>
        </div>
      </button>
      <div className={`text-header invert-0 transition-all transition-discrete duration-500 ease-in-out ${active ? 'animate-pulse text-link' : 'animate-none'}`}>
        Auto
      </div>
    </div>
  )
})
AutoRotateButton.displayName = 'AutoRotateButton'
