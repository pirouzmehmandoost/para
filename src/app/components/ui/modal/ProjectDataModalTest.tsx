'use client'

import { memo, startTransition, useCallback, useLayoutEffect, useState, useMemo } from 'react'
import type { ReactNode, Dispatch, SetStateAction } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import NotesIcon from '@mui/icons-material/Notes'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { Project } from '../../../../types/project'
import type { MaterialRecord } from '../../../../types/material'
import type { EulerValue } from '../button/types'
import useProjectStore from '@stores/projectStore'
import useSelection from '@stores/selectionStore'
import useMaterial from '@stores/materialStore'
import useMenu from '@stores/menuStore'
import ModalContainer from '../container/ModalContainer'
import ActionButton from '../button/ActionButton'
import { AutoRotateButton, ManualRotateButtonGroup } from '../button/RotateActionButton'

const reset = () => useSelection.getState().reset()
const setRotation = useSelection.getState().setRotation
const toggleAutoRotation = useSelection.getState().toggleDefaultRotationAnimation

interface NavigationPanelProps {
  callback: () => void
}
const NavigationPanel = memo(({ callback }: NavigationPanelProps) => {
  return (
    <div className='flex flex-col min-w-20 max-w-32 min-h-20 max-h-24 gap-y-1 justify-center-safe items-center-safe'>
      <div id='w-full h-fit text-center text-nowrap'>
        Go Back
      </div>
      <ActionButton id='back-button' ariaLabel={`Go back`} callback={callback}>
        <ArrowBackIcon fontSize='medium' />
      </ActionButton>
    </div>
  )
})
NavigationPanel.displayName = 'BackButton'

interface ToggleDisplayPanelProps {
  expanded: boolean
  callback: Dispatch<SetStateAction<boolean>>
}
const ToggleDisplayPanel = memo(({ expanded, callback }: ToggleDisplayPanelProps) => {
  return (
    <div className='flex flex-col min-w-20 max-w-32 min-h-20 max-h-24 gap-y-1 justify-center-safe items-center-safe'>
      <div className='w-full h-fit text-center text-nowrap'>
        Technical Specs
      </div>
      <ActionButton id='details' callback={() => callback((x) => !x)} ariaLabel={'Toggle details panel'}>
        {expanded ? <CloseFullscreenIcon fontSize='medium' /> : <NotesIcon fontSize='medium' />}
      </ActionButton>
    </div>
  )
})
ToggleDisplayPanel.displayName = 'ToggleDisplayPanel'

interface MaterialControlsPanelProps {
  callback: (id: string) => void
  materials: Record<string, MaterialRecord>
  materialIDs: string[]
  selectedID: string
}
const MaterialControlsPanel = memo(({ callback, materials, materialIDs, selectedID }: MaterialControlsPanelProps) => {
  return (
    <div className='flex flex-col min-w-28 max-w-36 min-h-20 max-h-24 gap-y-1 justify-center-safe items-center-safe'>
      <div className='w-full h-fit text-center text-nowrap'>
        Colors
      </div>
      <div className='flex flex-row w-full h-fit place-content-center-safe justify-center-safe gap-x-3'>
        {materialIDs
          .filter((entry) => Boolean(materials?.[entry]))
          .map((entry) => {
            const id = `color_select_button_${entry}`
            return (
              <button
                key={id}
                id={id}
                aria-label={`Select color ${entry}`}
                className={`${materials[entry].tailwindColor} appearance-none w-3.5 sm:w-3.5 md:w-3.5 lg:w-4 xl:w-5 2xl:w-5 h-3.5 sm:h-3.5 md:h-3.5 lg:h-4 xl:h-5 2xl:h-5 cursor-pointer rounded-full outline-offset-1 ${selectedID !== entry ? 'outline-none' : 'outline-header outline-2'}`}
                onClick={() => { callback(entry) }}
                type='button'
              />
            )
          })}
      </div>
      <div className='w-full h-fit text-center text-nowrap'>
        {materials[selectedID]?.displayName?.length && materials[selectedID].displayName}
      </div>
    </div>
  )
})
MaterialControlsPanel.displayName = 'MaterialControlsPanel'

interface RotationControlsPanelProps {
  handleAutoRotate: () => void
  handleManualRotate: (rotation: EulerValue) => void
  autoRotateActive: boolean
  rotation: EulerValue
}
const RotationControlsPanel = memo(({ handleAutoRotate, handleManualRotate, autoRotateActive, rotation }: RotationControlsPanelProps) => {
  return (
    <div className='flex flex-col min-w-30 sm:min-w-30 md:min-w-36 min-h-20 p-1 sm:p-1 md:p-2 gap-y-0.5 justify-center items-center'>
      <div className='w-full h-fit text-center'>
        Rotation
      </div>
      <div className='flex flex-row w-full max-h-fit'>
        <div className='flex flex-row basis-1/2 min-h-fit justify-center items-center'>
          <AutoRotateButton active={autoRotateActive} callback={handleAutoRotate} />
        </div>

        <div className='relative flex flex-row w-full h-full basis-1/2 justify-center items-center'>
          <div className='relative flex flex-row w-fit h-fit aspect-square justify-center items-center'>
            <ManualRotateButtonGroup rotation={rotation} handleManualRotate={handleManualRotate} autoRotateActive={autoRotateActive} />
          </div>
        </div>
      </div>

      <div className='flex flex-row w-full h-fit text-center'>
        <div className={`basis-1/2 transition-all transition-discrete duration-500 ease-in-out ${autoRotateActive ? 'text-header' : 'text-link'}`}>
          Auto
        </div>
        <div className={`basis-1/2 transition-all transition-discrete duration-500 ease-in-out ${!autoRotateActive ? 'text-header' : 'text-link'}`}>
          Manual
        </div>
      </div>
    </div>
  )
})
RotationControlsPanel.displayName = 'RotationControlsPanel'

