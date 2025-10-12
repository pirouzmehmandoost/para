'use client'

import { useState } from 'react';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import useMaterial from '@stores/materialStore';
import useSelection from '@stores/selectionStore';
import SingularModelViewer from '@three/scenes/SingularModelViewer';

const ProjectPage = () => {

  const getMaterial = useMaterial((state) => state.getMaterial);
  const [expanded, setExpanded] = useState(false);
  const selection = useSelection((state) => state.getSelection());

  const {
    sceneData: {
      groupName = '',
      materialId = '',
      scale = 1,
      materials: { defaultMaterial = '', colorWays = {} } = {},
    } = {},
    description = '',
  } = selection;

  const [selectedMaterial, setMaterial] = useState(
    materialId.length ? materialId : (defaultMaterial ?? null),
  );

  const data = {
    ...selection.sceneData,
    modelUrl: selection.sceneData?.ModelUrl
      ? selection.sceneData?.ModelUrl
      : selection?.sceneData?.modelUrls[0],
    autoRotate: true,
    autoRotateSpeed: 0.4,
    autoUpdateMaterial: false,
    enablePan: true,
    enableRotate: true,
    enableZoom: false,
    materialId: selectedMaterial,
    orthographic: false,
    position: undefined,
    scale: scale * 0.38,
  };

  const colorSelectButtons = (
    <div className="flex flex-row place-content-center items-center">
      <p className="text-nowrap text-2xl"> Select a Color </p>
      {Object.entries(colorWays).map((entry) => {
        return (
          <div
            key={entry[0]}
            className={`flex ${getMaterial(entry[1]).tailwindColor} w-6 h-6 mx-3 cursor-pointer rounded-full outline outline-offset-2 ${selectedMaterial !== entry[1] ? 'outline-none' : 'outline-neutral-500 outline-2'}`}
            onClick={() => {
              if (selectedMaterial !== entry[1]) setMaterial(entry[1]);
            }}
          />
        );
      })}
    </div>
  );

  const menuProps = {
    linkProps: {
      topLinks: [
        {
          href: '/projects',
          title: 'Projects',
        },
        {
          href: '/resume',
          title: 'Resume/CV',
        },
        {
          href: '/about',
          title: 'About',
        },
      ],

      bottomLinks: [
        {
          href: 'https://www.linkedin.com/in/pirouzmehmandoost/',
          title: 'LinkedIn',
        },
        {
          href: 'https://github.com/pirouzmehmandoost/para/blob/main/README.md',
          title: 'Github',
        },
      ],
    },
  };

  return (
    <div id="project_viewer" className="flex flex-col w-full h-screen">
      <div
        id="model_viewer_container"
        className="flex flex-col w-full h-full place-self-center place-content-center"
      >
        <SingularModelViewer
          className="w-full h-full self-center place-self-center place-content-center items-center"
          data={data}
        />
        {/* <div className="absolute p-8 ">
            <DynamicMenu {...menuProps}/>
        </div> */}
        <div
          id="back-button"
          className="fixed top-10 left-10 mt-10 p-8 rounded-full bg-white/1 text-5xl backdrop-blur-3xl transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700"
        >
          <Link href="/" rel="noopener noreferrer">
            <div className="flex flex-row w-full place-items-center cursor-pointer">
              <ArrowBackIosNewIcon fontSize="large" />
            </div>
          </Link>
        </div>
      </div>
      <div
        id="project_menu"
        className={`fixed bottom-0 z-20 right-0 w-full place-self-end transition-all duration-700 ease-in-out ${expanded ? 'mt-96' : 'mt-0'}`}
      >
        <div className="flex z-20 w-full h-full bottom-0 right-0">
          <div className="w-full h-full">
            <div
              className={`flex flex-col backdrop-blur-3xl backdrop-brightness-200 transition-all duration-700 ease-in-out ${expanded ? 'backdrop-opacity-90 backdrop-blur-xl' : 'backdrop-opacity-50'}`}
            >
              {/* collapsible menu items */}
              <div
                className={`px-6 pt-0 justify-items-center transition-all transition-discrete duration-700 ease-in-out ${expanded ? 'overflow-auto max-h-96' : 'overflow-hidden max-h-0'}`}
              >
                <p
                  className={`mt-5 text-neutral-900 transition-all duration-700 ease-in-out delay-75 ${expanded ? 'opacity-100' : 'opacity-0'}`}
                >
                  {description}
                </p>
              </div>
              {/* permanently visible menu items */}
              <div className="flex flex-row my-3 max-w-full align-items-center justify-items-stretch text-neutral-900">
                <div className="ml-5 justify-self-center align-items-center basis-1/3">
                  <div
                    className="cursor-pointer self-center"
                    onClick={() => {
                      setExpanded((current) => !current);
                    }}
                  >
                    {expanded ? (
                      <CloseFullscreenIcon fontSize="large" />
                    ) : (
                      <MenuIcon fontSize="large" />
                    )}
                  </div>
                </div>
                <div className="justify-self-center basis-1/3">
                  <p className="text-3xl text-center justify-self-center">
                    {groupName}
                  </p>
                </div>
                <div className="sm:mx-2 md:mx-2 justify-self-center self-center basis-1/3">
                  {colorSelectButtons}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;

// const perspective = {
//   initial: {
//     filter: 'blur(100px)',
//     opacity: 0,
//     rotateX: 90,
//     translateY: 80,
//     translateX: -20,
//   },
//   enter: (i) => ({
//     filter: 'blur(0px)',
//     opacity: 1,
//     rotateX: 0,
//     translateY: 0,
//     translateX: 0,
//     transition: {
//       duration: 0.65,
//       delay: 0.5 + i * 0.1,
//       ease: [0.215, 0.61, 0.355, 1],
//       opacity: { duration: 0.35 },
//     },
//   }),
//   exit: {
//     filter: 'blur(100px)',
//     opacity: 0,
//     transition: { duration: 0.5, type: 'linear', ease: [0.76, 0, 0.24, 1] },
//   },
// };

// export const slideIn = {
//   initial: {
//     filter: 'blur(100px)',
//     opacity: 0,
//     y: 20,
//   },
//   enter: (i) => ({
//     filter: 'blur(0px)',
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       delay: 0.75 + i * 0.1,
//       ease: [0.215, 0.61, 0.355, 1],
//     },
//   }),
//   exit: {
//     filter: 'blur(100px)',
//     opacity: 0,
//     transition: { duration: 0.5, type: 'tween', ease: 'easeInOut' },
//   },
// };

// const menu = {
//   open: {
//     width: '480px',
//     height: '650px',
//     top: '0px',
//     right: '0px',
//     translateX: '0px',
//     translateY: '0px',
//     transition: { duration: 0.75, type: 'tween', ease: [0.76, 0, 0.24, 1] },
//   },
//   closed: {
//     width: '0px',
//     height: '0px',
//     top: '0px',
//     right: '0px',
//     translateX: '40px',
//     translateY: '40px',
//     transition: {
//       duration: 0.75,
//       delay: 0.35,
//       type: 'tween',
//       ease: [0.76, 0, 0.24, 1],
//     },
//   },
// };

// const Links = ({ topLinks, bottomLinks }) => {
//   return (
//     <div className="flex flex-col w-full h-full justify-between p-10 text-4xl ">
//       <div className="flex flex-col items-center">
//         {topLinks.map((link, i) => {
//           const { title, href } = link;
//           return (
//             <div key={`b_${i}`}>
//               <motion.div
//                 custom={i}
//                 variants={perspective}
//                 initial="initial"
//                 animate="enter"
//                 exit="exit"
//               >
//                 <Link
//                   className="border-transparent cursor-pointer"
//                   rel="noopener noreferrer"
//                   href={href}
//                 >
//                   {title}
//                 </Link>
//               </motion.div>
//             </div>
//           );
//         })}
//       </div>
//       <motion.div className="flex flex-row w-full justify-between">
//         {bottomLinks.map((link, i) => {
//           const { title, href } = link;
//           return (
//             <motion.div
//               variants={slideIn}
//               custom={i}
//               initial="initial"
//               animate="enter"
//               exit="exit"
//               key={`f_${i}`}
//             >
//               <Link
//                 className="border-transparent cursor-pointer"
//                 rel="noopener noreferrer"
//                 target="blank"
//                 href={href}
//               >
//                 {title}
//               </Link>
//             </motion.div>
//           );
//         })}
//       </motion.div>
//       <div className=" absolute flex w-full h-full bg-neutral-200/50 rounded-3xl -z-1 inset-0 scale-100 blur-2xl"></div>
//     </div>
//   );
// };

// const ButtonContainer = ({ isActive, toggleMenu }) => {
//   return (
//     <div>
//       <div className="flex grow w-full h-full">
//         <div onClick={() => toggleMenu()}>
//           <div
//             className={`absolute cursor-pointer p-4 rounded-full bg-neutral-500/10 backdrop-blur-xl transition-all duration-1000 ease-in-out text-neutral-700 hover:text-neutral-700 ${isActive ? 'opacity-100' : 'opacity-0 bg-neutral-500/30'}`}
//           >
//             <CloseFullscreenIcon fontSize="large" />
//           </div>

//           <div
//             className={`absolute cursor-pointer p-4 rounded-full bg-neutral-500/10 backdrop-blur-xl transition-all duration-1000 ease-in-out text-neutral-700 hover:text-neutral-700  ${isActive ? 'opacity-0  bg-neutral-500/30' : 'opacity-100'}`}
//           >
//             <MenuIcon fontSize="large" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const DynamicMenu = ({ linkProps }) => {
//   const [isActive, setIsActive] = useState(false);

//   return (
//     <div className="relative flex flex-col grow w-fit min-w-18 h-fit min-h-18">
//       <div>
//         <motion.div
//           className={`absolute flex flex-col inset-0 bottom-0 w-fit h-fit bg-neutral-200/0 backdrop-blur-xs rounded-3xl`}
//           variants={menu}
//           animate={isActive ? 'open' : 'closed'}
//           initial="closed"
//         >
//           <AnimatePresence>
//             {isActive && <Links {...linkProps} />}
//           </AnimatePresence>
//         </motion.div>
//       </div>
//       <div className="absolute bottom-0 flex flex-row ">
//         <ButtonContainer
//           isActive={isActive}
//           toggleMenu={() => {
//             setIsActive(!isActive);
//           }}
//         />
//       </div>
//     </div>
//   );
// };
