'use client'

import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ActionButton from './ActionButton'
import useMenu from '@stores/menuStore'
import { memo } from 'react'

const setVisible = useMenu.getState().setVisible

const SidebarButton = () => {
  const menuVisible = useMenu(state => state.menuState.visible)
  return (
    <div id='sidebar-button'className='fixed inset-x-6 inset-y-6 flex flex-col w-fit h-fit z-100'>
      <ActionButton
        id='main-menu-button'
        ariaLabel='Toggle main menu'
        callback={() => setVisible(!menuVisible)} 
      >
        {menuVisible === false ? <MenuIcon fontSize='medium' /> : <CloseIcon fontSize='medium' />}
      </ActionButton>
    </div>
  )
}
export default memo(SidebarButton)