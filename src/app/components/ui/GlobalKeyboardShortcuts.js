'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSelectedLayoutSegment } from 'next/navigation'
import useSelection from '@stores/selectionStore'
import useMenu from '@/app/stores/menuStore'

const reset = useSelection.getState().reset
const setVisible = useMenu.getState().setVisible

export default function GlobalKeyboardShortcuts() {
  const pathname = usePathname()
  const router = useRouter()
  const segment = useSelectedLayoutSegment('modal')

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return

      if (pathname.startsWith('/projects/')) {
        setTimeout(() => {
          if (segment?.length) router.back()
          else router.replace('/')
        }, 500)
      }

      setVisible(false)
      reset()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [pathname, router, segment])

  return null
}

