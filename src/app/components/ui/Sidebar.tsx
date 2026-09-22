'use client'

import { memo } from 'react'
import Link from 'next/link'
import useMenu from '@stores/menuStore'

const Sidebar = () => {
  const visible: boolean = useMenu(state => state.menuState.visible)
  return (
    <div id='main-menu-wrapper' className='flex flex-col select-none touch-none w-fit h-fit max-w-54'>
      <div className={`flex flex-col h-fit py-6 px-0 gap-y-4 transition-all transition-discrete duration-500 ease-in-out origin-left ${visible ? 'px-6 opacity-100 w-44 sm:w-44 md:w-46 lg:w-54 visible' : 'px-0 opacity-0 w-0 collapse'}`}>
        {/* <div className={`flex w-fit h-fit text-nowrap text-lg sm:text-lg md:text-xl lg:text-2xl pt-14 sm:pt-14 md:pt-16 lg:pt-18 transition-colors ease-in-out ${visible ? 'text-header delay-100 duration-600' : 'text-header/0 duration-200'}`}>
          Pirouz Mehmandoost
        </div> */}
        <div className={`flex flex-col w-full h-fit gap-y-2 transition-colors duration-300 ease-in-out ${visible ? 'text-link delay-100 duration-600' : 'text-link/0 duration-200'}`}>
          <Link
            id='menu-link-linkedin'
            className='appearance-none w-fit h-fit text-md sm:text-md md:text-lg lg:text-xl cursor-pointer'
            href={'https://www.linkedin.com/in/pirouzmehmandoost/'}
            rel='noopener noreferrer'
            target='_blank'
          >
            LinkedIn
          </Link>
          <Link
            id='menu-link-github'
            className='appearance-none w-fit h-fit text-md sm:text-md md:text-lg lg:text-xl cursor-pointer'
            href={'https://github.com/pirouzmehmandoost/para/blob/main/README.md'}
            rel='noopener noreferrer'
            target='_blank'
          >
            Github
          </Link>
          <Link
            id='menu-link-about'
            className='appearance-none w-fit h-fit text-md sm:text-md md:text-lg lg:text-xl cursor-pointer'
            href={'https://github.com/pirouzmehmandoost/para/blob/main/README.md'}
            rel='noopener noreferrer'
            target='_blank'
          >
            About
          </Link>
        </div>
      </div>
    </div>
  )
}

export default memo(Sidebar)
