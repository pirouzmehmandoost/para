'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CloseIcon from '@mui/icons-material/Close';

const routeToTextMap = {
  '/': [
    'Move the 3D Carousel → Swipe Left / Right',
    'Focus → Tap a 3D Model',
    `Unfocus → Esc / Tap outside focused Model`,
    `View 3D Model Specs → Focus Mode + “View Details”`,
    `Hide Specs → Esc / Back Arrow Button`,
  ],
  '/projects/': [
    `Back / Hide Specs  → Esc / Back Arrow Button`,
  ],
};

//TO DO: if true, commands should be routeToTextMap[`/projects/`] 
// const HelpTable = () => {
//   const pathname = usePathname();
//   const segment = useSelectedLayoutSegment('modal');
//   const flagRef = useRef(false)

//   useEffect(() => {
//     flagRef.current = false;
//     if (segment?.length || pathname?.startsWith('/projects/')) flagRef.current = true;
//   }, [pathname, segment]);

//   const helpText = useMemo(()=>{
//     for (const key in routeToTextMap) {
//       if (pathname?.length && pathname.startsWith(key)) return [...routeToTextMap[key]]
//     }
//     return [];
//   }, [pathname, segment]);

//   return (
//     <div className='w-full p-4 text-neutral-800 text-center text-md select-none'>
//       <div>{flagRef.current? `true` : `false`}</div>
//       <table className='table-auto text-xs text-left'>
//         <tbody>
//           {helpText.map((text, index) =>  {
//             const [thStr, tdStr] = text.split(`→`);
//             return (
//               <tr key={`help_table_row_` + index}>
//                 <th className='whitespace-nowrap border-r px-2'> {thStr} </th>
//                 <td className='whitespace-nowrap pl-4'> {tdStr} </td>
//               </tr>
//             )
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

const AppHelpOverlay = () => {
  // const pathname = usePathname();
  // const segment = useSelectedLayoutSegment('modal');
  const flagRef = useRef(false)
  const [visible, setVisible] = useState(false);


  // useEffect(() => {
  //   // console.log("segment: ", segment);
  //   console.log("pathname: ", pathname);


  //   if (
  //     //segment?.length || 
  //     pathname?.startsWith('/projects/')) {
  //     flagRef.current = true;
  //   }

  // }, [pathname]);

  // const helpText = useMemo(()=>{
  //   for (const key in routeToTextMap) {
  //     if (pathname?.length && pathname.startsWith(key)) return [...routeToTextMap[key]]
  //   }
  //   return [];
  // }, [pathname]);

  const HelpTable = () => {
    return (
      <div className='w-full p-4 text-neutral-800 text-center text-md select-none'>
        {/* <div>{flagRef.current === true? `true` : `false`}</div> */}
        <table className='table-auto text-xs text-left'>
         <tbody>

                <tr key={`help_table_row_`}>
                  <th className='whitespace-nowrap border-r px-2'> hi </th>
                  <td className='whitespace-nowrap pl-4'> hello </td>
                </tr>
          </tbody>

          {/* <tbody>
            {helpText.map((text, index) =>  {
              const [thStr, tdStr] = text.split(`→`);
              return (
                <tr key={`help_table_row_` + index}>
                  <th className='whitespace-nowrap border-r px-2'> {thStr} </th>
                  <td className='whitespace-nowrap pl-4'> {tdStr} </td>
                </tr>
              )
            })}
          </tbody> */}
        </table>
      </div>
    );
  }


  return (
    <div className='fixed top-7 left-25'>
      {/* <button
        aria-label='Toggle help menu'
        className='relative flex w-fit h-fit z-20 p-2 rounded-full cursor-pointer text-neutral-600 backdrop-contrast-125 bg-neutral-600/10 backdrop-blur-xl transition-all duration-500 ease-in-out hover:text-neutral-700 hover:bg-neutral-700/10'
        onClick={() => setVisible(x => !x)}
        type='button'
      >
        {visible ? <CloseIcon fontSize='small' /> : <TipsAndUpdatesIcon fontSize='small' /> }
      </button> */}

      {/* <div className={`transition-all duration-500 ease-in-out ${visible? 'w-full h-full opacity-100 mt-2' : 'w-0 h-0 opacity-0 mt-0'}`}> */}
        <div>
        <div className='absolute w-full h-full -z-10 bg-neutral-500 blur-2xl'/>
        <HelpTable />
      </div>
    </div>
  )
};
export default AppHelpOverlay;