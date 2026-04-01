'use client';

import { useLayoutEffect, useMemo, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { portfolio } from '@configs/globals';
import { getProjectFromSlug } from '@utils/slug';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';

const { projects } = portfolio;

const clearFocus = () => useSelection.getState().setIsFocused(null);

const ProjectDataModal = ({ slug, entryPoint }) => {
  const router = useRouter();
  const pathname = usePathname();
  const materials = useMaterial((state) => state.materials);
  const selection = useSelection((state) => state.selection);
  const setSelectionStore = useSelection((state) => state.setSelection);
  const setMaterialID = useSelection((state) => state.setMaterialID);
  const setAnimateRotation = useSelection((state) => state.setAnimateRotation);

  const rotationState = useSelection.getState().selection.sceneData.animateRotation
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
      animateRotation,
      materials: {
        defaultMaterialID = '',
        materialIDs = [],
      } = {},
    } = {},
  } = projectData || {};

  const selectedMaterialID = selection?.materialID?.length ? selection.materialID : defaultMaterialID;

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
    clearFocus();
    router.replace('/');
  };

  const handleSelectMaterial = (id) => {
    if (!id || selectedMaterialID === id) return;
    setMaterialID(id);
  };

  const toggleRotationAnimation = () => {
    setAnimateRotation();
  };

  const MaterialSelectionPanel = (
    <div className='flex flex-col w-full h-fit p-5 gap-y-1 rounded-4xl backdrop-blur-md backdrop-brightness-175 items-center text-center text-nowrap text-md'>
      <div className='flex flex-row w-full place-content-center justify-center xs:gap-x-3 sm:gap-x-3 md:gap-x-3 lg:gap-x-5 xl:gap-x-6 2xl:gap-x-6 gap-x-6'>
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
      {materials[selectedMaterialID]?.displayName?.length && materials[selectedMaterialID].displayName}
    </div>
  );

  const RotationControlsPanel = (
    <div className='flex flex-col w-full h-fit p-3 gap-y-1 rounded-4xl backdrop-blur-md backdrop-brightness-175 items-center text-center text-nowrap text-md'>
      <div className='flex flex-row w-full place-content-center justify-center'>
        <button
          className={`group appearance-none flex w-fit h-fit rounded-full backdrop-blur-md cursor-pointer transition-all duration-500 ease-in-out hover:bg-neutral-500/50 ${rotationState ? 'bg-neutral-400/50 animate-pulse' : 'bg-neutral-500/10'}`}
          onClick={toggleRotationAnimation}
          type='button'
        >
          <div className='relative flex items-center justify-center p-2 transition-all duration-500 ease-in-out text-neutral-900 group-hover:text-neutral-700'>
            
            <div className='relative flex items-center justify-center w-6 h-6'>
              <ThreeSixtyIcon 
                className={rotationState ? 'animate-pulse' : ''} 
                fontSize='medium' 
              />
              {!rotationState && (
                <svg 
                  className='absolute inset-0 w-full h-full pointer-events-none' 
                  viewBox='0 0 1 1' 
                  preserveAspectRatio='none'
                >
                  <line 
                    x1='0' y1='1' x2='1' y2='0' 
                    vectorEffect='non-scaling-stroke' 
                    className='stroke-2 stroke-current transition-all duration-500 ease-in-out' 
                  />
                </svg>
              )}
            </div>
  
          </div>
        </button>
      </div>
      Rotation
    </div>
  );

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
        aria-label='Close details'
        className='appearance-none flex p-4 w-fit h-fit rounded-full bg-neutral-500/10 backdrop-blur-md backdrop-invert-10 cursor-pointer transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700'
        onClick={NavigateToRoot}
        type='button'
      >
        <ArrowBackIosNewIcon fontSize='medium' />
      </button>
    )
  };

  const ExpandButton = () => {
    return (
      <button
        aria-label={expanded ? 'Collapse details' : 'Expand details'}
        className='flex p-4 w-fit h-fit rounded-full bg-neutral-500/10 backdrop-blur-md backdrop-invert-10 cursor-pointer transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700'
        onClick={() => { setExpanded((x) => !x) }}
        type='button'
      >
        {expanded ? (<CloseFullscreenIcon fontSize='medium' />) : (<OpenInFullIcon fontSize='medium' />)}
      </button>
    )
  };

  return (
    /* parent container fills the screen */
    <div data-route={pathname} className='fixed inset-0 p-8 xl:p-12 2xl:p-12 flex flex-col w-full text-neutral-900 subpixel-antialiased overscroll-x-none overscroll-y-none overflow-y-auto'>
      <div className='fixed top-7 inset-x-0 text-center text-6xl xl:text-6xl 2xl:text-6xl'>
        {displayName}
      </div>
      <>
        <div className={`flex grow flex-col place-self-center justify-center items-center transition-all duration-100 ease-linear ${expanded ? 'h-full' : 'h-0'}`}>

          <div className={`select-none transition-all duration-300 delay-200 duration-initial ease-in-linear ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            {description}
          </div>

          <div className={`select-none transition-all duration-300 delay-200 duration-initial ease-in-linear ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            <ProductSpecsTable />
          </div>
          <div className={`fixed -z-100 inset-x-0 inset-y-0 invert-30 bg-linear-to-tr from-slate-700 via-slate-800 to-pink-950 rounded-full blur-3xl transition-all duration-500 ease-in-out ${expanded ? 'opacity-80' : 'opacity-0'}`} />
        </div>
        {/* <div className={`flex grow flex-col place-self-center items-center transition-all duration-500 ease-in-out  ${expanded ? 'w-full h-full opacity-100' : 'w-0 h-0 opacity-0'}`}>
      </div> */}
      </>

      <div className='fixed bottom-0 inset-x-0 flex flex-row h-fit p-5 xl:p-8 2xl:p-8 justify-center gap-x-6 items-center'>
        <div className='basis-1/4 z-10'> <BackNavButton /> </div>
        <div className='basis-1/4 z-10'> <ExpandButton /> </div>
        <div className='basis-1/4 z-10'> {RotationControlsPanel} </div>

        <div className='basis-1/4 z-10'> {MaterialSelectionPanel} </div>
        {/* </div> */}
      </div>
      {/* <div className={`fixed -z-100 w-full h-screen bg-linear-to-t from-neutral-500 from-60% to-transparent blur-3xl transition-all duration-500 ease-in-out ${expanded ? 'opacity-100' : 'opacity-0'}`} /> */}
    </div>
  );
};

export default ProjectDataModal;