'use client'

import { memo, startTransition, useCallback, useLayoutEffect, useState, useMemo } from 'react'
import type { ReactNode, Dispatch, SetStateAction } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import useSelection from '@stores/selectionStore'
import NotesIcon from '@mui/icons-material/Notes'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { Project } from '../../../types/project'
import type { MaterialRecord } from '../../../types/material'
import useMaterial from '@stores/materialStore'
import useProjectStore from '@stores/projectStore'
import { ModalContainer } from './ModalContainer'
import ActionButton from './ActionButton'
import { AutoRotateButton } from './RotateActionButton'

const reset = () => useSelection.getState().reset() // deliberately invoke store setter 
const setRotation = useSelection.getState().setRotation
const toggleAutoRotation = useSelection.getState().toggleDefaultRotationAnimation

interface EulerValue {
  x: number
  y: number
  z: number
}

interface BackButtonProps {
  callback: () => void
}
const NavigationPanel = memo(({ callback }: BackButtonProps) => {
  return (
    <div className='flex flex-col w-full h-fit gap-y-1 justify-center-safe items-center-safe'>
      <div> Go Back </div>
      <ActionButton id='back' callback={callback} ariaLabel={`Go back`}>
        <ArrowBackIcon fontSize='medium' />
      </ActionButton>
    </div>
  )
})
NavigationPanel.displayName = 'BackButton'

