import { memo } from 'react'
import type { ReactNode } from 'react'


interface ContainerProps {
  key: string
  children?: ReactNode
  visible?: boolean
}

const ControlPanel = memo(({ key, visible, children }: ContainerProps) =>
  <div
    id={key}
    className={`relative flex flex-col w-full h-full justify-center items-center text-center rounded-3xl backdrop-blur-sm backdrop-invert-37 transition-all transition-discrete duration-500 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}
  >
    {children}
  </div>
)
ControlPanel.displayName = 'ControlPanel'

const DisplayPanel = memo(({ key, visible, children }: ContainerProps) =>
  <div
    id={key}
    className={`flex flex-col w-full h-full justify-center items-center rounded-3xl backdrop-blur-sm backdrop-invert-37 transition-all transition-discrete duration-400 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}
  >
    {children}
  </div>
)
DisplayPanel.displayName = 'DisplayPanel'

interface ModalProps {
  header: string
  dataRoute: string
  visible: boolean
  displayPanelsVisible: boolean
  controlPanels: ReactNode[]
  displayPanels: ReactNode[]
}
export const ModalContainer = memo(({ header, dataRoute, controlPanels, displayPanels, visible, displayPanelsVisible }: ModalProps) => {
  return (
    <div id='modal-container-root' data-route={dataRoute} className={`fixed inset-0 flex grow flex-col w-full h-full justify-between text-body touch-none select-none text-xs sm:text-xs md:text-sm lg:text-sm xl:text-md 2xl:text-md`}>
      <div id='modal-container-top' className={`flex grow flex-row w-full max-h-fit mt-6 justify-center-safe items-center-safe text-center text-header text-5xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-6xl transition-all duration-500 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {header}
      </div>
      <div id='modal-container-bottom' className={`flex flex-col grow w-full max-h-fit p-6`}>
        <div id='panels-container' className={`flex grow flex-col-reverse sm:flex-col-reverse md:flex-row lg:flex-row xl:flex-row 2xl:flex-row w-full h-full gap-x-0 sm:gap-x-0 md:gap-x-4 lg:gap-x-4 xl:gap-x-4 2xl:gap-x-4 gap-y-4 sm:gap-y-4 md:gap-y-0 lg:gap-y-0 xl:gap-y-0 2xl:gap-y-0 justify-between sm:justify-between md:justify-start lg:justify-start xl:justify-start 2xl:justify-start items-center-safe sm:items-center-safe md:items-end-safe lg:items-end-safe xl:items-end-safe 2xl:items-end-safe`}>
          <div id='control-panels-container' className={`flex grow flex-row sm:flex-row md:flex-col lg:flex-col xl:flex-col 2xl:flex-col w-fit sm:w-fit md:w-fit lg:w-fit xl:w-fit 2xl:w-fit h-fit max-h-fit gap-x-2 sm:gap-x-2 md:gap-x-2 lg:gap-x-0 xl:gap-x-0 2xl:gap-x-0 gap-y-0 sm:gap-y-0 md:gap-y-2 lg:gap-y-2 xl:gap-y-2 2xl:gap-y-2 items-end sm:items-end md:items-start lg:items-start xl:items-start 2xl:items-start`}>
            {controlPanels.map((item, index) => <ControlPanel key={`controlpanel-${index}`} visible={visible}> {item} </ControlPanel>)}
          </div>
          <div id='display-panels-container' className={`flex flex-col w-full h-full`}>
            {displayPanels.map((item, index) => <DisplayPanel key={`displaypanel-${index}`} visible={displayPanelsVisible === true && visible === true}> {item} </DisplayPanel>)}
          </div>
        </div>
      </div>
    </div>
  )
})
ModalContainer.displayName = 'ModalContainer'

export default ModalContainer
