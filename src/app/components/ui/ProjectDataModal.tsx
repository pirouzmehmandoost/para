'use client'

import React, { memo, useCallback, useLayoutEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import useSelection from '@stores/selectionStore'
import AutoModeIcon from '@mui/icons-material/AutoMode'
import NotesIcon from '@mui/icons-material/Notes'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import type { Project } from '../../../types/project'
import type { MaterialRecord } from '../../../types/material'
import useMaterial from '@stores/materialStore'
import useProjectStore from '@stores/projectStore'

const reset = () => useSelection.getState().reset() // deliberately invoke store setter 
const setRotation = useSelection.getState().setRotation
const toggleDefaultRotationAnimation = useSelection.getState().toggleDefaultRotationAnimation

interface EulerValue {
  x: number
  y: number
  z: number
}

interface BaseButtonProps {
  buttonStyle: string
  text: string
}

interface ButtonVals extends BaseButtonProps {
  rotation: EulerValue
}

interface RotateActionButtonProps extends BaseButtonProps {
  callback: () => void
  defaultRotationAnimationActive: boolean
}

const RotateActionButton = memo(({
  callback,
  defaultRotationAnimationActive,
  buttonStyle,
  text
}: RotateActionButtonProps) => {
  return (
    <button
      className={`absolute appearance-none w-10 h-10 backdrop-blur-md cursor-pointer text-center text-sm ${buttonStyle} transition-all duration-500 ease-in-out ${!defaultRotationAnimationActive ? 'bg-neutral-300/60 hover:bg-neutral-400/60' : 'bg-neutral-500/50 hover:bg-neutral-400/50'}`}
      onClick={callback}
      type='button'
    >
      {text}
    </button>
  )
})
RotateActionButton.displayName = 'RotateActionButton'

interface ToggleDetailsButtonProps {
  expanded: boolean
  callback: React.Dispatch<React.SetStateAction<boolean>>
}
const ToggleDetailsButton = memo(({ expanded, callback }: ToggleDetailsButtonProps) => {
  return (
    <div className='flex flex-col w-full h-fit p-4 gap-y-1 items-center-safe rounded-4xl backdrop-blur-md backdrop-brightness-200'>
      Technical Specs
      <button
        aria-label={expanded ? 'Collapse details' : 'Expand details'}
        className='flex w-fit h-fit p-4 rounded-full items-center bg-neutral-500/10 backdrop-blur-md backdrop-invert-10 cursor-pointer transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700'
        onClick={() => { callback((x) => !x) }}
        type='button'
      >
        {expanded ? <CloseFullscreenIcon fontSize='medium' /> : <NotesIcon fontSize='medium' />}
      </button>
    </div>
  )
})
ToggleDetailsButton.displayName = 'ToggleDetailsButton'

interface DetailsPanelProps {
  expanded: boolean
  care: string
  description: string
  dimensions: string
  materialSpecs: string
  weight: string
}
const DetailsPanel = memo(
  ({ expanded, care = '', description = '', dimensions = '', materialSpecs = '', weight = '' }: DetailsPanelProps) => {
    const cells = { 'Dimensions': dimensions, 'Weight': weight, 'Materials': materialSpecs, 'Care': care }
    return (
      <div className={`flex flex-col w-fit h-full space-y-4 items-center-safe select-none transition-all transition-discrete duration-200 ease-in-out ${expanded ? 'opacity-100' : 'opacity-0'}`}>
        <div className='max-w-5/6 h-full text-center'> {description}</div>
        <div className='max-w-fit h-full select-none text-neutral-900 text-sm text-left font-medium whitespace-nowrap'>
          <table className='table-auto divide-inherit border-collapse border'>
            <tbody>
              {Object.entries(cells).map(([key, value]) => (
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
  }
)
DetailsPanel.displayName = 'DetailsPanel'

interface MaterialControlsPanelProps {
  callback: (id: string) => void
  materials: Record<string, MaterialRecord>
  materialIDs: string[]
  selectedID: string
}
const MaterialControlsPanel = memo(
  ({ callback, materials, materialIDs, selectedID }: MaterialControlsPanelProps) => {
    return (
      <div className='flex flex-col min-w-40 h-fit p-5 gap-y-1 items-center text-center rounded-4xl backdrop-blur-md backdrop-brightness-200 text-nowrap text-md'>
        <div className='flex flex-row w-full place-content-center-safe justify-center-safe gap-x-3 xs:gap-x-3 sm:gap-x-3 md:gap-x-3 lg:gap-x-5 xl:gap-x-6 2xl:gap-x-6'>
          {materialIDs
            .filter((entry) => Boolean(materials?.[entry]))
            .map((entry) => {
              return (
                <button
                  key={`color_select_button_${entry}`}
                  className={`${materials[entry].tailwindColor} appearance-none w-5 h-5 cursor-pointer rounded-full outline outline-offset-1 ${selectedID !== entry ? 'outline-none' : 'outline-neutral-950/50 outline-2'}`}
                  onClick={() => { callback(entry) }}
                  type='button'
                />
              )
            })}
        </div>
        <div className='min-w-full text-nowrap'>
          {materials[selectedID]?.displayName?.length && materials[selectedID].displayName}
        </div>
      </div>
    )
  },
)
MaterialControlsPanel.displayName = 'MaterialControlsPanel'

interface RotationControlsPanelProps {
  handleAutoRotate: () => void
  handleManualRotate: (rotation: EulerValue) => void
  autoRotateActive: boolean
  rotation: EulerValue
}
const RotationControlsPanel = memo(
  ({ handleAutoRotate, handleManualRotate, autoRotateActive, rotation }: RotationControlsPanelProps) => {
    //models face the camera laterally, so the SIDE button resets rotation.
    const rotateActionButtonValues: Record<string, ButtonVals> = {
      TOP: {
        text: 'TOP',
        rotation: {
          x: rotation.x + Math.PI / 2,
          y: rotation.y,
          z: rotation.z,
        },
        buttonStyle: `transform-3d perspective-origin-top-left translate-x-0 -translate-y-4 rotate-x-60 rotate-y-0 rotate-z-45 backface-visible contrast-150 hover:contrast-175`,
      },
      FRONT: {
        text: 'FRONT',
        rotation: {
          x: rotation.x,
          y: rotation.y + Math.PI / 2,
          z: rotation.z,
        },
        buttonStyle: `transform-3d perspective-origin-top-left translate-x-3.5 translate-y-2 -rotate-x-30 rotate-y-45 rotate-z-0 backface-visible contrast-100 hover:contrast-175`,
      },
      SIDE: {
        text: 'SIDE',
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        buttonStyle: `transform-3d perspective-origin-top-left -translate-x-3.5 translate-y-2 -rotate-x-30 -rotate-y-45 rotate-z-0 backface-visible contrast-125 hover:contrast-175`,
      }
    }

    return (
      <div className='flex flex-col w-full h-fit p-6 justify-center-safe items-center-safe rounded-4xl backdrop-blur-md backdrop-brightness-200'>
        <div className='flex flex-row w-full h-fit space-x-4 justify-center place-items-center-safe'>
          {/* Container for Auto-rotate button, text, and SVG strike-through line */}
          <div className='flex flex-col w-full items-center place-content-center justify-center'>
            <button
              className={`group appearance-none flex w-fit h-fit rounded-full backdrop-blur-md cursor-pointer transition-all duration-500 ease-in-out ${autoRotateActive ? 'bg-neutral-300/50 hover:bg-neutral-400/50 animate-pulse' : 'bg-neutral-500/50 hover:bg-neutral-400/50'}`}
              onClick={() => handleAutoRotate()}
              type='button'
            >
              <div className='relative flex p-2 items-center justify-center transition-all duration-500 ease-in-out text-neutral-900 group-hover:text-neutral-700'>
                <div className='relative flex w-6 h-6 items-center justify-center '>
                  <AutoModeIcon
                    className={`transform-3d perspective-origin-center rotate-x-50 ${autoRotateActive ? 'animate-pulse' : ''}`}
                    fontSize='medium'
                  />
                  {!autoRotateActive && (
                    <svg viewBox='0 0 1 1' preserveAspectRatio='none' className='absolute inset-0 w-full h-full pointer-events-none'>
                      <line x1='0' y1='1' x2='1' y2='0' vectorEffect='non-scaling-stroke' className='stroke-2 stroke-current transition-all duration-500 ease-in-out' />
                    </svg>
                  )}
                </div>
              </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out text-neutral-900 ${autoRotateActive ? 'animate-pulse invert-75' : ''}`}>
              Auto
            </div>
          </div>
          {/* Container for manual rotate buttons */}
          <div className='relative flex flex-row min-w-10 w-full min-h-10 h-full m-2 justify-center items-center'>
            {Object.entries(rotateActionButtonValues).map(([key, { rotation, buttonStyle, text }]) => (
              <RotateActionButton
                key={`rotation_button_${key}`}
                callback={() => { handleManualRotate(rotation) }}
                defaultRotationAnimationActive={autoRotateActive}
                buttonStyle={buttonStyle}
                text={text}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
)
RotationControlsPanel.displayName = 'RotationControlsPanel'

interface ProjectDataModalProps {
  slug: string
  entryPoint: string
}
// ProjectDataModal has a full-screen fixed container so event listeners attached to canvas won't receive events.
// GlobalKeyboardShortCuts mounts over ProjectDataModal to receive events.
const ProjectDataModal = ({ slug, entryPoint }: ProjectDataModalProps) => {
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

  const selectedMaterialID: string = currentMaterialID?.length ? currentMaterialID : defaultMaterialID

  useLayoutEffect(() => {
    if (project && useSelection.getState().selection.focusedName !== nodeName) {
      setFocused(nodeName, defaultMaterialID, null)
    }

    return () => { reset() }
  }, [project, setFocused, nodeName, defaultMaterialID])


  const handleSelectMaterial = useCallback((id: string) => {
    if (!id || selectedMaterialID === id) return
    else setMaterialID(id)
  }, [selectedMaterialID, setMaterialID])

  const handleManualRotate = useCallback((rotation: EulerValue) => { setRotation(rotation) }, [])

  const dismiss = useCallback(() => {
    if (entryPoint === 'modal') router.back()
    else router.replace('/')
  }, [entryPoint, router])

  return (
    <div data-route={pathname} className='fixed flex flex-col w-full h-full inset-0 text-neutral-900 subpixel-antialiased'>
      <div className='mt-12 text-center text-7xl select-none'>
        {displayName}
      </div>
      <div className='fixed flex grow w-full h-fit bottom-0 inset-x-0 p-6'>
        <div className='flex grow flex-col w-full h-full items-center-safe justify-center-safe'>
          <div className='flex flex-row w-full h-full lg:place-self-start xl:place-self-start 2xl:place-self-start space-x-4 items-end-safe justify-between lg:justify-start xl:justify-start 2xl:justify-start'>
              {/* row 1: buttons/panels row2: UIData */}
            <div className='flex flex-col w-fit h-full space-y-2'>
              {/* <div className='flex flex-col h-full p-6 rounded-4xl items-center-safe text-center'> */}
              <div className='flex flex-col w-full h-fit p-4 gap-y-1 items-center-safe rounded-4xl backdrop-blur-md backdrop-brightness-200'>
                Go Back
                <button
                  aria-label='Navigate back'
                  className='appearance-none flex p-4 w-fit h-fit rounded-full bg-neutral-500/10 backdrop-blur-md backdrop-invert-10 cursor-pointer transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700'
                  onClick={dismiss}
                  type='button'
                >
                  <ArrowBackIcon fontSize='medium' />
                </button>
              </div>
              <ToggleDetailsButton
                expanded={expanded}
                callback={setExpanded}
              />
              <MaterialControlsPanel
                callback={handleSelectMaterial}
                materials={materials}
                materialIDs={materialIDs}
                selectedID={selectedMaterialID}
              />
              <RotationControlsPanel
                rotation={rotation}
                handleAutoRotate={toggleDefaultRotationAnimation}
                handleManualRotate={handleManualRotate}
                autoRotateActive={isAutoRotationActive}
              />
            </div>
            <div className='flex flex-col w-full h-full justify-stretch items-center-safe'>
              <DetailsPanel
                expanded={expanded}
                care={care}
                description={description}
                dimensions={dimensions}
                materialSpecs={materialSpecs}
                weight={weight}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={`fixed -z-100 w-full h-screen bg-linear-to-t from-neutral-500 from-60% to-transparent blur-3xl transition-all duration-500 ease-in-out ${expanded ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}

export default memo(ProjectDataModal)
