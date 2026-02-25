'use client';

import { useLayoutEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MenuIcon from '@mui/icons-material/Menu';
import { portfolio } from '@configs/globals';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import { getProjectFromSlug } from '@utils/slug';

const { projects } = portfolio;

const clearFocus = () => useSelection.getState().setIsFocused(null);

export default function ProjectOverlay({ slug, entryPoint }) {
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
    description = '',
    sceneData: {
      groupName = '',
      materials: {
        defaultMaterialID = '',
        materialIDs = [],
      } = {},
    } = {},
  } = projectData || {};

  const selectedMaterialID =
    selection?.materialID?.length ? selection.materialID : defaultMaterialID;

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

  const close = () => {
    clearFocus();
    router.replace('/');
  };

  const handleSelectMaterial = (id) => {
    if (!id || selectedMaterialID === id) return;
    setMaterialID(id);
  };

  const ColorSelectButtons = (
    <div className='flex flex-row place-content-center items-center'>
      <p className='text-nowrap text-2xl'> Select Material </p>
      {materialIDs
        .filter((entry) => Boolean(materials?.[entry]))
        .map((entry) => {
          return (
            <button
              key={`color_select_button_${entry}`}
              className={`flex ${materials[entry].tailwindColor} w-6 h-6 mx-3 cursor-pointer rounded-full outline outline-offset-2 ${selectedMaterialID !== entry ? 'outline-none' : 'outline-neutral-600 outline-2'}`}
              onClick={() => { handleSelectMaterial(entry) }}
              type='button'
            />
          );
        })}
    </div>
  );

  return (
    <div className='fixed flex flex-col w-full h-screen' data-route={pathname}>
      <div className='fixed top-24 left-5 p-3 rounded-full bg-neutral-500/10 backdrop-blur-md transition-all duration-500 ease-in-out text-5xl text-neutral-900 hover:text-neutral-700'>
        <button
          aria-label='Close details'
          className='flex flex-row w-full place-items-center cursor-pointer'
          onClick={close}
          type='button'
        >
          <ArrowBackIosNewIcon fontSize='medium' />
        </button>
      </div>
      <div className={`fixed w-full bottom-0 z-20 right-0 place-self-end transition-all duration-700 ease-in-out ${expanded ? 'mt-96' : 'mt-0'}`}
      >
        <div className='flex z-20 w-full h-full bottom-0 right-0'>
          <div className={`flex flex-col w-full h-full backdrop-blur-3xl backdrop-invert-40 transition-all duration-700 ease-in-out ${expanded ? 'backdrop-opacity-90 backdrop-blur-xl' : 'backdrop-opacity-50'}`}>
            <div className={`px-6 pt-0 justify-items-center transition-all duration-700 ease-in-out ${expanded ? 'overflow-auto max-h-96' : 'overflow-hidden max-h-0'}`}>
              <p className={`mt-5 text-neutral-900 transition-all duration-700 ease-in-out delay-75 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                {description}
              </p>
            </div>
            <div className='flex flex-row max-w-full my-3 items-center text-neutral-900'>
              <button
                className='ml-5 justify-self-center items-center cursor-pointer basis-1/3'
                onClick={() => { setExpanded((x) => !x) }}
                type='button'
                aria-label={expanded ? 'Collapse details' : 'Expand details'}
              >
                {expanded ? (<CloseFullscreenIcon fontSize='large' />) : (<MenuIcon fontSize='large' />)}
              </button>

              <div className='justify-self-center basis-1/3'>
                <p className='text-3xl text-center justify-self-center'>
                  {groupName}
                </p>
              </div>

              <div className='sm:mx-2 md:mx-2 justify-self-center self-center basis-1/3'>
                {ColorSelectButtons}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

