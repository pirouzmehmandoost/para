'use client';

import React, { useLayoutEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
// import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
// import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { portfolio } from '@configs/globals';
import { getProjectFromSlug } from '@utils/slug';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import NotesIcon from '@mui/icons-material/Notes';
import HomeIcon from '@mui/icons-material/Home';
const { projects } = portfolio;

// const clearFocus = () => useSelection.getState().setIsFocused(null);  
const reset = () => useSelection.getState().reset();

// ProjectDataModal has full-screen fixed container.
// So pointer event listeners in BasicScene or attached to canvas via SceneRig won't receive events.
// GlobalKeyboardShortCuts will receive events as it mounts over this modal.
const ProjectDataModal = ({ slug, entryPoint }) => {
  const router = useRouter();
  const pathname = usePathname();
  const materials = useMaterial((state) => state.materials);
  const selection = useSelection((state) => state.selection);
  const setSelectionStore = useSelection((state) => state.setSelection);
  const setMaterialID = useSelection((state) => state.setMaterialID);

  const toggleDefaultRotationAnimation = useSelection.getState().toggleDefaultRotationAnimation;
  const defaultRotationAnimationActive = useSelection.getState().selection.sceneData.defaultRotationAnimationActive;
  const setRotation = useSelection.getState().setRotation;

  const [expanded, setExpanded] = useState(false);

  const project = useMemo(() => {
    if (!slug?.length) return null;

    return getProjectFromSlug(slug, projects);
  }, [slug]);

  const projectData = project || selection;

  const {
    displayName = '',
    productData: {
      care = '',
      description = '',
      dimensions = '',
      materialSpecs = '',
      weight = '',
    } = {},
    sceneData: {
      materials: {
        defaultMaterialID = '',
        materialIDs = [],
      } = {},
      rotation: {
        x: rx = 0,
        y: ry = 0,
        z: rz = 0
      } = {},
    } = {},
  } = projectData || {};

  const selectedMaterialID = selection?.materialID?.length ? selection.materialID : defaultMaterialID;

  // Hydration guard that handles the case where selectionStore initializes to initialState, if visiting /projects/[slug] directly from a browser tab. 
  useLayoutEffect(() => {
    if (!project) return;
    if (!selection?.name || selection.name !== project.name) {
      const update = {
        ...project,
        isFocused: project.sceneData.fileData.nodeName,
        materialID: project.sceneData.materials.defaultMaterialID,
      };
      setSelectionStore(update);
    }
  }, [project, setSelectionStore, selection?.name]);

  const NavigateToRoot = () => {
    // clearFocus();
    reset();
    router.replace('/');
  };

  const handleSelectMaterial = (id) => {
    if (!id || selectedMaterialID === id) return;
    setMaterialID(id);
  };

  const MaterialControlsPanel = (
    <div className='flex flex-col min-w-40 h-fit p-5 gap-y-1 items-center text-center rounded-4xl backdrop-blur-md backdrop-brightness-200 text-nowrap text-md'>
      <div className='flex flex-row w-full place-content-center justify-center gap-x-3 xs:gap-x-3 sm:gap-x-3 md:gap-x-3 lg:gap-x-5 xl:gap-x-6 2xl:gap-x-6'>
        {materialIDs
          .filter((entry) => Boolean(materials?.[entry]))
          .map((entry) => {
            return (
              <button
                key={`color_select_button_${entry}`}
                className={`${materials[entry].tailwindColor} appearance-none w-5 h-5 cursor-pointer rounded-full outline outline-offset-1 ${selectedMaterialID !== entry ? 'outline-none' : 'outline-neutral-950/50 outline-2'}`}
                onClick={() => { handleSelectMaterial(entry) }}
                type='button'
              />
            );
          })}
      </div>
      <div className='min-w-full text-nowrap'> {materials[selectedMaterialID]?.displayName?.length && materials[selectedMaterialID].displayName}</div>
    </div>
  );


  const rotateActionButtonProps = {
    'TOP': {
      text: 'TOP',
      rotation: {
        x: Math.PI * (rx + 0.5),
        y: Math.PI * ry,
        z: Math.PI * rz
      },
      style: `transform-3d perspective-origin-top-left translate-x-0 -translate-y-4 rotate-x-60 rotate-y-0 rotate-z-45 backface-visible contrast-150 `
    },
    'FRONT': {
      text: 'FRONT',
      rotation: {
        x: Math.PI * rx,
        y: Math.PI * (ry + 0.5),
        z: Math.PI * rz
      },
      style: `transform-3d perspective-origin-top-left translate-x-3.5 translate-y-2 -rotate-x-30 rotate-y-45 rotate-z-0 backface-visible contrast-100`
    },
    'SIDE': {
      text: 'SIDE',
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      style: `transform-3d perspective-origin-top-left -translate-x-3.5 translate-y-2 -rotate-x-30 -rotate-y-45 rotate-z-0 backface-visible contrast-125`
    },
  };

  const handleRotation = (delta) => { setRotation(delta) };

  const RotateActionButton = ({ callback, text, styling }) => {
    return (
      <button
        className={`absolute appearance-none w-10 h-10 backdrop-blur-md cursor-pointer text-center text-sm ${styling} transition-all duration-500 ease-in-out ${!defaultRotationAnimationActive ? 'bg-neutral-300/60 hover:bg-neutral-400/60' : 'bg-neutral-500/50 hover:bg-neutral-406/50'}`}
        onClick={callback}
        type='button'
      >
        {text}
      </button>
    )
  }

  const RotationControlsPanel = (
    <div className='flex flex-col w-full h-fit p-6 justify-center-safe items-center-safe rounded-4xl backdrop-blur-md backdrop-brightness-200'>
      {/* <div className='w-full mb-3 text-nowrap'> Rotation Controls</div> */}
      <div className='flex flex-row w-full h-fit space-x-4 justify-center place-items-center-safe'>
        {/* Container for Auto-rotate button, text, and SVG line */}
        <div className='flex flex-col w-full items-center place-content-center justify-center'>
          <button
            className={`group appearance-none flex w-fit h-fit rounded-full backdrop-blur-md cursor-pointer transition-all duration-500 ease-in-out ${defaultRotationAnimationActive ? 'bg-neutral-300/50 hover:bg-neutral-400/50 animate-pulse' : 'bg-neutral-500/50 hover:bg-neutral-400/50'}`}
            onClick={() => toggleDefaultRotationAnimation()}
            type='button'
          >
            <div className='relative flex p-2 items-center justify-center transition-all duration-500 ease-in-out text-neutral-900 group-hover:text-neutral-700'>
              <div className='relative flex w-6 h-6 items-center justify-center '>
                <AutoModeIcon className={`transform-3d perspective-origin-center rotate-x-50 ${defaultRotationAnimationActive ? 'animate-pulse' : ''}`} fontSize='medium' />
                {/* SVG strike-through line */}
                {!defaultRotationAnimationActive && (
                  <svg viewBox='0 0 1 1' preserveAspectRatio='none' className='absolute inset-0 w-full h-full pointer-events-none'>
                    <line x1='0' y1='1' x2='1' y2='0' vectorEffect='non-scaling-stroke' className='stroke-2 stroke-current transition-all duration-500 ease-in-out' />
                  </svg>
                )}
              </div>
            </div>
          </button>
          {/* text below button */}
          <div className={`transition-all duration-500 ease-in-out text-neutral-900 ${defaultRotationAnimationActive ? 'animate-pulse invert-75' : ''}`}> Auto </div>
        </div>
        {/* Container for single-axis rotation buttons displayed like a 3D cube */}
        <div className='relative flex flex-row min-w-10 w-full min-h-10 h-full m-2 justify-center items-center'>
          {Object.entries(rotateActionButtonProps).map(([key, { text, rotation, style }]) =>
            <RotateActionButton
              key={`rotation_button_${key}`}
              text={text}
              callback={() => { handleRotation(rotation) }}
              styling={style}
            />
          )}
        </div>
      </div>
    </div>
  );

  //  {/* Back  */}
  // {/* <div className='absolute w-10 h-10 backdrop-blur-md cursor-pointer transform-3d perspective-origin-top-left -translate-x-3.5 -translate-y-1 -rotate-x-30 rotate-y-45 rotate-z-0 text-center backface-hidden bg-neutral-500/50' /> */}
  // {/* Right  */}
  // {/* <div className='absolute w-10 h-10 backdrop-blur-md cursor-pointer transform-3d perspective-origin-top-left translate-x-3.5 -translate-y-1 -rotate-x-30 -rotate-y-45 rotate-z-0 text-center backface-hidden bg-neutral-500/50' /> */}
  // {/* Bottom  */}
  // {/* <div className='absolute appearance-none w-10 h-10 backdrop-blur-md cursor-pointer transform-3d perspective-origin-top-left translate-x-0 translate-y-5 rotate-x-60 rotate-y-0 rotate-z-45 text-center backface-hidden bg-neutral-500/50' /> */}

  const ProductSpecsTable = () => {
    return (
      <div className='max-w-fit select-none text-neutral-900 text-sm text-left font-medium whitespace-nowrap'>
        <table className='table-auto divide-inherit border-collapse border'>
          <tbody>
            <tr className='border-b'>
              <th scope='col' className='px-6 py-3 border-r'> Dimensions </th>
              <td scope='col' className='px-6'> {dimensions} </td>
            </tr>
            <tr className='border-b'>
              <th scope='col' className='px-6 py-3 border-r'> Weight </th>
              <td scope='col' className='px-6'> {weight} </td>
            </tr>
            <tr className='border-b'>
              <th scope='col' className='px-6 py-3 border-r'> Materials </th>
              <td scope='col' className='px-6'> {materialSpecs} </td>
            </tr>
            <tr className='border-b'>
              <th scope='col' className='px-6 py-3 border-r'> Care Instructions </th>
              <td scope='col' className='px-6 whitespace-normal text-wrap'> {care} </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  };

  const BackNavButton = () => {
    return (
      <button
        aria-label='Navigate back'
        className='appearance-none flex p-4 w-fit h-fit rounded-full bg-neutral-500/10 backdrop-blur-md backdrop-invert-10 cursor-pointer transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700'
        onClick={NavigateToRoot}
        type='button'
      >
        <HomeIcon fontSize='medium' />
      </button>
    )
  };

  const ToggleSpecsButton = () => {
    return (
      <button
        aria-label={expanded ? 'Collapse details' : 'Expand details'}
        className='flex w-fit h-fit p-4 rounded-full items-center bg-neutral-500/10 backdrop-blur-md backdrop-invert-10 cursor-pointer transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700'
        onClick={() => { setExpanded((x) => !x) }}
        type='button'
      >
        {expanded ? <CloseFullscreenIcon fontSize='medium' /> : <NotesIcon fontSize='medium' />}
      </button>
    )
  };

  const ToggleSpecsPanel = (
    <div className='flex flex-col w-full h-fit p-4 space-y-3 justify-center items-center rounded-4xl backdrop-blur-md backdrop-brightness-175'>
      <div>Technical Specs</div>
      <ToggleSpecsButton />
    </div>
  )

  const productDetailsOverlay = (
    <div className={`flex flex-col w-fit grow place-self-center justify-center items-center select-none transition-all duration-100 ease-linear ${expanded ? 'h-full' : 'h-0'}`}>
      <div className={`p-6 space-y-6 transition-all duration-300 delay-200 duration-initial ease-in-linear ${expanded ? 'opacity-100' : 'opacity-0'}`}>
        <div>{description}</div>
        <ProductSpecsTable />
      </div>
      {/* background with gradient and blur */}
      <div className={`fixed -z-100 inset-x-0 inset-y-0 invert-30 bg-linear-to-tr from-slate-700 via-slate-800 to-pink-950 rounded-full blur-3xl transition-all duration-500 ease-in-out ${expanded ? 'opacity-80' : 'opacity-0'}`} />
    </div>
  );

  return (
    <div data-route={pathname} className='fixed flex flex-col w-full h-full inset-0 text-neutral-900 subpixel-antialiased'>
      <div className='mt-12 text-center text-7xl select-none'> {displayName} </div>
      <div className='flex flex-col h-full '> {productDetailsOverlay} </div>

      <div className='fixed w-full h-fit bottom-0 inset-x-0 p-7'>
        <div className='flex flex-col w-fit md:w-full lg:w-full xl:w-full 2xl:w-full items-center justify-center space-y-2'>
          <div className='flex flex-row w-full items-center-safe space-x-4 ml-6 '>
            <BackNavButton />
            <ToggleSpecsButton/>
          </div>
          {/* {ToggleSpecsPanel} */}
          <div className='flex flex-row w-full lg:place-self-start xl:place-self-start 2xl:place-self-start max-w-fit space-x-4 items-center-safe justify-between lg:justify-start 2xl:justify-start xl:justify-start '>
          {MaterialControlsPanel}
          {RotationControlsPanel}
          </div>
        </div>
      </div>
      <div className={`fixed -z-100 w-full h-screen bg-linear-to-t from-neutral-500 from-60% to-transparent blur-3xl transition-all duration-500 ease-in-out ${expanded ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};

export default ProjectDataModal;