import { memo } from 'react'
import type { ReactNode } from 'react'

interface PanelProps {
  id: string
  children?: ReactNode
  visible?: boolean
  injectStyle?: string
}
const Panel = memo(({ id, injectStyle = '', visible, children }: PanelProps) =>
  <div id={id} className={`flex flex-col w-full h-full justify-center items-center rounded-3xl backdrop-blur-sm backdrop-invert-37 transition-all transition-discrete duration-500 ease-in-out starting:opacity-0 ${injectStyle} ${visible ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 collapse pointer-events-none'}`}>
    {children}
  </div>
)
Panel.displayName = 'Panel'

export default Panel