interface ToggleUIDataPanelProps {
  expanded: boolean
  callback: Dispatch<SetStateAction<boolean>>
}
const ToggleUIDataPanel = memo(({ expanded, callback }: ToggleUIDataPanelProps) => {
  return (
    <div className='flex flex-col w-full h-fit gap-y-1 justify-center-safe items-center-safe'>
      <div> Technical Specs </div>
      <ActionButton id='details' callback={() => callback((x) => !x)} ariaLabel={'Toggle details panel'}>
        {expanded
          ? <CloseFullscreenIcon fontSize='medium' />
          : <NotesIcon fontSize='medium' />
        }
      </ActionButton>
    </div>
  )
})
ToggleUIDataPanel.displayName = 'ToggleUIDataPanel'

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
    <div className='flex flex-col w-fit h-full justify-end-safe items-center-safe'>
      <div className='flex flex-col max-w-5/6 h-fit mb-4 justify-center-safe text-center'>
        {description}
      </div>
      <div className='flex flex-col max-w-5/6 max-h-fit justify-center-safe'>
        <table className='table-auto divide-inherit border-collapse border text-header text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm text-left font-medium whitespace-nowrap'>
          <tbody>
            {Object.entries(tableData).map(([key, value]) => (
              <tr key={key} className='border-b'>
                <th scope='col' className='px-6 py-3 border-r'>
                  {key}
                </th>
                <td scope='col' className='px-6 whitespace-normal text-wrap'>
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

interface MaterialControlsPanelProps {
  callback: (id: string) => void
  materials: Record<string, MaterialRecord>
  materialIDs: string[]
  selectedID: string
}
const MaterialControlsPanel = memo(({ callback, materials, materialIDs, selectedID }: MaterialControlsPanelProps) => {
  return (
    <div className='flex grow flex-col w-full h-full gap-y-1 place-items-center-safe text-center text-nowrap'>
      Colors
      <div className='flex flex-row w-full place-content-center-safe justify-center-safe gap-x-3'>
        {materialIDs
          .filter((entry) => Boolean(materials?.[entry]))
          .map((entry) => {
            return (
              <button
                key={`color_select_button_${entry}`}
                className={`${materials[entry].tailwindColor} appearance-none size-3 sm:size-3 md:size-3.5 lg:size-4 xl:size-5 2xl:size-5 cursor-pointer rounded-full outline-offset-1 ${selectedID !== entry ? 'outline-none' : 'outline-header outline-[1.5px] sm:outline-[1.5px] md:outline-2 lg:outline-2 xl:outline-2 2xl:outline-2 '}`}
                onClick={() => { callback(entry) }}
                type='button'
                aria-label='Select a color'
              />
            )
          })}
      </div>
      <div className='min-w-full text-nowrap'>
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
const RotationControlsPanel = memo(({
  handleAutoRotate,
  handleManualRotate,
  autoRotateActive,
  rotation
}: RotationControlsPanelProps) => {
  return (
    <div className='flex flex-col grow size-full justify-stretch items-stretch gap-y-1'>
      <div> Rotation </div>
      <div className='relative flex flex-row fize-full'>
        <div className='basis-1/2'>
          <AutoRotateButton active={autoRotateActive} callback={handleAutoRotate} />
        </div>
        <div className={`basis-1/2 relative flex grow place-self-start min-w-7 min-h-7 aspect-square transition-all transition-discrete duration-500 ease-in-out ${!autoRotateActive ? 'animate-pulse' : 'animate-none'}`}>
          <div
            id='manual_rotate_button_top'
            onClick={() => { handleManualRotate({ x: rotation.x + Math.PI / 2, y: rotation.y, z: rotation.z }) }}
            className={`absolute top-0 inset-0 place-self-center transform-3d origin-center flex items-center justify-center rotate-z-45 size-7 sm-size-7 md:size-8.5 xl:size-9.5 rotate-x-72 sm:rotate-x-72 xl:rotate-x-[73.5deg] -translate-y-1.25 sm:-translate-y-1.25 md:-translate-y-1.5 xl:translate-y-[-6.5px] scale-x-71 sm:scale-z-71 md:scale-x-70 xl:scale-x-68 z-200 cursor-pointer text-sm transition-all transition-discrete duration-500 ease-in-out ${autoRotateActive === true ? 'bg-neutral-400 hover:bg-neutral-300' : 'bg-neutral-300 hover:bg-neutral-200'}`}
          >
            Top
          </div>
          <div
            id='manual_rotate_button_front'
            onClick={() => { handleManualRotate({ x: rotation.x, y: rotation.y + Math.PI / 2, z: rotation.z }) }}
            className={`absolute bottom-0 inset-0 transform-3d origin-left place-self-end self-end flex items-center justify-center size-5 sm:size-5 md:size-6 xl:size-6.5 rotate-x-25 -rotate-y-45 cursor-pointer text-xs transition-all transition-discrete duration-500 ease-in-out ${autoRotateActive === true ? 'bg-neutral-500 hover:bg-neutral-400' : 'bg-neutral-400 hover:bg-neutral-300'}`}
          >
            Front
          </div>
          <div
            id='manual_rotate_button_side'
            onClick={() => { handleManualRotate({ x: 0, y: 0, z: 0 }) }}
            className={`absolute bottom-0 inset-0 transform-3d origin-right place-self-start self-end flex items-center justify-center size-5 sm-size-5 md:size-6 xl:size-6.5 rotate-x-25 rotate-y-45 cursor-pointer text-xs transition-all transition-discrete duration-500 ease-in-out ${autoRotateActive === true ? 'bg-neutral-600 hover:bg-neutral-500' : 'bg-neutral-500 hover:bg-neutral-400'} `}
          >
            Side
          </div>
        </div>
      </div>
    </div>
  )
})
RotationControlsPanel.displayName = 'RotationControlsPanel'

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
  const [expanded, setExpanded] = useState(false)

  const project: Project = slug?.length ? useProjectStore.getState().getProjectBySlug(slug) : null

  const {
    UIData: {
      care = '',
      description = '',
      dimensions = '',
      displayName = '',
      materialSpecs = '',
      weight = '',
    } = {},
    sceneData: {
      materials: {
        defaultMaterialID = '',
        materialIDs = [] as string[],
      } = {},
      fileData: {
        nodeName = ''
      } = {},
      rotation = {} as EulerValue,
    } = {},
  } = project || ({} as Project)

  const selectedMaterialID = useMemo((): string => currentMaterialID?.length ? currentMaterialID : defaultMaterialID, [currentMaterialID, defaultMaterialID])

  useLayoutEffect(() => {
    if (project && useSelection.getState().selection.focusedName !== nodeName) {
      startTransition(() => setFocused(nodeName, defaultMaterialID, null))
    }

    return () => { startTransition(() => reset()) }
  }, [project, setFocused, nodeName, defaultMaterialID])

  const handleSelectMaterial = useCallback((id: string) => {
    if (id.length > 0 && selectedMaterialID !== id) {
      startTransition(()=> setMaterialID(id))
    }
  }, [selectedMaterialID, setMaterialID])

  const handleManualRotate = useCallback((rotation: EulerValue) => {
    startTransition(() => setRotation(rotation))
  },[])

  const dismiss = useCallback(() => {
    if (entryPoint === 'modal') {
      router.back()
    }
    else {
      router.replace('/')
    }
  }, [entryPoint, router])

  const LeftContent: ReactNode[] = [
    <NavigationPanel callback={dismiss} />,
    <ToggleUIDataPanel expanded={expanded} callback={setExpanded} />,
    <MaterialControlsPanel callback={handleSelectMaterial} materials={materials} materialIDs={materialIDs} selectedID={selectedMaterialID} />,
    <RotationControlsPanel rotation={rotation} handleAutoRotate={toggleAutoRotation} handleManualRotate={handleManualRotate} autoRotateActive={isAutoRotationActive} />
  ]

  const RightContent: ReactNode[] = [
    <UIDataPanel care={care} description={description} dimensions={dimensions} materialSpecs={materialSpecs} weight={weight} />
  ]

  return (
    <ModalContainer
      header={displayName}
      dataRoute={pathname}
      visible={expanded}
      left={LeftContent}
      right={RightContent}
    />
  )
}

export default memo(ProjectDataModalTest)
