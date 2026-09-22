import type { ReactNode } from 'react'

interface ModalContainerProps {
  header: string
  dataRoute: string
  visible: boolean
  controls: ReactNode
  display: ReactNode
}

const ModalContainer = ({ header, dataRoute, controls, display, visible }: ModalContainerProps) => {
  return (
    <div id='container-root' data-route={dataRoute} className={`flex flex-col w-full h-full justify-between p-6 text-header touch-none select-none text-xs sm:text-xs md:text-sm lg:text-sm xl:text-md 2xl:text-md subpixel-antialiased`}>
      {/* header text*/}
      <div id={'header-wrapper'} className={`flex flex-row w-full h-fit justify-center items-center text-center text-header text-5xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-6xl transition-all transition-discrete duration-500 ease-in-out starting:opacity-0 ${visible ? 'opacity-100 visible' : 'opacity-0 collapse'}`}>
        {header}
      </div>
      {/* panels outer wrapper*/}
      <div id='panels-outer--wrapper' className={`flex flex-col w-full h-fit`}>
        {/* panels inner wrapper*/}
        <div id='panels-inner-wrapper' className={`flex flex-col-reverse sm:flex-col-reverse md:flex-row lg:flex-row xl:flex-row 2xl:flex-row w-full h-full gap-x-0 sm:gap-x-0 md:gap-x-4 lg:gap-x-4 xl:gap-x-4 2xl:gap-x-4 gap-y-4 sm:gap-y-4 md:gap-y-0 lg:gap-y-0 xl:gap-y-0 2xl:gap-y-0 justify-between sm:justify-between md:justify-start lg:justify-start xl:justify-start 2xl:justify-start items-center sm:items-center md:items-end lg:items-end xl:items-end 2xl:items-end`}>
          <div id='controlpanels-wrapper' className={`flex flex-row sm:flex-row md:flex-col lg:flex-col xl:flex-col 2xl:flex-col w-fit sm:w-fit md:w-fit lg:w-fit xl:w-fit 2xl:w-fit h-fit max-h-fit gap-x-2 sm:gap-x-2 md:gap-x-2 lg:gap-x-0 xl:gap-x-0 2xl:gap-x-0 gap-y-0 sm:gap-y-0 md:gap-y-2 lg:gap-y-2 xl:gap-y-2 2xl:gap-y-2 items-end sm:items-end md:items-start lg:items-start xl:items-start 2xl:items-start`}>
            {controls}
          </div>
          <div id='displaypanel-wrapper' className={`flex flex-col w-full h-full`}>
            {display}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalContainer