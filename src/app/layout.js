import './globals.css';
import localFont from 'next/font/local';

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
    <html lang="en">
      <body className={`${myFont.className} bg-cover bg-[#bcbcbc]`}>
        {children}
      </body>
    </html>
  );
}
