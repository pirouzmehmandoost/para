'use client'

import React, { use, useLayoutEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MenuIcon from '@mui/icons-material/Menu';
import { portfolio } from '@configs/globals';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import { getProjectFromSlug } from '@utils/slug';

const { projects } = portfolio;

const ProjectPage = ({ params }) => {
  const { slug } = use(params);
  const materials = useMaterial((state) => state.materials);
  const selection = useSelection((state) => state.getSelection);
  const setSelectionStore = useSelection((state) => state.setSelection);
  const setMaterialID = useSelection((state) => state.setMaterialID)
  const [expanded, setExpanded] = useState(false);

  const project = useMemo(() => {
    if (!slug?.length) return null;
    return getProjectFromSlug(slug, projects);
  }, [slug]);

  const projectData = project || selection;

  const {
    description = '',
    materialID = '',
    sceneData: {
      groupName = '',
      materials: {
        defaultMaterialID = '',
        materialIDs = [],
      } = {},
    } = {},
  } = projectData;

  const [selectedMaterial, setSelectedMaterial] = useState(materialID?.length ? materialID : defaultMaterialID);

  useLayoutEffect(() => {
    if (project && (!selection?.name || selection.name !== project.name)) {
      const p = {
        ...project,
        isFocused: project.sceneData.fileData.nodeName,
        materialID: project.sceneData.materials.defaultMaterialID,
      };
      setSelectionStore(p);
    }
  }, [project, setSelectionStore, selection?.name]);

  const handleSelectMaterial = (id) => {
    if (selectedMaterial !== id) {
      setSelectedMaterial((x) => x = id)
      setMaterialID(id);
    }
  }

  const ColorSelectButtons = (
    <div className='flex flex-row place-content-center items-center'>
      <p className='text-nowrap text-2xl'> Select Material </p>
      {materialIDs.map((entry) => {
        return (
          <button
            key={`color_select_button_${entry}`}
            className={`flex ${materials[entry].tailwindColor} w-6 h-6 mx-3 cursor-pointer rounded-full outline outline-offset-2 ${selectedMaterial !== entry ? 'outline-none' : 'outline-neutral-600 outline-2'}`}
            onClick={() => { handleSelectMaterial(entry) }}
          />
        )
      })}
    </div>
  );

  return (
    <div
      id='project-page-container'
      className='flex flex-col w-full h-screen'
    >
      <div
        id='project-page-canvas-container'
        className='fixed flex flex-col w-full h-full place-self-center place-content-center'
      >
        <div
          id='project-page-back-button-container'
          className='fixed top-22 left-5 p-3 rounded-full bg-neutral-500/10 backdrop-blur-md text-5xl transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700'
        >
          <Link href='/' rel='noopener noreferrer'>
            <div className='flex flex-row w-full place-items-center cursor-pointer'>
              <ArrowBackIosNewIcon fontSize='medium' />
            </div>
          </Link>
        </div>
      </div>
      <div id='project-page-bottom-menu-container' className={`fixed w-full bottom-0 z-20 right-0 place-self-end transition-all duration-700 ease-in-out ${expanded ? 'mt-96' : 'mt-0'}`}>
        <div className='flex z-20 w-full h-full bottom-0 right-0'>
          <div className={`flex flex-col w-full h-full backdrop-blur-3xl backdrop-brightness-200 transition-all duration-700 ease-in-out ${expanded ? 'backdrop-opacity-90 backdrop-blur-xl' : 'backdrop-opacity-50'}`}>
            {/* collapsible menu items */}
            <div className={`px-6 pt-0 justify-items-center transition-all transition-discrete duration-700 ease-in-out ${expanded ? 'overflow-auto max-h-96' : 'overflow-hidden max-h-0'}`}>
              <p className={`mt-5 text-neutral-900 transition-all duration-700 ease-in-out delay-75 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                {description}
              </p>
            </div>
            {/* permanently visible menu items */}
            <div className='flex flex-row max-w-full my-3 align-items-center justify-items-stretch text-neutral-900'>
              <div
                className='ml-5 justify-self-center align-items-center cursor-pointer basis-1/3'
                onClick={() => { setExpanded(x => !x) }}
              >
                {expanded
                  ? (<CloseFullscreenIcon fontSize='large' />)
                  : (<MenuIcon fontSize='large' />)
                }
              </div>
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
};

export default ProjectPage;