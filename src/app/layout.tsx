import './globals.css';
import localFont from 'next/font/local';
import sceneConfigs from '@configs/sceneConfigs';
import { getAllProjects } from '@db/projects';
import type { Project } from '../types/project'; 
import MainMenu from '@ui/MainMenu';
import GlobalKeyboardShortcuts from '@ui/GlobalKeyboardShortcuts';
import RootCanvas from '@three/canvas/RootCanvas';

const { BACKGROUND_COLOR } = sceneConfigs;
const myFont = localFont({
  src: './../../public/fonts/halibutSerif/web/HalibutSerif-Condensed.woff2',
  display: 'swap',
});

export const metadata = {
  title: '℘讠 ⍨',
  description: 'A showcase of custom Three.js and React Three Fiber utilities by Pirouz Mehmandoost',
};

export default async function RootLayout({ children, modal }) {
  const projects: Project[] = await getAllProjects();

  return (
    <html lang='en'>
      <body className={`${myFont.className} bg-cover bg-[${BACKGROUND_COLOR}]`}>
        <GlobalKeyboardShortcuts />
        <MainMenu />
        {modal}
        {children}
        <div className='fixed -z-10 inset-0 flex flex-col grow w-full h-full'>
          <RootCanvas projects={projects}/>
        </div>
      </body>
    </html>
  )
};
