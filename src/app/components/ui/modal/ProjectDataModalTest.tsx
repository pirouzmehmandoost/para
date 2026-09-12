'use client'

import { memo, startTransition, useCallback, useLayoutEffect, useState, useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import NotesIcon from '@mui/icons-material/Notes'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { Project } from '../../../../types/project'
import type { MaterialRecord } from '../../../../types/material'
import type { EulerValue } from '../buttons/types'
import useProjectStore from '@stores/projectStore'
import useSelection from '@stores/selectionStore'
import useMaterial from '@stores/materialStore'
import ModalContainer from '../containers/ModalContainer'
import Panel from '../containers/Panel'
import ActionButton from '../buttons/ActionButton'
import AutoRotateButton from '../buttons/AutoRotateButton'
import ManualRotateButtonGroup from '../buttons/ManualRotateButtonGroup'

const reset = () => useSelection.getState().reset()
const setRotation = useSelection.getState().setRotation
const toggleAutoRotation = useSelection.getState().toggleDefaultRotationAnimation

interface NavigationPanelProps {
  callback: () => void
}
const NavigationPanel = memo(({ callback }: NavigationPanelProps) => {
  return (
    <div className='flex flex-col min-w-20 sm:min-w-20 md:min-w-30 max-w-32 min-h-20 sm:min-h-20 md:min-h-24 max-h-24 gap-y-0 sm:gap-y-0 md:gap-y-1 justify-center items-center'>
      <div className='w-full h-fit text-center text-nowrap hidden sm:hidden md:block'>
        Go Back
      </div>
      <ActionButton id='navigate-back-button' ariaLabel={`Go back`} callback={callback}>
        <ArrowBackIcon fontSize='medium' />
      </ActionButton>
    </div>
  )
})
NavigationPanel.displayName = 'NavigationPanel'

interface ToggleDisplayPanelProps {
  visible: boolean
  callback: Dispatch<SetStateAction<boolean>>
}
const ToggleDisplayPanel = memo(({ visible, callback }: ToggleDisplayPanelProps) => {
  return (
    <div className='flex flex-col min-w-20 sm:min-w-20 md:min-w-30 max-w-32 min-h-20 sm:min-h-20 md:min-h-24 max-h-24 gap-y-0 sm:gap-y-0 md:gap-y-1 justify-center items-center'>
      <div className='w-full h-fit text-center text-nowrap hidden sm:hidden md:block'>
        Specs
      </div>
      <ActionButton id='toggle-details-panel-button' callback={() => callback((x) => !x)} ariaLabel={'Toggle details panel'}>
        {visible ? <CloseFullscreenIcon fontSize='medium' /> : <NotesIcon fontSize='medium' />}
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
    <div className='flex flex-col min-w-28 sm:min-w-28 md:min-w-30 max-w-36 min-h-20 sm:min-h-20 md:min-h-24 max-h-24 gap-y-1 justify-center items-center'>
      <div className='w-full h-fit text-center text-nowrap hidden sm:hidden md:block'>
        Colors
      </div>
      <div className='flex flex-row w-full h-fit place-content-center-safe justify-center-safe gap-x-3'>
        {materialIDs
          .filter((entry) => Boolean(materials?.[entry]))
          .map((entry) => {
            const id = `material_select_button_${entry}`
            const backgroundColor: string = materials[entry].tailwindColor?.length > 0 ? materials[entry].tailwindColor : 'bg-inactive'
            return (
              <button
                key={id}
                id={id}
                aria-label={`Select color ${entry}`}
                className={`appearance-none w-3.5 sm:w-3.5 md:w-3.5 lg:w-4 xl:w-5 2xl:w-5 h-3.5 sm:h-3.5 md:h-3.5 lg:h-4 xl:h-5 2xl:h-5 rounded-full outline-2 outline-offset-1 transition-all transition-discrete duration-500 ease-in-out ${selectedID !== entry ? 'outline-header/0' : 'outline-header'} ${backgroundColor} cursor-pointer `}
                onClick={() => { callback(entry) }}
                type='button'
              />
            )
          })
        }
      </div>
      <div className='w-full h-fit text-center text-nowrap'>
        {materials[selectedID]?.displayName?.length > 0 && materials[selectedID].displayName}
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
  const [clicked, setClicked] = useState('rotation-button-side')

  const onAutoRotate = useCallback(() => {
    setClicked('rotation-button-side')
    handleAutoRotate()
  }, [handleAutoRotate])

  const onManualRotate = useCallback((next: EulerValue, buttonID: string) => {
    setClicked(buttonID)
    handleManualRotate(next)
  }, [handleManualRotate])

  return (
    <div className='flex flex-col min-w-32 sm:min-w-32 md:min-w-36 min-h-20 p-1 sm:p-1 md:p-2 gap-y-0 sm:gap-y-0 md:gap-y-0.5 justify-center items-center'>
      <div className='w-full h-fit text-center text-nowrap hidden sm:hidden md:block'>
        Rotation
      </div>
      <div className='flex flex-row w-full max-h-fit'>
        <div className='flex flex-row basis-1/2 min-h-fit justify-center items-center'>
          <AutoRotateButton active={autoRotateActive} callback={onAutoRotate} />
        </div>
        <div className='relative flex flex-row w-full h-full basis-1/2 justify-center items-center'>
          <div className='relative flex flex-row w-fit h-fit aspect-square justify-center items-center'>
            <ManualRotateButtonGroup active={!autoRotateActive} callback={onManualRotate} rotation={rotation} clicked={clicked} />
          </div>
        </div>
      </div>
      <div className='flex flex-row w-full h-fit text-center'>
        <div className={`basis-1/2 transition-all transition-discrete duration-500 ease-in-out ${autoRotateActive ? 'text-header' : 'text-link'}`}>Auto</div>
        <div className={`basis-1/2 transition-all transition-discrete duration-500 ease-in-out ${!autoRotateActive ? 'text-header' : 'text-link'}`}>Manual</div>
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
  const tableData: Record<string, string> = useMemo(() => ({ 'Dimensions': dimensions, 'Weight': weight, 'Materials': materialSpecs, 'Care': care }), [dimensions, weight, materialSpecs, care])
  return (
    <div className='flex grow flex-col w-full min-h-11/12 p-3 sm:p-3 md:p-3 lg:p-6 xl:p-6 2xl:p-6 gap-y-4 justify-end items-center'>
      <div className='flex grow flex-row w-2/3 h-full items-end'>{description}</div>
      <div className='flex flex-row w-2/3 h-fit'>
        <table className='w-full h-full table-auto divide-inherit border border-collapse border-header'>
          <tbody>
            {Object.entries(tableData).map(([key, value]) => (
              <tr key={key} className='border border-collapse'>
                <th scope='row' className='w-1/12 px-3 sm:px-3 md:px-3 lg:px-6 xl:px-6 2xl:px-6 py-3 sm:py-3 md:py-3 lg:py-3 xl:py-3 2xl:py-3 border text-start whitespace-nowrap'>{key}</th>
                <td className='w-11/12 px-3 sm:px-3 md:px-6 text-start'>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})
UIDataPanel.displayName = 'UIDataPanel'

// NOTE: ProjectDataModal has a full-screen fixed container so that event listeners on canvas won't receive events.
interface ProjectDataModalProps {
  slug: string
  entryPoint: 'modal' | 'page'
}
const ProjectDataModalTest = ({ slug, entryPoint }: ProjectDataModalProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const materials = useMaterial((state) => state.materials)
  const project = useProjectStore((state) => (slug?.length ? state.projectsBySlug[slug] ?? null : null))
  const currentMaterialID = useSelection((state) => state.selection.focusedMaterialID)
  const isAutoRotationActive = useSelection((state) => state.selection.defaultRotationAnimationActive)

  const setFocused = useSelection((state) => state.setFocused)
  const setMaterialID = useSelection((state) => state.setMaterialID)

  const [displayPanelsVisible, setDisplayPanelsVisible] = useState(false)
  const [visible, setVisible] = useState(true)

  const {
    UIData: { displayName = '', care = '', description = '', dimensions = '', materialSpecs = '', weight = '' } = {},
    sceneData: {
      rotation = { x: 0, y: 0, z: 0 } as EulerValue,
      materials: { defaultMaterialID = '', materialIDs = [] as string[] } = {},
      fileData: { nodeName = '' } = {},
    } = {},
  } = project || ({} as Project)

  const selectedMaterialID = useMemo((): string => {
    return currentMaterialID?.length ? currentMaterialID : defaultMaterialID
  }, [currentMaterialID, defaultMaterialID])

  useLayoutEffect(() => {
    if (project && useSelection.getState().selection.focusedName !== nodeName) setFocused(nodeName, defaultMaterialID, null)

    return (() => reset())
  }, [project, setFocused, nodeName, defaultMaterialID])

  const handleSelectMaterial = useCallback((id: string) => {
    if (id.length > 0 && selectedMaterialID !== id) startTransition(() => setMaterialID(id))
  }, [selectedMaterialID, setMaterialID])

  const handleManualRotate = useCallback((rotation: EulerValue) => {
    startTransition(() => setRotation(rotation))
  }, [])

  const handleBackNav = useCallback(() => {
    if (displayPanelsVisible === true) setDisplayPanelsVisible(false)

    if (visible === true) setVisible(false)

    if (entryPoint === 'modal') router.back()
    else router.replace('/')
  }, [entryPoint, router, visible, setVisible, displayPanelsVisible, setDisplayPanelsVisible])

  const injectStyle = 'max-w-fit max-h-fit'

  return (
    <ModalContainer
      dataRoute={pathname}
      visible={visible}
      header={displayName}
      controls={
        <>
          <Panel id='panel-navigation' injectStyle={injectStyle} visible={visible}><NavigationPanel callback={handleBackNav} /></Panel>
          <Panel id='panel-uidata-toggle' injectStyle={injectStyle} visible={visible}><ToggleDisplayPanel visible={displayPanelsVisible} callback={setDisplayPanelsVisible} /></Panel>
          <Panel id='panel-materials' injectStyle={injectStyle} visible={visible}><MaterialControlsPanel callback={handleSelectMaterial} materials={materials} materialIDs={materialIDs} selectedID={selectedMaterialID} /></Panel>
          <Panel id='panel-rotation' injectStyle={injectStyle} visible={visible}><RotationControlsPanel rotation={rotation} handleAutoRotate={toggleAutoRotation} handleManualRotate={handleManualRotate} autoRotateActive={isAutoRotationActive} /></Panel>
        </>
      }
      display={<Panel id='panel-uidata' visible={visible && displayPanelsVisible}><UIDataPanel care={care} description={description} dimensions={dimensions} materialSpecs={materialSpecs} weight={weight} /></Panel>}
    />
  )
}

export default memo(ProjectDataModalTest)
