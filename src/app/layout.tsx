import './globals.css'
import localFont from 'next/font/local'
import { Suspense, type JSX, type ReactNode } from 'react'
import type { Project } from '../types/project'
import { getAllProjects } from '../db/projects'
import Sidebar from './components/ui/Sidebar'
import GlobalKeyboardShortcuts from './components/ui/GlobalKeyboardShortcuts'
import RootCanvas from './components/three/canvas/RootCanvas'
import SidebarButton from './components/ui/buttons/SidebarButton'

const myFont = localFont({
  src: './../../public/fonts/halibutSerif/web/HalibutSerif-Condensed.woff2',
  display: 'swap',
})

export const metadata = {
  title: '℘讠 ⍨',
  description: 'A showcase of custom Three.js and React Three Fiber utilities by Pirouz Mehmandoost',
}

const fetchProjectData = async (): Promise<Project[]> => {
  let projects: Project[] = []
  try {
    projects = await getAllProjects()
  }
  catch (error) {
    console.error('RootLayout: getAllProjects failed', error)
  }
  return projects
}

interface RootLayoutProps {
  children: ReactNode
  modal: ReactNode
}
export default async function RootLayout({ children, modal }: RootLayoutProps): Promise<JSX.Element> {
  const projects: Project[] = await fetchProjectData()

  return (
    <html lang='en'>
      <body className={`${myFont.className} bg-cover bg-neutral-300`}>
        <Suspense fallback={null}>
          <GlobalKeyboardShortcuts />
        </Suspense>
        <SidebarButton />
        <div className='absolute inset-0 flex grow flex-row w-full h-full'>
          <Sidebar />
          <div className='relative flex grow flex-col w-full h-full'>
            <Suspense fallback={null}>
              {modal}
              {children}
            </Suspense>
            <Suspense fallback={null}>
              <RootCanvas projects={projects} />
            </Suspense>
          </div>
        </div>
      </body>
    </html>
  )
};

//   return (
//     <html lang='en'>
//       <body className={`${myFont.className} bg-cover bg-neutral-300`}>
//         <GlobalKeyboardShortcuts />
//         <MainMenu />
//         {modal}
//         {children}
//         <div className='fixed inset-0 flex grow flex-col w-full h-full -z-10'>
//           <RootCanvas projects={projects} />
//         </div>
//       </body>
//     </html>
//   )
// };
