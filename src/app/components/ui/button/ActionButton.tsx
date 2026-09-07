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
      className='appearance-none flex grow w-fit h-fit p-1.5 sm:p-1.5 md:p-2 lg:p-2.5 xl:p-2.5 2xl:p-2.5 rounded-full items-center-safe text-header bg-container/25 cursor-pointer  backdrop-blur-xl transition-all duration-500 ease-in-out hover:text-header/50'
      onClick={callback}
      type='button'
    >
      {children}
    </button>
  )
})
ActionButton.displayName = 'ActionButton'

export default ActionButton

// className={`appearance-none flex grow w-fit h-fit p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3 rounded-full items-center text-header cursor-pointer transition-all transition-discrete duration-300 delay-200 ease-out hover:text-header/50 ${state === false ? 'backdrop-blur-md bg-container/20' : 'backdrop-blur-none bg-container/0'}`}
