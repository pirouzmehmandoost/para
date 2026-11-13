'use client'

import Link from 'next/link'
import useSelection from '@stores/selectionStore'

const reset = useSelection.getState().reset

export default function ErrorPage() {
  return (
    <div className='not-found-container'>
      <p className='text-7xl'>Not Found</p>
      <Link href='/' onClick={reset} className='appearance-none text-6xl text-inactive animate-pulse'>Return to Homepage</Link>
    </div>
  )
}