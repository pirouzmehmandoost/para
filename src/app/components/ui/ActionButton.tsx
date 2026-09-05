import { memo } from 'react'
import type { Dispatch, MouseEvent, ReactNode, SetStateAction } from 'react'

interface ActionButtonProps {
  id: string
  ariaLabel: string
  state?: boolean
  callback?: (e: MouseEvent<HTMLButtonElement>) => void | Dispatch<SetStateAction<boolean>> | ((value: SetStateAction<boolean>) => void)
  children?: string | ReactNode | ReactNode[]
}

const ActionButton = memo(({ id, ariaLabel, callback, children }: ActionButtonProps) => {
  return (
    <button
      id={id}
      aria-label={ariaLabel}
      className='appearance-none flex flex-row grow z-100 w-fit h-fit p-1.5 sm:p-1.5 md:p-2 lg:p-2.5 xl:p-3 2xl:p-3 rounded-full items-center-safe sm:text-sm md:text-sm lg:text-sm xl:text-md 2xl:text-md text-header bg-container/30 backdrop-blur-xl backdrop-brightness-150 cursor-pointer transition-all duration-500 ease-in-out hover:text-header/50'
      onClick={callback}
      type='button'
    >
      {children}
    </button>
  )
})
ActionButton.displayName = 'ActionButton'

export default ActionButton

// className='flex appearance-none w-fit h-fit p-2 sm:p-2 md:p-3 lg:p-4 xl:p-4 2xl:p-4 rounded-full bg-container/10 backdrop-blur-md backdrop-invert-10 cursor-pointer transition-all duration-500 ease-in-out text-header hover:text-link'
