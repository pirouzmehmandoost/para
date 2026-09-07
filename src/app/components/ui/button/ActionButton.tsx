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
      className='appearance-none flex w-fit h-fit aspect-square p-1.5 sm:p-1.5 md:p-2 lg:p-2.5 xl:p-2.5 2xl:p-2.5 rounded-full justify-center items-center text-center text-header bg-container/25 cursor-pointer backdrop-blur-xl transition-all duration-500 ease-in-out hover:text-header/50'
      onClick={callback}
      type='button'
    >
      {children}
    </button>
  )
})
ActionButton.displayName = 'ActionButton'

export default ActionButton
