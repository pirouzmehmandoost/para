import './globals.css';
import localFont from 'next/font/local';
import sceneConfigs from '@configs/sceneConfigs';
import MainMenu from '@ui/MainMenu';
import RootCanvas from '@three/canvas/RootCanvas';
import GlobalKeyboardShortcuts from '@ui/GlobalKeyboardShortcuts';

const { BACKGROUND_COLOR } = sceneConfigs;
const myFont = localFont({
  src: './../../public/fonts/halibutSerif/web/HalibutSerif-Condensed.woff2',
  display: 'swap',
});

export const metadata = {
  title: '℘讠 ⍨',
  description: 'A showcase of custom Three.js and R3F utilities and components by Pirouz Mehmandoost',
};

export default function RootLayout({ children, modal }) {
  return (
    <html lang='en'>
      <body className={`${myFont.className} bg-cover bg-[${BACKGROUND_COLOR}]`}>
        <GlobalKeyboardShortcuts />
        <MainMenu />
        {modal}
        {children}
        <div className='fixed -z-10 inset-0 flex flex-col grow w-full h-full'>
          <RootCanvas />
        </div>
      </body>
    </html>
  )
};
