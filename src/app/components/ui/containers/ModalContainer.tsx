import type { ReactNode } from 'react'

interface ModalContainerProps {
  header: string
  visible: boolean
  controls: ReactNode
  display: ReactNode
}

const ModalContainer = ({ header, controls, display, visible }: ModalContainerProps) => {
  return (
    <div id='modal-container' className={`flex flex-col w-full h-full justify-between p-6 text-header text-xs sm:text-xs md:text-sm xl:text-md subpixel-antialiased select-none touch-none`}>
      {/* header text*/}
      <div id={'header-wrapper'} className={`flex flex-row w-full h-fit justify-center items-center text-center text-header text-4xl sm:text-4xl md:text-5xl xl:text-6xl transition-all transition-discrete duration-500 ease-in-out starting:opacity-0 ${visible ? 'opacity-100 visible' : 'opacity-0 collapse'}`}>
        {header}
      </div>
      {/* panels outer wrapper*/}
      <div id='panels-outer-wrapper' className={`flex flex-col w-full h-fit`}>
        {/* panels inner wrapper*/}
        <div id='panels-inner-wrapper' className={`flex flex-col-reverse sm:flex-col-reverse md:flex-row w-full h-full gap-x-0 sm:gap-x-0 md:gap-x-4 gap-y-4 sm:gap-y-4 md:gap-y-0 justify-between sm:justify-between md:justify-start items-center sm:items-center md:items-end`}>
          <div id='control-panels-wrapper' className={`flex flex-row sm:flex-row md:flex-col w-fit h-fit max-h-fit gap-x-2 gap-y-0 sm:gap-y-0 md:gap-y-2 items-end sm:items-end md:items-start`}>
            {controls}
          </div>
          <div id='display-panel-wrapper' className={`flex flex-col w-full h-full`}>
            {display}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalContainer