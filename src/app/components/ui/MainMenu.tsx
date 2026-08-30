'use client'
import { memo, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import useMenu from '@stores/menuStore'

// interface MenuLink {
//   title: string
//   href: string
//   disabled?: boolean
// }

// const links: MenuLink[] = [
//   { disabled: false, title: 'LinkedIn', href: 'https://www.linkedin.com/in/pirouzmehmandoost/' },
//   { disabled: false, title: 'Github', href: 'https://github.com/pirouzmehmandoost/para/blob/main/README.md' },
// ]

const setVisible = useMenu.getState().setVisible

interface MenuButtonProps { phase: boolean }
const ToggleMainMenuButton = memo(({ phase }: MenuButtonProps) => {
  return (
    <button
      id='main-menu-button'
      aria-label='toggle-main-menu'
      className='fixed w-fit h-fit z-30 inset-0 top-6 left-6 p-2 rounded-full cursor-pointer backdrop-contrast-125 backdrop-blur-xl transition-all transition-discrete duration-500 ease-in-out text-neutral-600 hover:text-neutral-700 bg-neutral-600/20 hover:bg-neutral-600/30'
      onClick={() => setVisible(!phase)}
      type='button'
    >
      {phase === false ? <MenuIcon fontSize='large' /> : <CloseIcon fontSize='large' />}
    </button>
  )
})
ToggleMainMenuButton.displayName = "ToggleMainMenuButton"

const MainMenu = () => {
  const menuVisible = useMenu(state => state.menuState.visible)
  const firstPageVisited = useMenu((s) => s.firstPageVisited)
  const hasHydrated = useMenu((s) => s.hasHydrated)

  useEffect(() => {
    if (hasHydrated && !firstPageVisited) {
      useMenu.getState().setPageVisited()
      setVisible(true)
    }
  }, [hasHydrated, firstPageVisited])

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, disabled: boolean) => {
    setVisible(false)
    if (disabled) e.preventDefault()
  }, [])

  //  <div className='text-9xl text-blue-800 opacity-100 text-center self-center place-self-center-safe justify-center-safe select-none touch-none transition-all transition-discrete duration-1000 delay-2000 ease-in will-change-auto starting:opacity-0'>
  //     Test
  //   </div>

  return (
    <div className='relative flex flex-col w-full h-full'>
      <ToggleMainMenuButton phase={menuVisible} />
      <div className={`fixed flex flex-col z-20 justify-center items-center inset-0 text-neutral-800 uppercase transition-all transition-discrete duration-500 ease-in-out ${menuVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* {menuVisible && ( */}
        <div className='flex flex-col w-full h-full space-y-6 p-6'>
          <div className='flex flex-col w-fit h-fit mt-13 p-6 space-y-6 rounded-4xl bg-neutral-500/20 backdrop-blur-xl'>

          <div className='w-fit h-fit place-self-center-safe text-nowrap sm:text-3xl md:text-3xl lg:text-4xl xl:text-4xl 2xl:text-4xl'>
            Pirouz Mehmandoost
          </div>
            <div className='flex flex-col w-full h-full space-y-6'>
              <Link
                className='sm:text-lg md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl cursor-pointer transition-all transition-discrete duration-500 ease-in-out hover:text-neutral-500'
                id='main-menu-link-linkedin'
                href={'https://www.linkedin.com/in/pirouzmehmandoost/'}
                rel='noopener noreferrer'
                target='_blank'
              >
                LinkedIn
              </Link>
              <Link
                className='sm:text-lg md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl cursor-pointer transition-all transition-discrete duration-500 ease-in-out hover:text-neutral-500'
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
        {/* )} */}
      </div>
      {/* <div className={`fixed inset-0 z-10 bg-neutral-400/0 backdrop-blur-md md:backdrop-blur-xl select-none pointer-events-none transition-all transition-discrete duration-500 ease-in-out ${menuVisible ? 'opacity-100' : 'opacity-0'}`} /> */}
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