import { memo, useMemo } from 'react'
import type { EulerValue } from '../../../../types/EulerValue'
import ManualRotationButton from './ManualRotationButton'

interface ManualRotateButtonGroupProps {
  callback: (rotation: EulerValue, buttonID: string) => void
  active: boolean
  clickedButtonID: string
}
const ManualRotateButtonGroup = memo(({ callback, active, clickedButtonID }: ManualRotateButtonGroupProps) => {

  const rotateActionButtonValues = useMemo(() => {
    return {
      TOP: {
        text: 'TOP',
        callback: () => callback({ x: Math.PI / 2, y: 0, z: 0 }, 'rotation-button-top'),
        injectStyle: `translate-x-0 -translate-y-3.25 rotate-x-60 rotate-y-0 rotate-z-45 contrast-200`,
        id: 'rotation-button-top'
      },
      FRONT: {
        text: 'FRONT',
        callback: () => callback({ x: 0, y:  Math.PI / 2, z: 0}, 'rotation-button-front'),
        injectStyle: `translate-x-2.75 translate-y-1.5 -rotate-x-30 rotate-y-45 rotate-z-0 contrast-125`,
        id: 'rotation-button-front'
      },
      SIDE: {
        text: 'SIDE',
        callback: () => callback({ x: 0, y: 0, z: 0 }, 'rotation-button-side'),
        injectStyle: `-translate-x-2.75 translate-y-1.5 -rotate-x-30 -rotate-y-45 rotate-z-0 contrast-150`,
        id: 'rotation-button-side'
      }
    }
  }, [callback])

  return (
    <div className='flex flex-row aspect-square min-w-12 min-h-12 max-w-full max-h-full justify-center items-center'>
      <div className={`relative flex flex-row min-w-10 min-h-10 max-w-fit h-full justify-center items-center transition-all duration-500 ease-in-out ${active ? 'text-header' : 'text-link'}`}>
        {Object.entries(rotateActionButtonValues).map(([_, { callback, id, injectStyle, text }]) => {
          return (
            <ManualRotationButton
              key={id}
              id={id}
              active={active}
              clicked={clickedButtonID === id}
              callback={callback}
              injectStyle={injectStyle}
              text={text}
            />
          )
        })}
      </div>
    </div>
  )
})
ManualRotateButtonGroup.displayName = 'ManualRotateButtonGroup'

export default ManualRotateButtonGroup