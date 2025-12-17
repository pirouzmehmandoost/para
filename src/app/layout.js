import './globals.css';
import localFont from 'next/font/local';
import { SpeedInsights } from '@vercel/speed-insights/next'
import { envColor } from '@configs/globals';

const myFont = localFont({
  src: './../../public/fonts/halibutSerif/web/HalibutSerif-Condensed.woff2',
  display: 'swap',
});

export const metadata = {
  title: '℘讠 ⍨',
  description: 'A portfolio of 3D printing projects by Pirouz Mehmandoost',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${myFont.className} bg-cover bg-[${envColor}]`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
};
