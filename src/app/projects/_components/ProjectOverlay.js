'use client';

import { useLayoutEffect, useMemo, useState } from 'react';
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

const { projects } = portfolio;

const clearFocus = () => useSelection.getState().setIsFocused(null);

const ProjectOverlay = ({ slug, entryPoint }) => {
  const router = useRouter();
  const pathname = usePathname();
  const materials = useMaterial((state) => state.materials);
  const selection = useSelection((state) => state.selection);
  const setSelectionStore = useSelection((state) => state.setSelection);
  const setMaterialID = useSelection((state) => state.setMaterialID);

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

  const MaterialSelectionModal = (
    <div className='flex flex-col w-full p-1 gap-y-2 place-self-center items-center text-center text-nowrap sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl'>
      {
        materials[selectedMaterialID]?.displayName?.length && materials[selectedMaterialID].displayName
      }
      <div className='flex flex-row w-full place-content-center justify-center xs:gap-x-3 sm:gap-x-3 md:gap-x-3 lg:gap-x-5 xl:gap-x-6 2xl:gap-x-6 gap-x-6'>
        {materialIDs
          .filter((entry) => Boolean(materials?.[entry]))
          .map((entry) => {
            return (
              <button
                key={`color_select_button_${entry}`}
                className={`${materials[entry].tailwindColor} appearance-none w-6 h-6 cursor-pointer rounded-full outline outline-offset-2 ${selectedMaterialID !== entry ? 'outline-none' : 'outline-neutral-900 outline-2'}`}
                onClick={() => { handleSelectMaterial(entry) }}
                type='button'
              />
            );
          })}
      </div>
    </div>
  );

  const ProductDetailsTable = () => {
    return (
      <div className='flex w-fit overscroll-x-none select-none text-neutral-900 text-sm text-left font-medium whitespace-nowrap 2xs:px-5 2xs:mx-5 xs:px-5 xs:mx-5 sm:px-5 sm:mx-5 md:px-5 md:mx-5 lg:px-5 lg:mx-5 xl:px-6 xl:mx-6 2xl:px-6 2xl:mx-6 '>
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
              <td scope='col' className='px-6 whitespace-normal'> {care} </td>
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
        className='flex p-3 rounded-full bg-neutral-500/10 backdrop-blur-md cursor-pointer transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700'
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
        className='flex z-1 p-3 rounded-full bg-neutral-500/10 backdrop-blur-md cursor-pointer transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700'
        onClick={() => { setExpanded((x) => !x) }}
        type='button'
      >
        {expanded ? (<CloseFullscreenIcon fontSize='medium' />) : (<OpenInFullIcon fontSize='medium' />)}
      </button>
    )
  };

  return (
    /* parent container fills the screen */
    <div data-route={pathname} className='fixed w-full h-screen text-neutral-900 subpixel-antialiased overscroll-x-none'>
      {/* modal container fixes position at bottom */}
      <div className={`fixed w-full bottom-0 right-0 p-3 backdrop-blur-xl transition-all duration-700 ease-in-out ${expanded ? 'backdrop-opacity-0 backdrop-invert-0 ' : 'backdrop-opacity-90  backdrop-invert-20'}`}>

        {/* top section container with expanding/hiding items */}
        <div className={`flex flex-col m-3 select-none transition-all duration-700 ease-in-out  ${expanded ? 'max-h-90 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`flex flex-col 2xs:p-5 2xs:m-5 xs:p-5 xs:m-5 sm:p-5 sm:m-5 md:p-5 md:m-5 lg:p-5 lg:m-5 xl:p-6 xl:m-6 2xl:p-6 2xl:m-6 scroll-smooth overscroll-y-contain overscroll-x-none transition-all duration-700 ease-in-out delay-75 ${expanded ? 'overflow-y-auto' : 'overflow-hidden'}`}>
            {description}
          </div>
          <ProductDetailsTable />
        </div>


        {/* bottom section container with permanently visible items*/}
        <div className='flex flex-row max-w-full my-3 items-center'>
          <div className='basis-1/3'>
            <div className='flex flex-row ml-3 justify-start gap-x-5 spax'>
              <BackNavButton />
              <ExpandButton />
            </div>
          </div>
          <div className='basis-1/3 text-center text-4xl'>
            {displayName}
          </div>
          <div className='basis-1/3'>
            {MaterialSelectionModal}
          </div>
        </div>
      </div>
      <div className={`fixed -z-1 w-full h-screen bg-linear-to-t from-neutral-500 from-60% to-transparent blur-3xl transition-all duration-500 ease-in-out ${expanded ? 'opacity-100' : 'opacity-0'}`} />
      {/* <div className='absolute -top-20 -left-20 w-[400px] h-[400px] bg-linear-to-br from-purple-600 via-blue-500 to-teal-400 opacity-70 rounded-full blur-3xl'></div>
  <div className='absolute top-[30%] -left-20 w-[400px] h-[400px] bg-linear-to-br from-purple-600 via-blue-500 to-teal-400 opacity-70 rounded-full blur-3xl'></div>
  <div className='absolute bottom-0 right-0 w-[500px] h-[500px] bg-linear-to-tr from-indigo-500 via-fuchsia-500 to-pink-500 opacity-60 rounded-full blur-3xl'></div> */}
    </div>
  );
};

export default ProjectOverlay;