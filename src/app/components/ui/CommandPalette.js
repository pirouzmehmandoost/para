'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CloseIcon from '@mui/icons-material/Close';

const pathToCommandMap = {
  '/': [
    'To Move the 3D Carousel  → Swipe Left / Right',
    'To Pause / Focus on a 3D Model  → Tap 3D Model',
    `To Unpause / Unfocus → Esc / Tap outside Model.`,
    `To View Model Specs  → Tap Focused Model + “View Details”`,
    `To Hide Model Specs  → Esc / Back Arrow on Bottom Left`,
  ],
  '/projects/': [
    `To Hide Model Specs  → Click Esc / Back Arrow on Bottom Left`
  ],
};

//TO DO: if true, commands should be pathToCommandMap[`/projects/`] 
const CommandsTable = () => {
  const pathname = usePathname();
  const segment = useSelectedLayoutSegment('modal');
  const flagRef = useRef(false)

  useEffect(() => {
    flagRef.current = false;
    if (segment?.length && pathname?.startsWith('/projects/')) flagRef.current = true;
  }, [pathname, segment]);


  const commands = useMemo(()=>{
    for (const i in pathToCommandMap) {
      if (pathname?.length && pathname.startsWith(i)) return [...pathToCommandMap[i]]
    }
    return [];
  }, [pathname, segment]);

  return (
    <div className='text-neutral-800'>
      <div className='text-center text-md'> Scene Controls </div>
      <table className='table-auto text-xs text-left border-t border-b border-collapse border-inherit'>
        <tbody>
          {commands.map((command, index) =>  {
            const [f, l] = command.split(`→`);
            return (
              <tr key={index}>
                <th className='whitespace-nowrap border-r px-2'> {f} </th>
                <td className='whitespace-nowrap pl-4'> {l} </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
};


const CommandPalette = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  // useEffect(()=> {

  //   if (assRef?.current && !!parentRef) {
  //     if (parentRef?.current?.id?.length && assRef.current.id !== parentRef.current.id && menuVisible === true) {
  //       console.log(parentRef?.current.id)

  //       setMenuVisible(false);
  //     }
  //   }
  // },[menuVisible]);

  return (
    <div className='absolute top-7 left-25'>
      <button
        aria-label='Toggle menu'
        className='flex z-100 w-fit h-fit p-2 rounded-full cursor-pointer bg-neutral-500 backdrop-blur-md md:backdrop-blur-xl text-neutral-700 hover:text-neutral-600 transition-all duration-1000 ease-in-out'
        onClick={() => setMenuVisible(x => !x)}
        type='button'
      >
        {menuVisible ? <CloseIcon fontSize='small' /> : <TipsAndUpdatesIcon fontSize='small' />}
      </button>
      { menuVisible && <CommandsTable /> }
    </div>
  )
};
export default CommandPalette;