interface UIDataPanelProps {
  care: string
  description: string
  dimensions: string
  materialSpecs: string
  weight: string
}
const UIDataPanel = memo(({ care = '', description = '', dimensions = '', materialSpecs = '', weight = '' }: UIDataPanelProps) => {
  const tableData: Record<string, string> = { 'Dimensions': dimensions, 'Weight': weight, 'Materials': materialSpecs, 'Care': care }
  return (
    <div className='flex flex-col w-full h-full p-3 sm:p-3 md:p-3 lg:p-6 xl:p-6 2xl:p-6 gap-y-4 justify-end-safe items-center-safe'>
      <div className='flex flex-row w-full max-w-5/6 max-h-fit justify-center text-start'>
        {description}
      </div>
      <div className='flex flex-row w-full max-w-5/6 max-h-fit'>
        <table className='w-full h-fit table-auto divide-inherit border border-collapse border-header'>
          <tbody>
            {Object.entries(tableData).map(([key, value]) => (
              <tr key={key} className='border border-collapse'>
                <th scope='col' className='w-1/12 px-3 sm:px-3 md:px-3 lg:px-6 xl:px-6 2xl:px-6 py-3 sm:py-3 md:py-3 lg:py-3 xl:py-3 2xl:py-3 border text-start whitespace-nowrap'>
                  {key}
                </th>
                <td scope='col' className='w-11/12 px-3 sm:px-3 md:px-6 text-start'>
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})
UIDataPanel.displayName = 'UIDataPanel'

// NOTE: ProjectDataModal has a full-screen fixed container so event listeners attached to canvas won't receive events.
interface ProjectDataModalProps {
  slug: string
  entryPoint: string
}
const ProjectDataModalTest = ({ slug, entryPoint }: ProjectDataModalProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const materials = useMaterial((state) => state.materials)
  const currentMaterialID = useSelection((state) => state.selection.focusedMaterialID)
  const isAutoRotationActive = useSelection((state) => state.selection.defaultRotationAnimationActive)
  const setFocused = useSelection((state) => state.setFocused)
  const setMaterialID = useSelection((state) => state.setMaterialID)
  const [displayPanelsVisible, setDisplayPanelsVisible] = useState(false)
  const visible = useMenu((state) => state.menuState.visible)

  const project: Project = slug?.length ? useProjectStore.getState().getProjectBySlug(slug) : null

  const {
    UIData = {},
    UIData: { displayName = '' } = {},
    sceneData: {
      rotation = {} as EulerValue,
      materials: { defaultMaterialID = '', materialIDs = [] as string[] } = {},
      fileData: { nodeName = '' } = {},
    } = {},
  } = project || ({} as Project)

  const selectedMaterialID = useMemo((): string => currentMaterialID?.length ? currentMaterialID : defaultMaterialID, [currentMaterialID, defaultMaterialID])

  useLayoutEffect(() => {
    if (project && useSelection.getState().selection.focusedName !== nodeName) {
      startTransition(() => setFocused(nodeName, defaultMaterialID, null))
    }

    useMenu.getState().setVisible(true)

    return () => { startTransition(() => reset()) }
  }, [project, setFocused, nodeName, defaultMaterialID])

  const handleSelectMaterial = useCallback((id: string) => {
    if (id.length > 0 && selectedMaterialID !== id) startTransition(() => setMaterialID(id))
  }, [selectedMaterialID, setMaterialID])

  const handleManualRotate = useCallback((rotation: EulerValue) => {
    startTransition(() => setRotation(rotation))
  }, [])

  const dismiss = useCallback(() => {
    if (displayPanelsVisible === true) setDisplayPanelsVisible(false)

    setTimeout(() => {
      if (entryPoint === 'modal') router.back()
      else router.replace('/')
    }, 500)

  }, [entryPoint, router, displayPanelsVisible, setDisplayPanelsVisible])

  const ControlPanels: ReactNode[] = [
    <NavigationPanel callback={dismiss} />,
    <ToggleDisplayPanel expanded={displayPanelsVisible} callback={setDisplayPanelsVisible} />,
    <MaterialControlsPanel callback={handleSelectMaterial} materials={materials} materialIDs={materialIDs} selectedID={selectedMaterialID} />,
    <RotationControlsPanel rotation={rotation} handleAutoRotate={toggleAutoRotation} handleManualRotate={handleManualRotate} autoRotateActive={isAutoRotationActive} />
  ]
  const DisplayPanels: ReactNode[] = [<UIDataPanel {...UIData as UIDataPanelProps} />]

  return (
    <ModalContainer
      dataRoute={pathname}
      header={displayName}
      visible={visible}
      displayPanelsVisible={displayPanelsVisible}
      controlPanels={ControlPanels}
      displayPanels={DisplayPanels}
    />
  )
}

export default memo(ProjectDataModalTest)
