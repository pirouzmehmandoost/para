'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';

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
const CommandPalette = () => {
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
    <div className='fixed mt-5 ml-24 text-neutral-800'>
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

export default CommandPalette;