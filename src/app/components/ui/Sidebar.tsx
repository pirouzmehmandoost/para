'use client'

import Link from 'next/link'
import useMenu from '@stores/menuStore'
import type { ReactNode } from 'react'

interface Content {
  label: string
  link: string
}
const content: Content[] = [
  { label: 'LinkedIn', link: 'https://www.linkedin.com/in/pirouzmehmandoost/' },
  { label: 'Github', link: 'https://github.com/pirouzmehmandoost/para/blob/main/README.md' },
  { label: 'About', link: 'https://github.com/pirouzmehmandoost/para/blob/main/README.md' }
]

const Links = (): ReactNode => {
  return content.map(({ label, link }: Content) =>
    <Link
      key={label}
      className='appearance-none w-fit h-fit text-md sm:text-md md:text-lg lg:text-xl cursor-pointer'
      href={link}
      rel='noopener noreferrer'
      target='_blank'
    >
      {label}
    </Link>
  )
}

const Sidebar = (): ReactNode => {
  const visible: boolean = useMenu(state => state.menuState.visible)
  return (
    <div id='main-menu-wrapper' className='flex flex-col w-fit h-fit select-none touch-none'>
      <div className={`flex flex-col h-fit py-6 px-0 gap-y-4 transition-all transition-discrete duration-500 ease-in-out origin-left ${visible ? 'px-6 opacity-100 w-26 sm:w-26 md:w-30 lg:w-34 visible' : 'px-0 opacity-0 w-0 collapse'}`}>
        <div className={`flex flex-col w-full h-fit pt-14 sm:pt-14 md:pt-16 lg:pt-18 gap-y-2 transition-all duration-300 ease-in-out ${visible ? 'text-link delay-100 duration-600' : 'text-link/0 duration-200'}`}>
          <Links />
        </div>
      </div>
    </div>
  )
}

export default Sidebar