import { memo } from 'react'
import { Html } from '@react-three/drei'

interface ThreeLoaderProps {
  str?: string
  injectStyle?: string
}

export const ThreeLoader = ({ str = '', injectStyle = '' }: ThreeLoaderProps) => {
  const ending = ' Loading...'
  const message = str.length > 0 ? str + ending : ending
  return <Html center className={`text-8xl text-header ${injectStyle}`}>{message}</Html>
}

export default memo(ThreeLoader)