import { Html } from '@react-three/drei'
import { memo } from 'react'

interface LoaderProps {
  str?: string
  injectStyle?: string
}

export const ThreeLoader = memo(({ str = '', injectStyle = '' }: LoaderProps) => {
  const ending = ' Loading...'
  const message = str.length > 0 ? str + ending : ending
  return <Html center className={`text-8xl text-header ${injectStyle}`}>{message}</Html>
})
ThreeLoader.displayName = 'Loader'

export const GenericLoader =() => {return <div className='flex grow flex-col w-full h-full justify-center items-center text-center text-7xl text-header'>Loading...</div>}
