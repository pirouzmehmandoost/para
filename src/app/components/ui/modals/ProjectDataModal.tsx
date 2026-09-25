'use client'

import { memo, startTransition, useCallback, useLayoutEffect, useState, useMemo, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import NotesIcon from '@mui/icons-material/Notes'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { MaterialRecord } from '../../../../types/material'
import type { EulerValue } from '../../../../types/EulerValue'
import useSelection from '@stores/selectionStore'
import useMaterial from '@stores/materialStore'
import ModalContainer from '../containers/ModalContainer'
import Panel from '../containers/Panel'
import ActionButton from '../buttons/ActionButton'
import AutoRotateButton from '../buttons/AutoRotateButton'
import ManualRotateButtonGroup from '../buttons/ManualRotateButtonGroup'
import type { Project } from '@/types/project'

const reset = () => useSelection.getState().reset()
const setRotation = useSelection.getState().setRotation
const toggleAutoRotation = useSelection.getState().toggleAutoRotation
const setFocused = useSelection.getState().setFocused

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
    <div className='flex flex-col min-w-26 sm:min-26 md:min-w-30 max-w-36 min-h-20 sm:min-h-20 md:min-h-24 max-h-24 gap-y-1 justify-center items-center'>
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
}
const RotationControlsPanel = memo(({ handleAutoRotate, handleManualRotate, autoRotateActive }: RotationControlsPanelProps) => {
  const [clickedButtonID, setClickedButtonID] = useState('rotation-button-side')

  const onAutoRotate = useCallback(() => {
    setClickedButtonID('rotation-button-side')
    handleAutoRotate()
  }, [handleAutoRotate])

  const onManualRotate = useCallback((next: EulerValue, buttonID: string) => {
    setClickedButtonID(buttonID)
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
            <ManualRotateButtonGroup active={!autoRotateActive} callback={onManualRotate} clickedButtonID={clickedButtonID} />
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
      <div className='flex grow flex-row w-2/3 max-h-fit items-end'>{description}</div>
      <div className='flex flex-row w-2/3 h-fit'>
        <table className='w-full h-full table-auto divide-inherit'>
          <tbody>
            {Object.entries(tableData).map(([key, value]) => (
              <tr key={key} className='border border-collapse border-header'>
                <th scope='row' className='w-1/12 px-3 sm:px-3 md:px-3 lg:px-6 xl:px-6 2xl:px-6 py-3 sm:py-3 md:py-3 lg:py-3 xl:py-3 2xl:py-3 border-r text-start whitespace-nowrap'>{key}</th>
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
// NOTE: ProjectDataModal is a full-screen absolute container so that event listeners on canvas won't receive events.
interface ProjectDataModalProps {
  project: Project
  entryPoint: 'modal' | 'page'
}
const ProjectDataModal = ({ project, entryPoint }: ProjectDataModalProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const materials = useMaterial((state) => state.materials)
  const currentMaterialID = useSelection((state) => state.focusedMaterialID)
  const isAutoRotationActive = useSelection((state) => state.autoRotationActive)
  const setMaterialID = useSelection((state) => state.setMaterialID)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [displayPanelsVisible, setDisplayPanelsVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(true)

  const {
    UIData: { displayName, care, description, dimensions, materialSpecs, weight, slug },
    sceneData: { defaultMaterialID, materialIDs },
  } = project

  const selectedMaterialID = useMemo((): string =>
    currentMaterialID?.length ? currentMaterialID : defaultMaterialID
    , [currentMaterialID, defaultMaterialID])

  useLayoutEffect(() => {
    if (useSelection.getState().focusedSlug !== slug) setFocused(defaultMaterialID, slug)
  }, [project, slug, defaultMaterialID])

  useLayoutEffect(() => {
    return (() => {
      const { focusedSlug: checkSlug, focusedMaterialID: checkMaterialID } = useSelection.getState()

      if (checkSlug !== null || checkMaterialID !== null) reset()

      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    })
  }, [])

  const handleSelectMaterial = useCallback((id: string) => {
    if (id.length > 0 && selectedMaterialID !== id) startTransition(() => setMaterialID(id))
  }, [selectedMaterialID, setMaterialID])

  const handleManualRotate = useCallback((rotation: EulerValue) => {
    startTransition(() => setRotation(rotation))
  }, [])

  const handleBackNav = useCallback(() => {
    reset()
    setModalVisible(false)

    if (timeoutRef.current !== null) return

    const handleNav = () => {
      if (entryPoint === 'modal') router.back()
      else router.replace('/')
    }
    timeoutRef.current = setTimeout(() => handleNav(), 400)

  }, [entryPoint, router, setModalVisible])

  const injectStyle = 'max-w-fit'


  return (
    <div data-route={pathname} className='absolute inset-0 z-1 flex grow flex-col w-full h-full'>
      <ModalContainer
        visible={modalVisible}
        header={displayName}
        controls={
          <>
            <Panel id='panel-navigation' injectStyle={injectStyle} visible={modalVisible}><NavigationPanel callback={handleBackNav} /></Panel>
            <Panel id='panel-uidata-toggle' injectStyle={injectStyle} visible={modalVisible}><ToggleDisplayPanel visible={displayPanelsVisible} callback={setDisplayPanelsVisible} /></Panel>
            <Panel id='panel-materials' injectStyle={injectStyle} visible={modalVisible}><MaterialControlsPanel callback={handleSelectMaterial} materials={materials} materialIDs={materialIDs} selectedID={selectedMaterialID} /></Panel>
            <Panel id='panel-rotation' injectStyle={injectStyle} visible={modalVisible}><RotationControlsPanel handleAutoRotate={toggleAutoRotation} handleManualRotate={handleManualRotate} autoRotateActive={isAutoRotationActive} /></Panel>
          </>
        }
        display={<Panel id='panel-uidata' visible={modalVisible && displayPanelsVisible}><UIDataPanel care={care} description={description} dimensions={dimensions} materialSpecs={materialSpecs} weight={weight} /></Panel>}
      />
    </div>
  )
}

export default memo(ProjectDataModal)