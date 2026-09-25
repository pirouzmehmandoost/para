import { memo } from 'react'
import type { RotateButtonProps } from './types'

interface ManualRotationButtonProps extends RotateButtonProps {
  injectStyle: string
  text: string
  id: string
  clicked: boolean
}
const ManualRotationButton = memo(({ id, callback, active, clicked, injectStyle, text }: ManualRotationButtonProps) => {
  return (
    <button
      id={id}
      className={`absolute appearance-none w-10 h-10 z-100 text-center text-xs sm:text-xs md:text-sm lg:text-sm xl:text-md 2xl:text-md transform-3d perspective-origin-top-left scale-[78.5%] backface-visible ${injectStyle} transition-all transition-discrete duration-500 ease-in-out ${active ? `${clicked ? 'bg-neutral-100 animate-pulse' : 'bg-container'}` : `bg-inactive hover:bg-container`}`}
      onClick={callback}
      type='button'
    >
      {text}
    </button>
  )
})
ManualRotationButton.displayName = 'ManualRotationButton'

export default ManualRotationButton