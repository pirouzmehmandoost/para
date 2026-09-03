'use client'
import { memo, useEffect, useCallback } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import useMenu from '@stores/menuStore'

const setVisible = useMenu.getState().setVisible

interface MenuButtonProps {
  callback: (e: MouseEvent<HTMLButtonElement>, state: boolean) => void
  state: boolean
}
const MenuButton = memo(({ callback, state }: MenuButtonProps) => {
  return (
    <button
      id='main-menu-button'
      aria-label='toggle-main-menu'
      className={`appearance-none flex grow w-fit h-fit p-2 sm:p-2 md:p-3 lg:p-4 xl:p-4 2xl:p-4 rounded-full items-center text-header cursor-pointer transition-all transition-discrete duration-300 delay-200 ease-out hover:text-header/50 ${state === false ? 'backdrop-blur-md bg-container/20' : 'backdrop-blur-none bg-container/0'}`}
      onClick={(e) => callback(e, !state)}
      type='button'
    >
      {state === false ? <MenuIcon fontSize='medium' /> : <CloseIcon fontSize='medium' />}
    </button>
  )
})
MenuButton.displayName = 'MenuButton'

const MainMenu = () => {
  const menuVisible = useMenu(state => state.menuState.visible)
  const isFirstPageVisit = useMenu((s) => s.isFirstPageVisit)
  const hasHydrated = useMenu((s) => s.hasHydrated)

  useEffect(() => {
    if (hasHydrated && !isFirstPageVisit) {
      useMenu.getState().setPageVisited()
      setVisible(true)
    }
  }, [hasHydrated, isFirstPageVisit])

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>, state: boolean) => {
    setVisible(state)
    if (state === false) e.preventDefault()
  }, [])

  return (
    <div className='flex flex-col grow place-items-start max-w-fit max-h-fit p-6 text-body select-none'>
      <div className='fixed z-30'>
        <MenuButton callback={handleClick} state={menuVisible} />
      </div>
      <div className={`flex flex-col grow max-w-fit max-h-fit z-20 p-4 space-y-6 rounded-3xl bg-container/20 backdrop-blur-md justify-center-safe items-center-safe transition-all transition-discrete duration-500 ease-in-out ${menuVisible ? 'visible opacity-100 pointer-events-auto' : 'collapse opacity-0 pointer-events-none'}`}>

        <div className='flex grow w-fit h-fit pt-6 sm:pt-6 md:pt-8 lg:pt-8 xl:pt-10 2xl:pt-10 place-self-center-safe text-center uppercase text-nowrap text-xl sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-3xl transition-all transition-discrete duration-500 ease-in-out'>
          Pirouz Mehmandoost
        </div>
        <div className={`flex flex-col w-full h-full space-y-2`}>
          <Link
            className='w-fit text:md sm:text-md md:text-md lg:text-lg xl:text-xl 2xl:text-xl cursor-pointer transition-all transition-discrete duration-500 ease-in-out hover:text-neutral-500'
            id='main-menu-link-linkedin'
            href={'https://www.linkedin.com/in/pirouzmehmandoost/'}
            rel='noopener noreferrer'
            target='_blank'
          >
            LinkedIn
          </Link>
          <Link
            className='w-fit text-md sm:text-md md:text-md lg:text-lg xl:text-xl 2xl:text-xl cursor-pointer transition-all transition-discrete duration-500 ease-in-out hover:text-neutral-500'
            id='main-menu-link-github'
            href={'https://github.com/pirouzmehmandoost/para/blob/main/README.md'}
            rel='noopener noreferrer'
            target='_blank'
          >
            Github
          </Link>
        </div>
      </div>
    </div>
  )
}

export default memo(MainMenu)

// const DiagonalText = ({text}) => {
//   let charArray = [];
//   const strings = text.split(" ");
//   const longestLength = strings.reduce((a , b) => Math.max(a, b.length), 0);
//   // const characters = text.split('').map((char, index) => <div key={index} className='rotate-45'> {char} </div> );
//   const filled = strings.map(str => str.length < longestLength
//     ? [...str, ...Array(longestLength - str.length).fill('\u00A0')]
//     : str.split('')
//   );

//   for (let i = 0; i < longestLength; i++) {
//     for (let j = 0; j < filled.length; j++) {
//       if (charArray[i]) charArray[i] = [...charArray[i], ...filled[j][i]]
//       else charArray[i] = [...filled[j][i]];
//     }
//   }

//   const diagonalBlock = charArray.map((arr, index) => (
//     <div key={index} className='rotate-45 w-fit bg-blue-900 space-y-2'>
//       { arr.map((char, index2) => <div key={index2} className=' bg-red-500'> {char} </div> ) }
//     </div>
//   ));
//   return <div className='-rotate-45 bg-blue-400 max-w-fit'> {diagonalBlock} </div>
// // };