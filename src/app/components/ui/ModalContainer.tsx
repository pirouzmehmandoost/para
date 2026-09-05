import { memo } from 'react'
import type { ReactNode } from 'react'

interface ContainerProps {
  children?: ReactNode
  visible?: boolean
}

interface ModalProps {
  header: string
  dataRoute: string
  visible: boolean
  children?: ReactNode
  left: ReactNode[]
  right: ReactNode[]
}

const LeftContainer = memo(({ children }: ContainerProps) =>
  <div className='relative flex flex-col grow min-w-26 sm:min-w-26 md:min-w-30 lg:min-w-32 xl:min-w-36 max-w-40 min-h-20 max-h-28 p-3 sm:p-3 md:p-3 lg:p-4 xl:p-5 2xl:p-5 rounded-3xl justify-start place-items-center-safe place-content-center-safe text-center backdrop-blur-sm backdrop-invert-37 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-md 2xl:text-md'>
    {children}
  </div>
)
LeftContainer.displayName = 'LeftContainer'

const RightContainer = memo(({ children, visible }: ContainerProps) =>

  <div className={`relative flex flex-col grow w-full h-full gap-y-1 p-3 sm:p-3 md:p-3 lg:p-4 xl:p-5 2xl:p-5 rounded-3xl justify-stretch items-center-safe text-center text-xs sm:text-xs md:text-sm lg:text-sm xl:text-md 2xl:text-md backdrop-blur-sm backdrop-invert-37 transition-opacity transition-discrete duration-200 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
    {children}
  </div>
)
RightContainer.displayName = 'RightContainer'

export const ModalContainer = memo(({ header, dataRoute, left, right, visible, children }: ModalProps) => {
  return (
    <div data-route={dataRoute} className='fixed flex flex-col grow w-full h-full inset-0 justify-between text-body subpixel-antialiased touch-none select-none'>
      <div className='flex flex-row grow w-full h-fit mt-6 justify-center-safe text-header text-5xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-7xl 2xl:text-7xl '>
        {header}
      </div>
      <div className='flex flex-col grow w-full max-h-fit p-6 place-self-start'>
        <div className='flex flex-row grow w-full h-full space-x-4 items-end-safe lg:place-self-start xl:place-self-start 2xl:place-self-start justify-between lg:justify-start xl:justify-start 2xl:justify-start'>
          <div className='flex flex-col w-fit max-h-fit space-y-2'>
            {left.map((leftItem, index) => <LeftContainer key={`data-modal-left-item-${index}`}> {leftItem} </LeftContainer>)}
          </div>
          <div className='flex flex-col w-full h-full'>
            {right.map((rightItem, index) => <RightContainer key={`data-modal-right-item-${index}`} visible={visible}> {rightItem} </RightContainer>)}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
})
ModalContainer.displayName = 'ModalContainer'
