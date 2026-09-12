import { memo } from 'react'
import type { Dispatch, MouseEvent, ReactNode, SetStateAction } from 'react'

interface ActionButtonProps {
  ariaLabel: string
  callback: (e: MouseEvent<HTMLButtonElement>) => void | Dispatch<SetStateAction<boolean>> | ((value: SetStateAction<boolean>) => void)
  children?: string | ReactNode
  id: string
}

const ActionButton = memo(({ id, ariaLabel, callback, children }: ActionButtonProps) => {
  return (
    <button
      id={id}
      aria-label={ariaLabel}
      className='appearance-none flex w-fit h-fit aspect-square p-1.5 sm:p-1.5 md:p-2 lg:p-2.5 xl:p-2.5 2xl:p-2.5 rounded-full justify-center items-center text-center bg-container/50 backdrop-blur-xl text-header cursor-pointer transition-all transition-discrete duration-500 ease-in-out hover:bg-container hover:text-link'
      onClick={callback}
      type='button'
    >
      {children}
    </button>
  )
})
ActionButton.displayName = 'ActionButton'

export default ActionButton
