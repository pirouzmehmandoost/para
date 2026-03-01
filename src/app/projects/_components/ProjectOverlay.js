'use client';

import { useLayoutEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
// import MenuIcon from '@mui/icons-material/Menu';
import { portfolio } from '@configs/globals';
import { getProjectFromSlug } from '@utils/slug';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';

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

  const NavigateToRoot = () => {
    clearFocus();
    router.replace('/');
  };

  const handleSelectMaterial = (id) => {
    if (!id || selectedMaterialID === id) return;
    setMaterialID(id);
  };

  /* 
    items-center -> align-items: center. For controlling flex and grid item positions along container's cross-axis. flex and grid items
    place-content-center -> place-content: center. For controlling how content is justified and aligned at the same time. flex and grid content
    p-1 accounts for outline around buttons
  */
  const MaterialSelectionModal = (
    <div className='flex flex-col w-fit p-1 place-self-center items-center'>
      <div className='text-xl text-nowrap mb-2'>
        {materials[selectedMaterialID]?.displayName?.length && materials[selectedMaterialID].displayName}
      </div>
      <div className='flex flex-row w-full justify-center gap-x-6'>
        {materialIDs
          .filter((entry) => Boolean(materials?.[entry]))
          .map((entry) => {
            return (
              <button
                key={`color_select_button_${entry}`}
                className={`${materials[entry].tailwindColor} min-w-6 min-h-6 cursor-pointer rounded-full outline outline-offset-2 ${selectedMaterialID !== entry ? 'outline-none' : 'outline-neutral-900 outline-2'}`}
                onClick={() => { handleSelectMaterial(entry) }}
                type='button'
              />
            );
          })}
      </div>
    </div>
  );

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

  return (
    <div className='fixed flex flex-col w-full h-screen' data-route={pathname}>
      {/* <div className='fixed top-24 left-5'>
        <BackNavButton />
      </div> */}
      <div className='fixed w-full bottom-0 right-0 backdrop-blur-xs backdrop-invert-40'>
        <div className={`px-6 transition-all duration-700 ease-in-out ${expanded ? 'overflow-auto max-h-96' : 'overflow-hidden max-h-0'}`}>
          <div className={`mt-5 text-neutral-900 transition-all duration-700 ease-in-out delay-75 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            {description}
          </div>
        </div>
        <div className='flex flex-row max-w-full my-3 items-center text-neutral-900'>
          <div className='basis-1/3'>
            <div className='flex ml-3'>
              <BackNavButton />
              <button
                aria-label={expanded ? 'Collapse details' : 'Expand details'}
                className='ml-7 cursor-pointer'
                onClick={() => { setExpanded((x) => !x) }}
                type='button'
              >
                {expanded ? (<CloseFullscreenIcon fontSize='medium' />) : (<OpenInFullIcon fontSize='medium' />)}
              </button>
            </div>
          </div>
          <div className='text-center text-4xl basis-1/3'>
            {groupName}
          </div>
          <div className='basis-1/3'>
            {MaterialSelectionModal}
          </div>
        </div>
      </div>
    </div>
  );
};


// 'use client';

// import { useLayoutEffect, useMemo, useState } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
// import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
// import MenuIcon from '@mui/icons-material/Menu';
// import { portfolio } from '@configs/globals';
// import useMaterial from '@stores/materialStore';
// import useSelection from '@stores/selectionStore';
// import { getProjectFromSlug } from '@utils/slug';

// const { projects } = portfolio;

// const clearFocus = () => useSelection.getState().setIsFocused(null);

// export default function ProjectOverlay({ slug, entryPoint }) {
//   const router = useRouter();
//   const pathname = usePathname();

//   const materials = useMaterial((state) => state.materials);
//   const selection = useSelection((state) => state.selection);
//   const setSelectionStore = useSelection((state) => state.setSelection);
//   const setMaterialID = useSelection((state) => state.setMaterialID);

//   const [expanded, setExpanded] = useState(false);

//   const project = useMemo(() => {
//     if (!slug?.length) return null;
//     return getProjectFromSlug(slug, projects);
//   }, [slug]);

//   const projectData = project || selection;

//   const {
//     description = '',
//     sceneData: {
//       groupName = '',
//       materials: {
//         defaultMaterialID = '',
//         materialIDs = [],
//       } = {},
//     } = {},
//   } = projectData || {};

//   const selectedMaterialID =
//     selection?.materialID?.length ? selection.materialID : defaultMaterialID;

//   useLayoutEffect(() => {
//     if (!project) return;
//     if (!selection?.name || selection.name !== project.name) {
//       const update = {
//         ...project,
//         isFocused: project.sceneData.fileData.nodeName,
//         materialID: project.sceneData.materials.defaultMaterialID,
//       };
//       setSelectionStore(update);
//     }
//   }, [project, setSelectionStore, selection?.name]);

//   const NavigateToRoot = () => {
//     clearFocus();
//     router.replace('/');
//   };

//   const handleSelectMaterial = (id) => {
//     if (!id || selectedMaterialID === id) return;
//     setMaterialID(id);
//   };

//   const ColorSelectButtons = (
//     <div className='flex flex-row place-content-center items-center'>
//       <p className='text-nowrap text-2xl'> Select Material </p>
//       {materialIDs
//         .filter((entry) => Boolean(materials?.[entry]))
//         .map((entry) => {
//           return (
//             <button
//               key={`color_select_button_${entry}`}
//               className={`flex ${materials[entry].tailwindColor} w-6 h-6 mx-3 cursor-pointer rounded-full outline outline-offset-2 ${selectedMaterialID !== entry ? 'outline-none' : 'outline-neutral-600 outline-2'}`}
//               onClick={() => { handleSelectMaterial(entry) }}
//               type='button'
//             />
//           );
//         })}
//     </div>
//   );

//   const BackNavButton = () => {
//     return (
//         <button
//           aria-label='Close details'
//           className='flex p-3 rounded-full bg-neutral-500/10 backdrop-blur-md cursor-pointer transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700'
//           onClick={NavigateToRoot}
//           type='button'
//         >
//           <ArrowBackIosNewIcon fontSize='medium' />
//         </button>
//     )
//   };

//   return (
//     <div className='fixed flex flex-col w-full h-screen' data-route={pathname}>
//       <div className='fixed top-24 left-5'>
//         <BackNavButton />
//       </div>
//       {/* Bottom Modal*/}
//       <div className={`fixed w-full bottom-0 z-20 right-0 transition-all duration-700 ease-in-out backdrop-blur-xs backdrop-invert-40 ${expanded ? 'mt-96' : 'mt-0'}`}>
//         {/* Hidden section*/}
//         <div className={`px-6 pt-0 justify-items-center transition-all duration-700 ease-in-out ${expanded ? 'overflow-auto max-h-96' : 'overflow-hidden max-h-0'}`}>
//           <p className={`mt-5 text-neutral-900 transition-all duration-700 ease-in-out delay-75 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
//             {description}
//           </p>
//         </div>
//         {/* permanently visible section*/}
//         <div className='flex flex-row max-w-full my-3 items-center text-neutral-900'>
//           <div className='justify-self-center self-center items-center basis-1/3'>
//             <button
//               aria-label={expanded ? 'Collapse details' : 'Expand details'}
//               className='ml-7 cursor-pointer'
//               onClick={() => { setExpanded((x) => !x) }}
//               type='button'
//             >
//               {expanded ? (<CloseFullscreenIcon fontSize='large' />) : (<MenuIcon fontSize='large' />)}
//             </button>
//           </div>
//           <div className='justify-self-center text-3xl text-center basis-1/3'>
//             {groupName}
//           </div>
//           <div className='sm:mx-2 md:mx-2 justify-self-center self-center basis-1/3'>
//             {ColorSelectButtons}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

